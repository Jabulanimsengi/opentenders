import { NextResponse } from 'next/server';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { subDays, format } from 'date-fns';
import https from 'https';

const prisma = new PrismaClient();

const API_BASE = 'https://ocds-api.etenders.gov.za/api';
const FIRST_SUPPORTED_ADVERTISED_DATE = new Date('2025-01-01T00:00:00.000Z');

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

export const dynamic = 'force-dynamic'; // prevent caching

function isValidAdvertisedDate(date: Date | null): date is Date {
    if (!date || Number.isNaN(date.getTime())) return false;
    return date >= FIRST_SUPPORTED_ADVERTISED_DATE && date <= new Date();
}

async function fetchReleases(page = 1, pageSize = 50, dateFrom?: string, dateTo?: string) {
    try {
        const params: any = { PageNumber: page, PageSize: pageSize };
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;

        console.log(`Fetching page ${page}...`);
        const response = await axios.get(`${API_BASE}/OCDSReleases`, {
            params,
            httpsAgent
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('API Error:', error.message);
        } else {
            console.error('Error fetching releases:', error);
        }
        return null;
    }
}

export async function GET() {
    const dateFrom = format(subDays(new Date(), 90), 'yyyy-MM-dd');
    const dateTo = format(new Date(), 'yyyy-MM-dd');

    let page = 1;
    const pageSize = 50;
    let hasMore = true;
    let totalProcessed = 0;

    try {
        // Limit to 2 pages for initial test
        while (hasMore && page <= 2) {
            const data = await fetchReleases(page, pageSize, dateFrom, dateTo);

            if (!data || !data.releases || data.releases.length === 0) {
                hasMore = false;
                break;
            }

            const releases = data.releases;

            for (const release of releases) {
                if (!release.tender) continue;
                const tender = release.tender;
                const ocid = release.ocid;

                if (!ocid) continue;
                const advertisedDate = tender.tenderPeriod?.startDate
                    ? new Date(tender.tenderPeriod.startDate)
                    : release.date
                        ? new Date(release.date)
                        : null;

                if (!isValidAdvertisedDate(advertisedDate)) {
                    console.warn(`Skipping ${ocid}: invalid source advertised date`);
                    continue;
                }
                const closingDate = tender.tenderPeriod?.endDate ? new Date(tender.tenderPeriod.endDate) : null;
                const validClosingDate =
                    closingDate && !Number.isNaN(closingDate.getTime())
                        ? closingDate
                        : null;

                if (validClosingDate && validClosingDate < advertisedDate) {
                    console.warn(`Skipping ${ocid}: closing date is before advertised date`);
                    continue;
                }

                let buyerName = tender.buyer?.name;
                if (!buyerName && release.buyer?.name) buyerName = release.buyer.name;
                if (!buyerName && release.parties) {
                    const p = release.parties.find((x: any) => x.roles?.includes('buyer'));
                    if (p) buyerName = p.name;
                }

                let region = null;
                if (tender.deliveryAddresses && tender.deliveryAddresses.length > 0) {
                    region = tender.deliveryAddresses[0].region || tender.deliveryAddresses[0].locality;
                }

                await prisma.tender.upsert({
                    where: { ocid: ocid },
                    update: {
                        title: tender.title || 'Untitled',
                        description: tender.description,
                        status: tender.status,
                        publishedDate: advertisedDate,
                        closingDate: validClosingDate,
                        briefingDate: tender.briefingSession?.date ? new Date(tender.briefingSession.date) : null,
                        buyerName: buyerName,
                        category: tender.mainProcurementCategory,
                        region: region,
                        updatedAt: new Date(),
                        rawData: JSON.stringify(release)
                    },
                    create: {
                        ocid: ocid,
                        title: tender.title || 'Untitled',
                        description: tender.description,
                        status: tender.status,
                        publishedDate: advertisedDate,
                        closingDate: validClosingDate,
                        briefingDate: tender.briefingSession?.date ? new Date(tender.briefingSession.date) : null,
                        buyerName: buyerName,
                        category: tender.mainProcurementCategory,
                        region: region,
                        rawData: JSON.stringify(release)
                    }
                });
                totalProcessed++;
            }
            page++;
            await new Promise(r => setTimeout(r, 200));
        }

        return NextResponse.json({ success: true, processed: totalProcessed });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
