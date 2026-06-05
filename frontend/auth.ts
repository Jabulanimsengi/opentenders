import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const DEFAULT_JWT_SECRETS = new Set([
  "",
  "your-secret-key",
  "your-auth-secret-key-change-in-production",
]);

function getJwtSecret() {
  const configuredSecret = process.env.JWT_SECRET?.trim();

  if (configuredSecret && !DEFAULT_JWT_SECRETS.has(configuredSecret)) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set to a strong production secret");
  }

  return "development-only-jwt-secret-change-me";
}

const GOOGLE_PROVIDER = "google";

export const { auth, signIn, signOut, handlers } = NextAuth({
  pages: {
    signIn: "/", // Redirect to home page (login modal is in navbar)
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

          if (!user || !user.password || !user.emailVerifiedAt) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        Object.assign(session, { accessToken: token.accessToken });
        Object.assign(session.user, { role: token.role });
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const dbUser =
          account?.provider === GOOGLE_PROVIDER && user.email
            ? await prisma.user.upsert({
                where: { email: user.email },
                create: {
                  email: user.email,
                  name: user.name,
                  authProvider: GOOGLE_PROVIDER,
                  emailVerifiedAt: new Date(),
                },
                update: {
                  name: user.name,
                  authProvider: GOOGLE_PROVIDER,
                  emailVerifiedAt: new Date(),
                },
                select: { id: true, role: true, email: true, name: true },
              })
            : await prisma.user.findUnique({
                where: { id: user.id as string },
                select: { id: true, role: true, email: true, name: true },
              });

        if (!dbUser) return token;

        token.sub = dbUser.id;
        token.role = dbUser?.role || "user";
        // Generate a backend-compatible JWT token
        token.accessToken = jwt.sign(
          {
            sub: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: token.role,
          },
          getJwtSecret(),
          { expiresIn: "7d" },
        );
      }
      return token;
    },
  },
  session: { strategy: "jwt" },
});
