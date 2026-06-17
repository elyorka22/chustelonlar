"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Eye, MapPin, Clock } from "lucide-react";
import { formatPrice, formatRelativeDate } from "@/lib/utils";
import type { CategoryData } from "@/types";
import { findCategory } from "@/lib/category-helpers";
import { CategoryEmoji } from "@/components/ui/category-emoji";

interface ModerationCardProps {
  id: string;
  title: string;
  price: number;
  priceCurrency: "UZS" | "USD";
  priceNegotiable: boolean;
  category: string;
  categories?: CategoryData[];
  district: string;
  createdAt: Date;
  thumbUrl?: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loading?: boolean;
  index?: number;
}

export function ModerationCard({
  id,
  title,
  price,
  priceCurrency,
  priceNegotiable,
  category,
  district,
  createdAt,
  thumbUrl,
  onApprove,
  onReject,
  loading = false,
  categories = [],
  index = 0,
}: ModerationCardProps) {
  const cat = findCategory(categories, category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)]"
    >
      <div className="flex gap-3 p-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F1F5F9]">
          {thumbUrl ? (
            <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <CategoryEmoji emoji={cat?.emoji || "📦"} size={32} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-[#0F172A]">{title}</h3>
          <p className="mt-0.5 text-base font-extrabold text-primary">
            {formatPrice(price, priceCurrency, priceNegotiable)}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-[#64748B]">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{district}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-[#94A3B8]">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeDate(createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-[#F1F5F9] p-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          onClick={() => onApprove(id)}
          className="flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-[#22C55E]/10 text-sm font-bold text-[#22C55E] disabled:opacity-50"
        >
          <Check className="h-5 w-5" />
          Tasdiq
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          onClick={() => onReject(id)}
          className="flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-[#EF4444]/10 text-sm font-bold text-[#EF4444] disabled:opacity-50"
        >
          <X className="h-5 w-5" />
          Rad
        </motion.button>
        <Link href={`/ads/${id}`}>
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-[#F1F5F9] text-sm font-bold text-[#64748B]"
          >
            <Eye className="h-5 w-5" />
            Ko&apos;rish
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
