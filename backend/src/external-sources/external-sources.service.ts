/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTenderSourceDto,
  UpdateTenderSourceDto,
} from './dto/external-source.dto';
import { ExternalScraperRegistryService } from './external-scraper-registry.service';
import { ExternalTenderImportService } from './external-tender-import.service';
import { TenderSourceRecord } from './types';

type PrismaWithExternalSources = PrismaService & {
  tenderSource: any;
  externalScrapeRun: any;
  externalScrapeError: any;
  sourceHttpCheck: any;
  sourceIssue: any;
  tender: any;
};

type SourceHealthStatus =
  | 'healthy'
  | 'running'
  | 'due'
  | 'overdue'
  | 'failing'
  | 'paused'
  | 'untested';

type SourceHealthItem = {
  id: string;
  name: string;
  sourceType: string;
  province?: string | null;
  organisationName?: string | null;
  tenderUrl: string;
  active: boolean;
  scrapeMethod: string;
  scrapeFrequencyHours: number;
  scrapeFrequencyMinutes: number;
  lastScrapedAt?: Date | null;
  nextScrapeAt: Date;
  minutesUntilNextScrape: number;
  isDue: boolean;
  isOverdue: boolean;
  status: SourceHealthStatus;
  realDataConfirmed: boolean;
  latestRunProducedData: boolean;
  tenderCount: number;
  recentRunCount: number;
  recentErrorCount: number;
  latestHttpCheck: any | null;
  consecutiveHttpFailures: number;
  latestOpenIssue: any | null;
  latestRun: any | null;
  latestSuccessfulRun: any | null;
  latestError: any | null;
};

const SOUTH_AFRICAN_MUNICIPALITY_TARGET_COUNT = 257;
const SOURCE_HTTP_TIMEOUT_MS = 15000;

@Injectable()
export class ExternalSourcesService {
  private readonly logger = new Logger(ExternalSourcesService.name);
  private readonly runningSourceIds = new Set<string>();
  private schedulerRunning = false;
  private httpCheckRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly scraperRegistry: ExternalScraperRegistryService,
    private readonly importer: ExternalTenderImportService,
  ) {}

  findAll() {
    return this.db.tenderSource.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getHealth() {
    const now = new Date();
    const [sources, runs, errors, tenderCounts, httpChecks, openIssues] =
      await Promise.all([
      this.db.tenderSource.findMany({
        orderBy: [{ active: 'desc' }, { lastScrapedAt: 'asc' }],
      }),
      this.db.externalScrapeRun.findMany({
        orderBy: { startedAt: 'desc' },
        take: 500,
      }),
      this.db.externalScrapeError.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      this.db.tender.groupBy({
        by: ['sourceName'],
        where: { sourceName: { not: null } },
        _count: { _all: true },
      }),
      this.db.sourceHttpCheck.findMany({
        orderBy: { checkedAt: 'desc' },
        take: 1000,
      }),
      this.db.sourceIssue.findMany({
        where: { status: { in: ['open', 'investigating'] } },
        orderBy: { lastDetectedAt: 'desc' },
      }),
    ]);

    const runsBySource = new Map<string, any[]>();
    const errorsBySource = new Map<string, any[]>();
    const httpChecksBySource = new Map<string, any[]>();
    const openIssueBySource = new Map<string, any>();
    const tenderCountBySourceName = new Map<string, number>();

    for (const run of runs) {
      if (!run.sourceId) continue;
      const sourceRuns = runsBySource.get(run.sourceId) || [];
      sourceRuns.push(run);
      runsBySource.set(run.sourceId, sourceRuns);
    }

    for (const error of errors) {
      if (!error.sourceId) continue;
      const sourceErrors = errorsBySource.get(error.sourceId) || [];
      sourceErrors.push(error);
      errorsBySource.set(error.sourceId, sourceErrors);
    }

    for (const check of httpChecks) {
      if (!check.sourceId) continue;
      const sourceChecks = httpChecksBySource.get(check.sourceId) || [];
      sourceChecks.push(check);
      httpChecksBySource.set(check.sourceId, sourceChecks);
    }

    for (const issue of openIssues) {
      if (issue.sourceId && !openIssueBySource.has(issue.sourceId)) {
        openIssueBySource.set(issue.sourceId, issue);
      }
    }

    for (const item of tenderCounts) {
      if (item.sourceName) {
        tenderCountBySourceName.set(item.sourceName, item._count._all);
      }
    }

    const sourceHealth: SourceHealthItem[] = sources.map(
      (source: TenderSourceRecord): SourceHealthItem => {
      const sourceRuns = runsBySource.get(source.id) || [];
      const sourceErrors = errorsBySource.get(source.id) || [];
      const sourceHttpChecks = httpChecksBySource.get(source.id) || [];
      const latestRun = sourceRuns[0] || null;
      const latestHttpCheck = sourceHttpChecks[0] || null;
      const consecutiveHttpFailures =
        this.getConsecutiveHttpFailures(sourceHttpChecks);
      const latestOpenIssue = openIssueBySource.get(source.id) || null;
      const latestSuccessfulRun =
        sourceRuns.find((run) =>
          ['success', 'partial_success'].includes(run.status),
        ) || null;
      const latestError = sourceErrors[0] || null;
      const intervalMinutes = this.getSourceIntervalMinutes(source);
      const lastScrapedAt = source.lastScrapedAt
        ? new Date(source.lastScrapedAt)
        : null;
      const nextScrapeAt = lastScrapedAt
        ? new Date(lastScrapedAt.getTime() + intervalMinutes * 60 * 1000)
        : now;
      const minutesUntilNextScrape = Math.ceil(
        (nextScrapeAt.getTime() - now.getTime()) / 60000,
      );
      const isDue = source.active && minutesUntilNextScrape <= 0;
      const isOverdue =
        source.active &&
        (!lastScrapedAt ||
          now.getTime() - lastScrapedAt.getTime() >
            intervalMinutes * 2 * 60 * 1000);
      const sourceTenderCount =
        tenderCountBySourceName.get(source.name) ||
        (source.organisationName
          ? tenderCountBySourceName.get(source.organisationName)
          : 0) ||
        0;
      const latestRunProducedData =
        Boolean(latestRun) &&
        latestRun.numberOfTendersFound +
          latestRun.numberOfTendersCreated +
          latestRun.numberOfTendersUpdated +
          latestRun.numberOfDuplicatesFound >
          0;
      const realDataConfirmed =
        sourceTenderCount > 0 ||
        Boolean(latestSuccessfulRun?.numberOfTendersFound) ||
        Boolean(latestSuccessfulRun?.numberOfTendersCreated) ||
        Boolean(latestSuccessfulRun?.numberOfTendersUpdated) ||
        Boolean(latestSuccessfulRun?.numberOfDuplicatesFound);

        return {
        id: source.id,
        name: source.name,
        sourceType: source.sourceType,
        province: source.province,
        organisationName: source.organisationName,
        tenderUrl: source.tenderUrl,
        active: source.active,
        scrapeMethod: source.scrapeMethod,
        scrapeFrequencyHours: source.scrapeFrequencyHours,
        scrapeFrequencyMinutes: intervalMinutes,
        lastScrapedAt: source.lastScrapedAt,
        nextScrapeAt,
        minutesUntilNextScrape,
        isDue,
        isOverdue,
        status: this.getSourceHealthStatus({
          active: source.active,
          latestRun,
          latestHttpCheck,
          realDataConfirmed,
          isDue,
          isOverdue,
        }),
        realDataConfirmed,
        latestRunProducedData,
        tenderCount: sourceTenderCount,
        recentRunCount: sourceRuns.length,
        recentErrorCount: sourceErrors.length,
        latestHttpCheck,
        consecutiveHttpFailures,
        latestOpenIssue,
        latestRun,
        latestSuccessfulRun,
        latestError,
        };
      },
    );

    const summary = {
      generatedAt: now,
      scheduler: {
      tenderSyncCron: '*/30 * * * *',
      externalSourceCron: '*/30 * * * *',
      minimumSourceIntervalMinutes: 30,
        externalBatchSize: Number(process.env.EXTERNAL_SCRAPE_BATCH_SIZE || 500),
        externalConcurrency: Number(process.env.EXTERNAL_SCRAPE_CONCURRENCY || 5),
      },
      totalSources: sourceHealth.length,
      activeSources: sourceHealth.filter((source) => source.active).length,
      municipalityTargetSources: SOUTH_AFRICAN_MUNICIPALITY_TARGET_COUNT,
      municipalitySources: sourceHealth.filter(
        (source) => source.sourceType === 'municipality',
      ).length,
      activeMunicipalitySources: sourceHealth.filter(
        (source) => source.sourceType === 'municipality' && source.active,
      ).length,
      healthySources: sourceHealth.filter(
        (source) => source.status === 'healthy',
      ).length,
      sourcesWithRealData: sourceHealth.filter(
        (source) => source.realDataConfirmed,
      ).length,
      dueSources: sourceHealth.filter((source) => source.isDue).length,
      overdueSources: sourceHealth.filter((source) => source.isOverdue).length,
      failingSources: sourceHealth.filter(
        (source) => source.status === 'failing',
      ).length,
      runningSources: sourceHealth.filter(
        (source) => source.status === 'running',
      ).length,
      non200Sources: sourceHealth.filter(
        (source) =>
          source.latestHttpCheck &&
          (!source.latestHttpCheck.ok ||
            (source.latestHttpCheck.statusCode &&
              source.latestHttpCheck.statusCode !== 200)),
      ).length,
      openSourceIssues: openIssues.length,
      checkedSources: sourceHealth.filter((source) => source.latestHttpCheck)
        .length,
      averageResponseTimeMs: this.getAverageResponseTime(sourceHealth),
      recentRuns: runs.length,
      recentErrors: errors.length,
    };

    return { summary, sources: sourceHealth };
  }

  async findOne(id: string): Promise<TenderSourceRecord> {
    const source = await this.db.tenderSource.findUnique({ where: { id } });
    if (!source)
      throw new NotFoundException('External tender source not found');
    return source;
  }

  create(dto: CreateTenderSourceDto) {
    return this.db.tenderSource.create({
      data: {
        name: dto.name,
        sourceType: dto.sourceType,
        baseUrl: dto.baseUrl,
        tenderUrl: dto.tenderUrl,
        province: dto.province,
        organisationName: dto.organisationName,
        scrapeMethod: dto.scrapeMethod,
        active: dto.active ?? true,
        scrapeFrequencyHours: dto.scrapeFrequencyHours ?? 24,
        scrapeFrequencyMinutes:
          dto.scrapeFrequencyMinutes ??
          Math.max(1, dto.scrapeFrequencyHours ?? 24) * 60,
      },
    });
  }

  async update(id: string, dto: UpdateTenderSourceDto) {
    await this.findOne(id);
    const data: UpdateTenderSourceDto = { ...dto };
    if (
      dto.scrapeFrequencyHours !== undefined &&
      dto.scrapeFrequencyMinutes === undefined
    ) {
      data.scrapeFrequencyMinutes = Math.max(1, dto.scrapeFrequencyHours) * 60;
    }

    return this.db.tenderSource.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.db.tenderSource.delete({ where: { id } });
    return { success: true };
  }

  async scrapeSource(id: string) {
    const source = await this.findOne(id);
    if (this.runningSourceIds.has(id)) {
      throw new ConflictException('This source is already being scraped');
    }

    this.runningSourceIds.add(id);
    const run = await this.db.externalScrapeRun.create({
      data: {
        sourceId: source.id,
        sourceName: source.name,
        status: 'running',
      },
    });

    try {
      const scraper = this.scraperRegistry.getScraper(source);
      const output = await scraper.scrape(source);
      const stats = await this.importer.importResults(source, output.results);
      const status =
        stats.created + stats.updated + stats.duplicates === stats.found
          ? 'success'
          : 'partial_success';

      const finishedRun = await this.db.externalScrapeRun.update({
        where: { id: run.id },
        data: {
          finishedAt: new Date(),
          status,
          numberOfTendersFound: stats.found,
          numberOfTendersCreated: stats.created,
          numberOfTendersUpdated: stats.updated,
          numberOfDuplicatesFound: stats.duplicates,
          pagesVisited: output.pagesVisited,
        },
      });

      await this.db.tenderSource.update({
        where: { id: source.id },
        data: { lastScrapedAt: new Date() },
      });

      return finishedRun;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `External scrape failed for ${source.name}: ${message}`,
      );

      await this.db.externalScrapeError.create({
        data: {
          runId: run.id,
          sourceId: source.id,
          sourceName: source.name,
          url: source.tenderUrl,
          message,
          stack,
        },
      });

      return this.db.externalScrapeRun.update({
        where: { id: run.id },
        data: {
          finishedAt: new Date(),
          status: 'failed',
          errorMessage: message,
        },
      });
    } finally {
      this.runningSourceIds.delete(id);
    }
  }

  async scrapeAllActive() {
    const sources = await this.db.tenderSource.findMany({
      where: { active: true },
    });
    const concurrency = Math.max(
      1,
      Number(process.env.EXTERNAL_SCRAPE_CONCURRENCY || 5),
    );
    const results = await this.runWithConcurrency(
      sources,
      concurrency,
      (source: TenderSourceRecord) => this.scrapeSource(source.id),
    );
    const runs = results
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value);
    const failed = results.filter(
      (result) => result.status === 'rejected',
    ).length;

    return { success: failed === 0, runs, failed, totalSources: sources.length };
  }

  async checkSourceAvailability(id: string) {
    const source = await this.findOne(id);
    return this.recordSourceHttpCheck(source);
  }

  async checkActiveSourceAvailability() {
    const sources = (await this.db.tenderSource.findMany({
      where: { active: true },
      orderBy: [{ lastScrapedAt: 'asc' }, { createdAt: 'asc' }],
    })) as TenderSourceRecord[];
    const batchSize = Number(process.env.SOURCE_HTTP_CHECK_BATCH_SIZE || 500);
    const concurrency = Math.max(
      1,
      Number(process.env.SOURCE_HTTP_CHECK_CONCURRENCY || 10),
    );
    const selectedSources = sources.slice(0, batchSize);
    const results = await this.runWithConcurrency(
      selectedSources,
      concurrency,
      (source) => this.recordSourceHttpCheck(source),
    );
    const checks = results
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value);
    const failed = checks.filter((check) => !check.ok).length;

    return {
      success: failed === 0,
      checks,
      failed,
      totalSources: selectedSources.length,
    };
  }

  getIssues() {
    return this.db.sourceIssue.findMany({
      orderBy: [{ status: 'asc' }, { lastDetectedAt: 'desc' }],
      take: 250,
    });
  }

  async updateIssue(
    id: string,
    dto: {
      status?: string;
      severity?: string;
      assignedTo?: string | null;
      resolutionNote?: string | null;
    },
  ) {
    const issue = await this.db.sourceIssue.findUnique({ where: { id } });
    if (!issue) throw new NotFoundException('Source issue not found');

    const status = dto.status || issue.status;
    return this.db.sourceIssue.update({
      where: { id },
      data: {
        status,
        severity: dto.severity,
        assignedTo: dto.assignedTo,
        resolutionNote: dto.resolutionNote,
        resolvedAt:
          status === 'fixed' || status === 'ignored'
            ? new Date()
            : status === 'open' || status === 'investigating'
              ? null
              : issue.resolvedAt,
      },
    });
  }

  getRuns() {
    return this.db.externalScrapeRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 100,
    });
  }

  getErrors() {
    return this.db.externalScrapeError.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  @Cron('*/30 * * * *')
  async scrapeDueSources() {
    if (this.schedulerRunning) {
      this.logger.warn(
        'External source scheduler is already running; skipping',
      );
      return;
    }

    this.schedulerRunning = true;
    const batchSize = Number(process.env.EXTERNAL_SCRAPE_BATCH_SIZE || 500);
    const concurrency = Math.max(
      1,
      Number(process.env.EXTERNAL_SCRAPE_CONCURRENCY || 5),
    );
    const sources = (await this.db.tenderSource.findMany({
      where: { active: true },
      orderBy: [{ lastScrapedAt: 'asc' }, { createdAt: 'asc' }],
    })) as TenderSourceRecord[];
    const now = Date.now();
    const dueSources = sources
      .filter((source: TenderSourceRecord) => this.isSourceDue(source, now))
      .slice(0, batchSize);

    try {
      const results = await this.runWithConcurrency(
        dueSources,
        concurrency,
        (source) => this.scrapeSource(source.id),
      );
      const processed = results.length;
      const failed = results.filter(
        (result) => result.status === 'rejected',
      ).length;

      this.logger.log(
        `External source scheduler processed ${processed}/${sources.length} active sources (${failed} scheduler-level failures, concurrency=${concurrency})`,
      );
    } finally {
      this.schedulerRunning = false;
    }
  }

  @Cron('*/30 * * * *')
  async checkActiveSourceResponses() {
    if (this.httpCheckRunning) {
      this.logger.warn(
        'External source HTTP checker is already running; skipping',
      );
      return;
    }

    this.httpCheckRunning = true;
    try {
      const result = await this.checkActiveSourceAvailability();
      this.logger.log(
        `External source HTTP checker processed ${result.totalSources} sources (${result.failed} non-OK)`,
      );
    } finally {
      this.httpCheckRunning = false;
    }
  }

  private async runWithConcurrency<T, R>(
    items: T[],
    concurrency: number,
    worker: (item: T) => Promise<R>,
  ) {
    const results: PromiseSettledResult<R>[] = [];
    let index = 0;

    async function runNext() {
      while (index < items.length) {
        const currentIndex = index++;
        const item = items[currentIndex];
        try {
          const value = await worker(item);
          results[currentIndex] = { status: 'fulfilled', value };
        } catch (reason) {
          results[currentIndex] = { status: 'rejected', reason };
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(concurrency, items.length) }, () =>
        runNext(),
      ),
    );

    return results;
  }

  private isSourceDue(source: TenderSourceRecord, now: number) {
    const lastScrapedAt = source.lastScrapedAt
      ? new Date(source.lastScrapedAt).getTime()
      : 0;
    const intervalMinutes = this.getSourceIntervalMinutes(source);
    const intervalMs = Math.max(30, intervalMinutes) * 60 * 1000;

    return now - lastScrapedAt >= intervalMs;
  }

  private getSourceIntervalMinutes(source: TenderSourceRecord) {
    return Math.max(
      30,
      Number(source.scrapeFrequencyMinutes) ||
        Math.max(1, source.scrapeFrequencyHours || 24) * 60,
    );
  }

  private getSourceHealthStatus({
    active,
    latestRun,
    latestHttpCheck,
    realDataConfirmed,
    isDue,
    isOverdue,
  }: {
    active: boolean;
    latestRun: any | null;
    latestHttpCheck: any | null;
    realDataConfirmed: boolean;
    isDue: boolean;
    isOverdue: boolean;
  }): SourceHealthStatus {
    if (!active) return 'paused';
    if (latestHttpCheck && !latestHttpCheck.ok) return 'failing';
    if (!latestRun) return 'untested';
    if (latestRun.status === 'running') return 'running';
    if (latestRun.status === 'failed') return 'failing';
    if (isOverdue) return 'overdue';
    if (isDue) return 'due';
    return realDataConfirmed ? 'healthy' : 'untested';
  }

  private get db() {
    return this.prisma as PrismaWithExternalSources;
  }

  private async recordSourceHttpCheck(source: TenderSourceRecord) {
    const startedAt = Date.now();
    const result = await this.performHttpCheck(source.tenderUrl);
    const responseTimeMs = Date.now() - startedAt;
    const check = await this.db.sourceHttpCheck.create({
      data: {
        sourceId: source.id,
        sourceName: source.name,
        url: source.tenderUrl,
        ok: result.ok,
        statusCode: result.statusCode,
        responseTimeMs,
        errorCategory: result.errorCategory,
        errorMessage: result.errorMessage,
      },
    });

    if (check.ok) {
      await this.resolveOpenSourceIssue(source.id);
    } else {
      await this.openOrUpdateSourceIssue(source, check);
    }

    return check;
  }

  private async performHttpCheck(url: string) {
    try {
      const response = await axios.head(url, {
        timeout: SOURCE_HTTP_TIMEOUT_MS,
        maxRedirects: 5,
        validateStatus: () => true,
      });

      if (response.status === 405) {
        return this.performGetHttpCheck(url);
      }

      return {
        ok: response.status >= 200 && response.status < 300,
        statusCode: response.status,
        errorCategory: this.getHttpErrorCategory(response.status),
        errorMessage:
          response.status >= 200 && response.status < 300
            ? undefined
            : `HTTP ${response.status}`,
      };
    } catch (error) {
      return this.getHttpFailureResult(error);
    }
  }

  private async performGetHttpCheck(url: string) {
    try {
      const response = await axios.get(url, {
        timeout: SOURCE_HTTP_TIMEOUT_MS,
        maxRedirects: 5,
        responseType: 'text',
        headers: { Range: 'bytes=0-1024' },
        validateStatus: () => true,
      });

      return {
        ok: response.status >= 200 && response.status < 300,
        statusCode: response.status,
        errorCategory: this.getHttpErrorCategory(response.status),
        errorMessage:
          response.status >= 200 && response.status < 300
            ? undefined
            : `HTTP ${response.status}`,
      };
    } catch (error) {
      return this.getHttpFailureResult(error);
    }
  }

  private getHttpFailureResult(error: unknown) {
    if (axios.isAxiosError(error)) {
      const code = error.code || '';
      return {
        ok: false,
        statusCode: error.response?.status,
        errorCategory: this.getNetworkErrorCategory(code, error.message),
        errorMessage: error.message,
      };
    }

    return {
      ok: false,
      statusCode: undefined,
      errorCategory: 'unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  private getHttpErrorCategory(statusCode?: number) {
    if (!statusCode || (statusCode >= 200 && statusCode < 300)) return undefined;
    if (statusCode === 401 || statusCode === 403) return 'blocked';
    if (statusCode === 404 || statusCode === 410) return 'not_found';
    if (statusCode === 429) return 'rate_limited';
    if (statusCode >= 500) return 'server_error';
    return 'http_status';
  }

  private getNetworkErrorCategory(code: string, message: string) {
    const normalized = `${code} ${message}`.toLowerCase();
    if (normalized.includes('timeout') || code === 'ECONNABORTED') {
      return 'timeout';
    }
    if (normalized.includes('enotfound') || normalized.includes('dns')) {
      return 'dns';
    }
    if (normalized.includes('certificate') || normalized.includes('ssl')) {
      return 'ssl';
    }
    if (normalized.includes('econnrefused')) return 'connection_refused';
    return 'network_error';
  }

  private async openOrUpdateSourceIssue(source: TenderSourceRecord, check: any) {
    const reason =
      check.errorMessage ||
      (check.statusCode ? `HTTP ${check.statusCode}` : 'Source check failed');
    const severity = this.getIssueSeverity(check);
    const openIssue = await this.db.sourceIssue.findFirst({
      where: {
        sourceId: source.id,
        status: { in: ['open', 'investigating'] },
      },
      orderBy: { lastDetectedAt: 'desc' },
    });

    if (openIssue) {
      return this.db.sourceIssue.update({
        where: { id: openIssue.id },
        data: {
          reason,
          severity,
          failureCount: { increment: 1 },
          lastDetectedAt: new Date(),
        },
      });
    }

    return this.db.sourceIssue.create({
      data: {
        sourceId: source.id,
        sourceName: source.name,
        url: source.tenderUrl,
        reason,
        severity,
        failureCount: 1,
      },
    });
  }

  private async resolveOpenSourceIssue(sourceId: string) {
    const openIssue = await this.db.sourceIssue.findFirst({
      where: {
        sourceId,
        status: { in: ['open', 'investigating'] },
      },
      orderBy: { lastDetectedAt: 'desc' },
    });

    if (!openIssue) return null;

    return this.db.sourceIssue.update({
      where: { id: openIssue.id },
      data: {
        status: 'fixed',
        resolvedAt: new Date(),
        resolutionNote: 'Recovered automatically after a successful HTTP check.',
      },
    });
  }

  private getIssueSeverity(check: any) {
    if (check.statusCode === 404 || check.statusCode === 410) return 'high';
    if (check.statusCode === 401 || check.statusCode === 403) return 'medium';
    if (check.statusCode >= 500) return 'high';
    if (check.errorCategory === 'dns' || check.errorCategory === 'ssl') {
      return 'high';
    }
    return 'medium';
  }

  private getConsecutiveHttpFailures(checks: any[]) {
    let count = 0;
    for (const check of checks) {
      if (check.ok) break;
      count += 1;
    }
    return count;
  }

  private getAverageResponseTime(sources: SourceHealthItem[]) {
    const responseTimes = sources
      .map((source) => source.latestHttpCheck?.responseTimeMs)
      .filter((value): value is number => Number.isFinite(value));
    if (!responseTimes.length) return null;
    return Math.round(
      responseTimes.reduce((total, value) => total + value, 0) /
        responseTimes.length,
    );
  }
}
