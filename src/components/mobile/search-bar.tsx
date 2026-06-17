"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { buildAdsSearchParams, type AdsFilterValues } from "@/lib/ad-filters";

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  action?: string;
  className?: string;
  onSearch?: (query: string) => void;
  /** Preserve filter params from URL when searching */
  filterParams?: AdsFilterValues;
}

export function SearchBar({
  placeholder = "Qidirish...",
  defaultValue = "",
  action = "/ads",
  className,
  onSearch,
  filterParams = {},
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
      return;
    }
    const params = buildAdsSearchParams({
      ...filterParams,
      search: query.trim() || undefined,
    });
    const qs = params.toString();
    router.push(qs ? `${action}?${qs}` : action);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative min-w-0 flex-1", className)}>
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-[52px] w-full rounded-2xl bg-secondary pl-12 pr-4 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
      />
    </form>
  );
}
