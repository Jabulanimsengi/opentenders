"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
const api = axios_1.default.create({
    httpsAgent: new https_1.default.Agent({
        rejectUnauthorized: false
    })
});
async function runChunkedIngest() {
    // 180 days ago (6 months)
    const CUTOFF_DATE = (0, date_fns_1.subDays)(new Date(), 180);
    // Start from today
    let currentEndDate = new Date();
    let keepFetching = true;
    let totalIngested = 0;
    console.log(`Starting deep ingestion from ${(0, date_fns_1.format)(currentEndDate, 'yyyy-MM-dd')} back to ${(0, date_fns_1.format)(CUTOFF_DATE, 'yyyy-MM-dd')}`);
    while (keepFetching) {
        // Define 7-day window
        const currentStartDate = (0, date_fns_1.subDays)(currentEndDate, 7);
        // Format for API (YYYY-MM-DD)
        const dateFrom = (0, date_fns_1.format)(currentStartDate, 'yyyy-MM-dd');
        const dateTo = (0, date_fns_1.format)(currentEndDate, 'yyyy-MM-dd');
        console.log(`Fetching chunk: ${dateFrom} to ${dateTo}...`);
        try {
            let page = 1;
            let chunkHasMore = true;
            while (chunkHasMore) {
                // Throttle slightly
                await new Promise(r => setTimeout(r, 200));
                const url = `https://ocds-api.etenders.gov.za/api/OCDSReleases?PageNumber=${page}&PageSize=50&dateFrom=${dateFrom}&dateTo=${dateTo}`;
                const response = await api.get(url);
                const data = response.data?.releases; // Access 'releases' array
                if (!data || !Array.isArray(data) || data.length === 0) {
                    // Try to handle case where releases might be null but response is valid
                    // If releases is empty, we stop pagination for this chunk
                    chunkHasMore = false;
                    break;
                }
                console.log(`  Processing page ${page} (${data.length} items)...`);
                // Process Batch
                for (const item of data) {
                    const tender = {
                        ocid: item.ocid,
                        title: item.tender?.title || 'Untitled Tender',
                        description: item.tender?.description || '',
                        status: item.tender?.status || 'active',
                        publishedDate: item.date ? new Date(item.date) : new Date(),
                        closingDate: item.tender?.tenderPeriod?.endDate ? new Date(item.tender.tenderPeriod.endDate) : null,
                        briefingDate: item.tender?.briefing?.date ? new Date(item.tender.briefing.date) : null,
                        buyerName: item.buyer?.name || 'Unknown Buyer',
                        region: item.tender?.deliveryAddresses?.[0]?.region || 'National',
                        category: item.tender?.mainProcurementCategory || 'General',
                        rawData: JSON.stringify(item)
                    };
                    const savedTender = await prisma.tender.upsert({
                        where: { ocid: tender.ocid },
                        update: tender,
                        create: tender
                    });
                    // Process Awards
                    if (item.awards && Array.isArray(item.awards)) {
                        for (const award of item.awards) {
                            if (!award.suppliers?.[0]?.name)
                                continue;
                            await prisma.award.create({
                                data: {
                                    tenderId: savedTender.id,
                                    supplierName: award.suppliers[0].name,
                                    amount: award.value?.amount || 0,
                                    currency: award.value?.currency || 'ZAR',
                                    date: award.date ? new Date(award.date) : new Date(),
                                }
                            });
                        }
                    }
                }
                totalIngested += data.length;
                page++;
                // Safety break for huge chunks (unlikely in 7 days but safe)
                if (page > 50) {
                    console.log("  Reaching page limit for chunk. Moving on.");
                    chunkHasMore = false;
                }
            }
        }
        catch (error) {
            console.error(`Error processing chunk ${dateFrom}:`, error.message);
        }
        // Move window back
        currentEndDate = currentStartDate;
        if (currentEndDate < CUTOFF_DATE) {
            console.log("Reached cutoff date. Stopping.");
            keepFetching = false;
        }
    }
}
runChunkedIngest()
    .then(async () => {
    await prisma.$disconnect();
    console.log("Ingestion Complete.");
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
