import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'typesense';
export declare class TypesenseService implements OnModuleInit {
    private configService;
    private client;
    private readonly logger;
    private readonly COLLECTION_NAME;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private ensureCollection;
    indexTender(tender: any): Promise<void>;
    indexTenders(tenders: any[]): Promise<void>;
    deleteTender(tenderId: string): Promise<void>;
    search(query: string, filters?: {
        region?: string;
        category?: string;
        status?: string;
    }): Promise<import("typesense/lib/Typesense/Documents").SearchResponse<object> | {
        hits: never[];
        found: number;
    }>;
    getClient(): Client;
    getCollectionName(): string;
}
