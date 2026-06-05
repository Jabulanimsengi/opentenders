import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMine(@Req() req: any) {
    return this.subscriptionsService.getMine(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  createCheckout(@Req() req: any, @Body() body: { planId?: string }) {
    return this.subscriptionsService.createCheckoutSession(
      req.user.id,
      body.planId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('portal')
  createPortal(@Req() req: any) {
    return this.subscriptionsService.createPortalSession(req.user.id);
  }

  @Post('webhook')
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    return this.subscriptionsService.handleStripeWebhook(req, signature);
  }
}
