/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ConflictException } from '@nestjs/common';
import { ExternalSourcesService } from './external-sources.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ExternalSourcesService', () => {
  it('prevents concurrent scrapes for the same source', async () => {
    const source = {
      id: 'source-1',
      name: 'Example Source',
      sourceType: 'municipality',
      baseUrl: 'https://example.gov.za',
      tenderUrl: 'https://example.gov.za/tenders',
      scrapeMethod: 'static_html',
      active: true,
      scrapeFrequencyHours: 24,
    };
    let releaseScraper: () => void = () => undefined;

    const prisma = {
      tenderSource: {
        findUnique: jest.fn().mockResolvedValue(source),
        update: jest.fn(),
      },
      externalScrapeRun: {
        create: jest.fn().mockResolvedValue({ id: 'run-1' }),
        update: jest.fn().mockResolvedValue({ id: 'run-1', status: 'success' }),
      },
      externalScrapeError: {
        create: jest.fn(),
      },
    };

    const registry = {
      getScraper: jest.fn().mockReturnValue({
        scrape: jest.fn(
          () =>
            new Promise((resolve) => {
              releaseScraper = () => resolve({ results: [], pagesVisited: 1 });
            }),
        ),
      }),
    };
    const importer = {
      importResults: jest
        .fn()
        .mockResolvedValue({ found: 0, created: 0, updated: 0, duplicates: 0 }),
    };

    const service = new ExternalSourcesService(
      prisma as unknown as PrismaService,
      registry as any,
      importer as any,
    );

    const firstRun = service.scrapeSource(source.id);
    await expect(service.scrapeSource(source.id)).rejects.toBeInstanceOf(
      ConflictException,
    );
    releaseScraper();
    await expect(firstRun).resolves.toMatchObject({ status: 'success' });
  });

  it('marks changed duplicate imports as successful when every result was processed', async () => {
    const source = {
      id: 'source-1',
      name: 'Example Source',
      sourceType: 'municipality',
      baseUrl: 'https://example.gov.za',
      tenderUrl: 'https://example.gov.za/tenders',
      scrapeMethod: 'static_html',
      active: true,
      scrapeFrequencyHours: 24,
    };

    const prisma = {
      tenderSource: {
        findUnique: jest.fn().mockResolvedValue(source),
        update: jest.fn(),
      },
      externalScrapeRun: {
        create: jest.fn().mockResolvedValue({ id: 'run-1' }),
        update: jest
          .fn()
          .mockImplementation(({ data }) =>
            Promise.resolve({ id: 'run-1', ...data }),
          ),
      },
      externalScrapeError: {
        create: jest.fn(),
      },
    };
    const registry = {
      getScraper: jest.fn().mockReturnValue({
        scrape: jest.fn().mockResolvedValue({
          results: [{ title: 'Changed tender' }],
          pagesVisited: 1,
        }),
      }),
    };
    const importer = {
      importResults: jest
        .fn()
        .mockResolvedValue({ found: 1, created: 0, updated: 1, duplicates: 1 }),
    };

    const service = new ExternalSourcesService(
      prisma as unknown as PrismaService,
      registry as any,
      importer as any,
    );

    await expect(service.scrapeSource(source.id)).resolves.toMatchObject({
      status: 'success',
      numberOfTendersFound: 1,
      numberOfTendersUpdated: 1,
      numberOfDuplicatesFound: 1,
    });
  });
});
