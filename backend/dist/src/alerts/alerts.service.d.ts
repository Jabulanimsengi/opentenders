import { PrismaService } from '../prisma';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
export declare class AlertsService {
    private prisma;
    private emailService;
    private configService;
    private readonly logger;
    private typesenseClient;
    constructor(prisma: PrismaService, emailService: EmailService, configService: ConfigService);
    handleDailyAlerts(): Promise<void>;
    handleWeeklyAlerts(): Promise<void>;
    triggerAlertsManually(frequency?: string): Promise<{
        emailsSent: number;
        errors: number;
        searchesProcessed: number;
    }>;
    private processAlerts;
    private findNewMatchingTenders;
}
