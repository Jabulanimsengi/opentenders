"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting duplicate cleanup...');
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
    const groups = new Map();
    for (const award of awards) {
        const key = `${award.tenderId}|${award.supplierName}`;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(award);
    }
    let duplicateGroups = 0;
    const toDelete = [];
    for (const [key, group] of groups.entries()) {
        if (group.length > 1) {
            duplicateGroups++;
            console.log(`\nPotential duplicate group: ${key}`);
            group.forEach(g => console.log(` - ID: ${g.id}, Amount: ${g.amount}, Date: ${g.date}`));
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
//# sourceMappingURL=cleanup-duplicates.js.map