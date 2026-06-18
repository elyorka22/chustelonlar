"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { AdminHeader } from "./admin-header";
import { ModerationCard } from "./moderation-card";
import { FilterChips } from "@/components/mobile/filter-chips";
import { moderateAd } from "@/lib/actions";
import { useAsyncAction } from "@/lib/use-async-action";
import type { CategoryData } from "@/types";

interface PendingAd {
  id: string;
  title: string;
  price: number;
  priceCurrency: "UZS" | "USD";
  priceNegotiable: boolean;
  category: string;
  district: string;
  createdAt: Date;
  images: { thumbUrl: string }[];
}

interface AdminAdsClientProps {
  pendingAds: PendingAd[];
  categories: CategoryData[];
  notificationCount: number;
}

export function AdminAdsClient({
  pendingAds,
  categories,
  notificationCount,
}: AdminAdsClientProps) {
  const categoryChips = [
    { label: "Barchasi", value: "" },
    ...categories.map((c) => ({ label: c.shortLabel, value: c.slug })),
  ];
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const { run, isLoading } = useAsyncAction();

  const filtered = useMemo(() => {
    return pendingAds.filter((ad) => {
      if (category && ad.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          ad.title.toLowerCase().includes(q) ||
          ad.district.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [pendingAds, category, search]);

  const handleModerate = (adId: string, action: "approve" | "reject") => {
    run(
      `ad-${adId}`,
      () => moderateAd(adId, action),
      {
        successMessage: action === "approve" ? "Tasdiqlandi ✓" : "Rad etildi",
        reload: true,
      }
    );
  };

  return (
    <>
      <AdminHeader notificationCount={notificationCount} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="px-4 pb-4"
      >
        <h1 className="pt-2 text-xl font-extrabold text-[#0F172A]">
          Pending e&apos;lonlar
        </h1>
        <p className="mt-0.5 text-sm text-[#64748B]">
          {filtered.length} ta kutilmoqda
        </p>

        <div className="mt-4 -mx-4">
          <FilterChips chips={categoryChips} active={category} onChange={setCategory} />
        </div>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-2xl border-0 bg-white pl-10 pr-4 text-sm shadow-sm outline-none ring-1 ring-[#E2E8F0] focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-[20px] bg-white py-16 text-center shadow-sm">
              <p className="text-4xl">✅</p>
              <p className="mt-2 font-semibold text-[#0F172A]">Hammasi tayyor!</p>
              <p className="text-sm text-[#64748B]">Kutilayotgan e&apos;lonlar yo&apos;q</p>
            </div>
          ) : (
            filtered.map((ad) => (
              <ModerationCard
                key={ad.id}
                id={ad.id}
                title={ad.title}
                price={ad.price}
                priceCurrency={ad.priceCurrency}
                priceNegotiable={ad.priceNegotiable}
                category={ad.category}
                district={ad.district}
                createdAt={ad.createdAt}
                thumbUrl={ad.images[0]?.thumbUrl}
                onApprove={(id) => handleModerate(id, "approve")}
                onReject={(id) => handleModerate(id, "reject")}
                loading={isLoading(`ad-${ad.id}`)}
                categories={categories}
              />
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}
