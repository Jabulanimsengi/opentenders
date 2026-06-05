'use client';

import { useEffect, useMemo, useState } from 'react';
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
import {
    InstantSearch,
    SearchBox,
    Hits,
    RefinementList,
    Stats,
    Pagination,
    Configure,
    useInstantSearch,
} from 'react-instantsearch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Building2, MapPin, Clock, Plus, Lock, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { format, isPast, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { BookmarkButton } from '@/components/bookmark-button';

// Typesense configuration
const typesenseAdapter = new TypesenseInstantSearchAdapter({
    server: {
        apiKey: process.env.NEXT_PUBLIC_TYPESENSE_API_KEY || 'tender-app-typesense-key',
        nodes: [
            {
                host: process.env.NEXT_PUBLIC_TYPESENSE_HOST || 'localhost',
                port: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || '8108'),
                protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || 'http',
            },
        ],
    },
    additionalSearchParameters: {
        query_by: 'title,description,buyerName',
        sort_by: 'publishedDate:desc',
    },
});

const searchClient = typesenseAdapter.searchClient;

// Tender Hit Component with Quick View
function TenderHit({ hit, isSubscriber = false }: { hit: any; isSubscriber?: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const closingDate = hit.closingDate ? new Date(hit.closingDate) : null;
    const publishedDate = hit.publishedDate ? new Date(hit.publishedDate) : null;
    const isClosed = closingDate ? isPast(closingDate) : false;
    const daysLeft = closingDate && !isClosed ? differenceInDays(closingDate, new Date()) : null;
    const isClosingSoon = daysLeft !== null && daysLeft <= 7;
    const advertisedSource = hit.sourceName || labelSourceType(hit.sourceType);

    const handleCardClick = (e: React.MouseEvent) => {
        // Allow the link to work unless clicking on the bookmark button or expand button
        const target = e.target as HTMLElement;
        if (target.closest('[data-bookmark-button]') || target.closest('[data-expand-button]')) {
            e.preventDefault();
        }
    };

    const handleExpandClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="mb-4">
            <Link href={`/tenders/${hit.slug || hit.id}`} onClick={handleCardClick}>
                <Card className={cn(
                    "border-l-4 transition-all hover:shadow-md cursor-pointer",
                    isClosed ? "border-l-slate-300 opacity-75" :
                        isClosingSoon ? "border-l-amber-500" : "border-l-emerald-500",
                    isExpanded && "rounded-b-none"
                )}>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge
                                        variant={isClosed ? "secondary" : "default"}
                                        className={cn(
                                            "text-xs",
                                            !isClosed && "bg-emerald-500 hover:bg-emerald-600"
                                        )}
                                    >
                                        {isClosed ? 'Closed' : 'Active'}
                                    </Badge>
                                    {isClosingSoon && !isClosed && (
                                        <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                                            Closes soon
                                        </Badge>
                                    )}
                                </div>

                                <h3 className="font-semibold text-slate-800 line-clamp-2 mb-2">
                                    {hit.title}
                                </h3>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                                    {hit.buyerName && (
                                        <span className="flex items-center gap-1">
                                            <Building2 className="w-3.5 h-3.5" />
                                            <span className="truncate max-w-[200px]">{hit.buyerName}</span>
                                        </span>
                                    )}
                                    {hit.region && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {hit.region}
                                        </span>
                                    )}
                                    {advertisedSource && (
                                        <span className="flex min-w-0 items-center gap-1">
                                            <Megaphone className="w-3.5 h-3.5 shrink-0" />
                                            <span className="max-w-[200px] truncate">{advertisedSource}</span>
                                        </span>
                                    )}
                                </div>

                                {/* Dates Row */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100">
                                    {publishedDate && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatAdvertisedDate(publishedDate)}
                                        </span>
                                    )}
                                    {closingDate && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Closes: {format(closingDate, 'dd MMM yyyy')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end justify-between shrink-0 gap-2">
                                <div className="flex items-center gap-2">
                                    {closingDate && (
                                        <div className={cn(
                                            "flex items-center gap-1 text-sm font-medium",
                                            isClosed ? "text-slate-400" :
                                                isClosingSoon ? "text-amber-600" : "text-slate-600"
                                        )}>
                                            <Clock className="w-4 h-4" />
                                            {isClosed ? 'Closed' :
                                                daysLeft === 0 ? 'Today' :
                                                    daysLeft === 1 ? '1 day left' :
                                                        `${daysLeft} days left`
                                            }
                                        </div>
                                    )}
                                    <div data-bookmark-button>
                                        <BookmarkButton tenderId={hit.id} variant="icon" isSubscriber={isSubscriber} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {hit.category && (
                                        <Badge variant="outline" className="text-xs">
                                            {hit.category}
                                        </Badge>
                                    )}
                                    {/* Quick View Expand Button */}
                                    <div className="relative group">
                                        <button
                                            data-expand-button
                                            onClick={handleExpandClick}
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer",
                                                isExpanded
                                                    ? "bg-emerald-500 text-white rotate-45 shadow-lg"
                                                    : "bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:scale-110 hover:shadow-md"
                                            )}
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            {isExpanded ? "Close preview" : "Quick preview"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            {/* Expandable Quick View Panel - Shows to everyone */}
            {isExpanded && (
                <div className="bg-slate-50 border border-t-0 border-slate-200 rounded-b-lg p-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4">
                        {/* Description */}
                        {hit.description && (
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-1">Description</h4>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                                    {hit.description}
                                </p>
                            </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {hit.tenderNumber && (
                                <div>
                                    <span className="text-slate-400 text-xs uppercase">Tender No.</span>
                                    <p className="font-medium text-slate-700">{hit.tenderNumber}</p>
                                </div>
                            )}
                            {hit.category && (
                                <div>
                                    <span className="text-slate-400 text-xs uppercase">Category</span>
                                    <p className="font-medium text-slate-700">{hit.category}</p>
                                </div>
                            )}
                            {hit.region && (
                                <div>
                                    <span className="text-slate-400 text-xs uppercase">Region</span>
                                    <p className="font-medium text-slate-700">{hit.region}</p>
                                </div>
                            )}
                            {hit.buyerName && (
                                <div>
                                    <span className="text-slate-400 text-xs uppercase">Buyer</span>
                                    <p className="font-medium text-slate-700">{hit.buyerName}</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons - Paywall on View Full Details */}
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                            {isSubscriber ? (
                                <Link
                                    href={`/tenders/${hit.slug || hit.id}`}
                                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                                >
                                    View Full Details →
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-500">Full details require subscription</span>
                                    <Link
                                        href="/pricing"
                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 ml-2"
                                    >
                                        Upgrade →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function formatAdvertisedDate(date: Date | null) {
    if (!date || Number.isNaN(date.getTime()) || date.getFullYear() <= 1971) {
        return 'Advertised date unavailable';
    }

    return `Advertised: ${format(date, 'dd MMM yyyy')}`;
}

function labelSourceType(sourceType?: string) {
    if (!sourceType) return '';
    return sourceType
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

// No Results Component
function NoResults() {
    const { indexUiState } = useInstantSearch();
    return (
        <div className="text-center py-12">
            <p className="text-slate-500">
                No tenders found for "{indexUiState.query}".
            </p>
        </div>
    );
}

// Empty Query Info
function EmptyQueryBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
    const { indexUiState, results } = useInstantSearch();

    if (!indexUiState.query && (!results || results.nbHits === 0)) {
        return <>{fallback}</>;
    }

    if (results && results.nbHits === 0) {
        return <NoResults />;
    }

    return <>{children}</>;
}

interface TypesenseSearchProps {
    isSubscriber?: boolean;
}

export function TypesenseSearch({ isSubscriber = false }: TypesenseSearchProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="animate-pulse">
                <div className="h-12 bg-slate-200 rounded-lg mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-slate-100 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <InstantSearch
            searchClient={searchClient}
            indexName="tenders"
            future={{ preserveSharedStateOnUnmount: true }}
        >
            <Configure hitsPerPage={20} />

            <div className="space-y-6">
                {/* Search Box */}
                <SearchBox
                    placeholder="Search tenders by title, buyer, or description..."
                    classNames={{
                        root: 'w-full',
                        form: 'relative',
                        input: 'w-full h-12 px-4 pr-24 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-800',
                        submit: 'absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600',
                        reset: 'absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 hidden',
                        submitIcon: 'w-5 h-5',
                        resetIcon: 'w-4 h-4',
                        loadingIcon: 'w-4 h-4 animate-spin',
                    }}
                    searchAsYouType={true}
                />

                {/* Filters */}
                <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1 min-w-[200px]">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Region</h4>
                        <RefinementList
                            attribute="region"
                            limit={5}
                            showMore={true}
                            showMoreLimit={20}
                            classNames={{
                                root: 'text-sm',
                                list: 'space-y-1',
                                item: 'flex items-center gap-2',
                                checkbox: 'w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500',
                                label: 'flex items-center gap-2 cursor-pointer',
                                labelText: 'text-slate-600',
                                count: 'text-xs text-slate-400 bg-slate-200 px-1.5 rounded',
                                showMore: 'text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2 cursor-pointer',
                                disabledShowMore: 'text-slate-400 text-sm mt-2 cursor-not-allowed',
                            }}
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Category</h4>
                        <RefinementList
                            attribute="category"
                            limit={5}
                            showMore={true}
                            showMoreLimit={20}
                            classNames={{
                                root: 'text-sm',
                                list: 'space-y-1',
                                item: 'flex items-center gap-2',
                                checkbox: 'w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500',
                                label: 'flex items-center gap-2 cursor-pointer',
                                labelText: 'text-slate-600',
                                count: 'text-xs text-slate-400 bg-slate-200 px-1.5 rounded',
                                showMore: 'text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2 cursor-pointer',
                                disabledShowMore: 'text-slate-400 text-sm mt-2 cursor-not-allowed',
                            }}
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Status</h4>
                        <RefinementList
                            attribute="status"
                            classNames={{
                                root: 'text-sm',
                                list: 'space-y-1',
                                item: 'flex items-center gap-2',
                                checkbox: 'w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500',
                                label: 'flex items-center gap-2 cursor-pointer',
                                labelText: 'text-slate-600',
                                count: 'text-xs text-slate-400 bg-slate-200 px-1.5 rounded',
                            }}
                        />
                    </div>
                </div>

                {/* Stats */}
                <Stats
                    classNames={{
                        root: 'text-sm text-slate-500',
                    }}
                    translations={{
                        rootElementText: ({ nbHits, processingTimeMS }) =>
                            `${nbHits.toLocaleString()} tenders found in ${processingTimeMS}ms`
                    }}
                />

                {/* Results */}
                <EmptyQueryBoundary
                    fallback={
                        <div className="text-center py-12 text-slate-500">
                            Start typing to search tenders...
                        </div>
                    }
                >
                    <Hits
                        hitComponent={({ hit }) => <TenderHit hit={hit} isSubscriber={isSubscriber} />}
                        classNames={{ list: 'space-y-0' }}
                    />
                </EmptyQueryBoundary>

                {/* Pagination */}
                <div className="flex justify-center mt-8">
                    <Pagination
                        classNames={{
                            root: 'flex flex-row items-center gap-1',
                            list: 'flex flex-row items-center gap-1',
                            item: 'px-3 py-2 rounded-lg text-sm',
                            link: 'text-slate-600 hover:bg-slate-100 block',
                            selectedItem: 'bg-emerald-500 text-white rounded-lg',
                            disabledItem: 'text-slate-300',
                            firstPageItem: 'hidden sm:block',
                            lastPageItem: 'hidden sm:block',
                        }}
                    />
                </div>
            </div>
        </InstantSearch>
    );
}
