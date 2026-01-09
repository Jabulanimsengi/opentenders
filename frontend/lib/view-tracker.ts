/**
 * View Tracker - Tracks tender views for free tier limits
 * Uses localStorage for unauthenticated users
 * 25 views per month for free tier
 */

export const FREE_TIER_MONTHLY_VIEWS = 25;

interface ViewData {
    views: string[]; // Array of tender IDs viewed
    monthKey: string; // YYYY-MM format
}

const STORAGE_KEY = 'tender_views';

function getCurrentMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getViewData(): ViewData {
    if (typeof window === 'undefined') {
        return { views: [], monthKey: getCurrentMonthKey() };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return { views: [], monthKey: getCurrentMonthKey() };
        }

        const data: ViewData = JSON.parse(stored);

        // Reset if new month
        const currentMonth = getCurrentMonthKey();
        if (data.monthKey !== currentMonth) {
            const newData = { views: [], monthKey: currentMonth };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            return newData;
        }

        return data;
    } catch {
        return { views: [], monthKey: getCurrentMonthKey() };
    }
}

function saveViewData(data: ViewData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Record a tender view
 * @returns true if view was recorded (not a duplicate), false otherwise
 */
export function recordTenderView(tenderId: string): boolean {
    const data = getViewData();

    // Don't count duplicate views
    if (data.views.includes(tenderId)) {
        return false;
    }

    data.views.push(tenderId);
    saveViewData(data);
    return true;
}

/**
 * Get the number of tenders viewed this month
 */
export function getViewCount(): number {
    return getViewData().views.length;
}

/**
 * Get remaining views for this month
 */
export function getRemainingViews(): number {
    return Math.max(0, FREE_TIER_MONTHLY_VIEWS - getViewCount());
}

/**
 * Check if user has reached the view limit
 */
export function hasReachedViewLimit(): boolean {
    return getViewCount() >= FREE_TIER_MONTHLY_VIEWS;
}

/**
 * Check if a specific tender has been viewed
 */
export function hasTenderBeenViewed(tenderId: string): boolean {
    return getViewData().views.includes(tenderId);
}

/**
 * Check if viewing this tender would exceed the limit
 * (Returns true if already viewed OR if there are remaining views)
 */
export function canViewTender(tenderId: string): boolean {
    if (hasTenderBeenViewed(tenderId)) {
        return true; // Already viewed, doesn't count again
    }
    return !hasReachedViewLimit();
}
