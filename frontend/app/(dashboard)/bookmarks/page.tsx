"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Bookmark,
  Trash2,
  ArrowLeft,
  Loader2,
  Calendar,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { type Tender } from "@/lib/api-client";
import {
  getGuestWatchlist,
  removeFromGuestWatchlist,
  WATCHLIST_CHANGED_EVENT,
} from "@/lib/watchlist";

interface SavedTender {
  id: string;
  tenderId: string;
  notes: string | null;
  createdAt: string;
  tender: {
    id: string;
    title: string;
    description?: string | null;
    ocid?: string | null;
    slug: string | null;
    buyerName: string | null;
    region: string | null;
    category: string | null;
    closingDate: string | null;
    status: string | null;
  } | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const [bookmarks, setBookmarks] = useState<SavedTender[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const loadGuestBookmarks = useCallback(async () => {
    const savedItems = getGuestWatchlist();

    if (savedItems.length === 0) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const results = await Promise.all(
        savedItems.map(async (item) => {
          const response = await fetch(`${API_BASE}/tenders/${item.tenderId}`, {
            cache: "no-store",
          });
          if (!response.ok) return null;

          const tender = (await response.json()) as Tender;
          return {
            id: `guest-${item.tenderId}`,
            tenderId: item.tenderId,
            notes: null,
            createdAt: item.savedAt,
            tender: {
              id: tender.id,
              title: tender.title,
              description: tender.description,
              ocid: tender.ocid,
              slug: tender.slug,
              buyerName: tender.buyerName,
              region: tender.region,
              category: tender.category,
              closingDate: tender.closingDate,
              status: tender.status,
            },
          } satisfies SavedTender;
        }),
      );

      const availableBookmarks: SavedTender[] = [];
      for (const item of results) {
        if (item) {
          availableBookmarks.push(item);
        }
      }

      setBookmarks(availableBookmarks);
    } catch (error) {
      console.error("Error fetching guest watchlist:", error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAccountBookmarks = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/bookmarks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        const data = (await res.json()) as SavedTender[];
        setBookmarks(data);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "loading") return;

    if (accessToken) {
      void loadAccountBookmarks();
    } else {
      void loadGuestBookmarks();
    }
  }, [accessToken, loadAccountBookmarks, loadGuestBookmarks, status]);

  useEffect(() => {
    if (accessToken || typeof window === "undefined") return;

    window.addEventListener(WATCHLIST_CHANGED_EVENT, loadGuestBookmarks);
    window.addEventListener("storage", loadGuestBookmarks);

    return () => {
      window.removeEventListener(WATCHLIST_CHANGED_EVENT, loadGuestBookmarks);
      window.removeEventListener("storage", loadGuestBookmarks);
    };
  }, [accessToken, loadGuestBookmarks]);

  const removeBookmark = async (tenderId: string) => {
    setDeleting(tenderId);

    if (!accessToken) {
      removeFromGuestWatchlist(tenderId);
      setBookmarks((prev) =>
        prev.filter((bookmark) => bookmark.tenderId !== tenderId),
      );
      setDeleting(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/bookmarks/${tenderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        setBookmarks((prev) =>
          prev.filter((bookmark) => bookmark.tenderId !== tenderId),
        );
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
    } finally {
      setDeleting(null);
    }
  };

  const isPastClosingDate = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <div className="flex items-center justify-center py-16 sm:py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/tenders"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Tenders
        </Link>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2">
            <Bookmark className="h-5 w-5 text-amber-600 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Saved Tenders
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {accessToken
                ? "Your account watchlist"
                : "Your browser watchlist"}
            </p>
          </div>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <Card className="py-10 text-center sm:py-16">
          <CardContent>
            <Bookmark className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No saved tenders yet
            </h3>
            <p className="mb-4 text-gray-500">
              Start saving tenders you want to track here.
            </p>
            <Link href="/tenders">
              <Button>Browse Tenders</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="mb-4 text-sm text-muted-foreground">
            {bookmarks.length} saved tender{bookmarks.length !== 1 ? "s" : ""}
          </div>

          {bookmarks.map((bookmark) => {
            const tender = bookmark.tender;
            if (!tender) return null;

            const isClosed = isPastClosingDate(tender.closingDate);

            return (
              <Card
                key={bookmark.id}
                className={cn(
                  "border-l-4 transition-shadow hover:shadow-md",
                  isClosed ? "border-l-red-500" : "border-l-emerald-500",
                )}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Badge
                          variant={isClosed ? "destructive" : "default"}
                          className="text-xs"
                        >
                          {isClosed ? "Closed" : tender.status || "Active"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Saved{" "}
                          {format(new Date(bookmark.createdAt), "dd MMM yyyy")}
                        </span>
                      </div>

                      <Link
                        href={`/tenders/${tender.slug || tender.id}`}
                        className="line-clamp-2 text-lg font-semibold text-gray-900 transition-colors hover:text-emerald-600"
                      >
                        {tender.title}
                      </Link>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground sm:gap-4">
                        {tender.buyerName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {tender.buyerName}
                          </span>
                        )}
                        {tender.closingDate && (
                          <span
                            className={cn(
                              "flex items-center gap-1",
                              isClosed && "text-red-500",
                            )}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            {isClosed ? "Closed" : "Closes"}{" "}
                            {format(
                              new Date(tender.closingDate),
                              "dd MMM yyyy",
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                      <Link
                        href={`/tenders/${tender.slug || tender.id}`}
                        className="flex-1 sm:flex-none"
                      >
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBookmark(tender.id)}
                        disabled={deleting === tender.id}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        {deleting === tender.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
