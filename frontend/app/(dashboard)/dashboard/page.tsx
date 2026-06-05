import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { TrendingUp, Clock, FileText, AlertCircle, Lock, Search } from 'lucide-react';
import { auth } from '@/auth';
import { checkPaidAccess } from '@/lib/get-subscription';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default async function DashboardPage() {
  const session = await auth();
  const { isPaid } = await checkPaidAccess();
  const shouldBlur = !session?.user;

  // Fetch stats from backend API
  let stats = {
    totalCount: 0,
    closingSoon: 0,
    newThisWeek: 0,
    activeCount: 0,
    closedCount: 0,
  };

  try {
    const response = await fetch(`${API_BASE}/tenders/stats`, { cache: 'no-store' });
    if (response.ok) {
      stats = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }

  // Fetch facets for region count
  let regionCount = 0;
  try {
    const response = await fetch(`${API_BASE}/tenders/facets`, { cache: 'no-store' });
    if (response.ok) {
      const facets = await response.json();
      regionCount = facets.regions?.length || 0;
    }
  } catch (error) {
    console.error('Failed to fetch facets:', error);
  }

  return (
    <div className="container mx-auto px-4 py-5 sm:py-6">
      {/* Free User Banner */}
      {shouldBlur && (
        <div className="mb-5 flex flex-col gap-3 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 sm:h-10 sm:w-10">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">You&apos;re viewing limited content</p>
              <p className="text-sm text-gray-600">Upgrade to see full tender details, buyer names, and closing dates</p>
            </div>
          </div>
          <Link href="/pricing" className="inline-flex justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 sm:whitespace-nowrap">
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative mb-5 overflow-hidden rounded-lg bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 p-5 text-white sm:mb-8 sm:rounded-xl sm:p-8">
        <div className="relative z-10">
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {session?.user ? `Welcome back!` : 'Tender Opportunities'}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Monitor and track South African government tenders. Find your next contract opportunity.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        <div className="group flex min-h-[74px] items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-slate-300 hover:shadow-lg sm:gap-4 sm:p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 transition-colors group-hover:bg-slate-100 sm:h-12 sm:w-12">
            <FileText className="h-4 w-4 text-slate-600 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight text-slate-900 sm:text-2xl">{stats.totalCount?.toLocaleString() || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Total Tenders</p>
          </div>
        </div>

        <div className="group flex min-h-[74px] items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-emerald-300 hover:shadow-lg sm:gap-4 sm:p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 transition-colors group-hover:bg-emerald-100 sm:h-12 sm:w-12">
            <TrendingUp className="h-4 w-4 text-emerald-600 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight text-slate-900 sm:text-2xl">{stats.newThisWeek || 0}</p>
            <p className="text-xs text-slate-500 font-medium">New This Week</p>
          </div>
        </div>

        <div className="group flex min-h-[74px] items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-orange-300 hover:shadow-lg sm:gap-4 sm:p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 transition-colors group-hover:bg-orange-100 sm:h-12 sm:w-12">
            <Clock className="h-4 w-4 text-orange-600 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight text-slate-900 sm:text-2xl">{stats.closingSoon || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Closing Soon</p>
          </div>
        </div>

        <div className="group flex min-h-[74px] items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-emerald-300 hover:shadow-lg sm:gap-4 sm:p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 transition-colors group-hover:bg-emerald-100 sm:h-12 sm:w-12">
            <AlertCircle className="h-4 w-4 text-emerald-600 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight text-slate-900 sm:text-2xl">{stats.activeCount?.toLocaleString() || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Active Tenders</p>
          </div>
        </div>

        <div className="group flex min-h-[74px] items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-red-300 hover:shadow-lg sm:gap-4 sm:p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 transition-colors group-hover:bg-red-100 sm:h-12 sm:w-12">
            <Clock className="h-4 w-4 text-red-600 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight text-slate-900 sm:text-2xl">{stats.closedCount?.toLocaleString() || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Closed Tenders</p>
          </div>
        </div>

        <div className="group flex min-h-[74px] items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-amber-300 hover:shadow-lg sm:gap-4 sm:p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 transition-colors group-hover:bg-amber-100 sm:h-12 sm:w-12">
            <FileText className="h-4 w-4 text-amber-600 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight text-slate-900 sm:text-2xl">{regionCount}</p>
            <p className="text-xs text-slate-500 font-medium">Active Regions</p>
          </div>
        </div>
      </div>

      {/* Search Link */}
      <Card>
        <CardContent className="p-6">
          <div className="py-5 text-center sm:py-8">
            <Search className="mx-auto mb-3 h-10 w-10 text-slate-400 sm:mb-4 sm:h-12 sm:w-12" />
            <h2 className="mb-2 text-lg font-semibold text-slate-800 sm:text-xl">Search Tenders</h2>
            <p className="mb-4 text-sm text-slate-600 sm:text-base">Find government tender opportunities across South Africa</p>
            <Link
              href="/tenders"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 sm:px-6 sm:py-3"
            >
              <Search className="w-4 h-4" />
              Browse All Tenders
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
