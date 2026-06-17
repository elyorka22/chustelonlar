"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { SearchBar } from "@/components/mobile/search-bar";
import { FilterChips } from "@/components/mobile/filter-chips";
import { AdCardList } from "@/components/mobile/ad-card-list";
import { EmptyState } from "@/components/ads/ad-card";
import type { AdWithImages, PaginatedResult, CategoryData } from "@/types";
import Link from "next/link";

const filterChips = [
  { label: "Kategoriya", value: "category" },
  { label: "Narx", value: "price" },
  { label: "Joylashuv", value: "location" },
  { label: "Saralash", value: "sort" },
];

interface AdsListingClientProps {
  result: PaginatedResult<AdWithImages>;
  params: Record<string, string | undefined>;
  categories: CategoryData[];
}

export function AdsListingClient({ result, params, categories }: AdsListingClientProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("");

  return (
    <div className="min-h-screen bg-secondary/40 md:bg-white">
      <MobileHeader title="E'lonlar" />

      <div className="px-4 pt-2 pb-3">
        <SearchBar
          defaultValue={params.search || ""}
          placeholder="Qidirish..."
        />
      </div>

      <FilterChips
        chips={filterChips}
        active={activeFilter}
        onChange={setActiveFilter}
      />

      {activeFilter === "sort" && (
        <div className="flex gap-2 px-4 py-2">
          {[
            { label: "Eng yangi", value: "newest" },
            { label: "Mashhur", value: "popular" },
            { label: "Arzon", value: "price_asc" },
            { label: "Qimmat", value: "price_desc" },
          ].map((s) => {
            const nextParams = new URLSearchParams();
            for (const [key, value] of Object.entries(params)) {
              if (value && key !== "page" && key !== "sort") {
                nextParams.set(key, value);
              }
            }
            if (s.value !== "newest") {
              nextParams.set("sort", s.value);
            }

            return (
              <button
                key={s.value}
                onClick={() => router.push(`/ads?${nextParams.toString()}`)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                  (params.sort || "newest") === s.value
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      )}

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
                href={`/ads?${new URLSearchParams({ ...params, page: String(result.page - 1) } as Record<string, string>).toString()}`}
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
                href={`/ads?${new URLSearchParams({ ...params, page: String(result.page + 1) } as Record<string, string>).toString()}`}
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
