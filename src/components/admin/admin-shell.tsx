"use client";

import { AdminBottomNavbar } from "./admin-bottom-navbar";

interface AdminShellProps {
  children: React.ReactNode;
  pendingCount?: number;
  notificationCount?: number;
}

export function AdminShell({
  children,
  pendingCount = 0,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-[calc(72px+env(safe-area-inset-bottom,0px))]">
      {children}
      <AdminBottomNavbar pendingCount={pendingCount} />
    </div>
  );
}
