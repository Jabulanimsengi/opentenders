import { prisma } from '@/lib/prisma';

export async function processAlerts() {
    const savedSearches = await (prisma as any).savedSearch.findMany({
        include: { user: true }
    });

    const results = [];

    for (const search of savedSearches) {
        const criteria = JSON.parse(search.criteria);
        const lastCheck = search.lastAlertedAt || search.createdAt;

        // Construct dynamic where clause from JSON criteria
        const where: any = {
            createdAt: { gt: lastCheck } // Only find NEWLY ingested tenders
        };

        if (criteria.q) {
            where.OR = [
                { title: { contains: criteria.q } },
                { description: { contains: criteria.q } }
            ];
        }
        if (criteria.region) where.region = { in: criteria.region };
        if (criteria.category) where.category = { in: criteria.category };
        if (criteria.buyer) where.buyerName = { in: criteria.buyer };

        const matchingTenders = await prisma.tender.findMany({ where });

        if (matchingTenders.length > 0) {
            // Here we would send the email
            console.log(`[ALERT] Sending email to ${search.user.email} for search "${search.name}" - Found ${matchingTenders.length} new tenders.`);

            await (prisma as any).savedSearch.update({
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
