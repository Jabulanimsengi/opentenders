const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_UNDATED_TENDER_DAYS = 90;
const FIRST_SUPPORTED_ADVERTISED_DATE_ISO = '2025-01-01T00:00:00.000Z';

export function firstSupportedAdvertisedDate() {
  return new Date(FIRST_SUPPORTED_ADVERTISED_DATE_ISO);
}

export function recentUndatedTenderThreshold(now = new Date()) {
  return new Date(now.getTime() - RECENT_UNDATED_TENDER_DAYS * DAY_MS);
}

export function buildValidAdvertisedDateWhere(now = new Date()) {
  return {
    publishedDate: {
      gte: firstSupportedAdvertisedDate(),
      lte: now,
    },
  };
}

export function buildActiveTenderWhere(now = new Date()) {
  return {
    status: 'active',
    ...buildValidAdvertisedDateWhere(now),
    OR: [
      { closingDate: { gte: now } },
      {
        closingDate: null,
        publishedDate: { gte: recentUndatedTenderThreshold(now) },
      },
    ],
  };
}

export function isActiveTenderLike(
  tender: {
    status?: string | null;
    closingDate?: Date | string | null;
    publishedDate?: Date | string | null;
  },
  now = new Date(),
) {
  if (tender.status && tender.status !== 'active') return false;

  if (!hasDisplayableTenderDates(tender, now)) return false;

  const closingDate = toValidDate(tender.closingDate);
  if (closingDate) return closingDate.getTime() >= now.getTime();

  const publishedDate = toValidDate(tender.publishedDate);
  return (
    Boolean(publishedDate) &&
    publishedDate!.getTime() >= recentUndatedTenderThreshold(now).getTime()
  );
}

export function hasDisplayableTenderDates(
  tender: {
    closingDate?: Date | string | null;
    publishedDate?: Date | string | null;
  },
  now = new Date(),
) {
  const publishedDate = toValidDate(tender.publishedDate);
  if (!publishedDate) return false;

  if (publishedDate.getTime() < firstSupportedAdvertisedDate().getTime()) {
    return false;
  }

  if (publishedDate.getTime() > now.getTime()) {
    return false;
  }

  const closingDate = toValidDate(tender.closingDate);
  if (closingDate && closingDate.getTime() < publishedDate.getTime()) {
    return false;
  }

  return true;
}

export function normalizeTenderBriefingDate(
  briefingDate?: Date | string | null,
  publishedDate?: Date | string | null,
  closingDate?: Date | string | null,
) {
  const briefing = toValidDate(briefingDate);
  if (!briefing) return null;

  const published = toValidDate(publishedDate);
  if (published && briefing.getTime() + DAY_MS < published.getTime()) {
    return null;
  }

  const closing = toValidDate(closingDate);
  if (closing && briefing.getTime() > closing.getTime() + DAY_MS) {
    return null;
  }

  return briefing;
}

function toValidDate(value?: Date | string | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
