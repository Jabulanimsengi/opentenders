import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DeleteSearchButton } from '@/components/delete-search-button';
import { Heart, LogIn } from 'lucide-react';

export default async function SavedSearchesPage() {
    const session = await auth();

    // Show login prompt for unauthenticated users
    if (!session?.user?.id) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="max-w-md mx-auto text-center">
                    <Card className="p-6">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Saved Searches</h1>
                        <p className="text-muted-foreground mb-6">
                            Please sign in to view and manage your saved tender searches.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/login">
                                <LogIn className="w-4 h-4 mr-2" />
                                Sign In to Continue
                            </Link>
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    const savedSearches = await prisma.savedSearch.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Saved Alerts</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {savedSearches.map((search: any) => {
                    const criteria = JSON.parse(search.criteria);
                    return (
                        <Card key={search.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg">{search.name}</CardTitle>
                                <DeleteSearchButton searchId={search.id} />
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(criteria).map(([key, value]) => (
                                        <Badge key={key} variant="secondary">
                                            {key}: {Array.isArray(value) ? value.join(', ') : value as string}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={buildUrl(criteria)}>View Matches</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
                {savedSearches.length === 0 && (
                    <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                        <p>No saved searches yet. Go to the dashboard and save a filter!</p>
                        <Button variant="link" asChild>
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function buildUrl(criteria: any) {
    const params = new URLSearchParams();
    Object.entries(criteria).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            params.set(key, value.join(','));
        } else {
            params.set(key, value as string);
        }
    });
    return `/?${params.toString()}`;
}
