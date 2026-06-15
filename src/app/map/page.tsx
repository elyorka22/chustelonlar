"use client";

import { useEffect, useState } from "react";
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

export default function MapPage() {
  const [ads, setAds] = useState<MapAdMarker[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    async function fetchAds() {
      setLoading(true);
      const params = category ? `?category=${category}` : "";
      const res = await fetch(`/api/ads/map${params}`);
      const data = await res.json();
      setAds(data);
      setLoading(false);
    }
    fetchAds();
  }, [category]);

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
          onCategoryChange={setCategory}
        />
      )}
    </div>
  );
}
