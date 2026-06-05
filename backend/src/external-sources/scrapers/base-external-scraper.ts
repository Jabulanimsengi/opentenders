import axios from 'axios';
import * as https from 'https';
import {
  ExternalScrapeOutput,
  ExternalTenderScraper,
  TenderSourceRecord,
} from '../types';

export abstract class BaseExternalScraper implements ExternalTenderScraper {
  private static readonly robotsCache = new Map<
    string,
    Promise<string | null>
  >();
  protected readonly userAgent =
    'OpenTendersExternalScraper/1.0 (+https://opentenders.co.za)';
  protected readonly requestTimeoutMs = 30000;
  protected readonly httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  abstract scrape(source: TenderSourceRecord): Promise<ExternalScrapeOutput>;

  protected async politeDelay(ms = 500) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected async assertRobotsAllowed(targetUrl: string) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return;
    }

    const robotsText = await this.getRobotsText(parsedUrl.origin);
    if (!robotsText) return;

    const path = parsedUrl.pathname || '/';
    if (isPathDisallowed(robotsText, path)) {
      throw new Error(`robots.txt disallows scraping ${targetUrl}`);
    }
  }

  private getRobotsText(origin: string) {
    if (!BaseExternalScraper.robotsCache.has(origin)) {
      BaseExternalScraper.robotsCache.set(
        origin,
        axios
          .get<string>(`${origin}/robots.txt`, {
            timeout: 10000,
            httpsAgent: this.httpsAgent,
            headers: { 'User-Agent': this.userAgent },
          })
          .then((response) => response.data)
          .catch(() => null),
      );
    }

    return BaseExternalScraper.robotsCache.get(origin)!;
  }
}

function isPathDisallowed(robotsText: string, path: string) {
  const lines = robotsText.split(/\r?\n/).map((line) => line.trim());
  let appliesToAll = false;

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const [rawKey, ...rawValueParts] = line.split(':');
    const key = rawKey?.trim().toLowerCase();
    const value = rawValueParts.join(':').trim();

    if (key === 'user-agent') {
      appliesToAll = value === '*';
      continue;
    }

    if (appliesToAll && key === 'disallow' && value && path.startsWith(value)) {
      return true;
    }
  }

  return false;
}
