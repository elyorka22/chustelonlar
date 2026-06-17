"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Pencil,
  RefreshCw,
  Trash2,
  Crown,
  Flame,
  TrendingUp,
  Eye,
  Heart,
  Phone,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { MonetkaIcon } from "@/components/ui/monetka-icon";
import {
  removeAd,
  renewAdAction,
  toggleAdPausedAction,
  purchasePromotion,
} from "@/lib/actions";
import { formatPrice } from "@/lib/utils";
import { AD_STATUS_LABELS, AD_STATUS_STYLES } from "@/lib/constants";
import { isPromotionActive } from "@/lib/promotions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AdWithImages } from "@/types";

interface AdSettingsMobileProps {
  ad: AdWithImages;
  promotionCosts: { top: number; vip: number; urgent: number };
  renewCost: number;
  durations: { top: number; vip: number; urgent: number };
}

function shortAdId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}

const PROMO_ROWS = [
  {
    type: "TOP" as const,
    label: "TOP",
    desc: (days: number) => `E'loningizni tepaga chiqarish (${days} kun)`,
    icon: TrendingUp,
    iconBg: "bg-blue-500",
  },
  {
    type: "VIP" as const,
    label: "VIP",
    desc: (days: number) => `E'loningizni VIP qilish (${days} kun)`,
    icon: Crown,
    iconBg: "bg-amber-500",
  },
  {
    type: "URGENT" as const,
    label: "Shoshilinch",
    desc: (days: number) => `Qizil belgi qo'yish (${days} kun)`,
    icon: Flame,
    iconBg: "bg-red-500",
  },
];

export function AdSettingsMobile({
  ad,
  promotionCosts,
  renewCost,
  durations,
}: AdSettingsMobileProps) {
  const [paused, setPaused] = useState(ad.isPaused ?? false);
  const [pending, startTransition] = useTransition();
  const [promoLoading, setPromoLoading] = useState<string | null>(null);

  const isActive = ad.status === "APPROVED" && !paused;
  const costMap = { TOP: promotionCosts.top, VIP: promotionCosts.vip, URGENT: promotionCosts.urgent };
  const durationMap = { TOP: durations.top, VIP: durations.vip, URGENT: durations.urgent };
  const activeMap = {
    TOP: isPromotionActive(!!ad.isTop, ad.topUntil),
    VIP: isPromotionActive(!!ad.isVip, ad.vipUntil),
    URGENT: isPromotionActive(!!ad.isUrgent, ad.urgentUntil),
  };

  const handleToggle = (next: boolean) => {
    setPaused(next);
    startTransition(async () => {
      const result = await toggleAdPausedAction(ad.id, next);
      if (result.error) {
        setPaused(!next);
        toast.error(result.error);
        return;
      }
      toast.success(next ? "E'lon yashirildi" : "E'lon faollashtirildi");
    });
  };

  const handleRenew = () => {
    startTransition(async () => {
      const result = await renewAdAction(ad.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("E'lon yangilandi");
    });
  };

  const handleDelete = () => {
    if (!confirm("E'lonni o'chirmoqchimisiz?")) return;
    startTransition(async () => {
      const result = await removeAd(ad.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("O'chirildi");
      window.location.href = "/dashboard";
    });
  };

  const handlePromo = (type: "TOP" | "VIP" | "URGENT") => {
    setPromoLoading(type);
    startTransition(async () => {
      const result = await purchasePromotion(ad.id, type);
      setPromoLoading(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Xizmat faollashtirildi");
      window.location.reload();
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-8">
      <MobileHeader title="E'lon sozlamalari" showBack backHref="/dashboard" />

      <div className="space-y-4 px-4 pt-2">
        {/* Ad summary */}
        <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
          <div className="flex gap-3.5">
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl bg-[#F1F5F9]">
              {ad.images[0] ? (
                <Image src={ad.images[0].thumbUrl} alt="" fill className="object-cover" sizes="72px" />
              ) : (
                <div className="flex h-full items-center justify-center text-[#CBD5E1]">—</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="line-clamp-2 text-[16px] font-bold leading-snug text-[#0F172A]">
                  {ad.title}
                </h2>
                <button type="button" className="shrink-0 p-1 text-[#94A3B8]" aria-label="Menu">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-[18px] font-extrabold text-primary">
                {formatPrice(ad.price, ad.priceCurrency, ad.priceNegotiable)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[12px] font-medium text-[#64748B]">{shortAdId(ad.id)}</span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                    AD_STATUS_STYLES[ad.status]
                  )}
                >
                  {paused && ad.status === "APPROVED" ? "Yashirin" : AD_STATUS_LABELS[ad.status]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status toggle */}
        {ad.status === "APPROVED" && (
          <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
            <p className="text-[15px] font-extrabold text-[#0F172A]">E&apos;lon holati</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[14px] font-bold text-[#0F172A]">Faol</p>
                <p className="mt-0.5 text-[12px] text-[#64748B]">
                  {isActive
                    ? "E'lon hozir faol va boshqalarga ko'rinadi"
                    : "E'lon yashirilgan, boshqalarga ko'rinmaydi"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                disabled={pending}
                onClick={() => handleToggle(isActive)}
                className={cn(
                  "relative h-8 w-14 shrink-0 rounded-full transition-colors",
                  isActive ? "bg-emerald-500" : "bg-[#CBD5E1]"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform",
                    isActive ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>
          </div>
        )}

        {/* Manage */}
        <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
          <p className="px-4 pb-2 pt-4 text-[15px] font-extrabold text-[#0F172A]">
            E&apos;lonni boshqarish
          </p>
          <Link
            href={`/ads/${ad.id}`}
            className="flex items-center gap-3 border-t border-[#F1F5F9] px-4 py-3.5 active:bg-[#F8FAFC]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Pencil className="h-5 w-5 text-primary" />
            </div>
            <span className="flex-1 text-[14px] font-semibold text-[#0F172A]">
              E&apos;lon ma&apos;lumotlarini ko&apos;rish
            </span>
          </Link>
          <button
            type="button"
            disabled={pending}
            onClick={handleRenew}
            className="flex w-full items-center gap-3 border-t border-[#F1F5F9] px-4 py-3.5 active:bg-[#F8FAFC]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <RefreshCw className={cn("h-5 w-5 text-emerald-600", pending && "animate-spin")} />
            </div>
            <span className="flex-1 text-left text-[14px] font-semibold text-[#0F172A]">
              E&apos;lonni yangilash
            </span>
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1">
              <MonetkaIcon size={14} showShine={false} />
              <span className="text-[12px] font-extrabold text-amber-800">{renewCost}</span>
            </div>
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={handleDelete}
            className="flex w-full items-center gap-3 border-t border-[#F1F5F9] px-4 py-3.5 active:bg-red-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <span className="flex-1 text-left text-[14px] font-semibold text-red-600">
              E&apos;lonni o&apos;chirish
            </span>
          </button>
        </div>

        {/* Promotions */}
        {ad.status === "APPROVED" && (
          <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
            <p className="px-4 pb-2 pt-4 text-[15px] font-extrabold text-[#0F172A]">
              Monetka bilan xizmatlar
            </p>
            {PROMO_ROWS.map((row) => {
              const Icon = row.icon;
              const isPromoActive = activeMap[row.type];
              const loading = promoLoading === row.type;
              return (
                <button
                  key={row.type}
                  type="button"
                  disabled={pending || isPromoActive}
                  onClick={() => handlePromo(row.type)}
                  className="flex w-full items-center gap-3 border-t border-[#F1F5F9] px-4 py-3.5 text-left active:bg-[#F8FAFC] disabled:opacity-70"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl text-white",
                      row.iconBg
                    )}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-[#0F172A]">{row.label}</p>
                    <p className="text-[12px] text-[#64748B]">
                      {isPromoActive ? "Faol" : row.desc(durationMap[row.type])}
                    </p>
                  </div>
                  {!isPromoActive && (
                    <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1">
                      <MonetkaIcon size={14} showShine={false} />
                      <span className="text-[13px] font-extrabold text-amber-800">
                        {costMap[row.type]}
                      </span>
                    </div>
                  )}
                  {isPromoActive && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                      Faol
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
          <p className="text-[15px] font-extrabold text-[#0F172A]">Statistika</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Ko'rishlar", value: ad.views, icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
              {
                label: "Sevimli",
                value: ad._count?.favorites ?? 0,
                icon: Heart,
                color: "text-red-500",
                bg: "bg-red-50",
              },
              {
                label: "Bog'lanishlar",
                value: ad.contactClicks ?? 0,
                icon: Phone,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={cn("rounded-2xl px-2 py-3 text-center", stat.bg)}>
                  <Icon className={cn("mx-auto h-5 w-5", stat.color)} />
                  <p className="mt-1.5 text-[20px] font-extrabold text-[#0F172A]">{stat.value}</p>
                  <p className="text-[10px] font-semibold text-[#64748B]">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
