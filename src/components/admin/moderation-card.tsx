"use client";

import Link from "next/link";
import { Check, X, Eye, MapPin, Clock, Trash2 } from "lucide-react";
import { formatPrice, formatRelativeDate, cn } from "@/lib/utils";
import { AD_STATUS_LABELS, AD_STATUS_STYLES } from "@/lib/constants";
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
  status?: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

const actionBtn =
  "flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl text-[12px] font-bold touch-manipulation active:scale-[0.97] transition-transform disabled:pointer-events-none disabled:opacity-50";

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
  status = "PENDING",
  onApprove,
  onReject,
  onDelete,
  loading = false,
  categories = [],
}: ModerationCardProps) {
  const cat = findCategory(categories, category);
  const isPending = status === "PENDING";
  const statusLabel = AD_STATUS_LABELS[status] ?? status;
  const statusStyle = AD_STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
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
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-bold text-[#0F172A]">{title}</h3>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", statusStyle)}>
              {statusLabel}
            </span>
          </div>
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

      <div className="grid grid-cols-2 gap-2 border-t border-[#F1F5F9] p-3">
        {isPending && onApprove && (
          <button
            type="button"
            disabled={loading}
            onClick={() => onApprove(id)}
            className={cn(actionBtn, "bg-[#22C55E]/10 text-[#22C55E]")}
          >
            <Check className="h-4 w-4" />
            Tasdiq
          </button>
        )}
        {isPending && onReject && (
          <button
            type="button"
            disabled={loading}
            onClick={() => onReject(id)}
            className={cn(actionBtn, "bg-[#EF4444]/10 text-[#EF4444]")}
          >
            <X className="h-4 w-4" />
            Rad
          </button>
        )}
        <Link
          href={`/ads/${id}`}
          className={cn(
            actionBtn,
            "bg-[#F1F5F9] text-[#64748B]",
            !isPending && "col-span-1"
          )}
        >
          <Eye className="h-4 w-4" />
          Ko&apos;rish
        </Link>
        {onDelete && (
          <button
            type="button"
            disabled={loading}
            onClick={() => onDelete(id)}
            className={cn(actionBtn, "bg-[#EF4444]/10 text-[#EF4444]")}
          >
            <Trash2 className="h-4 w-4" />
            O&apos;chirish
          </button>
        )}
      </div>
    </div>
  );
}
