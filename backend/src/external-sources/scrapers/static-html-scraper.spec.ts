import { extractTenderResultsFromHtml } from './static-html-scraper';
import { TenderSourceRecord } from '../types';
import { inferTenderCategory } from '../../tenders/tender-categories';

const source: TenderSourceRecord = {
  id: 'city-1',
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

describe('extractTenderResultsFromHtml', () => {
  it('extracts tender data from table rows and resolves document links', () => {
    const html = `
            <table>
                <tr><th>Bid No</th><th>Description</th><th>Closing</th><th>Download</th></tr>
                <tr>
                    <td>RFQ 42/2026</td>
                    <td>Cleaning services for municipal offices</td>
                    <td>Closing: Friday, 15 June 2026, 11:00</td>
                    <td><a href="/docs/rfq-42.pdf">PDF</a></td>
                </tr>
            </table>
        `;

    const results = extractTenderResultsFromHtml(html, source);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      title: 'Cleaning services for municipal offices',
      tenderNumber: 'RFQ 42/2026',
      buyerName: 'Example Municipality',
      sourceUrl: 'https://example.gov.za/docs/rfq-42.pdf',
      documentUrls: ['https://example.gov.za/docs/rfq-42.pdf'],
    });
    expect(results[0].closingDate).toBeInstanceOf(Date);
  });

  it('uses table headers to map dates, contacts, and document URLs', () => {
    const html = `
            <table>
                <tr>
                    <th>Reference Number</th>
                    <th>Tender Description</th>
                    <th>Advert Date</th>
                    <th>Closing Date</th>
                    <th>Briefing Session</th>
                    <th>Contact Details</th>
                    <th>Bid Documents</th>
                </tr>
                <tr>
                    <td>BID-ICT-2026/07</td>
                    <td>Provision of network support services</td>
                    <td>01 June 2026</td>
                    <td>30 June 2026 at 12:00</td>
                    <td>Compulsory briefing: 10 June 2026 at 10:00</td>
                    <td>Contact: Jane Smith jane@example.gov.za 012 345 6789</td>
                    <td><a href="downloads/bid-ict.docx">Download bid document</a></td>
                </tr>
            </table>
        `;

    const results = extractTenderResultsFromHtml(html, source);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      title: 'Provision of network support services',
      tenderNumber: 'BID-ICT-2026/07',
      category: 'IT & Digital Services',
      contactName: 'Jane Smith',
      contactEmail: 'jane@example.gov.za',
      contactPhone: '012 345 6789',
      briefingCompulsory: true,
      documentUrls: ['https://example.gov.za/downloads/bid-ict.docx'],
    });
    expect(results[0].publishedDate).toBeInstanceOf(Date);
    expect(results[0].closingDate).toBeInstanceOf(Date);
    expect(results[0].briefingDate).toBeInstanceOf(Date);
  });

  it('cleans document listing titles without inventing an advertised date', () => {
    const html = `
            <article class="tender">
                <a href="/wp-content/uploads/dlm_uploads/2022/11/Bid-document-RFP-Appointment-of-ISO-Auditors-CCTVET20221102.pdf">
                    Bid document RFP Appointment of ISO Auditors CCTVET20221102
                </a>
                | View Tender | 2022/11/02 | WEDNESDAY 07 DECEMBER 2021 AT 10:00
            </article>
        `;

    const results = extractTenderResultsFromHtml(html, {
      ...source,
      baseUrl: 'https://capricorncollege.edu.za',
      organisationName: 'Capricorn TVET College',
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      title: 'Appointment of ISO Auditors',
      tenderNumber: 'CCTVET20221102',
      buyerName: 'Capricorn TVET College',
      sourceUrl:
        'https://capricorncollege.edu.za/wp-content/uploads/dlm_uploads/2022/11/Bid-document-RFP-Appointment-of-ISO-Auditors-CCTVET20221102.pdf',
      documentUrls: [
        'https://capricorncollege.edu.za/wp-content/uploads/dlm_uploads/2022/11/Bid-document-RFP-Appointment-of-ISO-Auditors-CCTVET20221102.pdf',
      ],
    });
    expect(results[0].publishedDate).toBeNull();
    expect(results[0].closingDate).toBeInstanceOf(Date);
  });

  it('does not treat re-advertisement titles as advertised-date labels', () => {
    const html = `
            <article class="tender">
                Re-advertisement of on-site replacement of mechanical seals and bearings
                | Closing Date: 15 June 2026
                | <a href="/docs/mechanical-seals.pdf">Download tender document</a>
            </article>
        `;

    const results = extractTenderResultsFromHtml(html, source);

    expect(results).toHaveLength(1);
    expect(results[0].title).toContain(
      'Re-advertisement of on-site replacement',
    );
    expect(results[0].publishedDate).toBeNull();
    expect(results[0].closingDate).toBeInstanceOf(Date);
  });

  it('ignores rows that do not look like tenders', () => {
    const results = extractTenderResultsFromHtml(
      '<tr><td>About our city</td></tr>',
      source,
    );
    expect(results).toEqual([]);
  });
});

describe('inferTenderCategory', () => {
  it('keeps cleaning limited to actual cleaning services or supplies', () => {
    expect(inferTenderCategory('Cleaning services for municipal offices')).toBe(
      'Cleaning & Hygiene',
    );
    expect(
      inferTenderCategory(
        'Supply and delivery of cleaning material for NEC region',
      ),
    ).toBe('Cleaning & Hygiene');
    expect(
      inferTenderCategory(
        'High pressure cleaning on intake line and waste line',
      ),
    ).toBe('Cleaning & Hygiene');
  });

  it('does not label unrelated waste or tape tenders as cleaning', () => {
    expect(
      inferTenderCategory('Transportation of waste tyres across the country'),
    ).toBe('Waste Management & Recycling');
    expect(
      inferTenderCategory(
        'Supply and deliver storage containers for medical waste',
      ),
    ).toBe('Waste Management & Recycling');
    expect(
      inferTenderCategory(
        'Procurement of Backup Tapes, Cleaning Tapes and Labels',
      ),
    ).toBe('IT & Digital Services');
  });

  it('separates occupational hygiene surveys from cleaning', () => {
    expect(
      inferTenderCategory('Conduct an Occupational Health Hygiene Survey'),
    ).toBe('Health & Safety');
  });

  it('recognises expanded tender categories', () => {
    expect(
      inferTenderCategory('Supply and delivery of Aruba APS and switches'),
    ).toBe('Telecommunications & Connectivity');
    expect(
      inferTenderCategory('Appointment of attorneys for litigation services'),
    ).toBe('Legal Services');
    expect(
      inferTenderCategory('Appointment of auditors for annual financial audit'),
    ).toBe('Financial, Audit & Accounting');
    expect(
      inferTenderCategory('Supply and delivery of office desks and chairs'),
    ).toBe('Office Supplies, Furniture & Equipment');
    expect(
      inferTenderCategory('Provision of catering and refreshments for events'),
    ).toBe('Catering & Food Services');
  });

  it('does not classify tenders from organisation names alone', () => {
    expect(
      inferTenderCategory(
        'Fit-out construction for offices at Mangosuthu University of Technology',
      ),
    ).toBe('Construction & Civil Works');
  });
});
