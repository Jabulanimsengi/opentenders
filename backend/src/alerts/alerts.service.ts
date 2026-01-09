import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma';
import { EmailService } from '../email/email.service';
import { Client } from 'typesense';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AlertsService {
    private readonly logger = new Logger(AlertsService.name);
    private typesenseClient: Client;

    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
        private configService: ConfigService,
    ) {
        // Initialize Typesense client
        this.typesenseClient = new Client({
            nodes: [{
                host: this.configService.get('TYPESENSE_HOST') || 'localhost',
                port: parseInt(this.configService.get('TYPESENSE_PORT') || '8108'),
                protocol: this.configService.get('TYPESENSE_PROTOCOL') || 'http',
            }],
            apiKey: this.configService.get('TYPESENSE_API_KEY') || 'xyz',
            connectionTimeoutSeconds: 5,
        });
    }

    // Run every day at 7:00 AM
    @Cron('0 7 * * *')
    async handleDailyAlerts() {
        this.logger.log('Starting daily email alerts job...');
        await this.processAlerts('daily');
    }

    // Run every Monday at 7:00 AM for weekly alerts
    @Cron('0 7 * * 1')
    async handleWeeklyAlerts() {
        this.logger.log('Starting weekly email alerts job...');
        await this.processAlerts('weekly');
    }

    // Manual trigger for testing
    async triggerAlertsManually(frequency: string = 'daily') {
        this.logger.log(`Manually triggering ${frequency} alerts...`);
        return this.processAlerts(frequency);
    }

    private async processAlerts(frequency: string) {
        try {
            // Get all saved searches with alerts enabled for this frequency
            // Only for paid users (non-free subscription)
            const savedSearches = await this.prisma.savedSearch.findMany({
                where: {
                    alertsEnabled: true,
                    alertFrequency: frequency,
                    user: {
                        subscription: {
                            plan: { not: 'free' },
                            status: 'active',
                        },
                    },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            });

            this.logger.log(`Found ${savedSearches.length} saved searches to process`);

            let emailsSent = 0;
            let errors = 0;

            for (const search of savedSearches) {
                try {
                    const newTenders = await this.findNewMatchingTenders(search);

                    if (newTenders.length > 0) {
                        const success = await this.emailService.sendTenderMatchAlert(
                            search.user.email,
                            search.user.name || 'User',
                            search.name,
                            newTenders,
                        );

                        if (success) {
                            emailsSent++;
                            // Update lastAlertedAt
                            await this.prisma.savedSearch.update({
                                where: { id: search.id },
                                data: { lastAlertedAt: new Date() },
                            });
                        }
                    }
                } catch (error) {
                    this.logger.error(`Error processing search ${search.id}: ${error}`);
                    errors++;
                }
            }

            this.logger.log(`Alerts complete: ${emailsSent} emails sent, ${errors} errors`);
            return { emailsSent, errors, searchesProcessed: savedSearches.length };
        } catch (error) {
            this.logger.error(`Alert job failed: ${error}`);
            throw error;
        }
    }

    private async findNewMatchingTenders(search: {
        id: string;
        criteria: string;
        lastAlertedAt: Date | null;
    }): Promise<{ title: string; closingDate: string | null; slug: string }[]> {
        try {
            const criteria = JSON.parse(search.criteria);

            // Build search query
            const query = criteria.q || '*';
            const filterBy: string[] = [];

            // Add date filter for new tenders since last alert
            if (search.lastAlertedAt) {
                const timestamp = Math.floor(search.lastAlertedAt.getTime() / 1000);
                filterBy.push(`publishedDate:>${timestamp}`);
            }

            // Add region filter
            if (criteria.region && Array.isArray(criteria.region) && criteria.region.length > 0) {
                filterBy.push(`region:[${criteria.region.join(',')}]`);
            }

            // Add category filter
            if (criteria.category && Array.isArray(criteria.category) && criteria.category.length > 0) {
                filterBy.push(`category:[${criteria.category.join(',')}]`);
            }

            // Add status filter
            if (criteria.status && Array.isArray(criteria.status) && criteria.status.length > 0) {
                filterBy.push(`status:[${criteria.status.join(',')}]`);
            }

            const searchResult = await this.typesenseClient
                .collections('tenders')
                .documents()
                .search({
                    q: query,
                    query_by: 'title,description,buyerName',
                    filter_by: filterBy.length > 0 ? filterBy.join(' && ') : undefined,
                    sort_by: 'publishedDate:desc',
                    per_page: 10, // Limit to 10 per email
                });

            return (searchResult.hits || []).map((hit: any) => ({
                title: hit.document.title || hit.document.description?.substring(0, 100),
                closingDate: hit.document.closingDate
                    ? new Date(hit.document.closingDate * 1000).toLocaleDateString('en-ZA')
                    : null,
                slug: hit.document.slug || hit.document.id,
            }));
        } catch (error) {
            this.logger.error(`Typesense search failed for search ${search.id}: ${error}`);
            return [];
        }
    }
}
