export type TenderSourceType =
  | 'municipality'
  | 'province'
  | 'national_department'
  | 'soe'
  | 'university'
  | 'tvet'
  | 'public_entity'
  | 'pdf_bulletin'
  | 'other';

export type ScrapeMethod = 'static_html' | 'dynamic_browser' | 'pdf' | 'mixed';

export type TenderSourceRecord = {
  id: string;
  name: string;
  sourceType: TenderSourceType;
  baseUrl: string;
  tenderUrl: string;
  province?: string | null;
  organisationName?: string | null;
  scrapeMethod: ScrapeMethod;
  active: boolean;
  scrapeFrequencyHours: number;
  scrapeFrequencyMinutes?: number;
  lastScrapedAt?: Date | null;
};

export type ExternalTenderResult = {
  title?: string;
  description?: string;
  tenderNumber?: string;
  referenceNumber?: string;
  buyerName?: string;
  buyerType?: string;
  province?: string;
  municipality?: string;
  category?: string;
  sourceName?: string;
  sourceType?: string;
  sourceUrl?: string;
  documentUrls?: string[];
  publishedDate?: string | Date | null;
  closingDate?: string | Date | null;
  briefingDate?: string | Date | null;
  briefingCompulsory?: boolean;
  briefingLocation?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  submissionMethod?: string;
  submissionAddress?: string;
  status?: string;
  rawText?: string;
  rawHtml?: string;
  rawHtmlHash?: string;
  scrapedAt?: Date;
};

export type ExternalScrapeOutput = {
  results: ExternalTenderResult[];
  pagesVisited: number;
};

export interface ExternalTenderScraper {
  scrape(source: TenderSourceRecord): Promise<ExternalScrapeOutput>;
}

export type ImportExternalTenderStats = {
  found: number;
  created: number;
  updated: number;
  duplicates: number;
};
