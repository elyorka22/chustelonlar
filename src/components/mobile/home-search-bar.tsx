"use client";

import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { AdsFilterButton } from "@/components/mobile/ads-filter-sheet";
import { SearchBar } from "@/components/mobile/search-bar";
import type { CategoryData } from "@/types";

interface HomeSearchBarProps {
  categories: CategoryData[];
}

export function HomeSearchBar({ categories }: HomeSearchBarProps) {
  return (
    <div className="flex items-center gap-2.5">
      <AdsFilterButton categories={categories} initialFilters={{}} preserveSearch={false} />

      <SearchBar className="min-w-0 flex-1" action="/ads" />

      <PwaInstallButton />
    </div>
  );
}
