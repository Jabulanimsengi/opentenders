import { Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { TenderQueryDto } from './dto';
import { addDays } from 'date-fns';
import { buildTenderSmartSearchCondition } from './smart-search';
import { TypesenseService } from '../typesense';
import { isPaidPlan } from '../subscriptions/plans';
import {
  buildActiveTenderWhere,
  buildValidAdvertisedDateWhere,
  hasDisplayableTenderDates,
  normalizeTenderBriefingDate,
} from './tender-date-rules';

type TenderAccessLevel = 'anonymous' | 'registered' | 'paid';

@Injectable()
export class TendersService {
  private readonly logger = new Logger(TendersService.name);

  constructor(
    private prisma: PrismaService,
    @Optional() private readonly typesense?: TypesenseService,
  ) {}

  async findAll(query: TenderQueryDto, userId?: string) {
    const accessLevel = await this.getTenderAccessLevel(userId);
    const {
      q,
      query: queryAlias,
      page = 1,
      limit = 20,
      status,
      region,
      category,
      buyer,
    } = query;
    const searchTerm = q || queryAlias;
    const typesenseResult = await this.findAllWithTypesense(
      query,
      accessLevel,
    );
    if (typesenseResult) return typesenseResult;

    const skip = (page - 1) * limit;
    const now = new Date();

    const where: any = {};

    const searchCondition = buildTenderSmartSearchCondition(searchTerm);
    if (searchCondition) {
      where.AND = [searchCondition];
    }

    // Status filter with computed values. Default listing is active only.
    const selectedStatus = status?.length ? status : ['active'];
    if (selectedStatus.length > 0) {
      const statusConditions: any[] = [];
      const inSevenDays = addDays(now, 7);
      const validAdvertisedDateWhere = buildValidAdvertisedDateWhere(now);

      if (selectedStatus.includes('active')) {
        statusConditions.push(buildActiveTenderWhere(now));
      }

      if (selectedStatus.includes('closing-soon')) {
        statusConditions.push({
          status: 'active',
          ...validAdvertisedDateWhere,
          closingDate: { gte: now, lte: inSevenDays },
        });
      }

      if (selectedStatus.includes('closed')) {
        statusConditions.push({
          status: { not: 'cancelled' },
          ...validAdvertisedDateWhere,
          closingDate: { lt: now },
        });
      }

      if (selectedStatus.includes('cancelled')) {
        statusConditions.push({
          status: 'cancelled',
          ...validAdvertisedDateWhere,
        });
      }

      if (statusConditions.length > 0) {
        if (where.AND?.length) {
          where.AND.push({ OR: statusConditions });
        } else {
          where.OR = statusConditions;
        }
      }
    }

    if (region && region.length > 0) where.region = { in: region };
    if (category && category.length > 0) where.category = { in: category };
    if (buyer && buyer.length > 0) where.buyerName = { in: buyer };

    const [tenders, total] = await Promise.all([
      this.prisma.tender.findMany({
        where,
        orderBy: { publishedDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.tender.count({ where }),
    ]);
    const displayableTenders = tenders.filter((tender) =>
      hasDisplayableTenderDates(tender, now),
    );

    return {
      data: displayableTenders.map((tender) =>
        this.sanitizeTender(tender, accessLevel),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        searchEngine: 'prisma',
      },
    };
  }

  private async findAllWithTypesense(
    query: TenderQueryDto,
    accessLevel: TenderAccessLevel,
  ) {
    if (!this.typesense?.isReady()) return null;

    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const result = await this.typesense.searchTenders({
        q: query.q || query.query,
        page,
        limit,
        status: query.status,
        region: query.region,
        category: query.category,
        buyer: query.buyer,
      });

      const ids = (result.hits || [])
        .map((hit: any) => hit.document?.id)
        .filter(Boolean);

      if (ids.length === 0) {
        return {
          data: [],
          meta: {
            total: result.found || 0,
            page,
            limit,
            totalPages: Math.ceil((result.found || 0) / limit),
            searchEngine: 'typesense',
          },
        };
      }

      const tenders = await this.prisma.tender.findMany({
        where: { id: { in: ids } },
      });
      const byId = new Map(tenders.map((tender: any) => [tender.id, tender]));
      const now = new Date();

      return {
        data: ids
          .map((id: string) => byId.get(id))
          .filter(Boolean)
          .filter((tender) => hasDisplayableTenderDates(tender, now))
          .map((tender) => this.sanitizeTender(tender, accessLevel)),
        meta: {
          total: result.found || 0,
          page,
          limit,
          totalPages: Math.ceil((result.found || 0) / limit),
          searchEngine: 'typesense',
          processingTimeMs: result.search_time_ms,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Typesense search failed, using Prisma fallback: ${message}`,
      );
      return null;
    }
  }

  async findOne(slugOrId: string, userId?: string) {
    const accessLevel = await this.getTenderAccessLevel(userId);
    const tender = await this.prisma.tender.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
    });

    return tender && hasDisplayableTenderDates(tender)
      ? this.sanitizeTender(tender, accessLevel)
      : null;
  }

  async getStats() {
    const now = new Date();
    const sevenDaysAgo = addDays(now, -7);
    const inSevenDays = addDays(now, 7);
    const validAdvertisedDateWhere = buildValidAdvertisedDateWhere(now);

    const [
      totalCount,
      newThisWeek,
      closingSoon,
      activeCount,
      closedCount,
      cancelledCount,
      awardedCount,
    ] = await Promise.all([
      this.prisma.tender.count({ where: validAdvertisedDateWhere }),
      this.prisma.tender.count({
        where: { publishedDate: { gte: sevenDaysAgo, lte: now } },
      }),
      this.prisma.tender.count({
        where: {
          ...validAdvertisedDateWhere,
          closingDate: { gte: now, lte: inSevenDays },
          status: 'active',
        },
      }),
      this.prisma.tender.count({
        where: buildActiveTenderWhere(now),
      }),
      this.prisma.tender.count({
        where: {
          ...validAdvertisedDateWhere,
          closingDate: { lt: now },
        },
      }),
      this.prisma.tender.count({
        where: { status: 'cancelled', ...validAdvertisedDateWhere },
      }),
      // Use raw query for Award count since client generation failed
      this.prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM Award`
        .then((r: any) => Number(r[0].count))
        .catch(() => 0),
    ]);

    return {
      totalCount,
      newThisWeek,
      closingSoon,
      activeCount,
      closedCount,
      cancelledCount,
      awardedCount,
    };
  }

  async getFacets() {
    const [regions, categories, buyers] = await Promise.all([
      this.prisma.tender.groupBy({
        by: ['region'],
        _count: { region: true },
        where: { region: { not: null } },
        orderBy: { _count: { region: 'desc' } },
        take: 20,
      }),
      this.prisma.tender.groupBy({
        by: ['category'],
        _count: { category: true },
        where: { category: { not: null } },
        orderBy: { _count: { category: 'desc' } },
        take: 20,
      }),
      this.prisma.tender.groupBy({
        by: ['buyerName'],
        _count: { buyerName: true },
        where: { buyerName: { not: null } },
        orderBy: { _count: { buyerName: 'desc' } },
        take: 20,
      }),
    ]);

    return {
      regions: regions.map((r: any) => ({
        value: r.region,
        count: r._count.region,
      })),
      categories: categories.map((c: any) => ({
        value: c.category,
        count: c._count.category,
      })),
      buyers: buyers.map((b: any) => ({
        value: b.buyerName,
        count: b._count.buyerName,
      })),
    };
  }

  private async getTenderAccessLevel(
    userId?: string,
  ): Promise<TenderAccessLevel> {
    if (!userId) return 'anonymous';

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, status: true },
    });

    if (
      subscription &&
      (subscription.status === 'active' || subscription.status === 'trial') &&
      isPaidPlan(subscription.plan)
    ) {
      return 'paid';
    }

    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId,
        status: 'active',
        organization: { subscription: { status: 'active' } },
      },
      select: {
        organization: {
          select: {
            subscription: {
              select: { plan: true, status: true },
            },
          },
        },
      },
    });

    const organizationSubscription = membership?.organization.subscription;
    if (
      organizationSubscription &&
      (organizationSubscription.status === 'active' ||
        organizationSubscription.status === 'trial') &&
      isPaidPlan(organizationSubscription.plan)
    ) {
      return 'paid';
    }

    return 'registered';
  }

  private sanitizeTender(tender: any, accessLevel: TenderAccessLevel) {
    const tenderWithDates = {
      ...tender,
      briefingDate: normalizeTenderBriefingDate(
        tender.briefingDate,
        tender.publishedDate,
        tender.closingDate,
      ),
    };
    const {
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      scrapedAt: _scrapedAt,
      ...displayTender
    } = tenderWithDates;

    if (accessLevel === 'paid') return displayTender;

    const restricted = {
      ...displayTender,
      documentUrls: null,
      sourceName: displayTender.sourceName,
      sourceType: displayTender.sourceType,
      sourceUrl: null,
      sourceHash: null,
      rawHtmlHash: null,
      rawData: null,
    };

    if (accessLevel === 'registered') return restricted;

    return {
      id: tenderWithDates.id,
      slug: tenderWithDates.slug,
      title: tenderWithDates.title,
      status: tenderWithDates.status,
      publishedDate: tenderWithDates.publishedDate,
      closingDate: tenderWithDates.closingDate,
      tenderNumber: null,
      referenceNumber: null,
      description: tenderWithDates.description,
      category: tenderWithDates.category,
      region: tenderWithDates.region,
      province: tenderWithDates.province,
      buyerName: tenderWithDates.buyerName,
      buyerType: tenderWithDates.buyerType,
      municipality: tenderWithDates.municipality,
      contactName: null,
      contactEmail: null,
      contactPhone: null,
      estimatedValue: null,
      currency: null,
      eligibilityCriteria: tenderWithDates.eligibilityCriteria,
      specialConditions: tenderWithDates.specialConditions,
      submissionMethod: tenderWithDates.submissionMethod,
      submissionAddress: null,
      documentUrls: null,
      sourceName: tenderWithDates.sourceName,
      sourceType: tenderWithDates.sourceType,
      sourceUrl: null,
      rawData: null,
    };
  }
}
