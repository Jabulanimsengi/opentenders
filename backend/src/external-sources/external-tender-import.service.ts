/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TypesenseService } from '../typesense';
import { AlertsService } from '../alerts';
import {
  ExternalTenderResult,
  ImportExternalTenderStats,
  TenderSourceRecord,
} from './types';
import { parseSouthAfricanTenderDate } from './utils/date-parser';
import { cleanText, nullableCleanText, stableHash } from './utils/text';
import {
  isActiveTenderLike,
  normalizeTenderBriefingDate,
} from '../tenders/tender-date-rules';
import {
  inferTenderCategory,
  isGenericTenderCategory,
  normaliseTenderCategory,
} from '../tenders/tender-categories';

const UNKNOWN_ADVERTISED_DATE = new Date(0);

type PrismaLike = PrismaService & {
  tender: any;
  externalTenderChangeLog?: any;
};

@Injectable()
export class ExternalTenderImportService {
  private readonly logger = new Logger(ExternalTenderImportService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly typesense?: TypesenseService,
    @Optional() private readonly alertsService?: AlertsService,
  ) {}

  async importResults(
    source: TenderSourceRecord,
    results: ExternalTenderResult[],
  ): Promise<ImportExternalTenderStats> {
    const stats: ImportExternalTenderStats = {
      found: results.length,
      created: 0,
      updated: 0,
      duplicates: 0,
    };

    for (const result of results) {
      const normalized = this.normalizeResult(source, result);
      if (!normalized) continue;

      const existing = await this.findDuplicate(normalized);
      if (existing) {
        stats.duplicates++;
        const changes = this.detectChanges(existing, normalized);
        if (changes.length > 0) {
          const { ocid: _ocid, slug: _slug, ...updateData } = normalized;
          const updatedTender = await (this.prisma as PrismaLike).tender.update(
            {
              where: { id: existing.id },
              data: updateData,
            },
          );
          await this.logChanges(existing.id, source.id, changes);
          await this.typesense?.indexTender(updatedTender);
          stats.updated++;
        }
        continue;
      }

      const createdTender = await (this.prisma as PrismaLike).tender.create({
        data: normalized,
      });
      await this.typesense?.indexTender(createdTender);
      if (createdTender && isActiveTenderLike(createdTender)) {
        await this.alertsService?.notifyNewTender(createdTender);
      }
      stats.created++;
    }

    return stats;
  }

  normalizeResult(source: TenderSourceRecord, result: ExternalTenderResult) {
    const title = cleanText(result.title);
    if (!title) {
      this.logger.warn(
        `Skipping external tender from ${source.name}: missing title`,
      );
      return null;
    }

    const buyerName =
      nullableCleanText(result.buyerName) ||
      source.organisationName ||
      source.name;
    const closingDate = parseSouthAfricanTenderDate(result.closingDate);
    const publishedDate =
      parseSouthAfricanTenderDate(result.publishedDate) ||
      UNKNOWN_ADVERTISED_DATE;
    const briefingDate = normalizeTenderBriefingDate(
      parseSouthAfricanTenderDate(result.briefingDate),
      publishedDate,
      closingDate,
    );
    const documentUrls = normalizeStringArray(result.documentUrls);
    const sourceUrl =
      nullableCleanText(result.sourceUrl) ||
      documentUrls[0] ||
      source.tenderUrl;
    const sourceHash = stableHash(
      [
        source.id,
        sourceUrl,
        result.tenderNumber,
        result.referenceNumber,
        title,
        buyerName,
        closingDate?.toISOString() || '',
        documentUrls.join('|'),
      ].join('|'),
    );
    const scrapedCategory = nullableCleanText(result.category);
    const inferredCategory = inferTenderCategory(
      [
        title,
        result.description,
        result.rawText,
        result.tenderNumber,
        result.referenceNumber,
        scrapedCategory,
      ]
        .filter(Boolean)
        .join(' | '),
    );
    const category =
      inferredCategory ||
      normaliseTenderCategory(scrapedCategory) ||
      (scrapedCategory && !isGenericTenderCategory(scrapedCategory)
        ? scrapedCategory
        : 'General');

    return {
      ocid: `external-${source.id}-${sourceHash.slice(0, 16)}`,
      slug: this.buildSlug(title, sourceHash),
      title,
      description: nullableCleanText(result.description || result.rawText),
      tenderNumber: nullableCleanText(result.tenderNumber),
      referenceNumber: nullableCleanText(result.referenceNumber),
      status: nullableCleanText(result.status) || 'active',
      category,
      region:
        nullableCleanText(
          result.municipality || result.province || source.province,
        ) || 'National',
      province: nullableCleanText(result.province || source.province),
      publishedDate,
      closingDate,
      briefingDate,
      briefingVenue: nullableCleanText(result.briefingLocation),
      briefingCompulsory: Boolean(result.briefingCompulsory),
      buyerName,
      buyerType: nullableCleanText(result.buyerType),
      municipality: nullableCleanText(result.municipality),
      contactName: nullableCleanText(result.contactName),
      contactEmail: nullableCleanText(result.contactEmail),
      contactPhone: nullableCleanText(result.contactPhone),
      submissionMethod: nullableCleanText(result.submissionMethod),
      submissionAddress: nullableCleanText(result.submissionAddress),
      documentUrls:
        documentUrls.length > 0 ? JSON.stringify(documentUrls) : null,
      sourceName: source.name,
      sourceType: source.sourceType,
      sourceUrl,
      sourceHash,
      rawHtmlHash: nullableCleanText(result.rawHtmlHash),
      scrapedAt: result.scrapedAt || new Date(),
      rawData: JSON.stringify({
        sourceId: source.id,
        sourceName: source.name,
        rawText: result.rawText,
        rawHtmlHash: result.rawHtmlHash,
        importedAt: new Date().toISOString(),
      }),
    };
  }

  private async findDuplicate(tender: any) {
    if (tender.ocid) {
      const existingByOcid = await (
        this.prisma as PrismaLike
      ).tender.findUnique({
        where: { ocid: tender.ocid },
      });
      if (existingByOcid) return existingByOcid;
    }

    const orConditions: any[] = [];

    if (tender.sourceUrl) orConditions.push({ sourceUrl: tender.sourceUrl });
    if (tender.sourceHash) orConditions.push({ sourceHash: tender.sourceHash });
    if (tender.tenderNumber && tender.buyerName) {
      orConditions.push({
        tenderNumber: tender.tenderNumber,
        buyerName: tender.buyerName,
      });
    }
    if (tender.referenceNumber && tender.buyerName) {
      orConditions.push({
        referenceNumber: tender.referenceNumber,
        buyerName: tender.buyerName,
      });
    }
    if (tender.title && tender.buyerName && tender.closingDate) {
      orConditions.push({
        title: tender.title,
        buyerName: tender.buyerName,
        closingDate: tender.closingDate,
      });
    }

    for (const url of parseDocumentUrls(tender.documentUrls)) {
      orConditions.push({ documentUrls: { contains: url } });
    }

    if (orConditions.length === 0) return null;

    return await (this.prisma as PrismaLike).tender.findFirst({
      where: { OR: orConditions },
    });
  }

  private detectChanges(existing: any, next: any) {
    const fields = [
      'closingDate',
      'briefingDate',
      'publishedDate',
      'status',
      'category',
      'tenderNumber',
      'referenceNumber',
      'documentUrls',
      'sourceUrl',
      'contactName',
      'contactEmail',
      'contactPhone',
      'submissionMethod',
      'submissionAddress',
      'title',
      'description',
    ];

    return fields
      .map((field) => {
        const oldValue = serializeComparable(existing[field]);
        const newValue = serializeComparable(next[field]);
        return oldValue !== newValue ? { field, oldValue, newValue } : null;
      })
      .filter(
        (
          change,
        ): change is {
          field: string;
          oldValue: string | null;
          newValue: string | null;
        } => Boolean(change),
      );
  }

  private async logChanges(
    tenderId: string,
    sourceId: string,
    changes: {
      field: string;
      oldValue: string | null;
      newValue: string | null;
    }[],
  ) {
    const db = this.prisma as PrismaLike;
    if (!db.externalTenderChangeLog?.createMany || changes.length === 0) return;

    await db.externalTenderChangeLog.createMany({
      data: changes.map((change) => ({
        tenderId,
        sourceId,
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
      })),
    });
  }

  private buildSlug(title: string, hash: string) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);

    return `${slug || 'external-tender'}-${hash.slice(0, 8)}`;
  }
}

function normalizeStringArray(values?: string[]) {
  return [...new Set((values || []).map(cleanText).filter(Boolean))];
}

function parseDocumentUrls(value?: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function serializeComparable(value: unknown) {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}
