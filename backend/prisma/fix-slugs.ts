import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(title: string, ocid: string): string {
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

async function fixSlugs() {
    console.log('Fixing slugs for all tenders without slugs...');

    // Get all tenders without slugs
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
        } catch (error: any) {
            // Handle duplicate slug error by appending random suffix
            if (error.code === 'P2002') {
                const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
                await prisma.tender.update({
                    where: { id: tender.id },
                    data: { slug: uniqueSlug }
                });
                updated++;
            } else {
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
