import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AwardsLoading() {
    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header Skeleton */}
            <div className="mb-8">
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-5 w-64" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div>
                                    <Skeleton className="h-7 w-20 mb-1" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search Skeleton */}
            <div className="mb-6">
                <Skeleton className="h-12 w-full max-w-md" />
            </div>

            {/* Awards Table Skeleton */}
            <Card>
                <CardContent className="p-0">
                    {/* Table Header */}
                    <div className="grid grid-cols-4 gap-4 p-4 border-b bg-slate-50">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    {/* Table Rows */}
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-28" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Pagination Skeleton */}
            <div className="flex justify-center mt-6 gap-2">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded" />
                ))}
            </div>
        </div>
    );
}
