import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { TenderQueryDto } from './dto';
import { addDays } from 'date-fns';

@Injectable()
export class TendersService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: TenderQueryDto) {
        const { q, page = 1, limit = 20, status, region, category, buyer } = query;
        const skip = (page - 1) * limit;

        const where: any = {};

        // Text search
        if (q) {
            where.OR = [
                { title: { contains: q } },
                { description: { contains: q } },
                { buyerName: { contains: q } },
            ];
        }

        // Status filter with computed values
        if (status && status.length > 0) {
            const statusConditions: any[] = [];
            const now = new Date();
            const inSevenDays = addDays(now, 7);

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
                } else {
                    where.OR = statusConditions;
                }
            }
        }

        if (region && region.length > 0) where.region = { in: region };
        if (category && category.length > 0) where.category = { in: category };
        if (buyer && buyer.length > 0) where.buyerName = { in: buyer };

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

    async findOne(slugOrId: string) {
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
        const sevenDaysAgo = addDays(now, -7);
        const inSevenDays = addDays(now, 7);

        const [
            totalCount,
            newThisWeek,
            closingSoon,
            activeCount,
            closedCount,
            cancelledCount,
            awardedCount,
        ] = await Promise.all([
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
            // Use raw query for Award count since client generation failed
            this.prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM Award`.then((r: any) => Number(r[0].count)).catch(() => 0),
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
            regions: regions.map((r: any) => ({ value: r.region, count: r._count.region })),
            categories: categories.map((c: any) => ({ value: c.category, count: c._count.category })),
            buyers: buyers.map((b: any) => ({ value: b.buyerName, count: b._count.buyerName })),
        };
    }
}
