'use client';

import Link from 'next/link';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FREE_TIER_MONTHLY_VIEWS } from '@/lib/view-tracker';

interface UpgradePromptProps {
    title?: string;
    message?: string;
    compact?: boolean;
}

export function UpgradePrompt({
    title = "You've reached your free limit",
    message = `Free users can view up to ${FREE_TIER_MONTHLY_VIEWS} tenders per month. Upgrade to get unlimited access.`,
    compact = false
}: UpgradePromptProps) {
    if (compact) {
        return (
            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
                <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="flex-1 text-sm">
                    <span className="text-amber-800">Upgrade to see more tenders</span>
                </div>
                <Link href="/pricing">
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                        Upgrade
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="relative z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-8 text-center shadow-xl border border-slate-700/50 backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">{message}</p>

            <div className="grid gap-4 max-w-sm mx-auto mb-6 text-sm text-left bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-start gap-3">
                    <div className="p-1 bg-emerald-500/10 rounded mt-0.5">
                        <Zap className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span>View full tender details and contact info</span>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-1 bg-emerald-500/10 rounded mt-0.5">
                        <Zap className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span>Download unlimited tender documents</span>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-1 bg-emerald-500/10 rounded mt-0.5">
                        <Zap className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span>Get daily email alerts for new tenders</span>
                </div>
            </div>

            <div className="flex flex-col gap-3 justify-center max-w-xs mx-auto">
                <Link href="/pricing" className="w-full">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg font-semibold shadow-lg shadow-emerald-500/20">
                        View Access Plans
                    </Button>
                </Link>
                <div className="text-center text-sm text-slate-400">
                    Already a subscriber? <Link href="/login?callbackUrl=/tenders" className="text-emerald-400 hover:text-emerald-300 underline">Sign In</Link>
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-6">
                Starting from just R109/month. Cancel anytime.
            </p>
        </div>
    );
}

export function ViewLimitBanner({ remaining }: { remaining: number }) {
    if (remaining > 10) return null;

    return (
        <div className={`rounded-lg px-4 py-2 mb-4 flex items-center justify-between ${remaining <= 3
            ? 'bg-red-50 border border-red-200'
            : 'bg-amber-50 border border-amber-200'
            }`}>
            <span className={`text-sm font-medium ${remaining <= 3 ? 'text-red-700' : 'text-amber-700'}`}>
                {remaining === 0
                    ? "You've used all your free views this month"
                    : `${remaining} free view${remaining === 1 ? '' : 's'} remaining this month`}
            </span>
            <Link href="/pricing" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                Upgrade →
            </Link>
        </div>
    );
}
