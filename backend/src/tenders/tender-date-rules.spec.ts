import {
  buildActiveTenderWhere,
  hasDisplayableTenderDates,
  isActiveTenderLike,
  normalizeTenderBriefingDate,
} from './tender-date-rules';

describe('tender date rules', () => {
  it('clears briefing dates that are before the published date', () => {
    const briefing = normalizeTenderBriefingDate(
      new Date('2025-12-03T11:00:00.000Z'),
      new Date('2026-06-01T00:00:00.000Z'),
      null,
    );

    expect(briefing).toBeNull();
  });

  it('keeps plausible briefing dates for newly published tenders', () => {
    const briefing = normalizeTenderBriefingDate(
      new Date('2026-06-03T11:00:00.000Z'),
      new Date('2026-06-01T00:00:00.000Z'),
      new Date('2026-06-10T11:00:00.000Z'),
    );

    expect(briefing?.toISOString()).toBe('2026-06-03T11:00:00.000Z');
  });

  it('limits active tenders without closing dates to recently published ones', () => {
    const where = buildActiveTenderWhere(new Date('2026-06-02T12:00:00.000Z'));

    expect(where).toEqual({
      status: 'active',
      publishedDate: {
        gte: expect.any(Date),
        lte: expect.any(Date),
      },
      OR: [
        { closingDate: { gte: expect.any(Date) } },
        {
          closingDate: null,
          publishedDate: { gte: expect.any(Date) },
        },
      ],
    });
    expect(where.OR[1].publishedDate.gte.toISOString()).toBe(
      '2026-03-04T12:00:00.000Z',
    );
    expect(where.publishedDate.gte.toISOString()).toBe(
      '2025-01-01T00:00:00.000Z',
    );
    expect(where.publishedDate.lte.toISOString()).toBe(
      '2026-06-02T12:00:00.000Z',
    );
  });

  it('identifies active tender-like objects consistently with the query rule', () => {
    const now = new Date('2026-06-02T12:00:00.000Z');

    expect(
      isActiveTenderLike(
        {
          status: 'active',
          closingDate: new Date('2026-06-03T12:00:00.000Z'),
          publishedDate: new Date('2025-12-01T12:00:00.000Z'),
        },
        now,
      ),
    ).toBe(true);
    expect(
      isActiveTenderLike(
        {
          status: 'active',
          closingDate: null,
          publishedDate: new Date('2026-06-01T12:00:00.000Z'),
        },
        now,
      ),
    ).toBe(true);
    expect(
      isActiveTenderLike(
        {
          status: 'active',
          closingDate: null,
          publishedDate: new Date('2026-01-01T12:00:00.000Z'),
        },
        now,
      ),
    ).toBe(false);
    expect(
      isActiveTenderLike(
        {
          status: 'active',
          closingDate: new Date('2026-06-10T12:00:00.000Z'),
          publishedDate: new Date('2026-06-06T12:00:00.000Z'),
        },
        now,
      ),
    ).toBe(false);
    expect(
      isActiveTenderLike(
        {
          status: 'active',
          closingDate: new Date('2026-06-10T12:00:00.000Z'),
          publishedDate: new Date('2024-12-31T23:59:59.000Z'),
        },
        now,
      ),
    ).toBe(false);
  });

  it('rejects impossible date ranges for display', () => {
    const now = new Date('2026-06-02T12:00:00.000Z');

    expect(
      hasDisplayableTenderDates(
        {
          publishedDate: new Date('2025-11-21T00:00:00.000Z'),
          closingDate: new Date('2025-11-20T15:50:04.000Z'),
        },
        now,
      ),
    ).toBe(false);

    expect(
      hasDisplayableTenderDates(
        {
          publishedDate: new Date('2025-11-21T00:00:00.000Z'),
          closingDate: new Date('2025-11-22T15:50:04.000Z'),
        },
        now,
      ),
    ).toBe(true);
  });
});
