import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function DesktopHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-white">
            CE
          </div>
          <span className="text-lg font-bold">{APP_NAME}</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/chegirmalar" className="text-sm font-medium text-gray-600 hover:text-primary">Chegirmalar</Link>
          <Link href="/map" className="text-sm font-medium text-gray-600 hover:text-primary">Xarita</Link>
          <Link href="/create" className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">E&apos;lon joylash</Link>
          <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary">Profil</Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary">Kirish</Link>
        </nav>
      </div>
    </header>
  );
}

export function DesktopFooter() {
  return (
    <footer className="mt-16 border-t border-gray-100 bg-secondary/50 py-12">
      <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-500">
        <nav className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/terms" className="font-medium text-gray-600 hover:text-primary">
            Foydalanish shartlari
          </Link>
          <Link href="/privacy" className="font-medium text-gray-600 hover:text-primary">
            Maxfiylik siyosati
          </Link>
        </nav>
        <p>
          © {new Date().getFullYear()} {APP_NAME}. Chust shahri e&apos;lonlar platformasi.
        </p>
      </div>
    </footer>
  );
}
