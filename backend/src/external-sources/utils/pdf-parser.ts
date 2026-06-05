import axios from 'axios';
import * as https from 'https';
import { ExternalTenderResult, TenderSourceRecord } from '../types';
import { cleanText, resolveUrl } from './text';
import { parseSouthAfricanTenderDate } from './date-parser';

const DEFAULT_USER_AGENT =
  'OpenTendersExternalScraper/1.0 (+https://opentenders.co.za)';

export async function downloadPdf(url: string): Promise<Buffer> {
  const response = await axios.get<ArrayBuffer>(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    headers: { 'User-Agent': DEFAULT_USER_AGENT },
  });

  return Buffer.from(response.data);
}

export function extractPdfText(buffer: Buffer): string {
  return cleanText(toPrintableText(buffer.toString('latin1')));
}

export function parsePdfTenderText(
  text: string,
  source: Pick<
    TenderSourceRecord,
    'name' | 'sourceType' | 'tenderUrl' | 'province' | 'organisationName'
  >,
): ExternalTenderResult[] {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  const tenderNumber = matchValue(
    cleaned,
    /(?:tender|bid|rfq)\s*(?:no\.?|number|ref(?:erence)?\.?)\s*[:-]?\s*([A-Z0-9/_.-]+)/i,
  );
  const closingText = matchValue(
    cleaned,
    /(?:closing\s*(?:date|time)?|closes)\s*[:-]?\s*([A-Za-z,\s]*\d{1,2}[/\s][A-Za-z0-9]+[/\s]\d{4}(?:,?\s*(?:at\s*)?\d{1,2}:\d{2})?)/i,
  );
  const briefingText = matchValue(
    cleaned,
    /(?:briefing\s*(?:date|session)?|site\s*meeting)\s*[:-]?\s*((?:\d{1,2}:\d{2}\s+on\s+)?[A-Za-z,\s]*\d{1,2}[/\s][A-Za-z0-9]+[/\s]\d{4}(?:,?\s*(?:at\s*)?\d{1,2}:\d{2})?)/i,
  );
  const email = matchValue(cleaned, /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  const cidb = matchValue(
    cleaned,
    /(CIDB\s*(?:grading|grade)?\s*[:-]?\s*[0-9A-Z]+\s*(?:GB|CE|EP|ME|SQ)?)/i,
  );
  const title =
    matchValue(
      cleaned,
      /(?:description|project|bid description)\s*[:-]\s*([^.;]{20,240})/i,
    ) || cleaned.slice(0, 180);

  return [
    {
      title,
      description: cidb
        ? `${cleaned.slice(0, 800)} CIDB: ${cidb}`
        : cleaned.slice(0, 800),
      tenderNumber,
      referenceNumber: tenderNumber,
      buyerName: source.organisationName || source.name,
      province: source.province || undefined,
      sourceName: source.name,
      sourceType: source.sourceType,
      sourceUrl: source.tenderUrl,
      documentUrls: [
        resolveUrl(source.tenderUrl, source.tenderUrl) || source.tenderUrl,
      ],
      closingDate: parseSouthAfricanTenderDate(closingText),
      briefingDate: parseSouthAfricanTenderDate(briefingText),
      contactEmail: email,
      rawText: cleaned,
      scrapedAt: new Date(),
    },
  ];
}

function matchValue(text: string, pattern: RegExp) {
  return cleanText(text.match(pattern)?.[1]);
}

function toPrintableText(value: string) {
  return Array.from(value)
    .map((char) => {
      const code = char.charCodeAt(0);
      return code === 9 ||
        code === 10 ||
        code === 13 ||
        (code >= 32 && code <= 126)
        ? char
        : ' ';
    })
    .join('');
}
