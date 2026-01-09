import { PrismaClient } from '@prisma/client';
import Typesense from 'typesense';

const prisma = new PrismaClient();

const typesenseClient = new Typesense.Client({
    nodes: [
        {
            host: process.env.TYPESENSE_HOST || 'localhost',
            port: parseInt(process.env.TYPESENSE_PORT || '8108'),
            protocol: process.env.TYPESENSE_PROTOCOL || 'http',
        },
    ],
    apiKey: process.env.TYPESENSE_API_KEY || 'tender-app-typesense-key',
    connectionTimeoutSeconds: 10,
});

const COLLECTION_NAME = 'tenders';

async function ensureCollection() {
    const schema = {
        name: COLLECTION_NAME,
        fields: [
            { name: 'id', type: 'string' as const },
            { name: 'title', type: 'string' as const },
            { name: 'description', type: 'string' as const, optional: true },
            { name: 'buyerName', type: 'string' as const, optional: true, facet: true },
            { name: 'region', type: 'string' as const, optional: true, facet: true },
            { name: 'category', type: 'string' as const, optional: true, facet: true },
            { name: 'status', type: 'string' as const, optional: true, facet: true },
            { name: 'closingDate', type: 'int64' as const, optional: true },
            { name: 'publishedDate', type: 'int64' as const },
            { name: 'slug', type: 'string' as const, optional: true },
            { name: 'ocid', type: 'string' as const, optional: true },
        ],
    };

    try {
        await typesenseClient.collections(COLLECTION_NAME).retrieve();
        console.log('Collection exists, dropping and recreating...');
        await typesenseClient.collections(COLLECTION_NAME).delete();
    } catch {
        console.log('Collection does not exist, creating...');
    }

    await typesenseClient.collections().create(schema);
    console.log('Collection created');
}

async function indexAllTenders() {
    console.log('Fetching all tenders from database...');
    const tenders = await prisma.tender.findMany();
    console.log(`Found ${tenders.length} tenders`);

    if (tenders.length === 0) {
        console.log('No tenders to index');
        return;
    }

    const documents = tenders.map((tender) => ({
        id: tender.id,
        title: tender.title || '',
        description: tender.description || '',
        buyerName: tender.buyerName || '',
        region: tender.region || '',
        category: tender.category || '',
        status: tender.status || 'active',
        closingDate: tender.closingDate ? new Date(tender.closingDate).getTime() : 0,
        publishedDate: tender.publishedDate ? new Date(tender.publishedDate).getTime() : Date.now(),
        slug: tender.slug || tender.id,
        ocid: tender.ocid || '',
    }));

    console.log('Importing documents to Typesense...');
    const result = await typesenseClient
        .collections(COLLECTION_NAME)
        .documents()
        .import(documents, { action: 'upsert' });

    const successCount = result.filter((r: any) => r.success).length;
    const errorCount = result.filter((r: any) => !r.success).length;

    console.log(`✅ Indexed ${successCount} tenders successfully`);
    if (errorCount > 0) {
        console.log(`❌ ${errorCount} errors occurred`);
    }
}

async function main() {
    console.log('🔍 Typesense Bulk Indexer');
    console.log('========================\n');

    try {
        await ensureCollection();
        await indexAllTenders();
        console.log('\n✅ Bulk indexing complete!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
