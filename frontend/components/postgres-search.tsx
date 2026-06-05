"use client";

import {
  useEffect,
  useState,
  useCallback,
  useTransition,
  Suspense,
  useMemo,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Building2,
  MapPin,
  Clock,
  Plus,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Bell,
  Megaphone,
  X,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { format, isPast, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { BookmarkButton } from "@/components/bookmark-button";
import { TenderFilter } from "@/components/tender-filter";
import { type Tender, type TenderFacets } from "@/lib/api-client";
import { useSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface TenderCardProps {
  tender: Tender;
  isSubscriber: boolean;
  isLoggedIn: boolean;
  searchQuery?: string;
}

function TenderCard({
  tender,
  isSubscriber,
  isLoggedIn,
  searchQuery = "",
}: TenderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const highlightTerms = useMemo(
    () => getHighlightTerms(searchQuery),
    [searchQuery],
  );
  const closingDate = tender.closingDate ? new Date(tender.closingDate) : null;
  const publishedDate = tender.publishedDate
    ? new Date(tender.publishedDate)
    : null;
  const tenderStatus = (tender.status || "active").toLowerCase();
  const isCancelled = tenderStatus === "cancelled";
  const isClosed = !isCancelled && closingDate ? isPast(closingDate) : false;
  const daysLeft =
    closingDate && !isClosed && !isCancelled
      ? differenceInDays(closingDate, new Date())
      : null;
  const isClosingSoon = daysLeft !== null && daysLeft <= 7;
  const isNewTender = isNewlyAdvertisedTender(publishedDate);
  const statusLabel = isCancelled
    ? "Cancelled"
    : isClosed
      ? "Closed"
      : "Active";
  const advertisedDateText = formatAdvertisedDate(publishedDate);
  const advertisedSource =
    tender.sourceName ||
    (tender.sourceType ? labelSourceType(tender.sourceType) : null);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("[data-bookmark-button]") ||
      target.closest("[data-expand-button]")
    ) {
      e.preventDefault();
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-2.5 sm:mb-4">
      <Link
        href={`/tenders/${tender.slug || tender.id}`}
        onClick={handleCardClick}
      >
        <Card
          className={cn(
            "overflow-hidden rounded-lg border-l-[3px] py-0 transition-all hover:shadow-md cursor-pointer sm:border-l-4",
            isCancelled || isClosed
              ? "border-l-slate-300 opacity-75"
              : isClosingSoon
                ? "border-l-amber-500"
                : "border-l-emerald-500",
            isExpanded && "rounded-b-none",
          )}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-between sm:gap-3">
              <div className="flex-1 min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                  {isNewTender && (
                    <Badge className="h-5 rounded bg-sky-500 px-1.5 text-[10px] font-semibold uppercase leading-none text-white hover:bg-sky-500 sm:text-xs">
                      New
                    </Badge>
                  )}
                  <Badge
                    variant={isClosed || isCancelled ? "secondary" : "default"}
                    className={cn(
                      "h-5 rounded px-1.5 text-[10px] leading-none sm:text-xs",
                      !isClosed &&
                        !isCancelled &&
                        "bg-emerald-500 hover:bg-emerald-600",
                      isCancelled && "bg-slate-200 text-slate-600",
                    )}
                  >
                    {statusLabel}
                  </Badge>
                  {isClosingSoon && !isClosed && !isCancelled && (
                    <Badge
                      variant="outline"
                      className="h-5 rounded border-amber-300 px-1.5 text-[10px] leading-none text-amber-600 sm:text-xs"
                    >
                      Closes soon
                    </Badge>
                  )}
                  {tender.category && (
                    <Badge
                      variant="outline"
                      className="max-w-full truncate rounded border-slate-200 bg-white px-1.5 text-[10px] leading-none text-slate-600 sm:max-w-[240px] sm:text-xs"
                    >
                      <HighlightText
                        text={tender.category}
                        terms={highlightTerms}
                      />
                    </Badge>
                  )}
                </div>

                <h3 className="mb-1 text-sm font-semibold leading-snug text-slate-800 line-clamp-2 sm:mb-2 sm:text-base">
                  <HighlightText text={tender.title} terms={highlightTerms} />
                </h3>

                {tender.description && (
                  <p className="max-w-2xl text-xs leading-snug text-slate-500 line-clamp-2 sm:text-sm">
                    <HighlightText
                      text={tender.description}
                      terms={highlightTerms}
                    />
                  </p>
                )}

                {(tender.buyerName || tender.region) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] leading-tight text-slate-500 sm:gap-x-4 sm:text-sm">
                    {tender.buyerName && (
                      <span className="flex min-w-0 items-center gap-1">
                        <Building2 className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                        <span className="max-w-[170px] truncate sm:max-w-[240px]">
                          <HighlightText
                            text={tender.buyerName}
                            terms={highlightTerms}
                          />
                        </span>
                      </span>
                    )}
                    {tender.region && (
                      <span className="flex min-w-0 items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                        <span className="max-w-[130px] truncate sm:max-w-none">
                          <HighlightText
                            text={tender.region}
                            terms={highlightTerms}
                          />
                        </span>
                      </span>
                    )}
                    {advertisedSource && (
                      <span className="flex min-w-0 items-center gap-1">
                        <Megaphone className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                        <span className="max-w-[170px] truncate sm:max-w-[240px]">
                          {advertisedSource}
                        </span>
                      </span>
                    )}
                  </div>
                )}

                {/* Dates Row */}
                {(publishedDate || closingDate) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-slate-100 pt-1.5 text-[10px] leading-tight text-slate-400 sm:mt-2 sm:gap-x-4 sm:pt-2 sm:text-xs">
                    {publishedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{advertisedDateText}</span>
                      </span>
                    )}
                    {closingDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>Closes {format(closingDate, "dd MMM yyyy")}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center justify-between gap-2 sm:flex-col sm:items-end">
                <div className="flex min-w-0 items-center gap-2">
                  {closingDate && (
                    <div
                      className={cn(
                        "flex items-center gap-1 whitespace-nowrap text-xs font-medium sm:text-sm",
                        isClosed
                          ? "text-slate-400"
                          : isClosingSoon
                            ? "text-amber-600"
                            : "text-slate-600",
                      )}
                    >
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {isClosed
                        ? "Closed"
                        : daysLeft === 0
                          ? "Today"
                          : daysLeft === 1
                            ? "1 day left"
                            : `${daysLeft} days left`}
                    </div>
                  )}
                  {isLoggedIn && (
                    <div data-bookmark-button>
                      <BookmarkButton
                        tenderId={tender.id}
                        variant="icon"
                        isSubscriber={isSubscriber}
                        className="h-8 w-8 rounded-md sm:h-9 sm:w-9"
                      />
                    </div>
                  )}
                </div>
                {isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    {/* Quick View Expand Button */}
                    <div className="relative group">
                      <button
                        data-expand-button
                        onClick={handleExpandClick}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-md transition-all cursor-pointer sm:rounded-full",
                          isExpanded
                            ? "bg-emerald-500 text-white rotate-45 shadow-lg"
                            : "bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:scale-105 hover:shadow-md",
                        )}
                        aria-label={
                          isExpanded ? "Close preview" : "Quick preview"
                        }
                      >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity pointer-events-none group-hover:opacity-100 sm:block">
                        {isExpanded ? "Close preview" : "Quick preview"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="h-5 rounded px-1.5 text-[10px] leading-none sm:text-xs"
                  >
                    Preview
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Expandable Quick View Panel */}
      {isLoggedIn && isExpanded && (
        <div className="rounded-b-lg border border-t-0 border-slate-200 bg-slate-50 p-3 animate-in slide-in-from-top-2 duration-200 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Description */}
            {tender.description && (
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm sm:normal-case sm:tracking-normal sm:text-slate-700">
                  Description
                </h4>
                <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap line-clamp-5 sm:text-sm sm:line-clamp-none">
                  <HighlightText
                    text={tender.description}
                    terms={highlightTerms}
                  />
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs sm:gap-4 sm:text-sm md:grid-cols-4">
              {tender.category && (
                <div className="min-w-0">
                  <span className="text-slate-400 text-xs uppercase">
                    Category
                  </span>
                  <p className="truncate font-medium text-slate-700">
                    <HighlightText
                      text={tender.category}
                      terms={highlightTerms}
                    />
                  </p>
                </div>
              )}
              {tender.region && (
                <div className="min-w-0">
                  <span className="text-slate-400 text-xs uppercase">
                    Region
                  </span>
                  <p className="truncate font-medium text-slate-700">
                    <HighlightText
                      text={tender.region}
                      terms={highlightTerms}
                    />
                  </p>
                </div>
              )}
              {tender.buyerName && (
                <div className="min-w-0">
                  <span className="text-slate-400 text-xs uppercase">
                    Buyer
                  </span>
                  <p className="truncate font-medium text-slate-700">
                    <HighlightText
                      text={tender.buyerName}
                      terms={highlightTerms}
                    />
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 border-t border-slate-200 pt-2">
              <Link
                href={`/tenders/${tender.slug || tender.id}`}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 sm:text-sm"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatAdvertisedDate(date: Date | null) {
  if (!date || Number.isNaN(date.getTime()) || date.getFullYear() <= 1971) {
    return "Advertised date unavailable";
  }

  return `Advertised ${format(date, "dd MMM yyyy")}`;
}

function isNewlyAdvertisedTender(date: Date | null) {
  if (!date || Number.isNaN(date.getTime()) || date.getFullYear() <= 1971) {
    return false;
  }

  const ageMs = Date.now() - date.getTime();
  return ageMs >= 0 && ageMs <= 72 * 60 * 60 * 1000;
}

function labelSourceType(sourceType: string) {
  return sourceType
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getHighlightTerms(query: string) {
  return [
    ...new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .map((term) => term.trim())
        .filter((term) => term.length > 2)
        .filter(
          (term) =>
            ![
              "and",
              "the",
              "for",
              "with",
              "from",
              "tender",
              "tenders",
              "service",
              "services",
            ].includes(term),
        ),
    ),
  ].slice(0, 8);
}

function HighlightText({
  text,
  terms,
}: {
  text?: string | null;
  terms: string[];
}) {
  if (!text) return null;
  if (terms.length === 0) return <>{text}</>;

  const escapedTerms = terms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(`(${escapedTerms.join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) =>
        terms.includes(part.toLowerCase()) ? (
          <mark
            key={`${part}-${index}`}
            className="rounded bg-amber-100 px-0.5 text-slate-950"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

interface PostgresSearchProps {
  isSubscriber?: boolean;
  isLoggedIn?: boolean;
  defaultRegion?: string;
  defaultCategory?: string;
  defaultQuery?: string;
}

function PostgresSearchContent({
  isSubscriber = false,
  isLoggedIn = false,
  defaultRegion = "",
  defaultCategory = "",
  defaultQuery = "",
}: PostgresSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [facets, setFacets] = useState<TenderFacets | null>(null);
  const [inputValue, setInputValue] = useState(
    searchParams.get("q") || defaultQuery,
  );
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchEngine, setSearchEngine] = useState<
    "typesense" | "prisma" | null
  >(null);
  const [processingTimeMs, setProcessingTimeMs] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlertCategory, setSelectedAlertCategory] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isSavingAlert, setIsSavingAlert] = useState(false);
  const requestSeq = useRef(0);

  // Get current values from URL
  const query = searchParams.get("q") || defaultQuery;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const statusParam = searchParams.get("status") || "";
  const regionParam = searchParams.get("region") || defaultRegion;
  const categoryParam = searchParams.get("category") || defaultCategory;
  const awardedOnly = searchParams.get("awarded") === "true";
  const statusFilter = useMemo(
    () => statusParam.split(",").filter(Boolean),
    [statusParam],
  );
  const regionFilter = useMemo(
    () => regionParam.split(",").filter(Boolean),
    [regionParam],
  );
  const categoryFilter = useMemo(
    () => categoryParam.split(",").filter(Boolean),
    [categoryParam],
  );
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  const categoryAlertOptions = facets?.categories ?? [];
  const showCategoryAlertTools =
    isLoggedIn && isSubscriber && categoryAlertOptions.length > 0;

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== query) {
        const params = new URLSearchParams(searchParams.toString());
        if (inputValue) {
          params.set("q", inputValue);
        } else {
          params.delete("q");
        }
        params.set("page", "1");
        router.push(`?${params.toString()}`);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, query, router, searchParams]);

  // Fetch facets on mount
  useEffect(() => {
    async function loadFacets() {
      try {
        const res = await fetch(`${API_BASE}/tenders/facets`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setFacets(data);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.warn(`Failed to fetch facets from ${API_BASE}: ${message}`);
      }
    }
    loadFacets();
  }, []);

  // Fetch tenders when URL params change
  const fetchTenders = useCallback(
    async (signal: AbortSignal, requestId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        params.set("page", String(page));
        params.set("limit", "20");
        if (statusFilter.length) params.set("status", statusFilter.join(","));
        if (regionFilter.length) params.set("region", regionFilter.join(","));
        if (categoryFilter.length)
          params.set("category", categoryFilter.join(","));
        if (awardedOnly) params.set("awarded", "true");

        const res = await fetch(`${API_BASE}/tenders?${params.toString()}`, {
          cache: "no-store",
          signal,
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        });

        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }

        const data = await res.json();
        if (requestId !== requestSeq.current) return;
        setTenders(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
        setTotal(data.meta?.total || 0);
        setSearchEngine(data.meta?.searchEngine || "prisma");
        setProcessingTimeMs(data.meta?.processingTimeMs ?? null);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        const message =
          err instanceof Error ? err.message : "Failed to fetch tenders";
        console.warn(`Failed to fetch tenders from ${API_BASE}: ${message}`);
        setError(message);
        setTenders([]);
        setSearchEngine(null);
        setProcessingTimeMs(null);
      } finally {
        if (requestId === requestSeq.current) {
          setIsLoading(false);
        }
      }
    },
    [
      query,
      page,
      statusFilter,
      regionFilter,
      categoryFilter,
      awardedOnly,
      accessToken,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    const requestId = requestSeq.current + 1;
    requestSeq.current = requestId;

    startTransition(() => {
      void fetchTenders(controller.signal, requestId);
    });

    return () => controller.abort();
  }, [fetchTenders]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.set("page", "1");
    setInputValue("");
    router.push(`?${params.toString()}`);
  };

  const handleClearAwarded = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("awarded");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleCreateCategoryAlert = async () => {
    if (!isLoggedIn) {
      setAlertMessage("Sign in before creating alerts.");
      return;
    }

    if (!isSubscriber) {
      setAlertMessage("A paid subscription is required for email alerts.");
      return;
    }

    if (!selectedAlertCategory || !accessToken) return;

    setIsSavingAlert(true);
    setAlertMessage(null);

    try {
      const response = await fetch(`${API_BASE}/saved-searches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: `${selectedAlertCategory} tenders`,
          criteria: {
            category: [selectedAlertCategory],
            status: ["active"],
          },
          alertsEnabled: true,
          alertFrequency: "daily",
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Unable to create alert.");
      }

      setAlertMessage("Alert created. Initial matches will be emailed.");
      setSelectedAlertCategory("");
    } catch (err) {
      setAlertMessage(
        err instanceof Error ? err.message : "Unable to create alert.",
      );
    } finally {
      setIsSavingAlert(false);
    }
  };

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Closing Soon", value: "closing-soon" },
    { label: "Closed", value: "closed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:left-4 sm:h-5 sm:w-5" />
        <Input
          type="text"
          placeholder="Try: cleaning services in Gauteng"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-16 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 sm:h-12 sm:rounded-xl sm:pl-12 sm:pr-20"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 sm:right-3">
          {(isPending || isLoading) && (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400 sm:h-5 sm:w-5" />
          )}
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClearSearch}
              className="h-7 w-7 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:h-8 sm:w-8"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <TenderFilter
          title="Status"
          options={statusOptions}
          paramName="status"
          defaultSelectedValues={[]}
        />
        {facets?.regions && (
          <TenderFilter
            title="Region"
            options={facets.regions.map((r) => ({
              label: r.value,
              value: r.value,
              count: r.count,
            }))}
            paramName="region"
            defaultSelectedValues={defaultRegion ? [defaultRegion] : []}
          />
        )}
        {facets?.categories && (
          <TenderFilter
            title="Category"
            options={facets.categories.map((c) => ({
              label: c.value,
              value: c.value,
              count: c.count,
            }))}
            paramName="category"
            defaultSelectedValues={defaultCategory ? [defaultCategory] : []}
          />
        )}
      </div>

      {awardedOnly && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:text-sm">
          <Trophy className="h-4 w-4 shrink-0" />
          <span className="font-medium">Awarded tenders only</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAwarded}
            className="ml-auto h-7 rounded px-2 text-amber-800 hover:bg-amber-100"
          >
            Clear
          </Button>
        </div>
      )}

      {showCategoryAlertTools ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="mt-0.5 rounded-md bg-emerald-100 p-1.5 text-emerald-700 sm:p-2">
                <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 sm:text-base">
                  Category email alerts
                </p>
                <p className="hidden text-sm text-slate-500 sm:block">
                  Paid subscribers can receive matching active tenders now and
                  new matches as they are added.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={selectedAlertCategory}
                onChange={(event) =>
                  setSelectedAlertCategory(event.target.value)
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs sm:h-10 sm:text-sm"
              >
                <option value="">Choose category</option>
                {categoryAlertOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.value}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                onClick={handleCreateCategoryAlert}
                disabled={isSavingAlert || !selectedAlertCategory}
                className="h-9 bg-emerald-500 text-xs hover:bg-emerald-600 sm:h-10 sm:text-sm"
              >
                {isSavingAlert ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Alert"
                )}
              </Button>
            </div>
          </div>
          {alertMessage && (
            <p
              className={cn(
                "mt-3 text-sm",
                alertMessage.includes("created")
                  ? "text-emerald-700"
                  : "text-amber-700",
              )}
            >
              {alertMessage}
            </p>
          )}
        </div>
      ) : null}

      {/* Stats */}
      <div className="text-xs text-slate-500 sm:text-sm">
        {total.toLocaleString()} tenders found
        {searchEngine === "typesense" && (
          <>
            {" "}
            <span className="ml-1.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 sm:ml-2 sm:px-2 sm:text-xs">
              Typesense fast search
              {typeof processingTimeMs === "number"
                ? ` in ${processingTimeMs}ms`
                : ""}
            </span>
          </>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading tenders</p>
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-2">
            Make sure the backend server is running at {API_BASE}
          </p>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="space-y-2.5 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-4 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            <span>{query ? "Searching tenders..." : "Loading tenders..."}</span>
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-lg bg-slate-100 animate-pulse sm:h-32"
            />
          ))}
        </div>
      ) : !error && tenders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">
            {query ? `No tenders found for "${query}".` : "No tenders found."}
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {tenders.map((tender) => (
            <TenderCard
              key={tender.id}
              tender={tender}
              isSubscriber={isSubscriber}
              isLoggedIn={isLoggedIn}
              searchQuery={query}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-slate-600 px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function PostgresSearch({
  isSubscriber = false,
  isLoggedIn = false,
  defaultRegion = "",
  defaultCategory = "",
  defaultQuery = "",
}: PostgresSearchProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 w-24 bg-slate-100 rounded-full animate-pulse"
              />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <PostgresSearchContent
        isSubscriber={isSubscriber}
        isLoggedIn={isLoggedIn}
        defaultRegion={defaultRegion}
        defaultCategory={defaultCategory}
        defaultQuery={defaultQuery}
      />
    </Suspense>
  );
}
