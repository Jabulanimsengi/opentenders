import { PrismaClient } from '@prisma/client';
import Typesense from 'typesense';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import { buildTenderCategorySearchText } from '../src/tenders/tender-categories';

const prisma = new PrismaClient();

const COLLECTION_NAME = 'tenders';
const BATCH_SIZE = Number(process.env.TYPESENSE_INDEX_BATCH_SIZE || 500);

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: Number(process.env.TYPESENSE_PORT || 8108),
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || 'tender-app-typesense-key',
  connectionTimeoutSeconds: Number(process.env.TYPESENSE_TIMEOUT_SECONDS || 10),
});

const schema: CollectionCreateSchema = {
  name: COLLECTION_NAME,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'description', type: 'string', optional: true },
    { name: 'buyerName', type: 'string', optional: true, facet: true },
    { name: 'region', type: 'string', optional: true, facet: true },
    { name: 'province', type: 'string', optional: true, facet: true },
    { name: 'category', type: 'string', optional: true, facet: true },
    { name: 'categoryKeywords', type: 'string', optional: true },
    { name: 'status', type: 'string', optional: true, facet: true },
    { name: 'tenderNumber', type: 'string', optional: true },
    { name: 'referenceNumber', type: 'string', optional: true },
    { name: 'sourceName', type: 'string', optional: true, facet: true },
    { name: 'sourceType', type: 'string', optional: true, facet: true },
    { name: 'sourceUrl', type: 'string', optional: true },
    { name: 'slug', type: 'string', optional: true },
    { name: 'ocid', type: 'string', optional: true },
    { name: 'closingDate', type: 'int64', optional: true, facet: true },
    { name: 'publishedDate', type: 'int64', facet: true },
  ],
  default_sorting_field: 'publishedDate',
};

async function recreateCollection() {
  try {
    await typesenseClient.collections(COLLECTION_NAME).delete();
    console.log(`Deleted existing ${COLLECTION_NAME} collection`);
  } catch {
    console.log(`No existing ${COLLECTION_NAME} collection found`);
  }

  await typesenseClient.collections().create(schema);
  console.log(`Created ${COLLECTION_NAME} collection`);
}

function toDocument(tender: any) {
  return {
    id: String(tender.id),
    title: tender.title || '',
    description: tender.description || '',
    buyerName: tender.buyerName || '',
    region: tender.region || '',
    province: tender.province || '',
    category: tender.category || '',
    categoryKeywords: buildTenderCategorySearchText(tender.category),
    status: tender.status || 'active',
    tenderNumber: tender.tenderNumber || '',
    referenceNumber: tender.referenceNumber || '',
    sourceName: tender.sourceName || '',
    sourceType: tender.sourceType || '',
    sourceUrl: tender.sourceUrl || '',
    slug: tender.slug || tender.id,
    ocid: tender.ocid || '',
    closingDate: tender.closingDate
      ? new Date(tender.closingDate).getTime()
      : 0,
    publishedDate: tender.publishedDate
      ? new Date(tender.publishedDate).getTime()
      : Date.now(),
  };
}

async function indexAllTenders() {
  let cursor: string | undefined;
  let indexed = 0;
  let failed = 0;

  while (true) {
    const tenders = await prisma.tender.findMany({
      take: BATCH_SIZE,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      orderBy: { id: 'asc' },
    });

    if (tenders.length === 0) break;

    const result = await typesenseClient
      .collections(COLLECTION_NAME)
      .documents()
      .import(tenders.map(toDocument), { action: 'upsert' });

    indexed += result.filter((item: any) => item.success).length;
    failed += result.filter((item: any) => !item.success).length;
    cursor = tenders[tenders.length - 1].id;
    console.log(`Indexed ${indexed} tenders so far`);
  }

  console.log(
    `Typesense reindex complete. Indexed: ${indexed}. Failed: ${failed}.`,
  );
}

async function main() {
  try {
    console.log('Starting Typesense tender reindex');
    await recreateCollection();
    await indexAllTenders();
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
