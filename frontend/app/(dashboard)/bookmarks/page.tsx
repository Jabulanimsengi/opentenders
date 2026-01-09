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

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
            <div className="container mx-auto py-10 px-4 max-w-4xl">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Bookmark className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Saved Tenders</h1>
                        <p className="text-muted-foreground">Your watchlist of bookmarked tenders</p>
                    </div>
                </div>
            </div>

            {/* Bookmarks List */}
            {bookmarks.length === 0 ? (
                <Card className="text-center py-16">
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
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
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

                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
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

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link href={`/tenders/${tender.slug || tender.id}`}>
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
