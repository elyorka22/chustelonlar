"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Map,
  Plus,
  LayoutDashboard,
  Shield,
  Sun,
  Moon,
  Search,
} from "lucide-react";
import { useState } from "react";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/stores";
import { cn } from "@/lib/utils";
import { CategoryEmoji } from "@/components/ui/category-emoji";

const navLinks = [
  { href: "/ads", label: "E'lonlar" },
  { href: "/map", label: "Xarita" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-md shadow-primary/30">
            CE
          </div>
          <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {session ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/create">
                  <Plus className="h-4 w-4" />
                  E&apos;lon joylash
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Kabinet
                </Link>
              </Button>
              {session.user.role === "ADMIN" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Chiqish
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Kirish</Link>
            </Button>
          )}
        </div>

        <button
          className="rounded-xl p-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 px-4 py-4 md:hidden dark:border-gray-800">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/create" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100">
                  E&apos;lon joylash
                </Link>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-100">
                  Kabinet
                </Link>
                <button onClick={() => signOut()} className="rounded-xl px-4 py-3 text-left text-sm font-medium text-red-500">
                  Chiqish
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-white">
                Kirish
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold">{APP_NAME}</h3>
            <p className="mt-2 text-sm text-gray-500">
              Chust shahri uchun zamonaviy e&apos;lonlar platformasi
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Sahifalar</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/ads" className="hover:text-primary">E&apos;lonlar</Link></li>
              <li><Link href="/map" className="hover:text-primary">Xarita</Link></li>
              <li><Link href="/create" className="hover:text-primary">E&apos;lon joylash</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Kategoriyalar</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2"><CategoryEmoji emoji="🚙" size={16} /> Avtomobillar</li>
              <li className="flex items-center gap-2"><CategoryEmoji emoji="🏡" size={16} /> Ko&apos;chmas mulk</li>
              <li className="flex items-center gap-2"><CategoryEmoji emoji="📦" size={16} /> Sotiladigan buyumlar</li>
              <li className="flex items-center gap-2"><CategoryEmoji emoji="📮" size={16} /> Boshqa e&apos;lonlar</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-400 dark:border-gray-800">
          © {new Date().getFullYear()} {APP_NAME}. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}

export function SearchBar({
  defaultValue = "",
  className,
}: {
  defaultValue?: string;
  className?: string;
}) {
  return (
    <form action="/ads" method="GET" className={cn("relative", className)}>
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        name="search"
        type="text"
        defaultValue={defaultValue}
        placeholder="Nima qidiryapsiz?"
        className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 text-sm shadow-sm transition-shadow focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-700 dark:bg-gray-900"
      />
    </form>
  );
}
