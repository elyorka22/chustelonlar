"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  transparent?: boolean;
}

export function MobileHeader({
  title,
  showBack = false,
  backHref = "/",
  transparent = false,
}: MobileHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 flex h-14 items-center justify-between px-4 md:hidden",
          transparent
            ? "bg-transparent"
            : "bg-white/95 backdrop-blur-md"
        )}
      >
        {showBack ? (
          <Link
            href={backHref}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary active:scale-95 transition-transform"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
        ) : (
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl active:scale-95 transition-transform"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
        )}

        {title ? (
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold">
            {title}
          </h1>
        ) : (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-xs font-extrabold text-white">
              CE
            </div>
            <span className="text-base font-bold tracking-tight">{APP_NAME}</span>
          </Link>
        )}

        <button
          className="flex h-10 w-10 items-center justify-center rounded-2xl active:scale-95 transition-transform"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white p-6 shadow-2xl md:hidden"
            >
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-extrabold text-white">
                  CE
                </div>
                <span className="text-lg font-bold">{APP_NAME}</span>
              </div>
              {[
                { href: "/", label: "Bosh sahifa" },
                { href: "/chegirmalar", label: "Chegirmalar" },
                { href: "/map", label: "Xarita" },
                { href: "/create", label: "E'lon joylash" },
                { href: "/dashboard", label: "Profil" },
                { href: "/login", label: "Kirish" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl px-4 py-3.5 text-[15px] font-medium text-gray-700 active:bg-secondary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
