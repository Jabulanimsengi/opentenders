import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting duplicate cleanup...');

    // 1. Fetch all awards
    const awards = await prisma.award.findMany({
        select: {
            id: true,
            tenderId: true,
            supplierName: true,
            amount: true,
            date: true,
        }
    });

    console.log(`Scanned ${awards.length} total awards.`);

    // Group by tenderId + supplierName
    const groups = new Map<string, typeof awards>();

    for (const award of awards) {
        const key = `${award.tenderId}|${award.supplierName}`;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(award);
    }

    let duplicateGroups = 0;
    const toDelete: string[] = [];

    for (const [key, group] of groups.entries()) {
        if (group.length > 1) {
            duplicateGroups++;
            console.log(`\nPotential duplicate group: ${key}`);
            group.forEach(g => console.log(` - ID: ${g.id}, Amount: ${g.amount}, Date: ${g.date}`));

            // Delete all but the first one
            // We'll keep the first one encountered in the list (or sort by creation if we had it, but mostly arbitrary)
            const [keep, ...remove] = group;
            remove.forEach(r => toDelete.push(r.id));
        }
    }

    if (duplicateGroups === 0) {
        console.log('No duplicates found by [tenderId + supplierName].');
        return;
    }

    console.log(`\nFound ${duplicateGroups} groups with duplicates.`);
    console.log(`Preparing to delete ${toDelete.length} records...`);

    // 2. Delete duplicates
    const BATCH_SIZE = 100;
    for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
        const batch = toDelete.slice(i, i + BATCH_SIZE);
        await prisma.award.deleteMany({
            where: {
                id: {
                    in: batch
                }
            }
        });
        console.log(`Deleted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} records)`);
    }

    console.log('Cleanup complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
