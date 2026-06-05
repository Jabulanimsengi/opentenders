import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSavedSearchDto,
  UpdateSavedSearchDto,
} from './saved-searches.dto';
import { buildTenderSmartSearchCondition } from '../tenders/smart-search';
import { EmailService } from '../email/email.service';
import { PLAN_DEFINITIONS } from '../subscriptions/plans';
import { format } from 'date-fns';
import { buildActiveTenderWhere } from '../tenders/tender-date-rules';

const ALERT_PLANS = Object.values(PLAN_DEFINITIONS)
  .filter((plan) => plan.canReceiveEmailAlerts)
  .map((plan) => plan.id);

@Injectable()
export class SavedSearchesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const search = await this.prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!search) {
      throw new NotFoundException('Saved search not found');
    }

    if (search.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return search;
  }

  async create(userId: string, dto: CreateSavedSearchDto) {
    const alertsEnabled = Boolean(dto.alertsEnabled);
    if (alertsEnabled) {
      await this.assertCanUseAlerts(userId);
    }

    const search = await this.prisma.savedSearch.create({
      data: {
        name: dto.name,
        criteria: JSON.stringify(this.normalizeCriteria(dto.criteria)),
        userId,
        alertsEnabled,
        alertFrequency: this.normalizeFrequency(dto.alertFrequency),
      },
    });

    if (alertsEnabled) {
      await this.sendInitialAlertMatches(search.id, userId);
    }

    return search;
  }

  async update(id: string, userId: string, dto: UpdateSavedSearchDto) {
    await this.findOne(id, userId); // Verify ownership
    if (dto.alertsEnabled) {
      await this.assertCanUseAlerts(userId);
    }

    return this.prisma.savedSearch.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.criteria && {
          criteria: JSON.stringify(this.normalizeCriteria(dto.criteria)),
        }),
        ...(dto.alertsEnabled !== undefined && {
          alertsEnabled: dto.alertsEnabled,
        }),
        ...(dto.alertFrequency && {
          alertFrequency: this.normalizeFrequency(dto.alertFrequency),
        }),
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId); // Verify ownership

    await this.prisma.savedSearch.delete({
      where: { id },
    });

    return { success: true };
  }

  async getMatchCount(id: string, userId: string) {
    const search = await this.findOne(id, userId);
    const criteria = JSON.parse(search.criteria);

    // Build query based on criteria
    const where: any = buildActiveTenderWhere();

    const searchCondition = buildTenderSmartSearchCondition(criteria.q);
    if (searchCondition) {
      where.AND = [searchCondition];
    }
    if (criteria.region?.length) {
      where.region = { in: criteria.region };
    }
    if (criteria.category?.length) {
      where.category = { in: criteria.category };
    }
    if (criteria.buyer?.length) {
      where.buyerName = { in: criteria.buyer };
    }

    const count = await this.prisma.tender.count({ where });
    return { count };
  }

  private normalizeCriteria(criteria: CreateSavedSearchDto['criteria']) {
    return {
      ...criteria,
      ...(Array.isArray(criteria.q) && { q: criteria.q.join(' ') }),
    };
  }

  private normalizeFrequency(frequency?: string) {
    return frequency === 'weekly' ? 'weekly' : 'daily';
  }

  private async assertCanUseAlerts(userId: string) {
    const canUseAlerts = await this.canUseAlerts(userId);
    if (!canUseAlerts) {
      throw new ForbiddenException('A paid subscription is required for alerts');
    }
  }

  private async canUseAlerts(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription: { select: { plan: true, status: true } },
        organizationMemberships: {
          where: { status: 'active' },
          select: {
            organization: {
              select: {
                subscription: { select: { plan: true, status: true } },
              },
            },
          },
        },
      },
    });

    if (!user) return false;

    const subscriptions = [
      user.subscription,
      ...user.organizationMemberships.map(
        (membership) => membership.organization.subscription,
      ),
    ].filter(Boolean);

    return subscriptions.some(
      (subscription) =>
        subscription &&
        subscription.status === 'active' &&
        ALERT_PLANS.includes(subscription.plan as any),
    );
  }

  private async sendInitialAlertMatches(searchId: string, userId: string) {
    const search = await this.prisma.savedSearch.findUnique({
      where: { id: searchId },
      include: { user: true },
    });
    if (!search || search.userId !== userId) return;

    const criteria = JSON.parse(search.criteria);
    const tenders = await this.prisma.tender.findMany({
      where: this.buildMatchWhere(criteria),
      orderBy: { publishedDate: 'desc' },
      select: {
        title: true,
        closingDate: true,
        slug: true,
        id: true,
      },
    });

    if (tenders.length === 0) return;

    const sent = await this.emailService.sendTenderMatchAlert(
      search.user.email,
      search.user.name || 'User',
      search.name,
      tenders.map((tender) => ({
        title: tender.title,
        closingDate: tender.closingDate
          ? format(tender.closingDate, 'dd MMM yyyy')
          : null,
        slug: tender.slug || tender.id,
      })),
    );

    if (sent) {
      await this.prisma.savedSearch.update({
        where: { id: search.id },
        data: { lastAlertedAt: new Date() },
      });
    }
  }

  private buildMatchWhere(criteria: any) {
    const where: any = buildActiveTenderWhere();

    const searchCondition = buildTenderSmartSearchCondition(criteria.q);
    if (searchCondition) where.AND = [searchCondition];
    if (criteria.region?.length) where.region = { in: criteria.region };
    if (criteria.category?.length) where.category = { in: criteria.category };
    if (criteria.buyer?.length) where.buyerName = { in: criteria.buyer };

    return where;
  }
}
