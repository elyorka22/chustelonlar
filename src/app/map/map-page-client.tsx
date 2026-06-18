"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MobileHeader } from "@/components/mobile/mobile-header";
import type { CategoryData, MapAdMarker } from "@/types";

const MobileMapView = dynamic(
  () => import("@/components/mobile/mobile-map-view").then((m) => m.MobileMapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    ),
  }
);

interface MapPageClientProps {
  initialAds: MapAdMarker[];
  initialCategories: CategoryData[];
}

async function fetchMapAds(category: string): Promise<MapAdMarker[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await fetch(`/api/ads/map${params}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function MapPageClient({ initialAds, initialCategories }: MapPageClientProps) {
  const [ads, setAds] = useState(initialAds);
  const [categories] = useState(initialCategories);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const loadMapAds = useCallback(async (nextCategory: string) => {
    setLoading(true);
    try {
      const freshAds = await fetchMapAds(nextCategory);
      setAds(freshAds);
    } catch {
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMapAds("");
  }, [loadMapAds]);

  const handleCategoryChange = useCallback(
    async (next: string) => {
      setCategory(next);
      await loadMapAds(next);
    },
    [loadMapAds]
  );

  return (
    <div className="bg-white">
      <MobileHeader title="Xarita" />
      {loading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
        </div>
      ) : (
        <MobileMapView
          ads={ads}
          category={category}
          categories={categories}
          onCategoryChange={handleCategoryChange}
        />
      )}
    </div>
  );
}
