import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../admin/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import type { CreateAnalyticsEventDto } from './analytics.service';

type RequestWithHeaders = {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
};

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  captureEvent(
    @Body() dto: CreateAnalyticsEventDto,
    @Headers('authorization') authorization?: string,
    @Req() request?: RequestWithHeaders,
  ) {
    const userAgent = Array.isArray(request?.headers?.['user-agent'])
      ? request?.headers?.['user-agent'][0]
      : request?.headers?.['user-agent'];
    const forwardedFor = Array.isArray(request?.headers?.['x-forwarded-for'])
      ? request?.headers?.['x-forwarded-for'][0]
      : request?.headers?.['x-forwarded-for'];
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || request?.ip;

    return this.analyticsService.captureEvent(dto, {
      authorization,
      userAgent,
      ipAddress,
    });
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getSummary(@Query('days') days?: string) {
    return this.analyticsService.getAdminSummary(Number(days || 30));
  }

  @Get('events')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getEvents(@Query('limit') limit?: string) {
    return this.analyticsService.getRecentEvents(Number(limit || 100));
  }
}
