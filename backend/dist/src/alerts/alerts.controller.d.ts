import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    triggerAlerts(frequency?: string): Promise<{
        emailsSent: number;
        errors: number;
        searchesProcessed: number;
    }>;
}
