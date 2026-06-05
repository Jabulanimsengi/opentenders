import { BaseExternalScraper } from './base-external-scraper';
import { ExternalScrapeOutput, TenderSourceRecord } from '../types';

export class DynamicPageScraper extends BaseExternalScraper {
  async scrape(source: TenderSourceRecord): Promise<ExternalScrapeOutput> {
    await Promise.resolve();
    throw new Error(
      `Dynamic scraping for ${source.name} requires a source-specific Playwright adapter.`,
    );
  }
}
