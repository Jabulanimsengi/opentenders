/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../admin/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExternalSourcesService } from './external-sources.service';

@Controller()
@UseGuards(JwtAuthGuard, AdminGuard)
export class ExternalScrapeRunsController {
  constructor(
    private readonly externalSourcesService: ExternalSourcesService,
  ) {}

  @Get('external-scrape-runs')
  getRuns() {
    return this.externalSourcesService.getRuns();
  }

  @Get('external-scrape-errors')
  getErrors() {
    return this.externalSourcesService.getErrors();
  }
}
