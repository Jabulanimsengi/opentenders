"use client";

export type GuestWatchlistItem = {
  tenderId: string;
  savedAt: string;
};

const STORAGE_KEY = "open-tenders.watchlist.v1";
export const WATCHLIST_CHANGED_EVENT = "open-tenders:watchlist-changed";

function readRawItems() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is GuestWatchlistItem =>
        typeof item?.tenderId === "string" &&
        item.tenderId.length > 0 &&
        typeof item?.savedAt === "string",
    );
  } catch {
    return [];
  }
}

function writeItems(items: GuestWatchlistItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
  window.dispatchEvent(new Event(WATCHLIST_CHANGED_EVENT));
}

export function getGuestWatchlist() {
  return readRawItems();
}

export function isInGuestWatchlist(tenderId: string) {
  return readRawItems().some((item) => item.tenderId === tenderId);
}

export function addToGuestWatchlist(tenderId: string) {
  const items = readRawItems().filter((item) => item.tenderId !== tenderId);
  const nextItems = [{ tenderId, savedAt: new Date().toISOString() }, ...items];
  writeItems(nextItems);
  return nextItems[0];
}

export function removeFromGuestWatchlist(tenderId: string) {
  const nextItems = readRawItems().filter((item) => item.tenderId !== tenderId);
  writeItems(nextItems);
}
