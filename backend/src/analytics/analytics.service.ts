/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma';

export type CreateAnalyticsEventDto = {
  eventName: string;
  sessionId?: string;
  entityType?: string;
  entityId?: string;
  path?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
};

type CaptureContext = {
  authorization?: string;
  userAgent?: string;
  ipAddress?: string;
};

type PrismaWithAnalytics = PrismaService & {
  analyticsEvent: any;
  user: any;
  savedSearch: any;
  bookmark: any;
  subscription: any;
};

type CountGroup<T extends string> = Record<T, string | null> & {
  _count: { _all: number };
};

const FUNNEL_EVENTS = [
  { eventName: 'page_view', label: 'Page views' },
  { eventName: 'search_submitted', label: 'Searches' },
  { eventName: 'tender_view', label: 'Tender views' },
  { eventName: 'document_download', label: 'Document downloads' },
  { eventName: 'bookmark_created', label: 'Saved tenders' },
  { eventName: 'saved_search_created', label: 'Saved searches' },
  { eventName: 'document_analysis_started', label: 'AI analyses started' },
  { eventName: 'upgrade_click', label: 'Upgrade clicks' },
  { eventName: 'checkout_started', label: 'Checkouts started' },
  { eventName: 'checkout_completed', label: 'Checkouts completed' },
];

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async captureEvent(dto: CreateAnalyticsEventDto, context: CaptureContext) {
    const eventName = this.normalizeEventName(dto.eventName);
    if (!eventName) {
      return { ok: false, reason: 'invalid_event_name' };
    }

    const userId = this.getVerifiedUserId(context.authorization);
    const metadata =
      dto.metadata && Object.keys(dto.metadata).length > 0
        ? JSON.stringify(dto.metadata).slice(0, 8000)
        : undefined;

    await this.db.analyticsEvent.create({
      data: {
        userId,
        sessionId: this.limit(dto.sessionId, 160),
        eventName,
        entityType: this.limit(dto.entityType, 80),
        entityId: this.limit(dto.entityId, 160),
        path: this.limit(dto.path, 600),
        referrer: this.limit(dto.referrer, 600),
        metadata,
        userAgent: this.limit(context.userAgent, 600),
        ipAddress: this.limit(context.ipAddress, 120),
      },
    });

    return { ok: true };
  }

  async getAdminSummary(days: number) {
    const safeDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 365) : 30;
    const now = new Date();
    const currentStart = new Date(now.getTime() - safeDays * 24 * 60 * 60 * 1000);
    const previousStart = new Date(
      currentStart.getTime() - safeDays * 24 * 60 * 60 * 1000,
    );

    const currentWhere = { createdAt: { gte: currentStart } };
    const previousWhere = {
      createdAt: { gte: previousStart, lt: currentStart },
    };

    const [
      currentEvents,
      previousEvents,
      uniqueUsers,
      uniqueSessions,
      previousUsers,
      previousSessions,
      newUsers,
      savedSearches,
      bookmarks,
      eventCounts,
      topPaths,
      planBreakdown,
      recentEvents,
      searchEvents,
    ] = await Promise.all([
      this.db.analyticsEvent.count({ where: currentWhere }),
      this.db.analyticsEvent.count({ where: previousWhere }),
      this.db.analyticsEvent.groupBy({
        by: ['userId'],
        where: { ...currentWhere, userId: { not: null } },
      }),
      this.db.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: { ...currentWhere, sessionId: { not: null } },
      }),
      this.db.analyticsEvent.groupBy({
        by: ['userId'],
        where: { ...previousWhere, userId: { not: null } },
      }),
      this.db.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: { ...previousWhere, sessionId: { not: null } },
      }),
      this.db.user.count({ where: currentWhere }),
      this.db.savedSearch.count({ where: currentWhere }),
      this.db.bookmark.count({ where: currentWhere }),
      this.db.analyticsEvent.groupBy({
        by: ['eventName'],
        where: currentWhere,
        _count: { _all: true },
        orderBy: { _count: { eventName: 'desc' } },
      }),
      this.db.analyticsEvent.groupBy({
        by: ['path'],
        where: { ...currentWhere, path: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { path: 'desc' } },
        take: 12,
      }),
      this.db.subscription.groupBy({
        by: ['plan', 'status'],
        _count: { _all: true },
        orderBy: { _count: { plan: 'desc' } },
      }),
      this.getRecentEvents(20),
      this.db.analyticsEvent.findMany({
        where: { ...currentWhere, eventName: 'search_submitted' },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
    ]);

    const typedEventCounts = eventCounts as Array<CountGroup<'eventName'>>;
    const typedTopPaths = topPaths as Array<CountGroup<'path'>>;
    const typedPlanBreakdown = planBreakdown as Array<
      CountGroup<'plan' | 'status'>
    >;

    const eventCountMap = new Map<string, number>(
      typedEventCounts.map((event) => [
        String(event.eventName),
        event._count._all,
      ]),
    );

    const tenderViews =
      eventCountMap.get('tender_view') ||
      typedTopPaths
        .filter((item) => item.path?.startsWith('/tenders/'))
        .reduce((total: number, item) => total + item._count._all, 0);

    return {
      generatedAt: now,
      range: {
        days: safeDays,
        currentStart,
        previousStart,
      },
      overview: {
        events: currentEvents,
        previousEvents,
        activeUsers: uniqueUsers.length,
        previousActiveUsers: previousUsers.length,
        activeSessions: uniqueSessions.length,
        previousActiveSessions: previousSessions.length,
        newUsers,
        savedSearches,
        bookmarks,
        tenderViews,
      },
      funnel: FUNNEL_EVENTS.map((item) => ({
        ...item,
        count:
          item.eventName === 'tender_view'
            ? tenderViews
            : eventCountMap.get(item.eventName) || 0,
      })),
      eventCounts: typedEventCounts.map((item) => ({
        eventName: item.eventName,
        count: item._count._all,
      })),
      topPaths: typedTopPaths.map((item) => ({
        path: item.path,
        count: item._count._all,
      })),
      topSearches: this.summarizeSearches(searchEvents),
      planBreakdown: typedPlanBreakdown.map((item) => ({
        plan: item.plan,
        status: item.status,
        count: item._count._all,
      })),
      recentEvents,
    };
  }

  getRecentEvents(limit: number) {
    return this.db.analyticsEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit || 100, 1), 250),
      select: {
        id: true,
        eventName: true,
        entityType: true,
        entityId: true,
        path: true,
        metadata: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
    });
  }

  private summarizeSearches(events: any[]) {
    const counts = new Map<string, { query: string; count: number; zeroResults: number }>();

    for (const event of events) {
      const metadata = this.parseMetadata(event.metadata);
      const query = String(metadata.q || metadata.query || '').trim();
      if (!query) continue;

      const key = query.toLowerCase();
      const current = counts.get(key) || { query, count: 0, zeroResults: 0 };
      current.count += 1;
      if (Number(metadata.resultCount || 0) === 0) {
        current.zeroResults += 1;
      }
      counts.set(key, current);
    }

    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }

  private parseMetadata(metadata?: string | null) {
    if (!metadata) return {};
    try {
      return JSON.parse(metadata) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  private getVerifiedUserId(authorization?: string) {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : undefined;
    if (!token) return undefined;

    try {
      const payload = this.jwtService.verify<{ sub?: string }>(token);
      return payload.sub;
    } catch {
      return undefined;
    }
  }

  private normalizeEventName(eventName?: string) {
    const normalized = eventName?.trim().toLowerCase();
    if (!normalized || !/^[a-z0-9_.:-]{2,80}$/.test(normalized)) {
      return null;
    }
    return normalized;
  }

  private limit(value: string | undefined, maxLength: number) {
    if (!value) return undefined;
    return value.slice(0, maxLength);
  }

  private get db() {
    return this.prisma as PrismaWithAnalytics;
  }
}
