import { createHash } from 'node:crypto';

export function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, ' ').trim() || '';
}

export function nullableCleanText(value?: string | null) {
  const cleaned = cleanText(value);
  return cleaned.length > 0 ? cleaned : null;
}

export function stripHtml(value: string) {
  return cleanText(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'"),
  );
}

export function stableHash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function resolveUrl(baseUrl: string, url?: string | null) {
  if (!url) return undefined;
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}
