import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import https from 'https';
import { subDays, format } from 'date-fns';

const prisma = new PrismaClient();

const api = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

async function runChunkedIngest() {
    // 180 days ago (6 months)
    const CUTOFF_DATE = subDays(new Date(), 180);

    // Start from today
    let currentEndDate = new Date();
    let keepFetching = true;
    let totalIngested = 0;

    console.log(`Starting deep ingestion from ${format(currentEndDate, 'yyyy-MM-dd')} back to ${format(CUTOFF_DATE, 'yyyy-MM-dd')}`);

    while (keepFetching) {
        // Define 7-day window
        const currentStartDate = subDays(currentEndDate, 7);

        // Format for API (YYYY-MM-DD)
        const dateFrom = format(currentStartDate, 'yyyy-MM-dd');
        const dateTo = format(currentEndDate, 'yyyy-MM-dd');

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
                    // Extract contact person
                    const contact = item.tender?.contactPerson;

                    // Extract briefing session details
                    const briefing = item.tender?.briefingSession;

                    // Extract value
                    const value = item.tender?.value;

                    const tender = {
                        ocid: item.ocid,
                        title: item.tender?.title || 'Untitled Tender',
                        description: item.tender?.description || '',
                        status: item.tender?.status || 'active',
                        publishedDate: item.date ? new Date(item.date) : new Date(),
                        closingDate: item.tender?.tenderPeriod?.endDate ? new Date(item.tender.tenderPeriod.endDate) : null,
                        briefingDate: briefing?.date ? new Date(briefing.date) : null,
                        briefingVenue: briefing?.venue || null,
                        briefingCompulsory: briefing?.compulsory || false,
                        buyerName: item.buyer?.name || 'Unknown Buyer',
                        region: item.tender?.deliveryAddresses?.[0]?.region || 'National',
                        province: item.tender?.province || null,
                        category: item.tender?.mainProcurementCategory || 'General',

                        // Contact person
                        contactName: contact?.name || null,
                        contactEmail: contact?.email || null,
                        contactPhone: contact?.telephoneNumber || null,

                        // Value
                        estimatedValue: value?.amount || null,
                        currency: value?.currency || 'ZAR',

                        // Requirements
                        eligibilityCriteria: item.tender?.eligibilityCriteria || null,
                        specialConditions: item.tender?.specialConditions || null,
                        submissionMethod: item.tender?.submissionMethod?.join(', ') || null,

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
                            if (!award.suppliers?.[0]?.name) continue;

                            await (prisma as any).award.upsert({
                                where: {
                                    tenderId_supplierName: {
                                        tenderId: savedTender.id,
                                        supplierName: award.suppliers[0].name,
                                    }
                                },
                                update: {
                                    amount: award.value?.amount || 0,
                                    currency: award.value?.currency || 'ZAR',
                                    date: award.date ? new Date(award.date) : new Date(),
                                },
                                create: {
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

        } catch (error: any) {
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
