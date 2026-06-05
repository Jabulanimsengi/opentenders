import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma';
import { PLAN_DEFINITIONS, PlanId, isPaidPlan, isValidPlanId } from './plans';

type StripeParams = Record<string, string | number | boolean | undefined>;

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private readonly stripeApiVersion = '2026-02-25.clover';

  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    return (
      subscription || {
        plan: 'free',
        status: 'active',
        endDate: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      }
    );
  }

  async createCheckoutSession(userId: string, requestedPlan?: string) {
    if (
      !requestedPlan ||
      !isValidPlanId(requestedPlan) ||
      requestedPlan === 'free' ||
      requestedPlan === 'enterprise'
    ) {
      throw new BadRequestException('Choose a valid paid plan');
    }

    const priceId = this.getStripePriceId(requestedPlan);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscription: {
          select: {
            stripeCustomerId: true,
            stripeSubscriptionId: true,
            status: true,
          },
        },
      },
    });

    if (!user) throw new ForbiddenException('User not found');

    let customerId = user.subscription?.stripeCustomerId || null;
    if (!customerId) {
      const customer = await this.stripeRequest<{ id: string }>(
        '/v1/customers',
        {
          email: user.email,
          name: user.name || user.email,
          'metadata[userId]': user.id,
        },
      );
      customerId = customer.id;

      await this.prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: 'free',
          status: 'active',
          stripeCustomerId: customerId,
        },
        update: { stripeCustomerId: customerId },
      });
    }

    const frontendUrl = this.frontendUrl();
    const session = await this.stripeRequest<{ id: string; url: string }>(
      '/v1/checkout/sessions',
      {
        customer: customerId,
        mode: 'subscription',
        client_reference_id: userId,
        success_url: `${frontendUrl}/settings?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/pricing`,
        allow_promotion_codes: true,
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': 1,
        'metadata[userId]': userId,
        'metadata[planId]': requestedPlan,
        'subscription_data[metadata][userId]': userId,
        'subscription_data[metadata][planId]': requestedPlan,
      },
    );

    return { url: session.url, id: session.id };
  }

  async createPortalSession(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    });

    if (!subscription?.stripeCustomerId) {
      throw new BadRequestException(
        'No Stripe billing profile exists for this account',
      );
    }

    const session = await this.stripeRequest<{ url: string }>(
      '/v1/billing_portal/sessions',
      {
        customer: subscription.stripeCustomerId,
        return_url: `${this.frontendUrl()}/settings`,
      },
    );

    return { url: session.url };
  }

  async handleStripeWebhook(req: { rawBody?: Buffer; body: unknown }, sig?: string) {
    const rawBody = req.rawBody;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

    if (!rawBody || !webhookSecret || !sig) {
      throw new BadRequestException('Stripe webhook signature unavailable');
    }

    if (!this.verifyStripeSignature(rawBody, sig, webhookSecret)) {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    const event = JSON.parse(rawBody.toString('utf8')) as {
      type: string;
      data: { object: any };
    };

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      default:
        this.logger.debug(`Ignoring Stripe event ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: any) {
    const userId = session.metadata?.userId || session.client_reference_id;
    const planId = session.metadata?.planId;
    const customerId =
      typeof session.customer === 'string' ? session.customer : undefined;
    const stripeSubscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : undefined;

    if (!userId || !isValidPlanId(planId) || !isPaidPlan(planId)) {
      this.logger.warn('Checkout completed without usable user/plan metadata');
      return;
    }

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: planId,
        status: 'active',
        stripeCustomerId: customerId,
        stripeSubscriptionId,
        stripeCheckoutId: session.id,
      },
      update: {
        plan: planId,
        status: 'active',
        stripeCustomerId: customerId,
        stripeSubscriptionId,
        stripeCheckoutId: session.id,
        endDate: null,
      },
    });
  }

  private async handleSubscriptionUpdated(subscription: any) {
    const userId = subscription.metadata?.userId;
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : undefined;
    const stripeSubscriptionId = subscription.id as string | undefined;
    const priceId = subscription.items?.data?.[0]?.price?.id as
      | string
      | undefined;
    const planId =
      subscription.metadata?.planId || this.getPlanFromStripePrice(priceId);

    if (!isValidPlanId(planId)) {
      this.logger.warn(`Unable to map Stripe subscription ${subscription.id}`);
      return;
    }

    const status = this.mapStripeSubscriptionStatus(subscription.status);
    const endDate = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : null;

    if (!userId) {
      if (!stripeSubscriptionId) return;

      await this.prisma.subscription.updateMany({
        where: { stripeSubscriptionId },
        data: {
          plan: status === 'active' ? planId : 'free',
          status,
          endDate,
          stripeCustomerId: customerId,
          stripePriceId: priceId,
        },
      });
      return;
    }

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: status === 'active' ? planId : 'free',
        status,
        endDate,
        stripeCustomerId: customerId,
        stripeSubscriptionId,
        stripePriceId: priceId,
      },
      update: {
        plan: status === 'active' ? planId : 'free',
        status,
        endDate,
        stripeCustomerId: customerId,
        stripeSubscriptionId,
        stripePriceId: priceId,
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: any) {
    const stripeSubscriptionId = subscription.id as string | undefined;
    if (!stripeSubscriptionId) return;

    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId },
      data: {
        plan: 'free',
        status: 'cancelled',
        endDate: new Date(),
      },
    });
  }

  private async stripeRequest<T>(path: string, params: StripeParams): Promise<T> {
    const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secretKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) body.set(key, String(value));
    }

    const response = await fetch(`https://api.stripe.com${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': this.stripeApiVersion,
      },
      body,
    });

    const text = await response.text();
    const parsed = text ? JSON.parse(text) : {};
    if (!response.ok) {
      const message = parsed?.error?.message || `Stripe ${response.status}`;
      throw new BadRequestException(message);
    }

    return parsed as T;
  }

  private getStripePriceId(planId: PlanId) {
    const envName = `STRIPE_PRICE_${planId.toUpperCase()}`;
    const priceId = process.env[envName]?.trim();
    if (!priceId) {
      throw new BadRequestException(`${envName} is not configured`);
    }
    return priceId;
  }

  private getPlanFromStripePrice(priceId?: string) {
    if (!priceId) return undefined;

    return (Object.keys(PLAN_DEFINITIONS) as PlanId[]).find((planId) => {
      if (planId === 'free') return false;
      return process.env[`STRIPE_PRICE_${planId.toUpperCase()}`] === priceId;
    });
  }

  private mapStripeSubscriptionStatus(status?: string) {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'active';
      case 'canceled':
        return 'cancelled';
      case 'incomplete_expired':
      case 'unpaid':
        return 'expired';
      default:
        return 'cancelled';
    }
  }

  private verifyStripeSignature(
    rawBody: Buffer,
    signatureHeader: string,
    webhookSecret: string,
  ) {
    const parts = Object.fromEntries(
      signatureHeader.split(',').map((part) => {
        const [key, value] = part.split('=');
        return [key, value];
      }),
    );
    const timestamp = parts.t;
    const signature = parts.v1;
    if (!timestamp || !signature) return false;

    const payload = `${timestamp}.${rawBody.toString('utf8')}`;
    const expected = createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    const actualBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    return (
      actualBuffer.length === expectedBuffer.length &&
      timingSafeEqual(actualBuffer, expectedBuffer)
    );
  }

  private frontendUrl() {
    return process.env.FRONTEND_URL || 'http://localhost:3001';
  }
}
