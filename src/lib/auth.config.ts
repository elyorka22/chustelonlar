import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config — no Prisma, no Node-only providers.
 * Used by middleware. Full auth with DB lives in auth.ts.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      if (user && "role" in user && user.role) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role =
          (token.role as "USER" | "MODERATOR" | "ADMIN" | "BANNED" | undefined) ??
          "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
