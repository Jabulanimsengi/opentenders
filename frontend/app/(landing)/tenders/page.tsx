import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { TrendingUp, Clock, FileText, AlertCircle, Search } from 'lucide-react';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { type TenderStats } from '@/lib/api-client';
import { TypesenseSearch } from '@/components/typesense-search';
import { checkPaidAccess } from '@/lib/get-subscription';

export const metadata: Metadata = {
    title: 'Browse Tenders - Open Tenders',
    description: 'Browse and search through thousands of government tenders in South Africa with instant, typo-tolerant search.',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const res = await fetch(`${API_BASE}/tenders/stats`, { cache: 'no-store' });
        if (res.ok) {
            stats = await res.json();
        }
    } catch (e) {
        console.error('Failed to fetch stats');
    }

    return (
        <div className="container mx-auto py-12 px-4">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Search className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        Instant Search
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Browse Tenders</h1>
                <p className="text-slate-600 mt-2">
                    Find government tender opportunities with our lightning-fast, typo-tolerant search.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-slate-300 hover:shadow-lg transition-all group flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors">
                        <FileText className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalCount.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 font-medium">Total Tenders</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all group flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">{stats.newThisWeek}</p>
                        <p className="text-xs text-slate-500 font-medium">New This Week</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                        <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">{stats.closingSoon}</p>
                        <p className="text-xs text-slate-500 font-medium">Closing Soon</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all group flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                        <AlertCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">{stats.activeCount.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 font-medium">Active Tenders</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all group flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                        <Clock className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">{stats.closedCount.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 font-medium">Closed Tenders</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all group flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                        <Search className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Instant</p>
                        <p className="text-xs text-slate-500 font-medium">Real-time Search</p>
                    </div>
                </div>
            </div>

            {/* Typesense Search */}
            <Card>
                <CardContent className="p-6">
                    <TypesenseSearch isSubscriber={isPaid} />
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
