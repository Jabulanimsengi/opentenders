'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Bookmark,
    Plus,
    Trash2,
    Bell,
    Search,
    ArrowRight,
    Loader2,
    ArrowLeft,
} from 'lucide-react';

interface SavedSearch {
    id: string;
    name: string;
    criteria: string;
    alertsEnabled: boolean;
    alertFrequency: string;
    lastAlertedAt: string | null;
    createdAt: string;
}

interface SearchCriteria {
    q?: string | string[];
    region?: string[];
    category?: string[];
    buyer?: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface SessionWithAccessToken {
    accessToken?: string;
}

export default function SavedSearchesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [searches, setSearches] = useState<SavedSearch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [query, setQuery] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    const accessToken = (session as SessionWithAccessToken | null)?.accessToken;

    const fetchSearches = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/saved-searches`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setSearches(data);
            }
        } catch (error) {
            console.error('Failed to fetch searches:', error);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (session) {
            fetchSearches();
        }
    }, [session, fetchSearches]);

    const handleCreate = async () => {
        if (!name.trim()) return;
        setSaving(true);

        try {
            const criteria: SearchCriteria = {};
            if (query) criteria.q = query;

            const res = await fetch(`${API_BASE}/saved-searches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ name, criteria }),
            });

            if (res.ok) {
                setIsCreateOpen(false);
                setName('');
                setQuery('');
                fetchSearches();
            }
        } catch (error) {
            console.error('Failed to create search:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this saved search?')) return;

        try {
            await fetch(`${API_BASE}/saved-searches/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            fetchSearches();
        } catch (error) {
            console.error('Failed to delete search:', error);
        }
    };

    const parseCriteria = (criteriaStr: string): SearchCriteria => {
        try {
            return JSON.parse(criteriaStr);
        } catch {
            return {};
        }
    };

    const getCriteriaDisplay = (criteriaStr: string) => {
        const criteria = parseCriteria(criteriaStr);
        const query = Array.isArray(criteria.q) ? criteria.q.join(' ') : criteria.q;
        const parts: string[] = [];
        if (query) parts.push(`"${query}"`);
        if (criteria.region?.length) parts.push(`in ${criteria.region.join(', ')}`);
        if (criteria.category?.length) parts.push(`(${criteria.category.join(', ')})`);
        return parts.length ? parts.join(' ') : 'All tenders';
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
            {/* Back Link */}
            <Link href="/dashboard" className="mb-5 inline-flex items-center text-sm font-medium text-slate-600 transition-colors hover:text-emerald-600 sm:mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl">
                        <Bookmark className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
                        Saved Searches
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 sm:text-base">
                        Get email alerts when new tenders match your criteria
                    </p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            New Search
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create Saved Search</DialogTitle>
                            <DialogDescription>
                                Save your search criteria to receive email alerts
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label htmlFor="name">Search Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. IT Tenders in Gauteng"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="query">Keywords</Label>
                                <Input
                                    id="query"
                                    placeholder="e.g. software, IT, consulting"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreate}
                                    disabled={saving || !name.trim()}
                                    className="bg-emerald-500 hover:bg-emerald-600"
                                >
                                    {saving ? 'Saving...' : 'Save Search'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Searches List */}
            {searches.length === 0 ? (
                <Card className="py-10 text-center sm:py-12">
                    <CardContent>
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No saved searches yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Create your first saved search to receive email alerts
                        </p>
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Search
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {searches.map((search) => (
                        <Card key={search.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="flex items-center gap-2 break-words font-semibold text-gray-900">
                                            {search.name}
                                            {search.alertsEnabled && (
                                                <Bell className="w-4 h-4 text-emerald-500" />
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {getCriteriaDisplay(search.criteria)}
                                        </p>
                                        {search.lastAlertedAt && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Last alert: {new Date(search.lastAlertedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 sm:justify-end">
                                        <Link
                                            href={`/tenders?q=${encodeURIComponent(getQueryFromCriteria(search.criteria))}`}
                                            className="flex-1 sm:flex-none"
                                        >
                                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                View Results
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(search.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Info Footer */}
            <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-emerald-900">Email Alerts Active</p>
                        <p className="text-sm text-emerald-700">
                            You&apos;ll receive daily digest emails when new tenders match your saved searches.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getQueryFromCriteria(criteriaStr: string) {
    try {
        const criteria = JSON.parse(criteriaStr) as SearchCriteria;
        return Array.isArray(criteria.q) ? criteria.q.join(' ') : criteria.q || '';
    } catch {
        return '';
    }
}
