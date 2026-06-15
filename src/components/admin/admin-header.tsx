"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Bell,
  X,
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  MessageSquareWarning,
  Settings,
  Tags,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ads", label: "E'lonlar", icon: FileText },
  { href: "/admin/categories", label: "Kategoriyalar", icon: Tags },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
  { href: "/admin/analytics", label: "Statistika", icon: BarChart3 },
  { href: "/admin/reports", label: "Xabarlar", icon: MessageSquareWarning },
  { href: "/admin/settings", label: "Sozlamalar", icon: Settings },
];

interface AdminHeaderProps {
  notificationCount?: number;
}

export function AdminHeader({ notificationCount = 0 }: AdminHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-[#F8FAFC]/90 px-4 backdrop-blur-lg">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm"
          aria-label="Menyu"
        >
          <Menu className="h-5 w-5 text-[#0F172A]" />
        </button>

        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-white">
            CE
          </div>
          <span className="text-sm font-bold text-[#0F172A]">Chust E&apos;lon</span>
        </Link>

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm"
          aria-label="Bildirishnomalar"
        >
          <Bell className="h-5 w-5 text-[#0F172A]" />
          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#F1F5F9] px-4 py-4">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">Admin panel</p>
                  <p className="text-lg font-extrabold text-[#0F172A]">Chust E&apos;lon</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8FAFC]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3">
                {menuItems.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors duration-200",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-[#0F172A] hover:bg-[#F8FAFC]"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1 text-sm font-semibold">{item.label}</span>
                      <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-[#F1F5F9] p-4">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center rounded-2xl bg-[#F8FAFC] py-3 text-sm font-semibold text-[#64748B]"
                >
                  Saytga qaytish
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
