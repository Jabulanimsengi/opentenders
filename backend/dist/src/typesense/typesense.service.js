"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TypesenseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypesenseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typesense_1 = require("typesense");
let TypesenseService = TypesenseService_1 = class TypesenseService {
    configService;
    client;
    logger = new common_1.Logger(TypesenseService_1.name);
    COLLECTION_NAME = 'tenders';
    constructor(configService) {
        this.configService = configService;
        this.client = new typesense_1.Client({
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
        }
        catch (error) {
            this.logger.warn('Typesense not available - search functionality disabled');
        }
    }
    async ensureCollection() {
        const schema = {
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
        }
        catch {
            await this.client.collections().create(schema);
            this.logger.log('Created tenders collection');
        }
    }
    async indexTender(tender) {
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
        }
        catch (error) {
            this.logger.error(`Failed to index tender ${tender.id}:`, error);
        }
    }
    async indexTenders(tenders) {
        if (!tenders.length)
            return;
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
        }
        catch (error) {
            this.logger.error('Failed to bulk index tenders:', error);
        }
    }
    async deleteTender(tenderId) {
        try {
            await this.client
                .collections(this.COLLECTION_NAME)
                .documents(tenderId)
                .delete();
        }
        catch (error) {
            this.logger.error(`Failed to delete tender ${tenderId} from index:`, error);
        }
    }
    async search(query, filters) {
        try {
            const filterBy = [];
            if (filters?.region)
                filterBy.push(`region:=${filters.region}`);
            if (filters?.category)
                filterBy.push(`category:=${filters.category}`);
            if (filters?.status)
                filterBy.push(`status:=${filters.status}`);
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
        }
        catch (error) {
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
};
exports.TypesenseService = TypesenseService;
exports.TypesenseService = TypesenseService = TypesenseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TypesenseService);
//# sourceMappingURL=typesense.service.js.map