"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DISTRICTS } from "@/lib/constants";
import {
  type AdsFilterValues,
  SORT_OPTIONS,
  buildAdsSearchParams,
  countActiveFilters,
} from "@/lib/ad-filters";
import { cn } from "@/lib/utils";
import type { CategoryData } from "@/types";

interface AdsFilterSheetProps {
  open: boolean;
  onClose: () => void;
  categories: CategoryData[];
  initialFilters: AdsFilterValues;
  /** Keep search query when applying filters */
  preserveSearch?: boolean;
}

const emptyFilters: AdsFilterValues = {
  category: "",
  minPrice: "",
  maxPrice: "",
  district: "",
  sort: "newest",
};

export function AdsFilterSheet({
  open,
  onClose,
  categories,
  initialFilters,
  preserveSearch = true,
}: AdsFilterSheetProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<AdsFilterValues>(initialFilters);

  useEffect(() => {
    if (open) {
      setDraft(initialFilters);
    }
  }, [open, initialFilters]);

  const handleApply = () => {
    const filters: AdsFilterValues = {
      ...draft,
      search: preserveSearch ? initialFilters.search : draft.search,
    };
    const params = buildAdsSearchParams(filters);
    router.push(`/ads?${params.toString()}`);
    onClose();
  };

  const handleClear = () => {
    const filters: AdsFilterValues = {
      ...emptyFilters,
      search: preserveSearch ? initialFilters.search : "",
    };
    const params = buildAdsSearchParams(filters);
    router.push(params.toString() ? `/ads?${params.toString()}` : "/ads");
    onClose();
  };

  const inputClass =
    "h-12 w-full rounded-2xl bg-[#F4F6FA] px-4 text-[14px] font-medium outline-none ring-1 ring-[#E2E8F0] focus:ring-2 focus:ring-primary/20";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[81] max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-white px-4 pb-8 pt-3 shadow-2xl"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#E2E8F0]" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold text-[#0F172A]">Filtrlar</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F6FA]"
                aria-label="Yopish"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Category */}
              <div>
                <label className="mb-2 block text-[13px] font-bold text-[#64748B]">
                  Kategoriya
                </label>
                <select
                  value={draft.category || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Barchasi</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-[13px] font-bold text-[#64748B]">Narx</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={draft.minPrice || ""}
                    onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value }))}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Max"
                    value={draft.maxPrice || ""}
                    onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* District */}
              <div>
                <label className="mb-2 block text-[13px] font-bold text-[#64748B]">
                  Joylashuv
                </label>
                <select
                  value={draft.district || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, district: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Barchasi</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="mb-2 block text-[13px] font-bold text-[#64748B]">
                  Saralash
                </label>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => {
                    const active = (draft.sort || "newest") === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, sort: opt.value }))}
                        className={cn(
                          "rounded-full px-4 py-2 text-[13px] font-semibold transition-all",
                          active
                            ? "bg-primary text-white shadow-md shadow-primary/25"
                            : "bg-[#F4F6FA] text-[#64748B]"
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="h-[52px] flex-1 rounded-2xl bg-[#F4F6FA] text-[14px] font-bold text-[#64748B]"
              >
                Tozalash
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="h-[52px] flex-1 rounded-2xl bg-primary text-[14px] font-bold text-white shadow-lg shadow-primary/25"
              >
                Qo&apos;llash
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface AdsFilterButtonProps {
  categories: CategoryData[];
  initialFilters: AdsFilterValues;
  preserveSearch?: boolean;
  className?: string;
}

export function AdsFilterButton({
  categories,
  initialFilters,
  preserveSearch = true,
  className,
}: AdsFilterButtonProps) {
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(initialFilters);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-secondary active:scale-95 transition-transform",
          activeCount > 0 && "ring-2 ring-primary/30 bg-primary/5",
          className
        )}
        aria-label="Filtrlar"
      >
        <SlidersHorizontal
          className={cn("h-5 w-5", activeCount > 0 ? "text-primary" : "text-gray-700")}
          strokeWidth={2.2}
        />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>
      <AdsFilterSheet
        open={open}
        onClose={() => setOpen(false)}
        categories={categories}
        initialFilters={initialFilters}
        preserveSearch={preserveSearch}
      />
    </>
  );
}
