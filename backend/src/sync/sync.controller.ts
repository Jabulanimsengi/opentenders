import { Controller, Post, Query } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  // Manual trigger endpoint (admin only in production)
  @Post('trigger')
  async triggerSync(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('pageLimit') pageLimit?: string,
    @Query('pageSize') pageSize?: string,
    @Query('notify') notify?: string,
    @Query('delayMs') delayMs?: string,
  ) {
    const count =
      dateFrom || dateTo
        ? await this.syncService.fetchTendersByDateRange({
            dateFrom,
            dateTo,
            pageLimit: pageLimit ? Number(pageLimit) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
            notifyNew: notify === 'true',
            delayMs: delayMs ? Number(delayMs) : 0,
            fullRange: true,
          })
        : await this.syncService.triggerSync();
    return {
      success: true,
      processed: count,
      dateFrom,
      dateTo,
      pageLimit,
      pageSize,
      notify,
      delayMs,
    };
  }

  @Post('alerts')
  async processAlerts() {
    await this.syncService.processAlerts();
    return { success: true };
  }
}
