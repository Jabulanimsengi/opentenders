import { Controller, Post, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
    constructor(private readonly syncService: SyncService) { }

    // Manual trigger endpoint (admin only in production)
    @Post('trigger')
    async triggerSync() {
        const count = await this.syncService.triggerSync();
        return { success: true, processed: count };
    }

    @Post('alerts')
    async processAlerts() {
        await this.syncService.processAlerts();
        return { success: true };
    }
}
