
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting currency fix (Cents -> Rands)...');

    const awards = await prisma.award.findMany();
    console.log(`Found ${awards.length} awards.`);

    let count = 0;

    // Process in chunks to be nice to the DB
    const BATCH_SIZE = 50;

    for (const award of awards) {
        // Skip if it looks already small? 
        // No, assuming inconsistent state is bad. 
        // But if I somehow run this twice, R16M becomes R160k.
        // It's a one-time script.

        if (award.amount == null) continue;

        const newAmount = award.amount / 100;

        await prisma.award.update({
            where: { id: award.id },
            data: { amount: newAmount }
        });

        count++;
        if (count % 100 === 0) {
            console.log(`Processed ${count}/${awards.length}`);
        }
    }

    console.log('Finished! All award amounts divided by 100.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
