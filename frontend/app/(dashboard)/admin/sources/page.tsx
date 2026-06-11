"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Globe2,
  Loader2,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/toast-provider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const AUTO_REFRESH_MS = 60_000;

type SourceStatus =
  | "healthy"
  | "running"
  | "due"
  | "overdue"
  | "failing"
  | "paused"
  | "untested";

type ScrapeRun = {
  id: string;
  sourceId?: string | null;
  sourceName: string;
  startedAt: string;
  finishedAt?: string | null;
  status: string;
  numberOfTendersFound: number;
  numberOfTendersCreated: number;
  numberOfTendersUpdated: number;
  numberOfDuplicatesFound: number;
  errorMessage?: string | null;
  pagesVisited: number;
};

type ScrapeError = {
  id: string;
  sourceName?: string | null;
  message: string;
  createdAt: string;
};

type SourceHttpCheck = {
  id: string;
  checkedAt: string;
  ok: boolean;
  statusCode?: number | null;
  responseTimeMs?: number | null;
  errorCategory?: string | null;
  errorMessage?: string | null;
};

type SourceIssue = {
  id: string;
  status: string;
  severity: string;
  reason: string;
  failureCount: number;
  assignedTo?: string | null;
  resolutionNote?: string | null;
  firstDetectedAt: string;
  lastDetectedAt: string;
  resolvedAt?: string | null;
};

type SourceHealth = {
  id: string;
  name: string;
  sourceType: string;
  province?: string | null;
  organisationName?: string | null;
  tenderUrl: string;
  active: boolean;
  scrapeMethod: string;
  scrapeFrequencyMinutes: number;
  lastScrapedAt?: string | null;
  nextScrapeAt: string;
  minutesUntilNextScrape: number;
  isDue: boolean;
  isOverdue: boolean;
  status: SourceStatus;
  realDataConfirmed: boolean;
  latestRunProducedData: boolean;
  tenderCount: number;
  recentRunCount: number;
  recentErrorCount: number;
  latestHttpCheck?: SourceHttpCheck | null;
  consecutiveHttpFailures: number;
  latestOpenIssue?: SourceIssue | null;
  latestRun?: ScrapeRun | null;
  latestSuccessfulRun?: ScrapeRun | null;
  latestError?: ScrapeError | null;
};

type SourceHealthResponse = {
  summary: {
    generatedAt: string;
    scheduler: {
      tenderSyncCron: string;
      externalSourceCron: string;
      minimumSourceIntervalMinutes: number;
      externalBatchSize: number;
      externalConcurrency: number;
    };
    totalSources: number;
    activeSources: number;
    municipalityTargetSources: number;
    municipalitySources: number;
    activeMunicipalitySources: number;
    healthySources: number;
    sourcesWithRealData: number;
    dueSources: number;
    overdueSources: number;
    failingSources: number;
    runningSources: number;
    non200Sources: number;
    openSourceIssues: number;
    checkedSources: number;
    averageResponseTimeMs?: number | null;
    recentRuns: number;
    recentErrors: number;
  };
  sources: SourceHealth[];
};

const statusOptions = [
  "all",
  "healthy",
  "running",
  "due",
  "overdue",
  "failing",
  "untested",
  "paused",
] as const;

type StatusFilter = (typeof statusOptions)[number];

export default function AdminSourcesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [health, setHealth] = useState<SourceHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scrapingSourceId, setScrapingSourceId] = useState<string | null>(null);
  const [scrapingAll, setScrapingAll] = useState(false);
  const [checkingSourceId, setCheckingSourceId] = useState<string | null>(null);
  const [checkingAll, setCheckingAll] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const token = (session as { accessToken?: string } | null)?.accessToken;

  const loadData = useCallback(
    async (mode: "initial" | "refresh" = "refresh") => {
      if (!token) return;
      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const response = await fetch(`${API_BASE}/external-sources/health`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (response.status === 403) {
          toast("Admin access required", "error");
          router.push("/dashboard");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load source health");
        }

        setHealth(await response.json());
      } catch (error) {
        console.error(error);
        toast("Failed to load source health", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router, toast, token],
  );

  async function scrapeSource(sourceId: string) {
    if (!token) return;
    setScrapingSourceId(sourceId);
    try {
      const response = await fetch(
        `${API_BASE}/external-sources/${sourceId}/scrape`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Scrape failed");
      }

      toast("Source scrape completed", "success");
      await loadData();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to scrape source",
        "error",
      );
    } finally {
      setScrapingSourceId(null);
    }
  }

  async function scrapeAllActive() {
    if (!token) return;
    setScrapingAll(true);
    try {
      const response = await fetch(`${API_BASE}/external-sources/scrape-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Scrape all failed");
      const data = await response.json();
      toast(`Scraped ${data.runs?.length || 0} active sources`, "success");
      await loadData();
    } catch {
      toast("Failed to scrape active sources", "error");
    } finally {
      setScrapingAll(false);
    }
  }

  async function checkSource(sourceId: string) {
    if (!token) return;
    setCheckingSourceId(sourceId);
    try {
      const response = await fetch(
        `${API_BASE}/external-sources/${sourceId}/check`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Source check failed");
      }

      const data = await response.json();
      toast(
        data.ok
          ? `HTTP check passed in ${data.responseTimeMs}ms`
          : `HTTP check failed: ${data.errorMessage || data.statusCode}`,
        data.ok ? "success" : "error",
      );
      await loadData();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to check source",
        "error",
      );
    } finally {
      setCheckingSourceId(null);
    }
  }

  async function checkAllActive() {
    if (!token) return;
    setCheckingAll(true);
    try {
      const response = await fetch(`${API_BASE}/external-sources/check-active`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Check all failed");
      const data = await response.json();
      toast(
        `Checked ${data.totalSources || 0} active sources; ${data.failed || 0} need attention`,
        data.failed ? "error" : "success",
      );
      await loadData();
    } catch {
      toast("Failed to check active source responses", "error");
    } finally {
      setCheckingAll(false);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      loadData("initial");
    }
  }, [loadData, router, status]);

  useEffect(() => {
    if (status !== "authenticated" || !token) return;
    const interval = window.setInterval(() => {
      loadData();
    }, AUTO_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [loadData, status, token]);

  const filteredSources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (health?.sources || [])
      .filter((source) =>
        statusFilter === "all" ? true : source.status === statusFilter,
      )
      .filter((source) => {
        if (!normalizedQuery) return true;
        return [
          source.name,
          source.organisationName,
          source.province,
          source.sourceType,
          source.tenderUrl,
          source.latestError?.message,
          source.latestHttpCheck?.statusCode?.toString(),
          source.latestHttpCheck?.errorCategory,
          source.latestHttpCheck?.errorMessage,
          source.latestOpenIssue?.reason,
          source.latestOpenIssue?.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .slice(0, 250);
  }, [health?.sources, query, statusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const summary = health?.summary;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Source Monitor</h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Verify source freshness, scrape health, and whether imported tender
            data is backed by real source runs.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button
            onClick={() => loadData()}
            variant="outline"
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button
            onClick={checkAllActive}
            variant="outline"
            disabled={checkingAll}
          >
            {checkingAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Globe2 className="mr-2 h-4 w-4" />
            )}
            Check Active
          </Button>
          <Button onClick={scrapeAllActive} disabled={scrapingAll}>
            {scrapingAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Scrape Active
          </Button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:mb-6 xl:grid-cols-7">
        <Metric
          title="Active Sources"
          value={summary?.activeSources || 0}
          detail={`${summary?.totalSources || 0} catalogued`}
          icon={<Database />}
        />
        <Metric
          title="Municipality Coverage"
          value={`${summary?.activeMunicipalitySources || 0}/${summary?.municipalityTargetSources || 257}`}
          detail={`${summary?.municipalitySources || 0} municipality sources catalogued`}
          icon={<ShieldCheck />}
        />
        <Metric
          title="Real Data Confirmed"
          value={summary?.sourcesWithRealData || 0}
          detail="Successful scrape or imported tenders"
          icon={<ShieldCheck />}
        />
        <Metric
          title="Due / Overdue"
          value={`${summary?.dueSources || 0}/${summary?.overdueSources || 0}`}
          detail="Due now / past expected interval"
          icon={<Clock />}
        />
        <Metric
          title="Failing Sources"
          value={summary?.failingSources || 0}
          detail={`${summary?.recentErrors || 0} recent errors`}
          icon={<AlertTriangle />}
        />
        <Metric
          title="Non-200 URLs"
          value={summary?.non200Sources || 0}
          detail={`${summary?.checkedSources || 0} sources checked`}
          icon={<Globe2 />}
        />
        <Metric
          title="Open Issues"
          value={summary?.openSourceIssues || 0}
          detail={
            summary?.averageResponseTimeMs
              ? `Avg ${summary.averageResponseTimeMs}ms response`
              : "No response samples yet"
          }
          icon={<XCircle />}
        />
      </div>

      <div className="mb-5 rounded-lg border border-slate-200 bg-white px-3 py-3 sm:px-4 lg:mb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-1 text-xs text-slate-600 sm:grid-cols-2 sm:text-sm lg:grid-cols-5 lg:gap-6">
            <span>
              eTenders cron:{" "}
              <strong className="text-slate-900">
                {summary?.scheduler.tenderSyncCron}
              </strong>
            </span>
            <span>
              Source cron:{" "}
              <strong className="text-slate-900">
                {summary?.scheduler.externalSourceCron}
              </strong>
            </span>
            <span>
              Min source interval:{" "}
              <strong className="text-slate-900">
                {summary?.scheduler.minimumSourceIntervalMinutes}m
              </strong>
            </span>
            <span>
              Batch size:{" "}
              <strong className="text-slate-900">
                {summary?.scheduler.externalBatchSize}
              </strong>
            </span>
            <span>
              Concurrency:{" "}
              <strong className="text-slate-900">
                {summary?.scheduler.externalConcurrency}
              </strong>
            </span>
          </div>
          <div className="text-xs text-slate-500 sm:text-sm">
            Auto-refreshes every {AUTO_REFRESH_MS / 1000}s
            {summary?.generatedAt
              ? `, last checked ${formatDistanceToNow(
                  new Date(summary.generatedAt),
                )} ago`
              : ""}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>Source Health</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="w-full pl-9 sm:w-80"
                  placeholder="Search source, province, error"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {labelStatus(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden overflow-x-auto lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>HTTP</TableHead>
                  <TableHead>Real Data</TableHead>
                  <TableHead>Latest Run</TableHead>
                  <TableHead>Next Check</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="min-w-80 align-top">
                      <div className="font-medium text-slate-900">
                        {source.name}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge variant="outline">{source.sourceType}</Badge>
                        {source.province && (
                          <Badge variant="secondary">{source.province}</Badge>
                        )}
                        <Badge variant={source.active ? "default" : "outline"}>
                          {source.active ? "active" : "paused"}
                        </Badge>
                      </div>
                      <a
                        href={source.tenderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block max-w-md truncate text-xs text-slate-500 hover:text-emerald-700"
                      >
                        {source.tenderUrl}
                      </a>
                    </TableCell>
                    <TableCell className="align-top">
                      <StatusBadge status={source.status} />
                      {source.latestError && (
                        <div className="mt-2 max-w-xs text-xs text-red-700">
                          {source.latestError.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="align-top">
                      <HttpCheckSummary source={source} />
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge
                        variant={
                          source.realDataConfirmed ? "default" : "outline"
                        }
                        className={
                          source.realDataConfirmed
                            ? "bg-emerald-600 text-white"
                            : ""
                        }
                      >
                        {source.realDataConfirmed
                          ? "confirmed"
                          : "not yet proven"}
                      </Badge>
                      <div className="mt-2 text-xs text-slate-500">
                        {source.tenderCount} imported tenders
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      {source.latestRun ? (
                        <div className="space-y-1 text-sm">
                          <div className="text-slate-900">
                            {formatDistanceToNow(
                              new Date(source.latestRun.startedAt),
                            )}{" "}
                            ago
                          </div>
                          <div className="text-xs text-slate-500">
                            {source.latestRun.status}, pages{" "}
                            {source.latestRun.pagesVisited}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="text-sm text-slate-900">
                        {source.isDue
                          ? "Due now"
                          : `in ${Math.max(
                              source.minutesUntilNextScrape,
                              0,
                            )}m`}
                      </div>
                      <div className="text-xs text-slate-500">
                        every {source.scrapeFrequencyMinutes}m
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-sm">
                      <div>
                        Found: {source.latestRun?.numberOfTendersFound ?? 0}
                      </div>
                      <div>
                        New: {source.latestRun?.numberOfTendersCreated ?? 0} /
                        Updated:{" "}
                        {source.latestRun?.numberOfTendersUpdated ?? 0}
                      </div>
                      <div>
                        Duplicates:{" "}
                        {source.latestRun?.numberOfDuplicatesFound ?? 0}
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      {source.latestOpenIssue ? (
                        <div className="max-w-xs text-sm">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline">
                              {source.latestOpenIssue.status}
                            </Badge>
                            <Badge variant="secondary">
                              {source.latestOpenIssue.severity}
                            </Badge>
                          </div>
                          <div className="mt-2 text-xs text-red-700">
                            {source.latestOpenIssue.reason}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {source.latestOpenIssue.failureCount} failures
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => checkSource(source.id)}
                          disabled={
                            checkingAll || checkingSourceId === source.id
                          }
                        >
                          {checkingSourceId === source.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Globe2 className="mr-2 h-4 w-4" />
                          )}
                          Check
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => scrapeSource(source.id)}
                          disabled={
                            scrapingAll || scrapingSourceId === source.id
                          }
                        >
                          {scrapingSourceId === source.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Scrape
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSources.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-sm text-slate-500"
                    >
                      No sources match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="space-y-3 lg:hidden">
            {filteredSources.map((source) => (
              <div key={source.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="break-words font-medium text-slate-900">
                      {source.name}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline">{source.sourceType}</Badge>
                      {source.province && (
                        <Badge variant="secondary">{source.province}</Badge>
                      )}
                      <Badge variant={source.active ? "default" : "outline"}>
                        {source.active ? "active" : "paused"}
                      </Badge>
                    </div>
                  </div>
                  <StatusBadge status={source.status} />
                </div>
                <a
                  href={source.tenderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block truncate text-xs text-slate-500 hover:text-emerald-700"
                >
                  {source.tenderUrl}
                </a>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-slate-50 p-2">
                    <div className="text-slate-500">Real Data</div>
                    <div className="mt-1 font-medium text-slate-900">
                      {source.realDataConfirmed ? "Confirmed" : "Not proven"}
                    </div>
                    <div className="text-slate-500">
                      {source.tenderCount} imported
                    </div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <div className="text-slate-500">Next Check</div>
                    <div className="mt-1 font-medium text-slate-900">
                      {source.isDue
                        ? "Due now"
                        : `in ${Math.max(source.minutesUntilNextScrape, 0)}m`}
                    </div>
                    <div className="text-slate-500">
                      every {source.scrapeFrequencyMinutes}m
                    </div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <div className="text-slate-500">Latest Run</div>
                    <div className="mt-1 font-medium text-slate-900">
                      {source.latestRun
                        ? `${formatDistanceToNow(new Date(source.latestRun.startedAt))} ago`
                        : "Never"}
                    </div>
                    <div className="text-slate-500">
                      {source.latestRun?.status || "No run"}
                    </div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <div className="text-slate-500">HTTP</div>
                    <div className="mt-1 font-medium text-slate-900">
                      {source.latestHttpCheck
                        ? source.latestHttpCheck.statusCode || "Error"
                        : "Not checked"}
                    </div>
                    <div className="text-slate-500">
                      {source.latestHttpCheck?.responseTimeMs
                        ? `${source.latestHttpCheck.responseTimeMs}ms`
                        : source.latestHttpCheck?.errorCategory || "No sample"}
                    </div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <div className="text-slate-500">Evidence</div>
                    <div className="mt-1 font-medium text-slate-900">
                      Found {source.latestRun?.numberOfTendersFound ?? 0}
                    </div>
                    <div className="text-slate-500">
                      New {source.latestRun?.numberOfTendersCreated ?? 0}
                    </div>
                  </div>
                </div>
                {source.latestError && (
                  <div className="mt-3 rounded-md border border-red-100 bg-red-50 p-2 text-xs text-red-700">
                    {source.latestError.message}
                  </div>
                )}
                {source.latestOpenIssue && (
                  <div className="mt-3 rounded-md border border-amber-100 bg-amber-50 p-2 text-xs text-amber-800">
                    {source.latestOpenIssue.reason}
                  </div>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => checkSource(source.id)}
                    disabled={checkingAll || checkingSourceId === source.id}
                  >
                    {checkingSourceId === source.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Globe2 className="mr-2 h-4 w-4" />
                    )}
                    Check
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => scrapeSource(source.id)}
                    disabled={scrapingAll || scrapingSourceId === source.id}
                  >
                    {scrapingSourceId === source.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Scrape
                  </Button>
                </div>
              </div>
            ))}
            {filteredSources.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-500">
                No sources match the current filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: number | string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-[82px] items-center gap-2 p-3 sm:gap-4 sm:p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11 [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-5 sm:[&_svg]:w-5">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold leading-tight text-slate-900 sm:text-2xl">{value}</div>
          <div className="text-xs font-medium text-slate-700 sm:text-sm">{title}</div>
          <div className="line-clamp-2 text-[11px] text-slate-500 sm:text-xs">{detail}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function HttpCheckSummary({ source }: { source: SourceHealth }) {
  const check = source.latestHttpCheck;
  if (!check) {
    return <span className="text-sm text-slate-500">Not checked</span>;
  }

  const statusLabel = check.statusCode ? `HTTP ${check.statusCode}` : "Error";
  const isOk = check.ok && (!check.statusCode || check.statusCode === 200);

  return (
    <div className="space-y-1 text-sm">
      <Badge
        variant={isOk ? "default" : "outline"}
        className={isOk ? "bg-emerald-600 text-white" : "border-red-200 text-red-700"}
      >
        {statusLabel}
      </Badge>
      <div className="text-xs text-slate-500">
        {check.responseTimeMs !== null && check.responseTimeMs !== undefined
          ? `${check.responseTimeMs}ms`
          : "No latency"}
        {" · "}
        {formatDistanceToNow(new Date(check.checkedAt))} ago
      </div>
      {!check.ok && (
        <div className="max-w-xs text-xs text-red-700">
          {check.errorCategory || check.errorMessage || "Response failed"}
        </div>
      )}
      {source.consecutiveHttpFailures > 0 && (
        <div className="text-xs text-slate-500">
          {source.consecutiveHttpFailures} consecutive failures
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: SourceStatus }) {
  const config: Record<
    SourceStatus,
    { label: string; icon: ReactNode; className: string }
  > = {
    healthy: {
      label: "Healthy",
      icon: <CheckCircle2 />,
      className: "bg-emerald-600 text-white",
    },
    running: {
      label: "Running",
      icon: <Activity />,
      className: "bg-blue-600 text-white",
    },
    due: {
      label: "Due",
      icon: <Clock />,
      className: "bg-amber-500 text-white",
    },
    overdue: {
      label: "Overdue",
      icon: <AlertTriangle />,
      className: "bg-orange-600 text-white",
    },
    failing: {
      label: "Failing",
      icon: <XCircle />,
      className: "bg-red-600 text-white",
    },
    paused: {
      label: "Paused",
      icon: <Clock />,
      className: "bg-slate-600 text-white",
    },
    untested: {
      label: "Untested",
      icon: <AlertTriangle />,
      className: "bg-slate-200 text-slate-800",
    },
  };
  const item = config[status];
  return (
    <Badge className={item.className}>
      <span className="[&_svg]:h-3 [&_svg]:w-3">{item.icon}</span>
      {item.label}
    </Badge>
  );
}

function labelStatus(status: StatusFilter) {
  if (status === "all") return "All statuses";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
