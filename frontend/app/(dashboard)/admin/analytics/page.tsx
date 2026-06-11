"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  BarChart3,
  Bookmark,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type AnalyticsSummary = {
  generatedAt: string;
  range: {
    days: number;
    currentStart: string;
    previousStart: string;
  };
  overview: {
    events: number;
    previousEvents: number;
    activeUsers: number;
    previousActiveUsers: number;
    activeSessions: number;
    previousActiveSessions: number;
    newUsers: number;
    savedSearches: number;
    bookmarks: number;
    tenderViews: number;
  };
  funnel: Array<{ eventName: string; label: string; count: number }>;
  eventCounts: Array<{ eventName: string; count: number }>;
  topPaths: Array<{ path: string; count: number }>;
  topSearches: Array<{ query: string; count: number; zeroResults: number }>;
  planBreakdown: Array<{ plan: string; status: string; count: number }>;
  recentEvents: Array<{
    id: string;
    eventName: string;
    entityType?: string | null;
    entityId?: string | null;
    path?: string | null;
    metadata?: string | null;
    createdAt: string;
    user?: { email?: string | null; name?: string | null } | null;
  }>;
};

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [days, setDays] = useState("30");
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
        const response = await fetch(`${API_BASE}/analytics/summary?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (response.status === 403) {
          toast("Admin access required", "error");
          router.push("/dashboard");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load analytics");
        }

        setSummary(await response.json());
      } catch (error) {
        console.error(error);
        toast("Failed to load analytics", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [days, router, toast, token],
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      loadData("initial");
    }
  }, [loadData, router, status]);

  const eventCountMap = useMemo(
    () =>
      new Map(
        (summary?.eventCounts || []).map((item) => [
          item.eventName,
          item.count,
        ]),
      ),
    [summary?.eventCounts],
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const overview = summary?.overview;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Product Analytics
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Monitor user activity, tender discovery, AI usage, saved work, and
            conversion signals.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => loadData()}
            variant="outline"
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Metric
          title="Active Users"
          value={overview?.activeUsers || 0}
          detail={deltaText(
            overview?.activeUsers || 0,
            overview?.previousActiveUsers || 0,
          )}
          icon={<Users />}
        />
        <Metric
          title="Sessions"
          value={overview?.activeSessions || 0}
          detail={deltaText(
            overview?.activeSessions || 0,
            overview?.previousActiveSessions || 0,
          )}
          icon={<Activity />}
        />
        <Metric
          title="Searches"
          value={eventCountMap.get("search_submitted") || 0}
          detail={`${summary?.topSearches?.length || 0} tracked terms`}
          icon={<Search />}
        />
        <Metric
          title="Tender Views"
          value={overview?.tenderViews || 0}
          detail="Detail page engagement"
          icon={<BarChart3 />}
        />
        <Metric
          title="Saved Tenders"
          value={overview?.bookmarks || 0}
          detail={`${overview?.savedSearches || 0} saved searches`}
          icon={<Bookmark />}
        />
        <Metric
          title="AI Reports"
          value={eventCountMap.get("document_analysis_started") || 0}
          detail={`${eventCountMap.get("document_analysis_completed") || 0} completed`}
          icon={<Sparkles />}
        />
      </div>

      <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        {summary?.generatedAt ? (
          <span>
            Last refreshed{" "}
            {formatDistanceToNow(new Date(summary.generatedAt))} ago for the
            last {summary.range.days} days.
          </span>
        ) : (
          <span>Analytics are ready, but no events have been recorded yet.</span>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Discovery Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {(summary?.funnel || []).map((item) => (
                <div key={item.eventName}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {item.label}
                    </span>
                    <span className="tabular-nums text-slate-900">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${barWidth(
                          item.count,
                          summary?.funnel?.[0]?.count || 0,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Uses</TableHead>
                  <TableHead className="text-right">Zero Results</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(summary?.topSearches || []).map((item) => (
                  <TableRow key={item.query}>
                    <TableCell className="font-medium">{item.query}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.count}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={item.zeroResults > 0 ? "outline" : "secondary"}
                      >
                        {item.zeroResults}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {!summary?.topSearches?.length && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-sm text-slate-500"
                    >
                      No search events recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(summary?.topPaths || []).map((item) => (
                  <TableRow key={item.path}>
                    <TableCell className="max-w-[28rem] truncate">
                      {item.path}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plans and Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-5 flex flex-wrap gap-2">
              {(summary?.planBreakdown || []).map((item) => (
                <Badge key={`${item.plan}-${item.status}`} variant="outline">
                  {item.plan} {item.status}: {item.count}
                </Badge>
              ))}
              {!summary?.planBreakdown?.length && (
                <span className="text-sm text-slate-500">
                  No subscription rows yet.
                </span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(summary?.recentEvents || []).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          {event.eventName}
                        </div>
                        <div className="max-w-xs truncate text-xs text-slate-500">
                          {event.path || event.entityId || event.entityType}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {event.user?.email || "Anonymous"}
                      </TableCell>
                      <TableCell className="text-right text-sm text-slate-500">
                        {formatDistanceToNow(new Date(event.createdAt))} ago
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
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
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-600">{title}</div>
          <div className="text-emerald-600 [&_svg]:size-4">{icon}</div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <TrendingUp className="size-3" />
          {detail}
        </div>
      </CardContent>
    </Card>
  );
}

function barWidth(value: number, max: number) {
  if (!max) return value ? 100 : 0;
  return Math.max(3, Math.min(100, Math.round((value / max) * 100)));
}

function deltaText(current: number, previous: number) {
  if (!previous) return "No previous period";
  const delta = Math.round(((current - previous) / previous) * 100);
  return `${delta >= 0 ? "+" : ""}${delta}% vs previous`;
}
