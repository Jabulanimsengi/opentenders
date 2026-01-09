import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookmarksLoading() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            {/* Header Skeleton */}
            <div className="mb-8">
                <Skeleton className="h-4 w-36 mb-4" />
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                        <Skeleton className="h-7 w-36 mb-1" />
                        <Skeleton className="h-4 w-52" />
                    </div>
                </div>
            </div>

            {/* Count Skeleton */}
            <Skeleton className="h-4 w-28 mb-4" />

            {/* Bookmark Cards Skeleton */}
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="border-l-4 border-l-slate-300">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                    <Skeleton className="h-6 w-full max-w-md mb-2" />
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Skeleton className="h-9 w-16 rounded" />
                                    <Skeleton className="h-9 w-9 rounded" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
