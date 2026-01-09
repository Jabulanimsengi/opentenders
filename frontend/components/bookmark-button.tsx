'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Bookmark, Loader2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/toast-provider';

interface BookmarkButtonProps {
    tenderId: string;
    className?: string;
    variant?: 'default' | 'icon';
    isSubscriber?: boolean;
}

export function BookmarkButton({ tenderId, className, variant = 'default', isSubscriber = false }: BookmarkButtonProps) {
    const { data: session, status } = useSession();
    const { toast } = useToast();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // Check if already bookmarked on mount
    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            setChecking(false);
            return;
        }

        const checkBookmark = async () => {
            try {
                const token = (session as any)?.accessToken;
                if (!token) {
                    console.warn('No access token available - please sign out and sign back in');
                    setChecking(false);
                    return;
                }

                const res = await fetch(`${API_BASE}/bookmarks/check/${tenderId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setIsBookmarked(data.isBookmarked);
                }
            } catch (error) {
                // Silently handle fetch errors - bookmark status unknown
                console.warn('Could not check bookmark status');
            } finally {
                setChecking(false);
            }
        };

        checkBookmark();
    }, [tenderId, session, status, API_BASE]);

    const toggleBookmark = async () => {
        if (!session) return;

        const token = (session as any)?.accessToken;
        if (!token) {
            toast('Please sign in to save tenders', 'error');
            return;
        }

        setLoading(true);
        try {
            if (isBookmarked) {
                // Remove bookmark
                const res = await fetch(`${API_BASE}/bookmarks/${tenderId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (res.ok) {
                    setIsBookmarked(false);
                    toast('Tender removed from your watchlist', 'info');
                } else {
                    toast('Failed to remove tender', 'error');
                }
            } else {
                // Add bookmark
                const res = await fetch(`${API_BASE}/bookmarks`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ tenderId }),
                });
                if (res.ok) {
                    setIsBookmarked(true);
                    toast('Tender saved to your watchlist!', 'success');
                } else {
                    toast('Failed to save tender', 'error');
                }
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            toast('Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Show placeholder while session is loading
    if (status === 'loading') {
        return (
            <Button variant="outline" size={variant === 'icon' ? 'icon' : 'sm'} disabled className={className}>
                {variant === 'icon' ? (
                    <Bookmark className="w-4 h-4" />
                ) : (
                    <>
                        <Bookmark className="w-4 h-4" />
                        Save
                    </>
                )}
            </Button>
        );
    }

    // User not logged in or not a subscriber - show button with upgrade prompt
    if (!session || !isSubscriber) {
        const handleNotSubscriber = () => {
            if (!session) {
                toast('Sign in to save tenders to your watchlist', 'info');
            } else {
                toast('Upgrade to a paid plan to save tenders', 'info');
            }
        };

        if (variant === 'icon') {
            return (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNotSubscriber}
                    className={cn('transition-colors cursor-pointer opacity-60 hover:opacity-100', className)}
                    title={!session ? "Sign in to save" : "Upgrade to save"}
                >
                    <Bookmark className="w-4 h-4" />
                </Button>
            );
        }

        return (
            <Button
                variant="outline"
                size="sm"
                onClick={handleNotSubscriber}
                className={cn('gap-2 transition-colors cursor-pointer opacity-60 hover:opacity-100', className)}
            >
                <Bookmark className="w-4 h-4" />
                Save
            </Button>
        );
    }

    if (checking) {
        return (
            <Button variant="outline" size={variant === 'icon' ? 'icon' : 'sm'} disabled className={className}>
                <Loader2 className="w-4 h-4 animate-spin" />
                {variant !== 'icon' && ' Loading...'}
            </Button>
        );
    }

    if (variant === 'icon') {
        return (
            <Button
                variant="outline"
                size="icon"
                onClick={toggleBookmark}
                disabled={loading}
                className={cn(
                    'transition-colors',
                    isBookmarked && 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100',
                    className
                )}
                title={isBookmarked ? 'Remove from watchlist' : 'Add to watchlist'}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
                )}
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleBookmark}
            disabled={loading}
            className={cn(
                'gap-2 transition-colors',
                isBookmarked && 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100',
                className
            )}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
            )}
            {isBookmarked ? 'Saved' : 'Save'}
        </Button>
    );
}
