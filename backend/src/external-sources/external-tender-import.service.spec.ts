/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { ExternalTenderImportService } from './external-tender-import.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenderSourceRecord } from './types';

const source: TenderSourceRecord = {
  id: 'source-1',
  name: 'Example Municipality',
  sourceType: 'municipality',
  baseUrl: 'https://example.gov.za',
  tenderUrl: 'https://example.gov.za/tenders',
  province: 'Gauteng',
  organisationName: 'Example Municipality',
  scrapeMethod: 'static_html',
  active: true,
  scrapeFrequencyHours: 24,
};

describe('ExternalTenderImportService', () => {
  let prisma: any;
  let service: ExternalTenderImportService;

  beforeEach(() => {
    prisma = {
      tender: {
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      externalTenderChangeLog: {
        createMany: jest.fn(),
      },
    };
    service = new ExternalTenderImportService(prisma as PrismaService);
  });

  it('creates normalized external tenders with synthetic ocids', async () => {
    prisma.tender.findFirst.mockResolvedValue(null);

    const stats = await service.importResults(source, [
      {
        title: 'Cleaning services for municipal offices',
        tenderNumber: 'RFQ 42/2026',
        buyerName: 'Example Municipality',
        sourceUrl: 'https://example.gov.za/docs/rfq-42.pdf',
        documentUrls: ['https://example.gov.za/docs/rfq-42.pdf'],
        closingDate: '15 June 2026',
      },
    ]);

    expect(stats).toEqual({ found: 1, created: 1, updated: 0, duplicates: 0 });
    expect(prisma.tender.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ocid: expect.stringMatching(/^external-source-1-/),
        sourceName: 'Example Municipality',
        sourceUrl: 'https://example.gov.za/docs/rfq-42.pdf',
        tenderNumber: 'RFQ 42/2026',
        closingDate: expect.any(Date),
      }),
    });
  });

  it('deduplicates and updates changed tender data', async () => {
    prisma.tender.findFirst.mockResolvedValue({
      id: 'existing-1',
      title: 'Cleaning services for municipal offices',
      buyerName: 'Example Municipality',
      closingDate: new Date('2026-06-15T00:00:00.000Z'),
      status: 'active',
      documentUrls: JSON.stringify(['https://example.gov.za/docs/rfq-42.pdf']),
      contactEmail: null,
    });

    const stats = await service.importResults(source, [
      {
        title: 'Cleaning services for municipal offices',
        buyerName: 'Example Municipality',
        sourceUrl: 'https://example.gov.za/docs/rfq-42.pdf',
        documentUrls: ['https://example.gov.za/docs/rfq-42.pdf'],
        closingDate: '20 June 2026',
        contactEmail: 'procurement@example.gov.za',
      },
    ]);

    expect(stats).toEqual({ found: 1, created: 0, updated: 1, duplicates: 1 });
    expect(prisma.tender.update).toHaveBeenCalledWith({
      where: { id: 'existing-1' },
      data: expect.objectContaining({
        closingDate: expect.any(Date),
        contactEmail: 'procurement@example.gov.za',
      }),
    });
    expect(prisma.tender.update.mock.calls[0][0].data).not.toHaveProperty(
      'ocid',
    );
    expect(prisma.tender.update.mock.calls[0][0].data).not.toHaveProperty(
      'slug',
    );
    expect(prisma.externalTenderChangeLog.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          tenderId: 'existing-1',
          field: 'closingDate',
        }),
        expect.objectContaining({
          tenderId: 'existing-1',
          field: 'contactEmail',
        }),
      ]),
    });
  });

  it('skips records without a title', async () => {
    const stats = await service.importResults(source, [
      { buyerName: 'Example Municipality' },
    ]);

    expect(stats).toEqual({ found: 1, created: 0, updated: 0, duplicates: 0 });
    expect(prisma.tender.create).not.toHaveBeenCalled();
  });

  it('drops impossible briefing dates without dropping the tender', async () => {
    prisma.tender.findFirst.mockResolvedValue(null);

    await service.importResults(source, [
      {
        title: 'Security services for municipal offices',
        publishedDate: '01 Jun 2026',
        briefingDate: '03 Dec 2025, 11:00',
      },
    ]);

    expect(prisma.tender.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Security services for municipal offices',
        publishedDate: expect.any(Date),
        briefingDate: null,
      }),
    });
  });
});
