'use client';

import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface BlurredContentProps {
    children: React.ReactNode;
    blur?: boolean;
    className?: string;
    showUpgrade?: boolean;
}

export function BlurredContent({
    children,
    blur = true,
    className,
    showUpgrade = false
}: BlurredContentProps) {
    if (!blur) {
        return <>{children}</>;
    }

    return (
        <div className={cn("relative group", className)}>
            <div className="blur-sm select-none pointer-events-none">
                {children}
            </div>
            {showUpgrade && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                        href="/pricing"
                        className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-lg hover:bg-emerald-600 transition-colors"
                    >
                        <Lock className="w-3.5 h-3.5" />
                        Upgrade to View
                    </Link>
                </div>
            )}
        </div>
    );
}

// Wrapper for inline blurred text
export function BlurredText({
    children,
    blur = true,
    placeholder = "••••••••"
}: {
    children: React.ReactNode;
    blur?: boolean;
    placeholder?: string;
}) {
    if (!blur) {
        return <>{children}</>;
    }

    return (
        <span className="blur-sm select-none" title="Upgrade to view">
            {placeholder}
        </span>
    );
}
