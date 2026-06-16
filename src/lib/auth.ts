import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/db";
import type { UserRole } from "@prisma/client";

const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  // Secure cookies only over HTTPS — otherwise session is lost after OAuth on HTTP/IP
  useSecureCookies: authUrl.startsWith("https://"),
  adapter: PrismaAdapter(getPrisma()),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getPrisma().user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        if (user.role === "BANNED") {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      const userId = (token.id ?? token.sub) as string | undefined;
      if (userId) {
        token.id = userId;

        try {
          const dbUser = await getPrisma().user.findUnique({
            where: { id: userId },
            select: { role: true },
          });

          if (dbUser) {
            token.role = dbUser.role;
          } else if (!token.role) {
            token.role = "USER";
          }
        } catch {
          token.role ??= "USER";
        }
      } else if (user) {
        token.role = (user as { role?: UserRole }).role ?? "USER";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role = (token.role as UserRole) ?? "USER";
      }
      return session;
    },
    async signIn({ user }) {
      if (!user.email) return false;

      const existingUser = await getPrisma().user.findUnique({
        where: { email: user.email },
      });

      if (existingUser?.role === "BANNED") {
        return false;
      }

      return true;
    },
  },
});
