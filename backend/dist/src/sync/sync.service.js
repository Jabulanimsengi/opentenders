"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const typesense_service_1 = require("../typesense/typesense.service");
const axios_1 = __importDefault(require("axios"));
const https = __importStar(require("https"));
const date_fns_1 = require("date-fns");
const api = axios_1.default.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    timeout: 30000,
});
let SyncService = SyncService_1 = class SyncService {
    prisma;
    emailService;
    typesenseService;
    logger = new common_1.Logger(SyncService_1.name);
    apiBaseUrl = 'https://ocds-api.etenders.gov.za/api/OCDSReleases';
    constructor(prisma, emailService, typesenseService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.typesenseService = typesenseService;
    }
    generateSlug(title, ocid) {
        const baseSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 80);
        const ocidSuffix = ocid.split('-').pop() || ocid.substring(ocid.length - 6);
        return `${baseSlug}-${ocidSuffix}`;
    }
    async syncNewTenders() {
        this.logger.log('Starting scheduled tender sync...');
        await this.fetchRecentTenders(24);
    }
    async sendDailyDigest() {
        this.logger.log('Sending daily digest alerts...');
        await this.processAlerts();
    }
    async sendClosingReminders() {
        this.logger.log('Processing closing reminders...');
        await this.processClosingReminders();
    }
    async fetchRecentTenders(hoursBack = 24) {
        const dateFrom = (0, date_fns_1.format)((0, date_fns_1.subHours)(new Date(), hoursBack), 'yyyy-MM-dd');
        const dateTo = (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd');
        this.logger.log(`Fetching tenders from ${dateFrom} to ${dateTo}`);
        let totalIngested = 0;
        let page = 1;
        let hasMore = true;
        while (hasMore) {
            try {
                const url = `${this.apiBaseUrl}?PageNumber=${page}&PageSize=50&dateFrom=${dateFrom}&dateTo=${dateTo}`;
                const response = await api.get(url);
                const releases = response.data?.releases || [];
                if (releases.length === 0) {
                    hasMore = false;
                    break;
                }
                for (const item of releases) {
                    await this.upsertTender(item);
                    totalIngested++;
                }
                page++;
                await this.delay(200);
                if (page > 20) {
                    this.logger.warn('Reached page limit, stopping');
                    hasMore = false;
                }
            }
            catch (error) {
                this.logger.error(`Sync error: ${error.message}`);
                hasMore = false;
            }
        }
        this.logger.log(`Sync complete: ${totalIngested} tenders processed`);
        return totalIngested;
    }
    async upsertTender(item) {
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
        await this.typesenseService.indexTender(result);
    }
    async processAlerts() {
        const searches = await this.prisma.savedSearch.findMany({
            where: {
                OR: [
                    { lastAlertedAt: null },
                    { lastAlertedAt: { lt: (0, date_fns_1.subHours)(new Date(), 24) } },
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
                    await this.emailService.sendTenderMatchAlert(search.user.email, search.user.name || 'User', search.name, matchingTenders.map((t) => ({
                        title: t.title,
                        closingDate: t.closingDate ? (0, date_fns_1.format)(t.closingDate, 'dd MMM yyyy') : null,
                        slug: t.slug || t.id,
                    })));
                    await this.prisma.savedSearch.update({
                        where: { id: search.id },
                        data: { lastAlertedAt: new Date() },
                    });
                }
            }
            catch (error) {
                this.logger.error(`Alert processing error for search ${search.id}: ${error.message}`);
            }
        }
    }
    async findMatchingTenders(criteria, since) {
        const where = {};
        if (since) {
            where.createdAt = { gt: since };
        }
        else {
            where.createdAt = { gt: (0, date_fns_1.subHours)(new Date(), 24) };
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
        const remindDays = [7, 3, 1];
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
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async triggerSync() {
        return this.fetchRecentTenders(24);
    }
};
exports.SyncService = SyncService;
__decorate([
    (0, schedule_1.Cron)('0 */4 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncService.prototype, "syncNewTenders", null);
__decorate([
    (0, schedule_1.Cron)('0 6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncService.prototype, "sendDailyDigest", null);
__decorate([
    (0, schedule_1.Cron)('0 7 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncService.prototype, "sendClosingReminders", null);
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        typesense_service_1.TypesenseService])
], SyncService);
//# sourceMappingURL=sync.service.js.map