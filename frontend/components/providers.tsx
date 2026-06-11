'use client';

import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AnalyticsTracker } from '@/components/analytics-tracker';
import { ToastProvider } from '@/components/toast-provider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ToastProvider>
                <Suspense fallback={null}>
                    <AnalyticsTracker />
                </Suspense>
                {children}
            </ToastProvider>
        </SessionProvider>
    );
}
