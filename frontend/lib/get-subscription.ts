import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isPaidUser, isValidPlanId, UserSubscription } from "./subscription";

// Get user's subscription from database
export async function getUserSubscription(
  userId?: string,
): Promise<UserSubscription | null> {
  if (!userId) return null;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      const membership = await prisma.organizationMember.findFirst({
        where: {
          userId,
          status: "active",
          organization: {
            subscription: {
              status: "active",
            },
          },
        },
        select: {
          organization: {
            select: {
              subscription: true,
            },
          },
        },
      });

      const organizationSubscription = membership?.organization.subscription;
      if (!organizationSubscription) {
        return { plan: "free", status: "active" };
      }

      return {
        plan: isValidPlanId(organizationSubscription.plan)
          ? organizationSubscription.plan
          : "free",
        status: organizationSubscription.status as UserSubscription["status"],
        endDate: organizationSubscription.endDate ?? undefined,
      };
    }

    return {
      plan: isValidPlanId(subscription.plan) ? subscription.plan : "free",
      status: subscription.status as UserSubscription["status"],
      endDate: subscription.endDate ?? undefined,
    };
  } catch (error) {
    // If subscription table doesn't exist yet, return free plan
    console.log("Subscription lookup failed, defaulting to free:", error);
    return { plan: "free", status: "active" };
  }
}

// Server-side helper to check if current user is paid
export async function checkPaidAccess(): Promise<{
  isPaid: boolean;
  subscription: UserSubscription | null;
}> {
  const session = await auth();

  if (!session?.user?.id) {
    return { isPaid: false, subscription: null };
  }

  const subscription = await getUserSubscription(session.user.id);
  const isPaid = isPaidUser(subscription);

  return { isPaid, subscription };
}
