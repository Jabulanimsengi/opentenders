import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PricingLoading() {
    return (
        <div className="container mx-auto py-12 px-4">
            {/* Header Skeleton */}
            <div className="text-center mb-12">
                <Skeleton className="h-10 w-80 mx-auto mb-4" />
                <Skeleton className="h-6 w-96 mx-auto" />
            </div>

            {/* Pricing Cards Grid Skeleton */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="p-6">
                        <Skeleton className="h-6 w-20 mb-2" />
                        <div className="flex items-baseline gap-1 mb-4">
                            <Skeleton className="h-9 w-16" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-4 w-28 mb-6" />
                        <div className="space-y-3 mb-6">
                            {[...Array(5)].map((_, j) => (
                                <div key={j} className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ))}
                        </div>
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </Card>
                ))}
            </div>

            {/* Comparison Table Skeleton */}
            <div className="max-w-5xl mx-auto">
                <Skeleton className="h-8 w-64 mx-auto mb-8" />
                <Card>
                    <CardContent className="p-0">
                        {/* Table Header */}
                        <div className="grid grid-cols-5 gap-4 p-4 border-b bg-slate-50">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-14 mx-auto" />
                            <Skeleton className="h-5 w-14 mx-auto" />
                            <Skeleton className="h-5 w-14 mx-auto" />
                            <Skeleton className="h-5 w-20 mx-auto" />
                        </div>
                        {/* Table Rows */}
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-5 w-5 mx-auto rounded-full" />
                                <Skeleton className="h-5 w-5 mx-auto rounded-full" />
                                <Skeleton className="h-5 w-5 mx-auto rounded-full" />
                                <Skeleton className="h-5 w-5 mx-auto rounded-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
