"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { SearchBar } from "@/components/mobile/search-bar";
import { AdsFilterButton } from "@/components/mobile/ads-filter-sheet";
import { AdCardList } from "@/components/mobile/ad-card-list";
import { EmptyState } from "@/components/ads/ad-card";
import {
  buildAdsSearchParams,
  filtersFromRecord,
  SORT_OPTIONS,
  type AdsFilterValues,
} from "@/lib/ad-filters";
import { findCategory } from "@/lib/category-helpers";
import { X } from "lucide-react";
import type { AdWithImages, PaginatedResult, CategoryData } from "@/types";

interface AdsListingClientProps {
  result: PaginatedResult<AdWithImages>;
  params: Record<string, string | undefined>;
  categories: CategoryData[];
}

function ActiveFilterTags({
  filters,
  categories,
}: {
  filters: AdsFilterValues;
  categories: CategoryData[];
}) {
  const router = useRouter();
  const tags: { key: keyof AdsFilterValues; label: string }[] = [];

  if (filters.category) {
    const cat = findCategory(categories, filters.category);
    tags.push({ key: "category", label: cat?.shortLabel || filters.category });
  }
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? Number(filters.minPrice).toLocaleString("uz-UZ") : "0";
    const max = filters.maxPrice
      ? Number(filters.maxPrice).toLocaleString("uz-UZ")
      : "∞";
    tags.push({ key: "minPrice", label: `${min} – ${max} so'm` });
  }
  if (filters.district) {
    tags.push({ key: "district", label: filters.district });
  }
  if (filters.sort && filters.sort !== "newest") {
    const sortLabel = SORT_OPTIONS.find((s) => s.value === filters.sort)?.label;
    tags.push({ key: "sort", label: sortLabel || filters.sort });
  }

  if (tags.length === 0) return null;

  const removeFilter = (key: keyof AdsFilterValues) => {
    const next = { ...filters };
    if (key === "minPrice") {
      delete next.minPrice;
      delete next.maxPrice;
    } else {
      delete next[key];
    }
    if (key === "sort") next.sort = "newest";
    const qs = buildAdsSearchParams(next).toString();
    router.push(qs ? `/ads?${qs}` : "/ads");
  };

  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar">
      {tags.map((tag) => (
        <button
          key={tag.key}
          type="button"
          onClick={() => removeFilter(tag.key)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-[12px] font-semibold text-primary"
        >
          {tag.label}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}

export function AdsListingClient({ result, params, categories }: AdsListingClientProps) {
  const filters = filtersFromRecord(params);

  const pageUrl = (page: number) => {
    const next = buildAdsSearchParams({ ...filters, search: params.search });
    next.set("page", String(page));
    return `/ads?${next.toString()}`;
  };

  return (
    <div className="min-h-screen bg-secondary/40 md:bg-white">
      <MobileHeader title="E'lonlar" />

      <div className="flex items-center gap-2.5 px-4 pt-2 pb-2">
        <AdsFilterButton
          categories={categories}
          initialFilters={filters}
          preserveSearch
        />
        <SearchBar
          defaultValue={params.search || ""}
          placeholder="Qidirish..."
          filterParams={filters}
        />
      </div>

      <ActiveFilterTags filters={filters} categories={categories} />

      <div className="px-4 py-4">
        <p className="mb-3 text-[13px] font-medium text-gray-500">
          {result.total} ta e&apos;lon topildi
        </p>

        {result.data.length > 0 ? (
          <div className="space-y-3">
            {result.data.map((ad, i) => (
              <AdCardList key={ad.id} ad={ad} categories={categories} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="E'lonlar topilmadi"
            description="Boshqa filtrlarni sinab ko'ring"
            action={
              <Link
                href="/create"
                className="inline-flex h-[52px] items-center rounded-2xl bg-primary px-6 font-bold text-white"
              >
                E&apos;lon joylash
              </Link>
            }
          />
        )}

        {result.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            {result.page > 1 && (
              <Link
                href={pageUrl(result.page - 1)}
                className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold card-shadow"
              >
                ← Oldingi
              </Link>
            )}
            <span className="text-sm text-gray-500">
              {result.page} / {result.totalPages}
            </span>
            {result.page < result.totalPages && (
              <Link
                href={pageUrl(result.page + 1)}
                className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold card-shadow"
              >
                Keyingi →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
