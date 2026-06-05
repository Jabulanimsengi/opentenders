export const PLAN_DEFINITIONS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    teamSize: 1,
    paid: false,
    canReceiveEmailAlerts: false,
  },
  solo: {
    id: 'solo',
    name: 'Solo',
    price: 229,
    teamSize: 1,
    paid: true,
    canReceiveEmailAlerts: true,
  },
  team: {
    id: 'team',
    name: 'Team',
    price: 629,
    teamSize: 5,
    paid: true,
    canReceiveEmailAlerts: true,
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 1329,
    teamSize: 15,
    paid: true,
    canReceiveEmailAlerts: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise / Custom',
    price: 2499,
    teamSize: -1,
    paid: true,
    canReceiveEmailAlerts: true,
  },
} as const;

export type PlanId = keyof typeof PLAN_DEFINITIONS;

export function isValidPlanId(plan: string): plan is PlanId {
  return plan in PLAN_DEFINITIONS;
}

export function getPlanSeatLimit(plan: string) {
  return isValidPlanId(plan) ? PLAN_DEFINITIONS[plan].teamSize : 1;
}

export function isPaidPlan(plan: string) {
  return isValidPlanId(plan) && PLAN_DEFINITIONS[plan].paid;
}
