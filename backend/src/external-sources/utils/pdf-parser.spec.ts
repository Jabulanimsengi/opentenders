import { parsePdfTenderText } from './pdf-parser';
import { TenderSourceRecord } from '../types';

const source: TenderSourceRecord = {
  id: 'bulletin-1',
  name: 'Example Bulletin',
  sourceType: 'pdf_bulletin',
  baseUrl: 'https://example.gov.za',
  tenderUrl: 'https://example.gov.za/bulletins/tenders.pdf',
  province: 'Western Cape',
  organisationName: 'Example Department',
  scrapeMethod: 'pdf',
  active: true,
  scrapeFrequencyHours: 24,
};

describe('parsePdfTenderText', () => {
  it('extracts likely tender fields from public PDF text', () => {
    const [result] = parsePdfTenderText(
      `
            Bid Description: Supply and delivery of laptops for regional offices.
            Tender No: WCED/ICT/15/2026
            Closing: Friday, 15 June 2026, 11:00
            Briefing Date: 11:00 on 10 June 2026
            Contact: procurement@example.gov.za
            CIDB grading: 3GB
        `,
      source,
    );

    expect(result).toMatchObject({
      title: 'Supply and delivery of laptops for regional offices',
      tenderNumber: 'WCED/ICT/15/2026',
      buyerName: 'Example Department',
      contactEmail: 'procurement@example.gov.za',
      documentUrls: ['https://example.gov.za/bulletins/tenders.pdf'],
    });
    expect(result.closingDate).toBeInstanceOf(Date);
    expect(result.briefingDate).toBeInstanceOf(Date);
    expect(result.description).toContain('CIDB');
  });
});
