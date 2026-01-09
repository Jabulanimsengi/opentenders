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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TendersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const date_fns_1 = require("date-fns");
let TendersService = class TendersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { q, page = 1, limit = 20, status, region, category, buyer } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (q) {
            where.OR = [
                { title: { contains: q } },
                { description: { contains: q } },
                { buyerName: { contains: q } },
            ];
        }
        if (status && status.length > 0) {
            const statusConditions = [];
            const now = new Date();
            const inSevenDays = (0, date_fns_1.addDays)(now, 7);
            if (status.includes('active')) {
                statusConditions.push({
                    status: 'active',
                    OR: [
                        { closingDate: { gt: inSevenDays } },
                        { closingDate: null },
                    ],
                });
            }
            if (status.includes('closing-soon')) {
                statusConditions.push({
                    status: 'active',
                    closingDate: { gte: now, lte: inSevenDays },
                });
            }
            if (status.includes('closed')) {
                statusConditions.push({
                    status: { not: 'cancelled' },
                    closingDate: { lt: now },
                });
            }
            if (status.includes('cancelled')) {
                statusConditions.push({ status: 'cancelled' });
            }
            if (statusConditions.length > 0) {
                if (q && where.OR) {
                    where.AND = [
                        { OR: where.OR },
                        { OR: statusConditions },
                    ];
                    delete where.OR;
                }
                else {
                    where.OR = statusConditions;
                }
            }
        }
        if (region && region.length > 0)
            where.region = { in: region };
        if (category && category.length > 0)
            where.category = { in: category };
        if (buyer && buyer.length > 0)
            where.buyerName = { in: buyer };
        const [tenders, total] = await Promise.all([
            this.prisma.tender.findMany({
                where,
                orderBy: { publishedDate: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.tender.count({ where }),
        ]);
        return {
            data: tenders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(slugOrId) {
        return this.prisma.tender.findFirst({
            where: {
                OR: [
                    { id: slugOrId },
                    { slug: slugOrId }
                ]
            },
        });
    }
    async getStats() {
        const now = new Date();
        const sevenDaysAgo = (0, date_fns_1.addDays)(now, -7);
        const inSevenDays = (0, date_fns_1.addDays)(now, 7);
        const [totalCount, newThisWeek, closingSoon, activeCount, closedCount, cancelledCount, awardedCount,] = await Promise.all([
            this.prisma.tender.count(),
            this.prisma.tender.count({
                where: { publishedDate: { gte: sevenDaysAgo } },
            }),
            this.prisma.tender.count({
                where: {
                    closingDate: { gte: now, lte: inSevenDays },
                    status: 'active',
                },
            }),
            this.prisma.tender.count({
                where: {
                    status: 'active',
                    OR: [{ closingDate: { gt: now } }, { closingDate: null }],
                },
            }),
            this.prisma.tender.count({
                where: { closingDate: { lt: now } },
            }),
            this.prisma.tender.count({ where: { status: 'cancelled' } }),
            this.prisma.$queryRaw `SELECT COUNT(*) as count FROM Award`.then((r) => Number(r[0].count)).catch(() => 0),
        ]);
        return {
            totalCount,
            newThisWeek,
            closingSoon,
            activeCount,
            closedCount,
            cancelledCount,
            awardedCount,
        };
    }
    async getFacets() {
        const [regions, categories, buyers] = await Promise.all([
            this.prisma.tender.groupBy({
                by: ['region'],
                _count: { region: true },
                where: { region: { not: null } },
                orderBy: { _count: { region: 'desc' } },
                take: 20,
            }),
            this.prisma.tender.groupBy({
                by: ['category'],
                _count: { category: true },
                where: { category: { not: null } },
                orderBy: { _count: { category: 'desc' } },
                take: 20,
            }),
            this.prisma.tender.groupBy({
                by: ['buyerName'],
                _count: { buyerName: true },
                where: { buyerName: { not: null } },
                orderBy: { _count: { buyerName: 'desc' } },
                take: 20,
            }),
        ]);
        return {
            regions: regions.map((r) => ({ value: r.region, count: r._count.region })),
            categories: categories.map((c) => ({ value: c.category, count: c._count.category })),
            buyers: buyers.map((b) => ({ value: b.buyerName, count: b._count.buyerName })),
        };
    }
};
exports.TendersService = TendersService;
exports.TendersService = TendersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], TendersService);
//# sourceMappingURL=tenders.service.js.map