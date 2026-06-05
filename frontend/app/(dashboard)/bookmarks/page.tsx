'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Bookmark, Trash2, ArrowLeft, Loader2, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BookmarkedTender {
    id: string;
    tenderId: string;
    notes: string | null;
    createdAt: string;
    tender: {
        id: string;
        title: string;
        description: string | null;
        ocid: string;
        slug: string | null;
        buyerName: string | null;
        region: string | null;
        category: string | null;
        closingDate: string | null;
        status: string | null;
    } | null;
}

export default function BookmarksPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bookmarks, setBookmarks] = useState<BookmarkedTender[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchBookmarks();
        }
    }, [session]);

    const fetchBookmarks = async () => {
        try {
            const token = (session as any)?.accessToken;
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_BASE}/bookmarks`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setBookmarks(data);
            }
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (tenderId: string) => {
        const token = (session as any)?.accessToken;
        if (!token) return;

        setDeleting(tenderId);
        try {
            const res = await fetch(`${API_BASE}/bookmarks/${tenderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setBookmarks(prev => prev.filter(b => b.tenderId !== tenderId));
            }
        } catch (error) {
            console.error('Error removing bookmark:', error);
        } finally {
            setDeleting(null);
        }
    };

    const isPastClosingDate = (date: string | null) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    if (loading) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-10">
                <div className="flex items-center justify-center py-16 sm:py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-10">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <Link href="/dashboard" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Link>
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-amber-100 p-2">
                        <Bookmark className="h-5 w-5 text-amber-600 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Saved Tenders</h1>
                        <p className="text-sm text-muted-foreground sm:text-base">Your watchlist of bookmarked tenders</p>
                    </div>
                </div>
            </div>

            {/* Bookmarks List */}
            {bookmarks.length === 0 ? (
                <Card className="py-10 text-center sm:py-16">
                    <CardContent>
                        <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No saved tenders yet</h3>
                        <p className="text-gray-500 mb-4">Start saving tenders you're interested in to track them here.</p>
                        <Link href="/tenders">
                            <Button>Browse Tenders</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <div className="text-sm text-muted-foreground mb-4">
                        {bookmarks.length} saved tender{bookmarks.length !== 1 ? 's' : ''}
                    </div>

                    {bookmarks.map((bookmark) => {
                        const tender = bookmark.tender;
                        if (!tender) return null;

                        const isClosed = isPastClosingDate(tender.closingDate);

                        return (
                            <Card key={bookmark.id} className={cn(
                                "hover:shadow-md transition-shadow border-l-4",
                                isClosed ? "border-l-red-500" : "border-l-emerald-500"
                            )}>
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                <Badge variant={isClosed ? "destructive" : "default"} className="text-xs">
                                                    {isClosed ? 'Closed' : tender.status || 'Active'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    Saved {format(new Date(bookmark.createdAt), 'dd MMM yyyy')}
                                                </span>
                                            </div>

                                            <Link
                                                href={`/tenders/${tender.slug || tender.id}`}
                                                className="text-lg font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2"
                                            >
                                                {tender.title}
                                            </Link>

                                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground sm:gap-4">
                                                {tender.buyerName && (
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="w-3.5 h-3.5" />
                                                        {tender.buyerName}
                                                    </span>
                                                )}
                                                {tender.closingDate && (
                                                    <span className={cn(
                                                        "flex items-center gap-1",
                                                        isClosed && "text-red-500"
                                                    )}>
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {isClosed ? 'Closed' : 'Closes'} {format(new Date(tender.closingDate), 'dd MMM yyyy')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                                            <Link href={`/tenders/${tender.slug || tender.id}`} className="flex-1 sm:flex-none">
                                                <Button variant="outline" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeBookmark(tender.id)}
                                                disabled={deleting === tender.id}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                {deleting === tender.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
