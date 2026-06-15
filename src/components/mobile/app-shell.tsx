"use client";

import { BottomNavbar } from "./bottom-navbar";

interface AppShellProps {
  children: React.ReactNode;
  noPadding?: boolean;
  hideNav?: boolean;
}

export function AppShell({ children, noPadding = false, hideNav = false }: AppShellProps) {
  return (
    <>
      <div className={noPadding ? "" : "pb-safe md:pb-0"}>
        {children}
      </div>
      {!hideNav && <BottomNavbar />}
    </>
  );
}
