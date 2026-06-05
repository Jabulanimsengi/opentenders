import { Injectable } from '@nestjs/common';
import { DynamicPageScraper } from './scrapers/dynamic-page-scraper';
import { MixedTenderScraper } from './scrapers/mixed-tender-scraper';
import { PdfBulletinScraper } from './scrapers/pdf-bulletin-scraper';
import { StaticHtmlScraper } from './scrapers/static-html-scraper';
import { ExternalTenderScraper, TenderSourceRecord } from './types';

@Injectable()
export class ExternalScraperRegistryService {
  private readonly staticHtmlScraper = new StaticHtmlScraper();
  private readonly dynamicPageScraper = new DynamicPageScraper();
  private readonly pdfBulletinScraper = new PdfBulletinScraper();
  private readonly mixedTenderScraper = new MixedTenderScraper();

  getScraper(source: TenderSourceRecord): ExternalTenderScraper {
    switch (source.scrapeMethod) {
      case 'dynamic_browser':
        return this.dynamicPageScraper;
      case 'pdf':
        return this.pdfBulletinScraper;
      case 'mixed':
        return this.mixedTenderScraper;
      case 'static_html':
      default:
        return this.staticHtmlScraper;
    }
  }
}
