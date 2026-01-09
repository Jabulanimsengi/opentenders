"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function generateSlug(title, ocid) {
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
async function fixSlugs() {
    console.log('Fixing slugs for all tenders without slugs...');
    const tendersWithoutSlugs = await prisma.tender.findMany({
        where: {
            OR: [
                { slug: null },
                { slug: '' }
            ]
        },
        select: {
            id: true,
            title: true,
            ocid: true
        }
    });
    console.log(`Found ${tendersWithoutSlugs.length} tenders without slugs`);
    let updated = 0;
    for (const tender of tendersWithoutSlugs) {
        const slug = generateSlug(tender.title, tender.ocid);
        try {
            await prisma.tender.update({
                where: { id: tender.id },
                data: { slug }
            });
            updated++;
            if (updated % 500 === 0) {
                console.log(`Updated ${updated}/${tendersWithoutSlugs.length} slugs...`);
            }
        }
        catch (error) {
            if (error.code === 'P2002') {
                const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
                await prisma.tender.update({
                    where: { id: tender.id },
                    data: { slug: uniqueSlug }
                });
                updated++;
            }
            else {
                console.error(`Error updating tender ${tender.id}:`, error.message);
            }
        }
    }
    console.log(`\nFinished! Updated ${updated} tender slugs.`);
}
fixSlugs()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=fix-slugs.js.map