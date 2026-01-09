import { SyncService } from './sync.service';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    triggerSync(): Promise<{
        success: boolean;
        processed: number;
    }>;
    processAlerts(): Promise<{
        success: boolean;
    }>;
}
