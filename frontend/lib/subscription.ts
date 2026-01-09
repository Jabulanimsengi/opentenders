// Subscription plan definitions
export const PLANS = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        teamSize: 1,
        features: [
            '25 tender views per month',
            'Browse tender listings',
            'Limited tender details',
        ],
        restrictions: {
            blurContent: true,
            canDownload: false,
            canSaveSearches: false,
            canExport: false,
            maxSearches: 0,
            monthlyViewLimit: 25,
        }
    },
    solo: {
        id: 'solo',
        name: 'Solo',
        price: 109,
        teamSize: 1,
        features: [
            'Full tender details',
            'Save tenders (bookmarks)',
            'Unlimited saved searches',
            'Email alerts',
            'Download as PDF',
            'Export to CSV',
            'Tender watchlist',
        ],
        restrictions: {
            blurContent: false,
            canDownload: true,
            canSaveSearches: true,
            canExport: true,
            maxSearches: -1, // unlimited
            monthlyViewLimit: -1, // unlimited
        }
    },
    team: {
        id: 'team',
        name: 'Team',
        price: 399,
        teamSize: 5,
        features: [
            'Everything in Solo',
            'Up to 5 team members',
            'Priority email support',
        ],
        restrictions: {
            blurContent: false,
            canDownload: true,
            canSaveSearches: true,
            canExport: true,
            maxSearches: -1,
            monthlyViewLimit: -1,
        }
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 999,
        teamSize: -1, // unlimited
        features: [
            'Everything in Team',
            'Unlimited team members',
            'Dedicated account manager',
            'Custom onboarding',
        ],
        restrictions: {
            blurContent: false,
            canDownload: true,
            canSaveSearches: true,
            canExport: true,
            maxSearches: -1,
            monthlyViewLimit: -1,
        }
    }
} as const;

export type PlanId = keyof typeof PLANS;

export interface UserSubscription {
    plan: PlanId;
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    endDate?: Date;
}

// Check if user has paid subscription
export function isPaidUser(subscription?: UserSubscription | null): boolean {
    if (!subscription) return false;
    if (subscription.status !== 'active' && subscription.status !== 'trial') return false;
    return subscription.plan !== 'free';
}

// Check if content should be blurred
export function shouldBlurContent(subscription?: UserSubscription | null): boolean {
    return !isPaidUser(subscription);
}

// Check if user can access feature
export function canAccess(feature: keyof typeof PLANS['free']['restrictions'], subscription?: UserSubscription | null): boolean {
    if (!subscription || subscription.plan === 'free') {
        return !PLANS.free.restrictions[feature];
    }
    const plan = PLANS[subscription.plan];
    return !plan.restrictions[feature];
}

// Get plan details
export function getPlan(planId: PlanId) {
    return PLANS[planId];
}
