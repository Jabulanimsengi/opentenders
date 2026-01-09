import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/', // Redirect to home page (login modal is in navbar)
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnSaved = nextUrl.pathname.startsWith('/saved');
            const isOnSettings = nextUrl.pathname.startsWith('/settings');

            // Only these routes require authentication
            if (isOnSaved || isOnSettings) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to home
            }
            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;

