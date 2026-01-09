import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const { auth, signIn, signOut, handlers } = NextAuth({
    pages: {
        signIn: '/', // Redirect to home page (login modal is in navbar)
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await prisma.user.findUnique({ where: { email } });

                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                // Add the access token and role to session
                (session as any).accessToken = token.accessToken;
                (session.user as any).role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                // Get user role from database
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id as string },
                    select: { role: true }
                });
                token.role = dbUser?.role || 'user';
                // Generate a backend-compatible JWT token
                token.accessToken = jwt.sign(
                    { sub: user.id, email: user.email, name: user.name, role: token.role },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );
            }
            return token;
        }
    },
    session: { strategy: "jwt" }
});
