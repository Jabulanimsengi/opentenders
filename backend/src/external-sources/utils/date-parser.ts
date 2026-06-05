import { parse, isValid } from 'date-fns';
import { cleanText } from './text';

const DATE_FORMATS = [
  'yyyy-MM-dd',
  'yyyy-MM-dd HH:mm',
  'dd MMMM yyyy',
  'dd MMM yyyy',
  'dd/MM/yyyy',
  'dd-MM-yyyy',
  'yyyy/MM/dd',
  'yyyy/MM/dd HH:mm',
  'dd MMM yyyy HH:mm',
  'dd MMMM yyyy HH:mm',
  'EEEE dd MMMM yyyy HH:mm',
  'EEEE dd MMM yyyy HH:mm',
  'EEEE, dd MMMM yyyy, HH:mm',
  'EEEE, dd MMM yyyy, HH:mm',
  "HH:mm 'on' dd MMMM yyyy",
  "HH:mm 'on' dd MMM yyyy",
];

export function parseSouthAfricanTenderDate(
  value?: string | Date | null,
): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;

  const normalized = cleanText(value)
    .replace(/\bat\b/gi, ' ')
    .replace(
      /^(?:closing|closes|close|due|deadline|published|issued|advert(?:ised)?|briefing|site meeting)(?:\s+date)?\s*:\s*/i,
      '',
    )
    .replace(/^closing:\s*/i, '')
    .replace(/\s+/g, ' ');

  if (!normalized) return null;

  for (const format of DATE_FORMATS) {
    try {
      const parsed = parse(normalized, format, new Date());
      if (isValid(parsed)) return parsed;
    } catch {
      continue;
    }
  }

  const embeddedDate = normalized.match(
    /(?:(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+)?(\d{1,2}\s+(?:Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)\s+\d{4})(?:,?\s*(\d{1,2}:\d{2}))?/i,
  );

  if (embeddedDate) {
    return parseSouthAfricanTenderDate(
      embeddedDate[2]
        ? `${embeddedDate[1]} ${embeddedDate[2]}`
        : embeddedDate[1],
    );
  }

  const slashDate = normalized.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashDate) {
    const [, day, month, year] = slashDate;
    return parseSouthAfricanTenderDate(
      `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`,
    );
  }

  if (/^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?Z?)?$/.test(normalized)) {
    const isoDate = Date.parse(normalized);
    if (!Number.isNaN(isoDate)) return new Date(isoDate);
  }

  return null;
}
