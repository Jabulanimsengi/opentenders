import { BaseExternalScraper } from './base-external-scraper';
import { TenderSourceRecord } from '../types';
import { StaticHtmlScraper } from './static-html-scraper';

export class MixedTenderScraper extends BaseExternalScraper {
  private readonly staticScraper = new StaticHtmlScraper();

  async scrape(source: TenderSourceRecord) {
    // Starter behavior: parse the HTML listing and preserve linked PDFs as documentUrls.
    // Source-specific scrapers can extend this to fetch and parse each linked PDF.
    return this.staticScraper.scrape(source);
  }
}
