import { ScrapeMethod, TenderSourceType } from '../types';

export class CreateTenderSourceDto {
  name: string;
  sourceType: TenderSourceType;
  baseUrl: string;
  tenderUrl: string;
  province?: string;
  organisationName?: string;
  scrapeMethod: ScrapeMethod;
  active?: boolean;
  scrapeFrequencyHours?: number;
  scrapeFrequencyMinutes?: number;
}

export class UpdateTenderSourceDto {
  name?: string;
  sourceType?: TenderSourceType;
  baseUrl?: string;
  tenderUrl?: string;
  province?: string | null;
  organisationName?: string | null;
  scrapeMethod?: ScrapeMethod;
  active?: boolean;
  scrapeFrequencyHours?: number;
  scrapeFrequencyMinutes?: number;
}
