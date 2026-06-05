import {
  buildTenderSmartSearchCondition,
  extractTenderSearchTerms,
} from './smart-search';

describe('tender smart search', () => {
  it('splits natural-language queries into unique searchable terms', () => {
    expect(
      extractTenderSearchTerms('the road and road maintenance for the city'),
    ).toEqual(['road', 'maintenance', 'city']);
  });

  it('supports older saved searches that stored q as an array', () => {
    expect(extractTenderSearchTerms(['cleaning services in Gauteng'])).toEqual([
      'cleaning',
      'services',
      'gauteng',
    ]);
  });

  it('searches every term across tender fields', () => {
    expect(buildTenderSmartSearchCondition('cleaning services')).toEqual({
      AND: [
        {
          OR: expect.arrayContaining([
            { title: { contains: 'cleaning', mode: 'insensitive' } },
            { region: { contains: 'cleaning', mode: 'insensitive' } },
            { category: { equals: 'Cleaning & Hygiene' } },
          ]),
        },
        {
          OR: expect.arrayContaining([
            { description: { contains: 'services', mode: 'insensitive' } },
            { buyerName: { contains: 'services', mode: 'insensitive' } },
          ]),
        },
      ],
    });
  });

  it('maps category-intent words to the canonical category', () => {
    expect(buildTenderSmartSearchCondition('software')).toEqual({
      AND: [
        {
          OR: expect.arrayContaining([
            { category: { equals: 'IT & Digital Services' } },
            { title: { contains: 'software', mode: 'insensitive' } },
          ]),
        },
      ],
    });
  });
});
