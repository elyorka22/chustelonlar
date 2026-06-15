"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Map, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Bosh sahifa", icon: Home },
  { href: "/ads", label: "E'lonlar", icon: LayoutGrid },
  { href: "/create", label: "", icon: Plus, center: true },
  { href: "/map", label: "Xarita", icon: Map },
  { href: "/dashboard", label: "Profil", icon: User },
];

export function BottomNavbar() {
  const pathname = usePathname();

  const hiddenOn = ["/login", "/register"];
  const isAdDetail = /^\/ads\/[^/]+$/.test(pathname);
  const isAdmin = pathname.startsWith("/admin");
  if (hiddenOn.some((p) => pathname.startsWith(p)) || isAdDetail || isAdmin) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-auto max-w-lg border-t border-gray-100 bg-white/95 px-2 pb-[env(safe-area-inset-bottom,8px)] pt-2 backdrop-blur-lg">
        <div className="relative flex items-end justify-around">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            if (item.center) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -top-5 flex flex-col items-center"
                >
                  <motion.div
                    whileTap={{ scale: 0.92 }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30"
                  >
                    <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center gap-0.5 py-1"
              >
                <Icon
                  className={cn(
                    "h-6 w-6 transition-colors duration-200",
                    isActive ? "text-primary" : "text-gray-400"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    isActive ? "text-primary" : "text-gray-400"
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
