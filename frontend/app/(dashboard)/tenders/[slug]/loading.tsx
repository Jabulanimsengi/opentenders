import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            {/* Back Link Skeleton */}
            <Skeleton className="h-4 w-32 mb-6" />

            {/* Hero Header Skeleton */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 rounded-xl shadow-lg overflow-hidden mb-8">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex-1">
                            <Skeleton className="h-4 w-40 mb-2 bg-slate-700" />
                            <Skeleton className="h-8 w-full max-w-xl bg-slate-700" />
                        </div>
                        <Skeleton className="h-7 w-20 rounded-full bg-slate-600" />
                    </div>
                    <div className="mt-3">
                        <Skeleton className="h-7 w-48 rounded-full bg-slate-700" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <Skeleton className="h-5 w-56 bg-slate-700" />
                    </div>
                </div>
            </div>

            {/* Content Card Skeleton */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6">
                    {/* Info Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-5 w-32" />
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-4 w-24" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Description Skeleton */}
                    <div className="mb-6">
                        <Skeleton className="h-5 w-28 mb-3" />
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>

                    {/* Documents Skeleton */}
                    <div className="mb-6">
                        <Skeleton className="h-5 w-36 mb-3" />
                        <div className="grid gap-2">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Skeleton className="h-10 w-10 rounded-lg" />
                                    <div>
                                        <Skeleton className="h-5 w-40 mb-1" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reference Info Skeleton */}
                    <div className="mt-8 pt-6 border-t space-y-2">
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                </div>
            </div>
        </div>
    );
}
