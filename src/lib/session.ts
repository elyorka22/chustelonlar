import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import type { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getCurrentUserProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await getPrisma().user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      password: true,
    },
  });

  if (!user) return null;

  const { password, ...profile } = user;
  return { ...profile, hasPassword: !!password };
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return getPrisma().user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role === "BANNED") {
    redirect("/login?error=banned");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}

export function hasRole(role: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(role);
}
