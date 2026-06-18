"use client";

import { createContext, useContext } from "react";
import type { UserRole } from "@prisma/client";
import { isAdmin } from "@/lib/roles";

interface AdminStaffContextValue {
  role: UserRole;
  isAdmin: boolean;
}

const AdminStaffContext = createContext<AdminStaffContextValue | null>(null);

export function AdminStaffProvider({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  return (
    <AdminStaffContext.Provider value={{ role, isAdmin: isAdmin(role) }}>
      {children}
    </AdminStaffContext.Provider>
  );
}

export function useAdminStaff() {
  const value = useContext(AdminStaffContext);
  if (!value) {
    return { role: "USER" as UserRole, isAdmin: false };
  }
  return value;
}
