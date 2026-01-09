import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubscribeLoading() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-lg">
            {/* Back Link Skeleton */}
            <Skeleton className="h-4 w-28 mb-8" />

            {/* Plan Card Skeleton */}
            <Card className="mb-6">
                <CardHeader className="text-center pb-4">
                    <Skeleton className="h-7 w-28 mx-auto mb-2" />
                    <div className="flex items-baseline justify-center gap-1">
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Payment Form Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-36" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Skeleton className="h-4 w-10 mb-2" />
                        <Skeleton className="h-10 w-full rounded" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-10 w-full rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Skeleton className="h-4 w-16 mb-2" />
                            <Skeleton className="h-10 w-full rounded" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-10 mb-2" />
                            <Skeleton className="h-10 w-full rounded" />
                        </div>
                    </div>
                    <Skeleton className="h-12 w-full rounded-xl mt-4" />
                </CardContent>
            </Card>

            {/* Security Text Skeleton */}
            <div className="flex items-center justify-center gap-2 mt-6">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
    );
}
