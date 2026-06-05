import { BaseExternalScraper } from './base-external-scraper';
import { TenderSourceRecord } from '../types';
import {
  downloadPdf,
  extractPdfText,
  parsePdfTenderText,
} from '../utils/pdf-parser';

export class PdfBulletinScraper extends BaseExternalScraper {
  async scrape(source: TenderSourceRecord) {
    await this.assertRobotsAllowed(source.tenderUrl);
    await this.politeDelay();

    const pdf = await downloadPdf(source.tenderUrl);
    const text = extractPdfText(pdf);

    return {
      results: parsePdfTenderText(text, source),
      pagesVisited: 1,
    };
  }
}
