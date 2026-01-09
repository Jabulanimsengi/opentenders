"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AlertsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_1 = require("../prisma");
const email_service_1 = require("../email/email.service");
const typesense_1 = require("typesense");
const config_1 = require("@nestjs/config");
let AlertsService = AlertsService_1 = class AlertsService {
    prisma;
    emailService;
    configService;
    logger = new common_1.Logger(AlertsService_1.name);
    typesenseClient;
    constructor(prisma, emailService, configService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.configService = configService;
        this.typesenseClient = new typesense_1.Client({
            nodes: [{
                    host: this.configService.get('TYPESENSE_HOST') || 'localhost',
                    port: parseInt(this.configService.get('TYPESENSE_PORT') || '8108'),
                    protocol: this.configService.get('TYPESENSE_PROTOCOL') || 'http',
                }],
            apiKey: this.configService.get('TYPESENSE_API_KEY') || 'xyz',
            connectionTimeoutSeconds: 5,
        });
    }
    async handleDailyAlerts() {
        this.logger.log('Starting daily email alerts job...');
        await this.processAlerts('daily');
    }
    async handleWeeklyAlerts() {
        this.logger.log('Starting weekly email alerts job...');
        await this.processAlerts('weekly');
    }
    async triggerAlertsManually(frequency = 'daily') {
        this.logger.log(`Manually triggering ${frequency} alerts...`);
        return this.processAlerts(frequency);
    }
    async processAlerts(frequency) {
        try {
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
                        const success = await this.emailService.sendTenderMatchAlert(search.user.email, search.user.name || 'User', search.name, newTenders);
                        if (success) {
                            emailsSent++;
                            await this.prisma.savedSearch.update({
                                where: { id: search.id },
                                data: { lastAlertedAt: new Date() },
                            });
                        }
                    }
                }
                catch (error) {
                    this.logger.error(`Error processing search ${search.id}: ${error}`);
                    errors++;
                }
            }
            this.logger.log(`Alerts complete: ${emailsSent} emails sent, ${errors} errors`);
            return { emailsSent, errors, searchesProcessed: savedSearches.length };
        }
        catch (error) {
            this.logger.error(`Alert job failed: ${error}`);
            throw error;
        }
    }
    async findNewMatchingTenders(search) {
        try {
            const criteria = JSON.parse(search.criteria);
            const query = criteria.q || '*';
            const filterBy = [];
            if (search.lastAlertedAt) {
                const timestamp = Math.floor(search.lastAlertedAt.getTime() / 1000);
                filterBy.push(`publishedDate:>${timestamp}`);
            }
            if (criteria.region && Array.isArray(criteria.region) && criteria.region.length > 0) {
                filterBy.push(`region:[${criteria.region.join(',')}]`);
            }
            if (criteria.category && Array.isArray(criteria.category) && criteria.category.length > 0) {
                filterBy.push(`category:[${criteria.category.join(',')}]`);
            }
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
                per_page: 10,
            });
            return (searchResult.hits || []).map((hit) => ({
                title: hit.document.title || hit.document.description?.substring(0, 100),
                closingDate: hit.document.closingDate
                    ? new Date(hit.document.closingDate * 1000).toLocaleDateString('en-ZA')
                    : null,
                slug: hit.document.slug || hit.document.id,
            }));
        }
        catch (error) {
            this.logger.error(`Typesense search failed for search ${search.id}: ${error}`);
            return [];
        }
    }
};
exports.AlertsService = AlertsService;
__decorate([
    (0, schedule_1.Cron)('0 7 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AlertsService.prototype, "handleDailyAlerts", null);
__decorate([
    (0, schedule_1.Cron)('0 7 * * 1'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AlertsService.prototype, "handleWeeklyAlerts", null);
exports.AlertsService = AlertsService = AlertsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        email_service_1.EmailService,
        config_1.ConfigService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map