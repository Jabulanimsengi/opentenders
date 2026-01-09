import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'typesense';
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

@Injectable()
export class TypesenseService implements OnModuleInit {
    private client: Client;
    private readonly logger = new Logger(TypesenseService.name);
    private readonly COLLECTION_NAME = 'tenders';

    constructor(private configService: ConfigService) {
        this.client = new Client({
            nodes: [
                {
                    host: this.configService.get('TYPESENSE_HOST') || 'localhost',
                    port: parseInt(this.configService.get('TYPESENSE_PORT') || '8108'),
                    protocol: this.configService.get('TYPESENSE_PROTOCOL') || 'http',
                },
            ],
            apiKey: this.configService.get('TYPESENSE_API_KEY') || 'tender-app-typesense-key',
            connectionTimeoutSeconds: 5,
        });
    }

    async onModuleInit() {
        try {
            await this.ensureCollection();
            this.logger.log('Typesense collection ready');
        } catch (error) {
            this.logger.warn('Typesense not available - search functionality disabled');
        }
    }

    private async ensureCollection() {
        const schema: CollectionCreateSchema = {
            name: this.COLLECTION_NAME,
            fields: [
                { name: 'id', type: 'string' },
                { name: 'title', type: 'string' },
                { name: 'description', type: 'string', optional: true },
                { name: 'buyerName', type: 'string', optional: true, facet: true },
                { name: 'region', type: 'string', optional: true, facet: true },
                { name: 'category', type: 'string', optional: true, facet: true },
                { name: 'status', type: 'string', optional: true, facet: true },
                { name: 'closingDate', type: 'int64', optional: true },
                { name: 'publishedDate', type: 'int64' },
                { name: 'slug', type: 'string', optional: true },
                { name: 'ocid', type: 'string', optional: true },
            ],
        };

        try {
            await this.client.collections(this.COLLECTION_NAME).retrieve();
            this.logger.log('Tenders collection exists');
        } catch {
            await this.client.collections().create(schema);
            this.logger.log('Created tenders collection');
        }
    }

    async indexTender(tender: any) {
        try {
            const document = {
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
            };

            await this.client
                .collections(this.COLLECTION_NAME)
                .documents()
                .upsert(document);
        } catch (error) {
            this.logger.error(`Failed to index tender ${tender.id}:`, error);
        }
    }

    async indexTenders(tenders: any[]) {
        if (!tenders.length) return;

        try {
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

            await this.client
                .collections(this.COLLECTION_NAME)
                .documents()
                .import(documents, { action: 'upsert' });

            this.logger.log(`Indexed ${documents.length} tenders to Typesense`);
        } catch (error) {
            this.logger.error('Failed to bulk index tenders:', error);
        }
    }

    async deleteTender(tenderId: string) {
        try {
            await this.client
                .collections(this.COLLECTION_NAME)
                .documents(tenderId)
                .delete();
        } catch (error) {
            this.logger.error(`Failed to delete tender ${tenderId} from index:`, error);
        }
    }

    async search(query: string, filters?: { region?: string; category?: string; status?: string }) {
        try {
            const filterBy: string[] = [];
            if (filters?.region) filterBy.push(`region:=${filters.region}`);
            if (filters?.category) filterBy.push(`category:=${filters.category}`);
            if (filters?.status) filterBy.push(`status:=${filters.status}`);

            const result = await this.client
                .collections(this.COLLECTION_NAME)
                .documents()
                .search({
                    q: query || '*',
                    query_by: 'title,description,buyerName',
                    filter_by: filterBy.join(' && ') || undefined,
                    sort_by: 'publishedDate:desc',
                    per_page: 50,
                    facet_by: 'region,category,status,buyerName',
                });

            return result;
        } catch (error) {
            this.logger.error('Search failed:', error);
            return { hits: [], found: 0 };
        }
    }

    getClient() {
        return this.client;
    }

    getCollectionName() {
        return this.COLLECTION_NAME;
    }
}
