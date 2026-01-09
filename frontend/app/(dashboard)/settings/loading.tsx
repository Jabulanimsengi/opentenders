import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            {/* Header Skeleton */}
            <div className="mb-8">
                <Skeleton className="h-8 w-28 mb-2" />
                <Skeleton className="h-5 w-56" />
            </div>

            {/* Profile Section Skeleton */}
            <Card className="mb-6">
                <CardHeader>
                    <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Skeleton className="h-4 w-12 mb-2" />
                        <Skeleton className="h-10 w-full rounded" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-10 mb-2" />
                        <Skeleton className="h-10 w-full rounded" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded" />
                </CardContent>
            </Card>

            {/* Subscription Section Skeleton */}
            <Card className="mb-6">
                <CardHeader>
                    <Skeleton className="h-6 w-28" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <Skeleton className="h-5 w-24 mb-1" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-36 rounded" />
                </CardContent>
            </Card>

            {/* Notifications Section Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div>
                                <Skeleton className="h-5 w-40 mb-1" />
                                <Skeleton className="h-4 w-56" />
                            </div>
                            <Skeleton className="h-6 w-12 rounded-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
