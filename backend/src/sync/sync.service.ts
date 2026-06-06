import { Injectable, Logger, Optional } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import axios from 'axios';
import * as https from 'https';
import { subDays, subHours, format } from 'date-fns';
import { buildTenderSmartSearchCondition } from '../tenders/smart-search';
import { TypesenseService } from '../typesense';
import { AlertsService } from '../alerts';
import {
  inferTenderCategory,
  normaliseTenderCategory,
} from '../tenders/tender-categories';
import {
  isActiveTenderLike,
  normalizeTenderBriefingDate,
} from '../tenders/tender-date-rules';

const UNKNOWN_ADVERTISED_DATE = new Date(0);

const api = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  timeout: Number(process.env.ETENDERS_TIMEOUT_MS || 120000),
});

const SYNC_PAGE_SIZE = Number(process.env.ETENDERS_PAGE_SIZE || 10);
const SYNC_PAGE_LIMIT = 20;
const SYNC_PAGE_RETRIES = 3;
const MAX_MANUAL_PAGE_LIMIT = 10000;
const MAX_MANUAL_PAGE_SIZE = 100;
const DEFAULT_AWARD_REFRESH_DAYS = Number(
  process.env.ETENDERS_AWARD_REFRESH_DAYS || 180,
);
const DEFAULT_AWARD_REFRESH_LIMIT = Number(
  process.env.ETENDERS_AWARD_REFRESH_LIMIT || 500,
);
const DEFAULT_AWARD_REFRESH_DELAY_MS = Number(
  process.env.ETENDERS_AWARD_REFRESH_DELAY_MS || 100,
);

interface TenderDateRangeSyncOptions {
  dateFrom?: string;
  dateTo?: string;
  pageLimit?: number;
  pageSize?: number;
  notifyNew?: boolean;
  delayMs?: number;
  fullRange?: boolean;
}

interface AwardRefreshOptions {
  daysBack?: number;
  limit?: number;
  delayMs?: number;
}

type AwardSyncResult = {
  saved: number;
  deleted: number;
  activeSupplierCount: number;
  sourceAwardCount: number;
};

interface OCDSRelease {
  ocid: string;
  date: string;
  tender?: {
    title?: string;
    description?: string;
    status?: string;
    province?: string;
    tenderPeriod?: { startDate?: string; endDate?: string };
    briefingSession?: {
      date?: string;
      venue?: string;
      compulsory?: boolean;
    };
    deliveryAddresses?: { region?: string }[];
    mainProcurementCategory?: string;
    contactPerson?: {
      name?: string;
      email?: string;
      telephoneNumber?: string;
    };
    value?: {
      amount?: number;
      currency?: string;
    };
    eligibilityCriteria?: string;
    specialConditions?: string;
    submissionMethod?: string[];
  };
  buyer?: { name?: string };
  awards?: Array<{
    id?: string;
    title?: string;
    status?: string;
    description?: string;
    suppliers?: { name: string }[];
    value?: { amount?: number; currency?: string };
    date?: string;
  }>;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly apiBaseUrl =
    'https://ocds-api.etenders.gov.za/api/OCDSReleases';
  private syncRunning = false;
  private awardRefreshRunning = false;

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private alertsService: AlertsService,
    @Optional() private readonly typesense?: TypesenseService,
  ) {}

  private generateSlug(title: string, ocid: string): string {
    // Create slug from title, limited to 80 chars, appended with short ocid suffix
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Trim hyphens from start/end
      .substring(0, 80);

    // Extract last part of ocid for uniqueness (e.g., "ocds-9t57fa-143883" -> "143883")
    const ocidSuffix = ocid.split('-').pop() || ocid.substring(ocid.length - 6);

    return `${baseSlug}-${ocidSuffix}`;
  }

  // Pull fresh eTenders records every 30 minutes.
  @Cron('*/30 * * * *')
  async syncNewTenders() {
    if (this.syncRunning) {
      this.logger.warn('Tender sync is already running; skipping');
      return;
    }

    this.syncRunning = true;
    this.logger.log('Starting scheduled tender sync...');
    try {
      await this.fetchRecentTenders(2);
    } finally {
      this.syncRunning = false;
    }
  }

  // Award data can be added to old eTenders releases after the tender closes,
  // so date-range sync alone will miss winners unless closed tenders are revisited.
  @Cron('15 2 * * *')
  async refreshAwardDataCron() {
    if (this.awardRefreshRunning) {
      this.logger.warn('Award refresh is already running; skipping');
      return;
    }

    this.awardRefreshRunning = true;
    this.logger.log('Starting scheduled award refresh...');
    try {
      const summary = await this.refreshRecentAwards();
      this.logger.log(
        `Award refresh complete: refreshed=${summary.refreshed}, withAwards=${summary.withAwards}, saved=${summary.awardsSaved}, deleted=${summary.awardsDeleted}, failed=${summary.failed}`,
      );
    } finally {
      this.awardRefreshRunning = false;
    }
  }

  // Manual compatibility path; scheduled alert delivery lives in AlertsService.
  async sendDailyDigest() {
    this.logger.log('Sending daily digest alerts...');
    await this.processAlerts();
  }

  // Daily at 7 AM - send closing reminders
  @Cron('0 7 * * *')
  async sendClosingReminders() {
    this.logger.log('Processing closing reminders...');
    await this.processClosingReminders();
  }

  async fetchRecentTenders(hoursBack: number = 24): Promise<number> {
    const dateFrom = format(subHours(new Date(), hoursBack), 'yyyy-MM-dd');
    const dateTo = format(new Date(), 'yyyy-MM-dd');

    return this.fetchTendersByDateRange({
      dateFrom,
      dateTo,
      pageLimit: SYNC_PAGE_LIMIT,
      pageSize: SYNC_PAGE_SIZE,
    });
  }

  async fetchTendersByDateRange({
    dateFrom = format(subHours(new Date(), 24), 'yyyy-MM-dd'),
    dateTo = format(new Date(), 'yyyy-MM-dd'),
    pageLimit,
    pageSize,
    notifyNew = true,
    delayMs = 200,
    fullRange = false,
  }: TenderDateRangeSyncOptions = {}): Promise<number> {
    const defaultPageLimit = fullRange
      ? MAX_MANUAL_PAGE_LIMIT
      : SYNC_PAGE_LIMIT;
    const defaultPageSize = fullRange ? MAX_MANUAL_PAGE_SIZE : SYNC_PAGE_SIZE;
    const resolvedPageLimit = Math.max(
      1,
      Math.min(Number(pageLimit) || defaultPageLimit, MAX_MANUAL_PAGE_LIMIT),
    );
    const resolvedPageSize = Math.max(
      1,
      Math.min(Number(pageSize) || defaultPageSize, MAX_MANUAL_PAGE_SIZE),
    );
    const resolvedDelayMs = Math.max(0, Math.min(Number(delayMs) || 0, 1000));

    this.logger.log(
      `Fetching tenders from ${dateFrom} to ${dateTo} (pageSize=${resolvedPageSize}, pageLimit=${resolvedPageLimit}, notifyNew=${notifyNew}, delayMs=${resolvedDelayMs})`,
    );

    let totalIngested = 0;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const releases = await this.fetchOcdsPage(
          page,
          dateFrom,
          dateTo,
          resolvedPageSize,
        );

        if (releases.length === 0) {
          hasMore = false;
          break;
        }

        for (const item of releases) {
          const ingested = await this.upsertTender(item, notifyNew);
          if (ingested.processed) totalIngested++;
        }

        page++;
        if (resolvedDelayMs > 0) {
          await this.delay(resolvedDelayMs);
        }

        if (page > resolvedPageLimit) {
          this.logger.warn(
            `Reached page limit (${resolvedPageLimit}), stopping`,
          );
          hasMore = false;
        }
      } catch (error: any) {
        this.logger.error(`Sync error: ${error.message}`);
        hasMore = false;
      }
    }

    this.logger.log(`Sync complete: ${totalIngested} tenders processed`);
    return totalIngested;
  }

  private async fetchOcdsPage(
    page: number,
    dateFrom: string,
    dateTo: string,
    pageSize = SYNC_PAGE_SIZE,
  ): Promise<OCDSRelease[]> {
    const url = `${this.apiBaseUrl}?PageNumber=${page}&PageSize=${pageSize}&dateFrom=${dateFrom}&dateTo=${dateTo}`;

    for (let attempt = 1; attempt <= SYNC_PAGE_RETRIES; attempt++) {
      try {
        const response = await api.get(url);
        return response.data?.releases || [];
      } catch (error: any) {
        const message = error?.message || String(error);
        const retryable =
          error?.code === 'ETIMEDOUT' ||
          error?.code === 'ECONNABORTED' ||
          error?.code === 'ENOTFOUND' ||
          error?.code === 'ECONNRESET' ||
          error?.code === 'ECONNREFUSED' ||
          error?.code === 'EAI_AGAIN' ||
          Number(error?.response?.status) >= 500;

        if (!retryable || attempt === SYNC_PAGE_RETRIES) {
          throw error;
        }

        this.logger.warn(
          `eTenders page ${page} fetch failed (${message}); retrying ${attempt}/${SYNC_PAGE_RETRIES}`,
        );
        await this.delay(1000 * attempt);
      }
    }

    return [];
  }

  async refreshRecentAwards({
    daysBack = DEFAULT_AWARD_REFRESH_DAYS,
    limit = DEFAULT_AWARD_REFRESH_LIMIT,
    delayMs = DEFAULT_AWARD_REFRESH_DELAY_MS,
  }: AwardRefreshOptions = {}) {
    const now = new Date();
    const since = subDays(now, Math.max(1, Number(daysBack) || 1));
    const take = Math.max(1, Math.min(Number(limit) || 1, 5000));
    const pauseMs = Math.max(0, Math.min(Number(delayMs) || 0, 1000));
    const candidates = await this.prisma.tender.findMany({
      where: {
        closingDate: { lt: now, gte: since },
        OR: [
          { sourceName: 'eTenders Portal' },
          { ocid: { startsWith: 'ocds-9t57fa' } },
        ],
      },
      orderBy: { closingDate: 'desc' },
      take,
      select: {
        id: true,
        ocid: true,
      },
    });

    const summary = {
      scanned: candidates.length,
      refreshed: 0,
      withAwards: 0,
      awardsSaved: 0,
      awardsDeleted: 0,
      failed: 0,
    };

    for (const candidate of candidates) {
      const release = await this.fetchOcdsReleaseByOcid(candidate.ocid);
      if (!release) {
        summary.failed++;
        continue;
      }

      const result = await this.upsertTender(release, false, true);
      summary.refreshed++;
      summary.awardsSaved += result.awards.saved;
      summary.awardsDeleted += result.awards.deleted;
      if (result.awards.activeSupplierCount > 0) summary.withAwards++;

      if (pauseMs > 0) {
        await this.delay(pauseMs);
      }
    }

    return summary;
  }

  private async fetchOcdsReleaseByOcid(
    ocid: string,
  ): Promise<OCDSRelease | null> {
    const url = `${this.apiBaseUrl}/release/${encodeURIComponent(ocid)}`;

    for (let attempt = 1; attempt <= SYNC_PAGE_RETRIES; attempt++) {
      try {
        const response = await api.get(url);
        return response.data || null;
      } catch (error: any) {
        const status = Number(error?.response?.status);
        if (status === 404) return null;

        const message = error?.message || String(error);
        const retryable =
          error?.code === 'ETIMEDOUT' ||
          error?.code === 'ECONNABORTED' ||
          error?.code === 'ENOTFOUND' ||
          error?.code === 'ECONNRESET' ||
          error?.code === 'ECONNREFUSED' ||
          error?.code === 'EAI_AGAIN' ||
          status >= 500;

        if (!retryable || attempt === SYNC_PAGE_RETRIES) {
          this.logger.warn(
            `Failed to fetch eTenders release ${ocid}: ${message}`,
          );
          return null;
        }

        this.logger.warn(
          `eTenders release ${ocid} fetch failed (${message}); retrying ${attempt}/${SYNC_PAGE_RETRIES}`,
        );
        await this.delay(1000 * attempt);
      }
    }

    return null;
  }

  private async upsertTender(
    item: OCDSRelease,
    notifyNew = true,
    replaceAwards = false,
  ): Promise<{
    processed: boolean;
    tenderId: string;
    awards: AwardSyncResult;
  }> {
    const briefing = item.tender?.briefingSession;
    const contact = item.tender?.contactPerson;
    const value = item.tender?.value;
    const title = item.tender?.title || 'Untitled Tender';
    const sourcePublishedDate = item.tender?.tenderPeriod?.startDate
      ? new Date(item.tender.tenderPeriod.startDate)
      : item.date
        ? new Date(item.date)
        : null;
    const sourceClosingDate = item.tender?.tenderPeriod?.endDate
      ? new Date(item.tender.tenderPeriod.endDate)
      : null;
    const closingDate =
      sourceClosingDate && !Number.isNaN(sourceClosingDate.getTime())
        ? sourceClosingDate
        : null;

    if (!sourcePublishedDate || Number.isNaN(sourcePublishedDate.getTime())) {
      this.logger.warn(
        `Tender ${item.ocid} has no source advertised date; storing as unavailable`,
      );
    }
    const publishedDate =
      sourcePublishedDate && !Number.isNaN(sourcePublishedDate.getTime())
        ? sourcePublishedDate
        : UNKNOWN_ADVERTISED_DATE;

    const tender = {
      ocid: item.ocid,
      slug: this.generateSlug(title, item.ocid),
      title,
      description: item.tender?.description || '',
      status: item.tender?.status || 'active',
      publishedDate,
      closingDate,
      briefingDate: normalizeTenderBriefingDate(
        briefing?.date ? new Date(briefing.date) : null,
        publishedDate,
        closingDate,
      ),
      briefingVenue: briefing?.venue || null,
      briefingCompulsory: briefing?.compulsory || false,
      buyerName: item.buyer?.name || 'Unknown Buyer',
      region: item.tender?.deliveryAddresses?.[0]?.region || 'National',
      province: item.tender?.province || null,
      category:
        inferTenderCategory(
          [title, item.tender?.description, item.buyer?.name]
            .filter(Boolean)
            .join(' | '),
        ) ||
        normaliseTenderCategory(item.tender?.mainProcurementCategory) ||
        null,
      contactName: contact?.name || null,
      contactEmail: contact?.email || null,
      contactPhone: contact?.telephoneNumber || null,
      estimatedValue: value?.amount || null,
      currency: value?.currency || 'ZAR',
      eligibilityCriteria: item.tender?.eligibilityCriteria || null,
      specialConditions: item.tender?.specialConditions || null,
      submissionMethod: item.tender?.submissionMethod?.join(', ') || null,
      sourceName: 'eTenders Portal',
      sourceType: 'national_portal',
      sourceUrl: `${this.apiBaseUrl}/release/${encodeURIComponent(item.ocid)}`,
      rawData: JSON.stringify(item),
    };

    const existing = await this.prisma.tender.findUnique({
      where: { ocid: tender.ocid },
      select: { id: true },
    });

    const result = await this.prisma.tender.upsert({
      where: { ocid: tender.ocid },
      update: tender,
      create: tender,
    });
    const awardSync = await this.upsertAwards(result.id, item.awards, {
      replaceExisting: replaceAwards,
    });
    await this.typesense?.indexTender(result);
    if (!existing && notifyNew && isActiveTenderLike(result)) {
      await this.alertsService.notifyNewTender(result);
    }

    return { processed: true, tenderId: result.id, awards: awardSync };
  }

  private async upsertAwards(
    tenderId: string,
    awards?: OCDSRelease['awards'],
    options: { replaceExisting?: boolean } = {},
  ): Promise<AwardSyncResult> {
    if (!awards) {
      return {
        saved: 0,
        deleted: 0,
        activeSupplierCount: 0,
        sourceAwardCount: 0,
      };
    }

    let saved = 0;
    const seenSuppliers = new Set<string>();

    for (const award of awards) {
      if (!this.isActiveAward(award)) continue;

      const date = this.parseOptionalDate(award.date);
      const amount =
        typeof award.value?.amount === 'number' &&
        Number.isFinite(award.value.amount)
          ? award.value.amount
          : null;
      const currency = award.value?.currency || 'ZAR';

      for (const supplier of award.suppliers || []) {
        const supplierName = supplier.name?.replace(/\s+/g, ' ').trim();
        if (!supplierName) continue;

        const supplierKey = supplierName.toLowerCase();
        if (seenSuppliers.has(supplierKey)) continue;
        seenSuppliers.add(supplierKey);

        await this.prisma.award.upsert({
          where: {
            tenderId_supplierName: {
              tenderId,
              supplierName,
            },
          },
          update: {
            amount,
            currency,
            date,
          },
          create: {
            tenderId,
            supplierName,
            amount,
            currency,
            date,
          },
        });
        saved++;
      }
    }

    let deleted = 0;
    if (options.replaceExisting) {
      const supplierNames = [...seenSuppliers];
      const deleteResult = await this.prisma.award.deleteMany({
        where: {
          tenderId,
          ...(supplierNames.length > 0
            ? { supplierName: { notIn: supplierNames } }
            : {}),
        },
      });
      deleted = deleteResult.count;
    }

    return {
      saved,
      deleted,
      activeSupplierCount: seenSuppliers.size,
      sourceAwardCount: awards.length,
    };
  }

  private isActiveAward(award: NonNullable<OCDSRelease['awards']>[number]) {
    const status = award.status?.trim().toLowerCase();
    if (!status) return true;
    return ['active', 'complete', 'successful', 'awarded'].includes(status);
  }

  private parseOptionalDate(value?: string) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  async processAlerts() {
    return this.alertsService.triggerAlertsManually('daily');
  }

  private async findMatchingTenders(criteria: any, since: Date | null) {
    const where: any = {};

    if (since) {
      where.createdAt = { gt: since };
    } else {
      where.createdAt = { gt: subHours(new Date(), 24) };
    }

    const searchCondition = buildTenderSmartSearchCondition(criteria.q);
    if (searchCondition) {
      where.AND = [...(where.AND ?? []), searchCondition];
    }
    if (criteria.region?.length) {
      where.region = { in: criteria.region };
    }
    if (criteria.category?.length) {
      where.category = { in: criteria.category };
    }
    if (criteria.buyer?.length) {
      where.buyerName = { in: criteria.buyer };
    }

    return this.prisma.tender.findMany({
      where,
      take: 10,
      orderBy: { publishedDate: 'desc' },
    });
  }

  async processClosingReminders() {
    const today = new Date();
    const remindDays = [7, 3, 1]; // Send reminders at these intervals

    for (const days of remindDays) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);

      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const tenders = await this.prisma.tender.findMany({
        where: {
          closingDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: 'active',
        },
      });

      this.logger.log(
        `Found ${tenders.length} tenders closing in ${days} day(s)`,
      );

      // For now, just log - in production, you'd track which users saved these tenders
      // and send reminders to them
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Manual trigger for testing
  async triggerSync() {
    return this.fetchRecentTenders(24);
  }
}
