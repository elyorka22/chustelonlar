"use client";

import Link from "next/link";
import { SlidersHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    router.push(`/ads?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2.5">
      <Link
        href="/ads"
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-secondary active:scale-95 transition-transform"
        aria-label="Filtrlar"
      >
        <SlidersHorizontal className="h-5 w-5 text-gray-700" strokeWidth={2.2} />
      </Link>

      <form onSubmit={handleSubmit} className="relative min-w-0 flex-1">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Qidirish..."
          className="h-[52px] w-full rounded-2xl bg-secondary px-4 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/20"
        />
      </form>

      <Link
        href="/create"
        className="flex h-[52px] shrink-0 items-center gap-1.5 rounded-2xl bg-gray-900 px-4 text-[14px] font-bold text-white active:scale-95 transition-transform"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        E&apos;lon
      </Link>
    </div>
  );
}
