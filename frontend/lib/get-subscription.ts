import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { UserSubscription } from './subscription';

// For local development: set to true to make all signed-in users paid subscribers
const DEV_PAID_ACCESS = process.env.NODE_ENV === 'development';

// Get user's subscription from database
export async function getUserSubscription(userId?: string): Promise<UserSubscription | null> {
    if (!userId) return null;

    // DEV: Default to solo plan for local testing
    if (DEV_PAID_ACCESS) {
        return { plan: 'solo', status: 'active' };
    }

    try {
        // Note: This will need prisma generate to work after restarting dev server
        const subscription = await (prisma as any).subscription.findUnique({
            where: { userId }
        });

        if (!subscription) {
            // Default to free plan
            return { plan: 'free', status: 'active' };
        }

        return {
            plan: subscription.plan as UserSubscription['plan'],
            status: subscription.status as UserSubscription['status'],
            endDate: subscription.endDate
        };
    } catch (error) {
        // If subscription table doesn't exist yet, return free plan
        console.log('Subscription lookup failed, defaulting to free:', error);
        return { plan: 'free', status: 'active' };
    }
}

// Server-side helper to check if current user is paid
export async function checkPaidAccess(): Promise<{ isPaid: boolean; subscription: UserSubscription | null }> {
    const session = await auth();

    if (!session?.user?.id) {
        return { isPaid: false, subscription: null };
    }

    const subscription = await getUserSubscription(session.user.id);
    const isPaid = subscription ? subscription.plan !== 'free' && subscription.status === 'active' : false;

    return { isPaid, subscription };
}
