"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Plus,
  MessageSquareWarning,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/ads", label: "E'lonlar", icon: FileText },
  { href: "/admin/ads", label: "", icon: Plus, center: true },
  { href: "/admin/reports", label: "Xabarlar", icon: MessageSquareWarning },
  { href: "/admin/settings", label: "Sozlamalar", icon: Settings },
];

interface AdminBottomNavbarProps {
  pendingCount?: number;
}

export function AdminBottomNavbar({ pendingCount = 0 }: AdminBottomNavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:max-w-lg md:mx-auto">
      <div className="border-t border-[#E2E8F0]/80 bg-white/95 px-2 pb-[env(safe-area-inset-bottom,8px)] pt-2 backdrop-blur-xl">
        <div className="relative flex items-end justify-around">
          {navItems.map((item, idx) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && !item.center;
            const Icon = item.icon;

            if (item.center) {
              return (
                <Link
                  key={`fab-${idx}`}
                  href="/admin/ads"
                  className="relative -top-5 flex flex-col items-center"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative flex h-[58px] w-[58px] items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/35"
                  >
                    <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
                    {pendingCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white ring-2 ring-white">
                        {pendingCount > 9 ? "9+" : pendingCount}
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="flex flex-1 flex-col items-center gap-0.5 py-1"
              >
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-colors duration-200",
                    isActive ? "text-primary" : "text-[#94A3B8]"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold transition-colors duration-200",
                    isActive ? "text-primary" : "text-[#94A3B8]"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
