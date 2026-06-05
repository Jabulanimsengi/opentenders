import axios from 'axios';
import { BaseExternalScraper } from './base-external-scraper';
import { ExternalTenderResult, TenderSourceRecord } from '../types';
import { cleanText, resolveUrl, stableHash, stripHtml } from '../utils/text';
import { parseSouthAfricanTenderDate } from '../utils/date-parser';
import { inferTenderCategory } from '../../tenders/tender-categories';

export class StaticHtmlScraper extends BaseExternalScraper {
  async scrape(source: TenderSourceRecord) {
    await this.assertRobotsAllowed(source.tenderUrl);
    await this.politeDelay();

    const response = await axios.get<string>(source.tenderUrl, {
      timeout: this.requestTimeoutMs,
      httpsAgent: this.httpsAgent,
      headers: { 'User-Agent': this.userAgent },
    });

    return {
      results: extractTenderResultsFromHtml(response.data, source),
      pagesVisited: 1,
    };
  }
}

export function extractTenderResultsFromHtml(
  html: string,
  source: TenderSourceRecord,
): ExternalTenderResult[] {
  const tableResults = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)]
    .flatMap((match) => extractTenderResultsFromTable(match[0], source))
    .filter((result): result is ExternalTenderResult => Boolean(result?.title));

  if (tableResults.length > 0) return dedupeResults(tableResults);

  const blocks = [
    ...html.matchAll(
      /<tr[\s\S]*?<\/tr>|<li[\s\S]*?<\/li>|<article[\s\S]*?<\/article>|<div[^>]+class=["'][^"']*(?:tender|bid|rfq|quotation|procurement)[^"']*["'][\s\S]*?<\/div>/gi,
    ),
  ].map((match) => match[0]);

  return dedupeResults(
    blocks
      .map((row) => parseHtmlTenderRow(row, source))
      .filter((result): result is ExternalTenderResult =>
        Boolean(result?.title),
      ),
  );
}

function extractTenderResultsFromTable(
  tableHtml: string,
  source: TenderSourceRecord,
) {
  const rows = [...tableHtml.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map(
    (match) => match[0],
  );
  const headerRow = rows.find((row) => /<th[\s\S]*?<\/th>/i.test(row));
  const headers = headerRow ? extractCells(headerRow, 'th') : [];

  return rows
    .filter((row) => row !== headerRow)
    .map((row) => parseHtmlTenderRow(row, source, headers))
    .filter((result): result is ExternalTenderResult => Boolean(result?.title));
}

function parseHtmlTenderRow(
  rowHtml: string,
  source: TenderSourceRecord,
  headers: string[] = [],
): ExternalTenderResult | null {
  const cells = extractCells(rowHtml, 'td');

  if (
    cells.length > 0 &&
    cells.every((cell) =>
      /^(bid no|description|closing|download|date|document|title|reference)$/i.test(
        cell,
      ),
    )
  ) {
    return null;
  }

  const text = cells.length > 0 ? cells.join(' | ') : stripHtml(rowHtml);
  if (!looksLikeTenderText(text)) return null;

  const links = [
    ...rowHtml.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi),
  ];
  const documentUrls = links
    .filter((match) => looksLikeDocumentLink(match[1], stripHtml(match[2])))
    .map((match) => resolveUrl(source.baseUrl, match[1]))
    .filter((url): url is string => Boolean(url));
  const rowUrls = links
    .map((match) => resolveUrl(source.baseUrl, match[1]))
    .filter((url): url is string => Boolean(url));
  const segments = text.split('|').map(cleanText).filter(Boolean);

  const field = (patterns: RegExp[]) =>
    findCellByHeader(headers, cells, patterns);
  const titleCell = field([
    /description/i,
    /title/i,
    /bid\s*description/i,
    /tender\s*description/i,
    /project/i,
    /service/i,
  ]);
  const tenderNumberCell = field([
    /bid|tender|rfq|quotation|quote|contract|reference|ref/i,
  ]);
  const closingDateCell = field([/closing|close|due|deadline/i]);
  const publishedDateCell = field([/published|issued|advert/i]);
  const briefingDateCell = field([/briefing|site\s*meeting|compulsory/i]);
  const contactCell = field([/contact|enquiries|email|telephone|phone/i]);
  const submissionCell = field([/submission|delivery|address/i]);

  const rawTitle = cleanText(
    titleCell ||
      stripHtml(bestLinkText(links) || '') ||
      cells.find(
        (cell) =>
          cell.length > 12 &&
          !/closing|date|download|pdf|docx?|briefing|compulsory/i.test(cell),
      ) ||
      text.slice(0, 180),
  );
  const tenderNumber = findTenderNumber(tenderNumberCell, text, rawTitle);
  const title = cleanTenderTitle(rawTitle, tenderNumber);

  if (!title || title.length < 5) return null;

  const closingDateText =
    cleanText(closingDateCell) || findLikelyClosingDateText(text, segments);
  const briefingDateText =
    cleanText(briefingDateCell) ||
    matchValue(
      text,
      /(?:briefing|site\s*meeting)\s*(?:date)?\s*[:-]?\s*([A-Za-z,\s]*\d{1,2}[-/\s][A-Za-z0-9]+[-/\s]\d{2,4}(?:,?\s*(?:at\s*)?\d{1,2}:\d{2})?)/i,
    );
  const publishedDateText =
    cleanText(publishedDateCell) || findLikelyPublishedDateText(text);
  const contactText = cleanText(contactCell || text);
  const contactEmail = matchValue(
    contactText,
    /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i,
  );
  const contactPhone = matchValue(
    contactText,
    /((?:\+27|0)\s?\d{2}\s?\d{3}\s?\d{4})/,
  );
  const contactName = matchValue(
    contactText,
    /(?:contact|enquiries?)\s*(?:person)?\s*[:-]?\s*([A-Z][A-Za-z .'-]{3,80}?)(?=\s+[A-Z0-9._%+-]+@|\s+\+27|\s+0\d|,|;|$)/i,
  );
  const briefingCompulsory = /\b(compulsory|mandatory)\b/i.test(
    briefingDateCell || text,
  );
  const category = inferTenderCategory(text);

  return {
    title,
    description: text,
    tenderNumber,
    referenceNumber: tenderNumber,
    buyerName: source.organisationName || source.name,
    province: source.province || undefined,
    category,
    sourceName: source.name,
    sourceType: source.sourceType,
    sourceUrl: documentUrls[0] || rowUrls[0] || source.tenderUrl,
    documentUrls,
    publishedDate: parseSouthAfricanTenderDate(publishedDateText),
    closingDate: parseSouthAfricanTenderDate(closingDateText),
    briefingDate: parseSouthAfricanTenderDate(briefingDateText),
    briefingCompulsory,
    contactName,
    contactEmail,
    contactPhone,
    submissionAddress: cleanText(submissionCell),
    rawText: text,
    rawHtml: rowHtml,
    rawHtmlHash: stableHash(rowHtml),
    scrapedAt: new Date(),
  };
}

function extractCells(rowHtml: string, tag: 'td' | 'th') {
  return [
    ...rowHtml.matchAll(
      new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'),
    ),
  ]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);
}

function findCellByHeader(
  headers: string[],
  cells: string[],
  patterns: RegExp[],
) {
  for (const [index, header] of headers.entries()) {
    if (patterns.some((pattern) => pattern.test(header))) {
      return cells[index];
    }
  }

  return undefined;
}

function bestLinkText(links: RegExpMatchArray[]) {
  return links
    .map((match) => stripHtml(match[2]))
    .find(
      (cell) => cell.length > 12 && !/closing|date|download|pdf/i.test(cell),
    );
}

function cleanTenderTitle(rawTitle: string, tenderNumber?: string) {
  let title = cleanText(rawTitle)
    .replace(/\|\s*view\s+tender.*$/i, '')
    .replace(/\|\s*download.*$/i, '')
    .replace(/^(?:bid|tender|rfq|rfp)?\s*document\s*[:-]?\s*/i, '')
    .replace(/^(?:rfp|rfq|bid|quotation)\s+for\s+/i, '')
    .replace(/^(?:rfp|rfq|bid|quotation)\s+/i, '');

  if (tenderNumber) {
    title = title.replace(new RegExp(escapeRegExp(tenderNumber), 'i'), '');
  }

  return cleanText(
    title
      .replace(/\bview\s+tender\b/gi, '')
      .replace(/\b(?:pdf|docx?|xlsx?|download)\b$/gi, '')
      .replace(/\s+\b[A-Z]{2,}[A-Z0-9/-]{5,}\b$/g, '')
      .replace(/\s{2,}/g, ' '),
  );
}

function findTenderNumber(
  tenderNumberCell: string | undefined,
  text: string,
  rawTitle: string,
) {
  const cellValue = cleanText(tenderNumberCell);
  if (looksLikeReference(cellValue)) return cellValue;

  const explicit = matchValue(
    text,
    /\b(?:tender|bid|rfq|rfp|quotation|quote|contract)\s*(?:no\.?|number|ref(?:erence)?\.?)\s*[:#-]?\s*([A-Z0-9][A-Z0-9/_. -]{3,60})/i,
  );
  if (looksLikeReference(explicit)) return explicit;

  const codeCandidates = [rawTitle, text]
    .flatMap((value) =>
      [...value.matchAll(/\b([A-Z]{2,}[A-Z0-9/-]{5,})\b/g)].map(
        (match) => match[1],
      ),
    )
    .filter(looksLikeReference);

  return codeCandidates.at(-1) || undefined;
}

function findLikelyClosingDateText(text: string, segments: string[]) {
  const labelled = matchValue(
    text,
    /(?:closing|closes|close|due|deadline)\s*(?:date)?\s*[:-]?\s*([A-Za-z,\s]*\d{1,2}[-/\s][A-Za-z0-9]+[-/\s]\d{2,4}(?:,?\s*(?:at\s*)?\d{1,2}:\d{2})?)/i,
  );
  if (labelled) return labelled;

  const weekdaySegment = segments.find(
    (segment) =>
      /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i.test(
        segment,
      ) && /\d{1,2}\s+[A-Za-z]+\s+\d{4}/.test(segment),
  );
  if (weekdaySegment) return weekdaySegment;

  return segments
    .filter((segment) => /\d{1,2}[-/\s][A-Za-z0-9]+[-/\s]\d{2,4}/.test(segment))
    .at(-1);
}

function findLikelyPublishedDateText(text: string) {
  const labelled = matchValue(
    text,
    /(?:^|[|;\n\r])\s*(?:published|issued|advertised|advert)\b\s*(?:date)?\s*[:-]?\s*([A-Za-z,\s]*\d{1,2}[-/\s][A-Za-z0-9]+[-/\s]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})/i,
  );
  if (labelled) return labelled;

  return undefined;
}

function looksLikeReference(value?: string) {
  const cleaned = cleanText(value);
  return (
    cleaned.length >= 4 &&
    cleaned.length <= 80 &&
    /[0-9/.-]/.test(cleaned) &&
    !/\|/.test(cleaned) &&
    !/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i.test(
      cleaned,
    ) &&
    !/^(document|download|view tender|pdf|docx?)$/i.test(cleaned)
  );
}

function looksLikeDocumentLink(href: string, linkText: string) {
  return (
    /\.(pdf|doc|docx|xls|xlsx|csv|zip)(?:[?#].*)?$/i.test(href) ||
    /\b(document|download|terms|rfq|bid|tender|specification|brief)\b/i.test(
      linkText,
    )
  );
}

function looksLikeTenderText(text: string) {
  const hasProcurementTerm =
    /\b(tender|bid|rfq|quotation|proposal|contract|procurement)\b/i.test(text);
  const hasTenderDetail =
    /\b(closing|closes|close|deadline|compulsory|briefing|download|pdf|docx?|bid\s*no|rfq\s*no|reference)\b/i.test(
      text,
    ) || /\d{1,2}[-/\s][A-Za-z0-9]+[-/\s]\d{2,4}/.test(text);

  return hasProcurementTerm && hasTenderDetail;
}

function matchValue(text: string, pattern: RegExp) {
  return cleanText(text.match(pattern)?.[1]);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function dedupeResults(results: ExternalTenderResult[]) {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = stableHash(
      [
        result.sourceUrl,
        result.tenderNumber,
        result.title,
        result.closingDate instanceof Date
          ? result.closingDate.toISOString()
          : result.closingDate,
      ].join('|'),
    );
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
