// Subscription plan definitions
export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "R0",
    teamSize: 1,
    features: [
      "Browse tender listings",
      "Limited tender details",
      "Limited monthly tender views",
    ],
    restrictions: {
      blurContent: true,
      canDownload: false,
      canSaveSearches: false,
      canExport: false,
      canReceiveEmailAlerts: false,
      maxSearches: 0,
      monthlyViewLimit: 25,
    },
  },
  solo: {
    id: "solo",
    name: "Solo",
    price: 229,
    priceLabel: "R229",
    teamSize: 1,
    features: [
      "Full tender details",
      "Save tenders and searches",
      "Email alerts",
      "Download as PDF",
      "Export to CSV",
      "Tender watchlist",
    ],
    restrictions: {
      blurContent: false,
      canDownload: true,
      canSaveSearches: true,
      canExport: true,
      canReceiveEmailAlerts: true,
      maxSearches: -1,
      monthlyViewLimit: -1,
    },
  },
  team: {
    id: "team",
    name: "Team",
    price: 629,
    priceLabel: "R629",
    teamSize: 5,
    features: [
      "Everything in Solo",
      "Up to 5 team members",
      "Shared team access",
      "Email alerts for team users",
      "Priority email support",
    ],
    restrictions: {
      blurContent: false,
      canDownload: true,
      canSaveSearches: true,
      canExport: true,
      canReceiveEmailAlerts: true,
      maxSearches: -1,
      monthlyViewLimit: -1,
    },
  },
  business: {
    id: "business",
    name: "Business",
    price: 1329,
    priceLabel: "R1,329",
    teamSize: 15,
    features: [
      "Everything in Team",
      "Up to 15 team members",
      "Admin-managed users",
      "Advanced source and alert monitoring",
      "Priority support",
    ],
    restrictions: {
      blurContent: false,
      canDownload: true,
      canSaveSearches: true,
      canExport: true,
      canReceiveEmailAlerts: true,
      maxSearches: -1,
      monthlyViewLimit: -1,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise / Custom",
    price: 2499,
    priceLabel: "From R2,499",
    teamSize: -1,
    features: [
      "Everything in Business",
      "Custom user limits",
      "Dedicated account manager",
      "Custom onboarding",
      "Custom reporting",
    ],
    restrictions: {
      blurContent: false,
      canDownload: true,
      canSaveSearches: true,
      canExport: true,
      canReceiveEmailAlerts: true,
      maxSearches: -1,
      monthlyViewLimit: -1,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;

export interface UserSubscription {
  plan: PlanId;
  status: "active" | "cancelled" | "expired" | "trial";
  endDate?: Date;
}

// Check if user has paid subscription
export function isPaidUser(subscription?: UserSubscription | null): boolean {
  if (!subscription) return false;
  if (subscription.status !== "active" && subscription.status !== "trial")
    return false;
  return subscription.plan !== "free";
}

// Check if content should be blurred
export function shouldBlurContent(
  subscription?: UserSubscription | null,
): boolean {
  return !isPaidUser(subscription);
}

// Check if user can access feature
export function canAccess(
  feature: keyof (typeof PLANS)["free"]["restrictions"],
  subscription?: UserSubscription | null,
): boolean {
  if (!subscription || subscription.plan === "free") {
    return !PLANS.free.restrictions[feature];
  }
  const plan = PLANS[subscription.plan];
  return !plan.restrictions[feature];
}

// Get plan details
export function getPlan(planId: PlanId) {
  return PLANS[planId];
}

export function getPlanSeatLimit(planId: PlanId) {
  return PLANS[planId].teamSize;
}

export function isValidPlanId(planId: string): planId is PlanId {
  return planId in PLANS;
}
