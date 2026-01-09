import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header Skeleton */}
            <div className="mb-8">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-72" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-l-4 border-l-slate-300">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div>
                                    <Skeleton className="h-8 w-16 mb-1" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search & Filter Skeleton */}
            <Card className="mb-8 overflow-hidden bg-white shadow-sm">
                <CardContent className="p-0">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Skeleton className="h-12 flex-1" />
                            <Skeleton className="h-12 w-28" />
                        </div>
                    </div>
                    <div className="p-4 flex flex-wrap items-center gap-3">
                        <Skeleton className="h-5 w-20" />
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-9 w-24 rounded-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Results Count & Export Skeleton */}
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-9 w-28 rounded" />
            </div>

            {/* Tender Cards Skeleton */}
            <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="border-l-4 border-l-slate-300">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start gap-4 mb-3">
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-6 w-full max-w-lg" />
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-5 w-20 rounded" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-4" />
                            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                                <div className="flex gap-5">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-8 w-24 rounded" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex justify-center mt-8 gap-2">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded" />
                ))}
            </div>
        </div>
    );
}
