import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  // Manual trigger endpoint (admin only) for testing
  @Post('trigger')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async triggerAlerts(@Query('frequency') frequency: string = 'daily') {
    return this.alertsService.triggerAlertsManually(frequency);
  }
}
