import { TendersService } from './tenders.service';
import { PrismaService } from '../prisma';

describe('TendersService', () => {
  let service: TendersService;
  let prisma: {
    tender: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      tender: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
      },
    };

    service = new TendersService(prisma as unknown as PrismaService);
  });

  it('splits natural-language searches into terms across tender fields', async () => {
    await service.findAll({
      q: 'cleaning services in Gauteng',
      page: 1,
      limit: 20,
    });

    const where = prisma.tender.findMany.mock.calls[0][0].where;
    const smartSearchTerms = where.AND[0].AND;

    expect(smartSearchTerms).toHaveLength(3);
    expect(smartSearchTerms[0].OR).toContainEqual({
      title: { contains: 'cleaning', mode: 'insensitive' },
    });
    expect(smartSearchTerms[0].OR).toContainEqual({
      category: { equals: 'Cleaning & Hygiene' },
    });
    expect(smartSearchTerms[1].OR).toContainEqual({
      description: { contains: 'services', mode: 'insensitive' },
    });
    expect(smartSearchTerms[2].OR).toContainEqual({
      region: { contains: 'gauteng', mode: 'insensitive' },
    });
    expect(JSON.stringify(where)).not.toContain('cleaning services in gauteng');
    expect(where.AND[1]).toEqual({
      publishedDate: {
        gte: expect.any(Date),
        lte: expect.any(Date),
      },
    });
  });

  it('combines smart search with status and facet filters', async () => {
    await service.findAll({
      q: 'road maintenance',
      page: 1,
      limit: 20,
      status: ['closing-soon'],
      region: ['Western Cape'],
      category: ['Construction'],
    });

    const where = prisma.tender.findMany.mock.calls[0][0].where;

    expect(where.AND).toHaveLength(2);
    expect(where.AND[0].AND).toHaveLength(2);
    expect(where.AND[1]).toEqual({
      OR: [
        {
          status: 'active',
          publishedDate: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
          closingDate: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        },
      ],
    });
    expect(where.region).toEqual({ in: ['Western Cape'] });
    expect(where.category).toEqual({ in: ['Construction'] });
  });

  it('ignores connector words and duplicate terms', async () => {
    await service.findAll({
      q: 'the road and road maintenance for the city',
      page: 1,
      limit: 20,
    });

    const where = prisma.tender.findMany.mock.calls[0][0].where;
    const terms = where.AND[0].AND.map(
      (condition: any) =>
        condition.OR.find((item: any) => item.title).title.contains,
    );

    expect(terms).toEqual(['road', 'maintenance', 'city']);
  });

  it('defaults to valid newest tenders when no status is selected', async () => {
    await service.findAll({
      page: 1,
      limit: 20,
    });

    const where = prisma.tender.findMany.mock.calls[0][0].where;

    expect(where.AND).toEqual([
      {
        publishedDate: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
      },
    ]);
  });

  it('includes public award supplier details for awarded tenders', async () => {
    prisma.tender.findMany.mockResolvedValue([
      {
        id: 'tender-awarded',
        slug: 'awarded-tender',
        title: 'Awarded tender',
        status: 'active',
        publishedDate: new Date('2026-01-10T00:00:00.000Z'),
        closingDate: new Date('2026-01-20T00:00:00.000Z'),
        awards: [
          {
            id: 'award-1',
            supplierName: 'Winning Supplier',
            amount: 125000,
            currency: 'ZAR',
            date: null,
            tenderId: 'tender-awarded',
            createdAt: new Date('2026-01-25T00:00:00.000Z'),
          },
        ],
      },
    ]);
    prisma.tender.count.mockResolvedValue(1);

    const result = await service.findAll({
      awarded: true,
      page: 1,
      limit: 20,
    });

    expect(prisma.tender.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          awards: { some: {} },
        }),
        include: {
          awards: { orderBy: { date: 'desc' }, take: 3 },
        },
      }),
    );
    expect(result.data[0].awards).toEqual([
      {
        id: 'award-1',
        supplierName: 'Winning Supplier',
        amount: 125000,
        currency: 'ZAR',
        date: null,
      },
    ]);
  });

  it('uses Typesense results when the index is available', async () => {
    const typesense = {
      isReady: jest.fn().mockReturnValue(true),
      searchTenders: jest.fn().mockResolvedValue({
        found: 2,
        search_time_ms: 4,
        hits: [
          { document: { id: 'tender-2' } },
          { document: { id: 'tender-1' } },
        ],
      }),
    };
    prisma.tender.findMany.mockResolvedValue([
      {
        id: 'tender-1',
        title: 'First tender',
        publishedDate: new Date('2026-06-01T00:00:00.000Z'),
        closingDate: new Date('2026-06-10T00:00:00.000Z'),
      },
      {
        id: 'tender-2',
        title: 'Second tender',
        publishedDate: new Date('2026-06-01T00:00:00.000Z'),
        closingDate: new Date('2026-06-10T00:00:00.000Z'),
      },
    ]);
    service = new TendersService(
      prisma as unknown as PrismaService,
      typesense as any,
    );

    const result = await service.findAll({
      q: 'security services',
      page: 1,
      limit: 20,
      region: ['Gauteng'],
    });

    expect(typesense.searchTenders).toHaveBeenCalledWith(
      expect.objectContaining({
        q: 'security services',
        region: ['Gauteng'],
      }),
    );
    expect(prisma.tender.count).not.toHaveBeenCalled();
    expect(result.data.map((tender: any) => tender.id)).toEqual([
      'tender-2',
      'tender-1',
    ]);
    expect(result.meta.searchEngine).toBe('typesense');
    expect(result.meta.processingTimeMs).toBe(4);
  });
});
