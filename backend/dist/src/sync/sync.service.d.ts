import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { TypesenseService } from '../typesense/typesense.service';
export declare class SyncService {
    private prisma;
    private emailService;
    private typesenseService;
    private readonly logger;
    private readonly apiBaseUrl;
    constructor(prisma: PrismaService, emailService: EmailService, typesenseService: TypesenseService);
    private generateSlug;
    syncNewTenders(): Promise<void>;
    sendDailyDigest(): Promise<void>;
    sendClosingReminders(): Promise<void>;
    fetchRecentTenders(hoursBack?: number): Promise<number>;
    private upsertTender;
    processAlerts(): Promise<void>;
    private findMatchingTenders;
    processClosingReminders(): Promise<void>;
    private delay;
    triggerSync(): Promise<number>;
}
