"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting currency fix (Cents -> Rands)...');
    const awards = await prisma.award.findMany();
    console.log(`Found ${awards.length} awards.`);
    let count = 0;
    const BATCH_SIZE = 50;
    for (const award of awards) {
        if (award.amount == null)
            continue;
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
//# sourceMappingURL=fix-cents.js.map