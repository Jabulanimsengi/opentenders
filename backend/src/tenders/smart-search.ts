import { inferTenderCategoryFromSearchText } from './tender-categories';

const SEARCHABLE_FIELDS = [
  'title',
  'description',
  'buyerName',
  'category',
  'region',
  'province',
  'eligibilityCriteria',
  'specialConditions',
  'submissionMethod',
] as const;

const QUERY_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'at',
  'by',
  'for',
  'from',
  'in',
  'into',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
]);

type SmartSearchQuery = string | string[] | null | undefined;

export function buildTenderSmartSearchCondition(query?: SmartSearchQuery) {
  const terms = extractTenderSearchTerms(query);
  if (terms.length === 0) return null;

  return {
    AND: terms.map((term) => {
      const inferredCategory = inferTenderCategoryFromSearchText(term);
      const fieldConditions = SEARCHABLE_FIELDS.map((field) => ({
        [field]: { contains: term, mode: 'insensitive' },
      }));

      return {
        OR: inferredCategory
          ? [{ category: { equals: inferredCategory } }, ...fieldConditions]
          : fieldConditions,
      };
    }),
  };
}

export function extractTenderSearchTerms(query?: SmartSearchQuery) {
  const rawQuery = Array.isArray(query) ? query.join(' ') : query;
  const normalized = rawQuery
    ?.trim()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .toLowerCase();

  if (!normalized) return [];

  const terms = normalized
    .split(/\s+/)
    .filter((term) => term.length >= 2 && !QUERY_STOP_WORDS.has(term));

  return [...new Set(terms)].slice(0, 8);
}
