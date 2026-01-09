import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { addDays } from 'date-fns';
import { TrendingUp, Clock, FileText, AlertCircle, Lock } from 'lucide-react';
import { auth } from '@/auth';
import { TypesenseSearch } from '@/components/typesense-search';
import { checkPaidAccess } from '@/lib/get-subscription';

export default async function DashboardPage() {
  const session = await auth();
  const { isPaid } = await checkPaidAccess();
  const shouldBlur = !session?.user;

  // Fetch stats only (search is handled by Typesense)
  const [totalCount, closingSoonCount, newThisWeek, activeCount, closedCount, regionCount] = await Promise.all([
    prisma.tender.count(),
    prisma.tender.count({
      where: {
        closingDate: { gte: new Date(), lte: addDays(new Date(), 7) },
        status: 'active'
      }
    }),
    prisma.tender.count({
      where: {
        publishedDate: { gte: addDays(new Date(), -7) }
      }
    }),
    prisma.tender.count({
      where: {
        status: 'active',
        OR: [
          { closingDate: { gt: new Date() } },
          { closingDate: null }
        ]
      }
    }),
    prisma.tender.count({
      where: {
        closingDate: { lt: new Date() }
      }
    }),
    prisma.tender.groupBy({
      by: ['region'],
      where: { region: { not: null } },
    }).then(r => r.length)
  ]);

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Free User Banner */}
      {shouldBlur && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">You&apos;re viewing limited content</p>
              <p className="text-sm text-gray-600">Upgrade to see full tender details, buyer names, and closing dates</p>
            </div>
          </div>
          <Link href="/pricing" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 text-white p-8 mb-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {session?.user ? `Welcome back!` : 'Tender Opportunities'}
          </h1>
          <p className="text-slate-300 max-w-xl">
            Monitor and track South African government tenders. Find your next contract opportunity.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-emerald-500/10 rounded-full translate-y-1/2" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-slate-300 hover:shadow-lg transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors">
            <FileText className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalCount.toLocaleString()}</p>
            <p className="text-xs text-slate-500 font-medium">Total Tenders</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{newThisWeek}</p>
            <p className="text-xs text-slate-500 font-medium">New This Week</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{closingSoonCount}</p>
            <p className="text-xs text-slate-500 font-medium">Closing Soon</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
            <AlertCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{activeCount.toLocaleString()}</p>
            <p className="text-xs text-slate-500 font-medium">Active Tenders</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
            <Clock className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{closedCount.toLocaleString()}</p>
            <p className="text-xs text-slate-500 font-medium">Closed Tenders</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
            <FileText className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{regionCount}</p>
            <p className="text-xs text-slate-500 font-medium">Active Regions</p>
          </div>
        </div>
      </div>

      {/* Typesense Search */}
      <Card>
        <CardContent className="p-6">
          <TypesenseSearch isSubscriber={isPaid} />
        </CardContent>
      </Card>
    </div>
  );
}
