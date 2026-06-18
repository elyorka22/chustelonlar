"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { Plus, List, Map } from "lucide-react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { FilterChips } from "@/components/mobile/filter-chips";
import { ChegirmaCard } from "@/components/mobile/chegirma-card";
import { EmptyState } from "@/components/ads/ad-card";
import { CHEGIRMA_CATEGORIES } from "@/lib/chegirma-constants";
import { isBusinessOrAdmin } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { ChegirmaData, MapChegirmaMarker } from "@/types";

const ChegirmaMapView = dynamic(
  () =>
    import("@/components/mobile/chegirma-map-view").then((m) => m.ChegirmaMapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    ),
  }
);

interface ChegirmalarClientProps {
  initialItems: ChegirmaData[];
  initialMapItems: MapChegirmaMarker[];
}

export function ChegirmalarClient({
  initialItems,
  initialMapItems,
}: ChegirmalarClientProps) {
  const [view, setView] = useState<"list" | "map">("list");
  const [items, setItems] = useState(initialItems);
  const [mapItems, setMapItems] = useState(initialMapItems);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const canCreateAksiya = session?.user && isBusinessOrAdmin(session.user.role);
  const createHref = !session?.user
    ? "/login?callbackUrl=/chegirmalar/create"
    : canCreateAksiya
      ? "/chegirmalar/create"
      : "/dashboard?business=required";

  const categoryChips = [
    { label: "Barchasi", value: "" },
    ...CHEGIRMA_CATEGORIES.map((c) => ({ label: c.label, value: c.value })),
  ];

  const fetchData = useCallback(async (nextCategory: string) => {
    setLoading(true);
    try {
      const params = nextCategory ? `?category=${nextCategory}` : "";
      const [listRes, mapRes] = await Promise.all([
        fetch(`/api/chegirmalar${params}`),
        fetch(`/api/chegirmalar/map${params}`),
      ]);
      const listData = listRes.ok ? await listRes.json() : [];
      const mapData = mapRes.ok ? await mapRes.json() : [];
      setItems(Array.isArray(listData) ? listData : []);
      setMapItems(Array.isArray(mapData) ? mapData : []);
    } catch {
      setItems([]);
      setMapItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCategoryChange = (next: string) => {
    setCategory(next);
    void fetchData(next);
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <MobileHeader title="Chegirmalar" />

      <div className="flex items-center justify-between gap-2 px-4 pt-2">
        <div className="flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition-colors",
              view === "list" ? "bg-primary text-white" : "text-gray-500"
            )}
          >
            <List className="h-4 w-4" />
            Ro&apos;yxat
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition-colors",
              view === "map" ? "bg-primary text-white" : "text-gray-500"
            )}
          >
            <Map className="h-4 w-4" />
            Xarita
          </button>
        </div>

        <Link
          href={createHref}
          className={cn(
            "flex h-10 items-center gap-1.5 rounded-2xl px-4 text-[12px] font-bold text-white shadow-md",
            canCreateAksiya || !session?.user
              ? "bg-primary shadow-primary/25"
              : "bg-amber-500 shadow-amber-500/25"
          )}
        >
          <Plus className="h-4 w-4" />
          {canCreateAksiya ? "Aksiya" : session?.user ? "Biznes" : "Aksiya"}
        </Link>
      </div>

      {view === "list" && (
        <div className="pt-2">
          <FilterChips
            chips={categoryChips}
            active={category}
            onChange={handleCategoryChange}
          />
        </div>
      )}

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
        </div>
      ) : view === "map" ? (
        <ChegirmaMapView
          items={mapItems}
          category={category}
          onCategoryChange={handleCategoryChange}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Hozircha aksiyalar yo'q"
          description="Birinchi bo'lib do'koningiz uchun aksiya joylashtiring"
        />
      ) : (
        <div className="grid gap-3 px-4 py-3 pb-6">
          {items.map((item, i) => (
            <ChegirmaCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
