'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function deleteSavedSearch(searchId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: 'Not authenticated' };
    }

    // Verify ownership
    const search = await prisma.savedSearch.findFirst({
        where: {
            id: searchId,
            userId: session.user.id
        }
    });

    if (!search) {
        return { error: 'Search not found or not authorized' };
    }

    await prisma.savedSearch.delete({
        where: { id: searchId }
    });

    revalidatePath('/saved');
    return { success: true };
}
