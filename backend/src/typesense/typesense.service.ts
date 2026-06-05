import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Typesense from 'typesense';
import type { SearchResponse } from 'typesense/lib/Typesense/Documents';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import {
  firstSupportedAdvertisedDate,
  recentUndatedTenderThreshold,
} from '../tenders/tender-date-rules';

export type TenderSearchDocument = {
  id: string;
  title: string;
  description: string;
  buyerName: string;
  region: string;
  province: string;
  category: string;
  status: string;
  tenderNumber: string;
  referenceNumber: string;
  sourceName: string;
  sourceType: string;
  sourceUrl: string;
  slug: string;
  ocid: string;
  closingDate: number;
  publishedDate: number;
};

export type TenderSearchParams = {
  q?: string;
  page?: number;
  limit?: number;
  status?: string[];
  region?: string[];
  category?: string[];
  buyer?: string[];
};

const COLLECTION_NAME = 'tenders';

@Injectable()
export class TypesenseService implements OnModuleInit {
  private readonly logger = new Logger(TypesenseService.name);
  private readonly client: InstanceType<typeof Typesense.Client>;
  private ready = false;

  constructor(private readonly configService: ConfigService) {
    this.client = new Typesense.Client({
      nodes: [
        {
          host: this.configService.get<string>('TYPESENSE_HOST') || 'localhost',
          port: Number(
            this.configService.get<string>('TYPESENSE_PORT') || 8108,
          ),
          protocol:
            this.configService.get<string>('TYPESENSE_PROTOCOL') || 'http',
        },
      ],
      apiKey:
        this.configService.get<string>('TYPESENSE_API_KEY') ||
        'tender-app-typesense-key',
      connectionTimeoutSeconds: Number(
        this.configService.get<string>('TYPESENSE_TIMEOUT_SECONDS') || 3,
      ),
    });
  }

  async onModuleInit() {
    try {
      await this.ensureCollection();
      this.ready = true;
      this.logger.log('Typesense tender index is ready');
    } catch (error) {
      this.ready = false;
      this.logger.warn(
        `Typesense unavailable; Prisma search fallback remains active: ${this.describeError(error)}`,
      );
    }
  }

  isReady() {
    return this.ready;
  }

  getCollectionName() {
    return COLLECTION_NAME;
  }

  getClient() {
    return this.client;
  }

  async ensureCollection() {
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

    try {
      await this.client.collections(COLLECTION_NAME).retrieve();
    } catch {
      await this.client.collections().create(schema);
    }
  }

  async indexTender(tender: any) {
    if (!this.ready) return;
    try {
      await this.client
        .collections<TenderSearchDocument>(COLLECTION_NAME)
        .documents()
        .upsert(this.toDocument(tender));
    } catch (error) {
      this.logger.warn(
        `Failed to index tender ${tender?.id || tender?.ocid}: ${this.describeError(error)}`,
      );
    }
  }

  async indexTenders(tenders: any[]) {
    if (!this.ready || tenders.length === 0) return;
    try {
      const result = await this.client
        .collections<TenderSearchDocument>(COLLECTION_NAME)
        .documents()
        .import(
          tenders.map((tender) => this.toDocument(tender)),
          {
            action: 'upsert',
          },
        );

      const failures = result.filter((item: any) => !item.success);
      if (failures.length > 0) {
        this.logger.warn(
          `Typesense indexed ${result.length - failures.length}/${result.length} tenders`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Bulk Typesense indexing failed: ${this.describeError(error)}`,
      );
    }
  }

  async deleteTender(tenderId: string) {
    if (!this.ready) return;
    try {
      await this.client
        .collections(COLLECTION_NAME)
        .documents(tenderId)
        .delete();
    } catch (error) {
      this.logger.warn(
        `Failed to remove tender ${tenderId} from Typesense: ${this.describeError(error)}`,
      );
    }
  }

  async searchTenders(
    params: TenderSearchParams,
  ): Promise<SearchResponse<TenderSearchDocument>> {
    const filterBy = this.buildFilter(params);

    return this.client
      .collections<TenderSearchDocument>(COLLECTION_NAME)
      .documents()
      .search({
        q: params.q?.trim() || '*',
        query_by:
          'title,description,buyerName,category,region,province,tenderNumber,referenceNumber,sourceName',
        query_by_weights: '5,2,4,3,3,3,4,4,2',
        filter_by: filterBy || undefined,
        sort_by: params.q?.trim()
          ? '_text_match:desc,publishedDate:desc'
          : 'publishedDate:desc',
        page: params.page || 1,
        per_page: params.limit || 20,
        facet_by: 'region,category,status,buyerName,province,sourceType',
        num_typos: '1',
        min_len_1typo: 5,
        min_len_2typo: 8,
        drop_tokens_threshold: 0,
        typo_tokens_threshold: 0,
        prioritize_exact_match: true,
        prefix: false,
      });
  }

  toDocument(tender: any): TenderSearchDocument {
    return {
      id: String(tender.id),
      title: tender.title || '',
      description: tender.description || '',
      buyerName: tender.buyerName || '',
      region: tender.region || '',
      province: tender.province || '',
      category: tender.category || '',
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
        : 0,
    };
  }

  private buildFilter(params: TenderSearchParams) {
    const filters: string[] = [];

    const statusFilter = this.statusFilter(params.status);
    if (statusFilter) filters.push(statusFilter);

    const regionFilter = this.enumFilter('region', params.region);
    if (regionFilter) filters.push(regionFilter);

    const categoryFilter = this.enumFilter('category', params.category);
    if (categoryFilter) filters.push(categoryFilter);

    const buyerFilter = this.enumFilter('buyerName', params.buyer);
    if (buyerFilter) filters.push(buyerFilter);

    return filters.join(' && ');
  }

  private statusFilter(status?: string[]) {
    const selected = status?.length ? status : ['active'];
    const now = Date.now();
    const firstSupportedAdvertised = firstSupportedAdvertisedDate().getTime();
    const recentUndated = recentUndatedTenderThreshold(new Date(now)).getTime();
    const inSevenDays = now + 7 * 24 * 60 * 60 * 1000;
    const validAdvertisedDate = `publishedDate:>=${firstSupportedAdvertised} && publishedDate:<=${now}`;
    const conditions: string[] = [];

    if (selected.includes('active')) {
      conditions.push(
        `status:=active && ${validAdvertisedDate} && (closingDate:>=${now} || (closingDate:=0 && publishedDate:>=${recentUndated}))`,
      );
    }

    if (selected.includes('closing-soon')) {
      conditions.push(
        `status:=active && ${validAdvertisedDate} && closingDate:>=${now} && closingDate:<=${inSevenDays}`,
      );
    }

    if (selected.includes('closed')) {
      conditions.push(
        `status:!=cancelled && ${validAdvertisedDate} && closingDate:>0 && closingDate:<${now}`,
      );
    }

    if (selected.includes('cancelled')) {
      conditions.push(`status:=cancelled && ${validAdvertisedDate}`);
    }

    return conditions.length > 1
      ? `(${conditions.map((condition) => `(${condition})`).join(' || ')})`
      : conditions[0] || '';
  }

  private enumFilter(field: string, values?: string[]) {
    const cleanValues = (values || [])
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => `\`${value.replace(/`/g, '\\`')}\``);

    if (cleanValues.length === 0) return '';
    return `${field}:=[${cleanValues.join(',')}]`;
  }

  private describeError(error: unknown) {
    if (error instanceof Error) return error.message;
    return String(error);
  }
}
