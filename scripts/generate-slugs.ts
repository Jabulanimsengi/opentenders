// Script to generate slugs for existing tenders
import { PrismaClient } from '@prisma/client';
import { generateSlug } from '../frontend/lib/slug';

const prisma = new PrismaClient();

// Check if string looks like a short code/OCID (no spaces, less than 20 chars, mostly alphanumeric)
function isShortCode(str: string): boolean {
    if (!str) return true;
    const trimmed = str.trim();
    // Short codes don't have spaces and are typically under 20 chars
    return !trimmed.includes(' ') && trimmed.length < 25;
}

async function generateSlugs() {
    console.log('Fetching tenders...');

    const tenders = await prisma.tender.findMany({
        select: { id: true, title: true, description: true, ocid: true }
    });

    console.log(`Found ${tenders.length} tenders to update`);

    let updated = 0;
    let usedDescription = 0;

    for (const tender of tenders) {
        // Use description for slug if title looks like a short code AND description has actual words
        let baseText = tender.title;

        if (isShortCode(tender.title) && tender.description && tender.description.includes(' ')) {
            // Take first 100 chars of description
            baseText = tender.description.substring(0, 100);
            usedDescription++;
        }

        const slug = generateSlug(baseText, tender.id);

        try {
            await prisma.tender.update({
                where: { id: tender.id },
                data: { slug }
            });
            updated++;

            if (updated % 500 === 0) {
                console.log(`Updated ${updated} tenders...`);
            }
        } catch (error) {
            console.error(`Failed to update tender ${tender.id}:`, error);
        }
    }

    console.log(`\nDone! Updated ${updated} tenders with slugs.`);
    console.log(`Used description for ${usedDescription} tenders (title was a short code)`);
}

generateSlugs()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
