import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { TypesenseService } from '../typesense/typesense.service';
import axios from 'axios';
import * as https from 'https';
import { subHours, format, differenceInDays } from 'date-fns';

const api = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    timeout: 30000,
});

interface OCDSRelease {
    ocid: string;
    date: string;
    tender?: {
        title?: string;
        description?: string;
        status?: string;
        province?: string;
        tenderPeriod?: { endDate?: string };
        briefingSession?: {
            date?: string;
            venue?: string;
            compulsory?: boolean;
        };
        deliveryAddresses?: { region?: string }[];
        mainProcurementCategory?: string;
        contactPerson?: {
            name?: string;
            email?: string;
            telephoneNumber?: string;
        };
        value?: {
            amount?: number;
            currency?: string;
        };
        eligibilityCriteria?: string;
        specialConditions?: string;
        submissionMethod?: string[];
    };
    buyer?: { name?: string };
    awards?: Array<{
        suppliers?: { name: string }[];
        value?: { amount?: number; currency?: string };
        date?: string;
    }>;
}

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);
    private readonly apiBaseUrl = 'https://ocds-api.etenders.gov.za/api/OCDSReleases';

    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
        private typesenseService: TypesenseService,
    ) { }

    private generateSlug(title: string, ocid: string): string {
        // Create slug from title, limited to 80 chars, appended with short ocid suffix
        const baseSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, '') // Trim hyphens from start/end
            .substring(0, 80);

        // Extract last part of ocid for uniqueness (e.g., "ocds-9t57fa-143883" -> "143883")
        const ocidSuffix = ocid.split('-').pop() || ocid.substring(ocid.length - 6);

        return `${baseSlug}-${ocidSuffix}`;
    }

    // Run every 4 hours
    @Cron('0 */4 * * *')
    async syncNewTenders() {
        this.logger.log('Starting scheduled tender sync...');
        await this.fetchRecentTenders(24); // Last 24 hours
    }

    // Daily at 6 AM - send digest alerts
    @Cron('0 6 * * *')
    async sendDailyDigest() {
        this.logger.log('Sending daily digest alerts...');
        await this.processAlerts();
    }

    // Daily at 7 AM - send closing reminders
    @Cron('0 7 * * *')
    async sendClosingReminders() {
        this.logger.log('Processing closing reminders...');
        await this.processClosingReminders();
    }

    async fetchRecentTenders(hoursBack: number = 24): Promise<number> {
        const dateFrom = format(subHours(new Date(), hoursBack), 'yyyy-MM-dd');
        const dateTo = format(new Date(), 'yyyy-MM-dd');

        this.logger.log(`Fetching tenders from ${dateFrom} to ${dateTo}`);

        let totalIngested = 0;
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            try {
                const url = `${this.apiBaseUrl}?PageNumber=${page}&PageSize=50&dateFrom=${dateFrom}&dateTo=${dateTo}`;
                const response = await api.get(url);
                const releases: OCDSRelease[] = response.data?.releases || [];

                if (releases.length === 0) {
                    hasMore = false;
                    break;
                }

                for (const item of releases) {
                    await this.upsertTender(item);
                    totalIngested++;
                }

                page++;
                await this.delay(200); // Rate limiting

                if (page > 20) {
                    this.logger.warn('Reached page limit, stopping');
                    hasMore = false;
                }
            } catch (error: any) {
                this.logger.error(`Sync error: ${error.message}`);
                hasMore = false;
            }
        }

        this.logger.log(`Sync complete: ${totalIngested} tenders processed`);
        return totalIngested;
    }

    private async upsertTender(item: OCDSRelease) {
        const briefing = item.tender?.briefingSession;
        const contact = item.tender?.contactPerson;
        const value = item.tender?.value;
        const title = item.tender?.title || 'Untitled Tender';

        const tender = {
            ocid: item.ocid,
            slug: this.generateSlug(title, item.ocid),
            title,
            description: item.tender?.description || '',
            status: item.tender?.status || 'active',
            publishedDate: item.date ? new Date(item.date) : new Date(),
            closingDate: item.tender?.tenderPeriod?.endDate ? new Date(item.tender.tenderPeriod.endDate) : null,
            briefingDate: briefing?.date ? new Date(briefing.date) : null,
            briefingVenue: briefing?.venue || null,
            briefingCompulsory: briefing?.compulsory || false,
            buyerName: item.buyer?.name || 'Unknown Buyer',
            region: item.tender?.deliveryAddresses?.[0]?.region || 'National',
            province: item.tender?.province || null,
            category: item.tender?.mainProcurementCategory || 'General',
            contactName: contact?.name || null,
            contactEmail: contact?.email || null,
            contactPhone: contact?.telephoneNumber || null,
            estimatedValue: value?.amount || null,
            currency: value?.currency || 'ZAR',
            eligibilityCriteria: item.tender?.eligibilityCriteria || null,
            specialConditions: item.tender?.specialConditions || null,
            submissionMethod: item.tender?.submissionMethod?.join(', ') || null,
            rawData: JSON.stringify(item),
        };

        const result = await this.prisma.tender.upsert({
            where: { ocid: tender.ocid },
            update: tender,
            create: tender,
        });

        // Index to Typesense
        await this.typesenseService.indexTender(result);
    }

    async processAlerts() {
        // Get all saved searches that haven't been alerted in the last 24 hours
        const searches = await this.prisma.savedSearch.findMany({
            where: {
                OR: [
                    { lastAlertedAt: null },
                    { lastAlertedAt: { lt: subHours(new Date(), 24) } },
                ],
            },
            include: {
                user: true,
            },
        });

        this.logger.log(`Processing ${searches.length} saved searches for alerts`);

        for (const search of searches) {
            try {
                const criteria = JSON.parse(search.criteria);
                const matchingTenders = await this.findMatchingTenders(criteria, search.lastAlertedAt);

                if (matchingTenders.length > 0) {
                    await this.emailService.sendTenderMatchAlert(
                        search.user.email,
                        search.user.name || 'User',
                        search.name,
                        matchingTenders.map((t: any) => ({
                            title: t.title,
                            closingDate: t.closingDate ? format(t.closingDate, 'dd MMM yyyy') : null,
                            slug: t.slug || t.id,
                        })),
                    );

                    // Update last alerted time
                    await this.prisma.savedSearch.update({
                        where: { id: search.id },
                        data: { lastAlertedAt: new Date() },
                    });
                }
            } catch (error: any) {
                this.logger.error(`Alert processing error for search ${search.id}: ${error.message}`);
            }
        }
    }

    private async findMatchingTenders(criteria: any, since: Date | null) {
        const where: any = {};

        if (since) {
            where.createdAt = { gt: since };
        } else {
            where.createdAt = { gt: subHours(new Date(), 24) };
        }

        if (criteria.q) {
            where.OR = [
                { title: { contains: criteria.q } },
                { description: { contains: criteria.q } },
            ];
        }
        if (criteria.region?.length) {
            where.region = { in: criteria.region };
        }
        if (criteria.category?.length) {
            where.category = { in: criteria.category };
        }
        if (criteria.buyer?.length) {
            where.buyerName = { in: criteria.buyer };
        }

        return this.prisma.tender.findMany({
            where,
            take: 10,
            orderBy: { publishedDate: 'desc' },
        });
    }

    async processClosingReminders() {
        const today = new Date();
        const remindDays = [7, 3, 1]; // Send reminders at these intervals

        for (const days of remindDays) {
            const targetDate = new Date(today);
            targetDate.setDate(targetDate.getDate() + days);

            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

            const tenders = await this.prisma.tender.findMany({
                where: {
                    closingDate: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    status: 'active',
                },
            });

            this.logger.log(`Found ${tenders.length} tenders closing in ${days} day(s)`);

            // For now, just log - in production, you'd track which users saved these tenders
            // and send reminders to them
        }
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Manual trigger for testing
    async triggerSync() {
        return this.fetchRecentTenders(24);
    }
}
