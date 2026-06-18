import type { UserRole } from "@prisma/client";

export function isAdmin(role: UserRole | string | undefined): boolean {
  return role === "ADMIN";
}

export function isModerator(role: UserRole | string | undefined): boolean {
  return role === "MODERATOR";
}

export function isBusiness(role: UserRole | string | undefined): boolean {
  return role === "BUSINESS";
}

export function isBusinessOrAdmin(role: UserRole | string | undefined): boolean {
  return isAdmin(role) || isBusiness(role);
}

export function isStaff(role: UserRole | string | undefined): boolean {
  return isAdmin(role) || isModerator(role);
}

export const ADMIN_ONLY_ADMIN_PATHS = [
  "/admin/users",
  "/admin/settings",
  "/admin/monetization",
  "/admin/categories",
  "/admin/analytics",
] as const;
