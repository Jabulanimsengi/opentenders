"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const count = await prisma.tender.count();
    const dateRange = await prisma.tender.aggregate({
        _min: { publishedDate: true },
        _max: { publishedDate: true }
    });
    console.log(`Total Tenders: ${count}`);
    console.log(`Date Range: ${dateRange._min.publishedDate} to ${dateRange._max.publishedDate}`);
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
