import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  FileText,
  AlertCircle,
  Search,
  Trophy,
} from "lucide-react";
import { Metadata } from "next";
import { auth } from "@/auth";
import { type TenderStats } from "@/lib/api-client";
import { PostgresSearch } from "@/components/postgres-search";
import { checkPaidAccess } from "@/lib/get-subscription";

export const metadata: Metadata = {
  title: "Browse Tenders - Open Tenders",
  description:
    "Browse and search through thousands of government tenders in South Africa with smart search and practical filters.",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default async function TendersPage() {
  const session = await auth();
  const { isPaid } = await checkPaidAccess();

  // Fetch stats from backend API
  let stats: TenderStats = {
    totalCount: 0,
    activeCount: 0,
    closingSoon: 0,
    newThisWeek: 0,
    closedCount: 0,
    cancelledCount: 0,
    awardedCount: 0,
  };

  try {
    const res = await fetch(`${API_BASE}/tenders/stats`, { cache: "no-store" });
    if (res.ok) {
      stats = await res.json();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn(`Tender stats unavailable from ${API_BASE}: ${message}`);
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-12">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 sm:h-8 sm:w-8 sm:rounded-lg">
            <Search className="h-3.5 w-3.5 text-emerald-600 sm:h-4 sm:w-4" />
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 sm:text-sm">
            Smart Search
          </span>
        </div>
        <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
          Browse Tenders
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600 sm:mt-2 sm:text-base">
          Search by service, buyer, location, or a plain-language phrase, then
          refine with practical filters.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        <Link
          href="/tenders"
          className="group flex min-h-[74px] min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-slate-300 hover:shadow-lg sm:min-h-0 sm:gap-4 sm:rounded-2xl sm:p-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-50 transition-colors group-hover:bg-slate-100 sm:h-12 sm:w-12 sm:rounded-lg">
            <FileText className="h-4 w-4 text-slate-600 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold leading-none text-slate-900 tabular-nums sm:text-2xl">
              {stats.totalCount.toLocaleString()}
            </p>
            <p className="mt-1 text-[10px] font-medium leading-tight text-slate-500 sm:text-xs">
              Total
            </p>
          </div>
        </Link>

        <Link
          href="/tenders"
          className="group flex min-h-[74px] min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-emerald-300 hover:shadow-lg sm:min-h-0 sm:gap-4 sm:rounded-2xl sm:p-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 transition-colors group-hover:bg-emerald-100 sm:h-12 sm:w-12 sm:rounded-lg">
            <TrendingUp className="h-4 w-4 text-emerald-600 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold leading-none text-slate-900 tabular-nums sm:text-2xl">
              {stats.newThisWeek.toLocaleString()}
            </p>
            <p className="mt-1 text-[10px] font-medium leading-tight text-slate-500 sm:text-xs">
              New
            </p>
          </div>
        </Link>

        <Link
          href="/tenders?status=closing-soon"
          className="group flex min-h-[74px] min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-orange-300 hover:shadow-lg sm:min-h-0 sm:gap-4 sm:rounded-2xl sm:p-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orange-50 transition-colors group-hover:bg-orange-100 sm:h-12 sm:w-12 sm:rounded-lg">
            <Clock className="h-4 w-4 text-orange-600 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold leading-none text-slate-900 tabular-nums sm:text-2xl">
              {stats.closingSoon.toLocaleString()}
            </p>
            <p className="mt-1 text-[10px] font-medium leading-tight text-slate-500 sm:text-xs">
              Closing Soon
            </p>
          </div>
        </Link>

        <Link
          href="/tenders?status=active"
          className="group flex min-h-[74px] min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-emerald-300 hover:shadow-lg sm:min-h-0 sm:gap-4 sm:rounded-2xl sm:p-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 transition-colors group-hover:bg-emerald-100 sm:h-12 sm:w-12 sm:rounded-lg">
            <AlertCircle className="h-4 w-4 text-emerald-600 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold leading-none text-slate-900 tabular-nums sm:text-2xl">
              {stats.activeCount.toLocaleString()}
            </p>
            <p className="mt-1 text-[10px] font-medium leading-tight text-slate-500 sm:text-xs">
              Active
            </p>
          </div>
        </Link>

        <Link
          href="/tenders?status=closed"
          className="group flex min-h-[74px] min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-red-300 hover:shadow-lg sm:min-h-0 sm:gap-4 sm:rounded-2xl sm:p-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-50 transition-colors group-hover:bg-red-100 sm:h-12 sm:w-12 sm:rounded-lg">
            <Clock className="h-4 w-4 text-red-600 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold leading-none text-slate-900 tabular-nums sm:text-2xl">
              {stats.closedCount.toLocaleString()}
            </p>
            <p className="mt-1 text-[10px] font-medium leading-tight text-slate-500 sm:text-xs">
              Closed
            </p>
          </div>
        </Link>

        <Link
          href="/tenders?awarded=true"
          className="group flex min-h-[74px] min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-amber-300 hover:shadow-lg sm:min-h-0 sm:gap-4 sm:rounded-2xl sm:p-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-50 transition-colors group-hover:bg-amber-100 sm:h-12 sm:w-12 sm:rounded-lg">
            <Trophy className="h-4 w-4 text-amber-600 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold leading-none text-slate-900 tabular-nums sm:text-2xl">
              {stats.awardedCount.toLocaleString()}
            </p>
            <p className="mt-1 text-[10px] font-medium leading-tight text-slate-500 sm:text-xs">
              Awards
            </p>
          </div>
        </Link>
      </div>

      {/* PostgreSQL Search */}
      <Card className="rounded-lg py-0 sm:rounded-xl sm:py-6">
        <CardContent className="p-3 sm:p-6">
          <PostgresSearch isSubscriber={isPaid} isLoggedIn={!!session?.user} />
        </CardContent>
      </Card>

      {/* CTA for non-logged in users */}
      {!session?.user && (
        <div className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Want More Features?</h3>
          <p className="text-emerald-100 mb-4">
            Sign up to save tenders, get email alerts, and export to CSV.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-white text-emerald-600 px-6 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
          >
            View Plans
          </Link>
        </div>
      )}
    </div>
  );
}
