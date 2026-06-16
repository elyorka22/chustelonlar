"use client";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-[env(safe-area-inset-bottom,16px)]">
      {children}
    </div>
  );
}
