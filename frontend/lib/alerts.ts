import { prisma } from '@/lib/prisma';
import { buildTenderSmartSearchCondition } from '@/lib/smart-search';
import { Prisma } from '@prisma/client';

interface SavedSearchWithUser {
    id: string;
    name: string;
    criteria: string;
    lastAlertedAt: Date | null;
    createdAt: Date;
    user: {
        email: string;
    };
}

interface SavedSearchStore {
    findMany(args: unknown): Promise<SavedSearchWithUser[]>;
    update(args: unknown): Promise<unknown>;
}

type PrismaWithSavedSearches = typeof prisma & {
    savedSearch: SavedSearchStore;
};

export async function processAlerts() {
    const db = prisma as PrismaWithSavedSearches;
    const savedSearches = await db.savedSearch.findMany({
        include: { user: true }
    });

    const results = [];

    for (const search of savedSearches) {
        const criteria = JSON.parse(search.criteria);
        const lastCheck = search.lastAlertedAt || search.createdAt;

        // Construct dynamic where clause from JSON criteria
        const where: Prisma.TenderWhereInput = {
            createdAt: { gt: lastCheck } // Only find NEWLY ingested tenders
        };

        const searchCondition = buildTenderSmartSearchCondition(criteria.q);
        if (searchCondition) {
            where.AND = [
                ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
                searchCondition,
            ];
        }
        if (criteria.region) where.region = { in: criteria.region };
        if (criteria.category) where.category = { in: criteria.category };
        if (criteria.buyer) where.buyerName = { in: criteria.buyer };

        const matchingTenders = await prisma.tender.findMany({ where });

        if (matchingTenders.length > 0) {
            // Here we would send the email
            console.log(`[ALERT] Sending email to ${search.user.email} for search "${search.name}" - Found ${matchingTenders.length} new tenders.`);

            await db.savedSearch.update({
                where: { id: search.id },
                data: { lastAlertedAt: new Date() }
            });

            results.push({
                user: search.user.email,
                search: search.name,
                count: matchingTenders.length
            });
        }
    }

    return results;
}
