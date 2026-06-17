"use client";

import { useState, useTransition } from "react";
import { Crown, Flame, TrendingUp, Loader2 } from "lucide-react";
import { MonetkaIcon } from "@/components/ui/monetka-icon";
import { purchasePromotion } from "@/lib/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PromotionPanelProps {
  adId: string;
  costs: { top: number; vip: number; urgent: number };
  active: { isTop: boolean; isVip: boolean; isUrgent: boolean };
}

const PROMOS = [
  { type: "TOP" as const, label: "TOP", icon: TrendingUp, color: "from-blue-500 to-indigo-600" },
  { type: "VIP" as const, label: "VIP", icon: Crown, color: "from-amber-400 to-orange-500" },
  { type: "URGENT" as const, label: "Shoshilinch", icon: Flame, color: "from-red-500 to-rose-600" },
];

export function PromotionPanel({ adId, costs, active }: PromotionPanelProps) {
  const [pending, startTransition] = useTransition();
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const costMap = { TOP: costs.top, VIP: costs.vip, URGENT: costs.urgent };
  const activeMap = { TOP: active.isTop, VIP: active.isVip, URGENT: active.isUrgent };

  const handleBuy = (type: "TOP" | "VIP" | "URGENT") => {
    setLoadingType(type);
    startTransition(async () => {
      const result = await purchasePromotion(adId, type);
      setLoadingType(null);
      if (result.error) {
        if (result.code === "INSUFFICIENT_COINS") {
          toast.error("Monetka yetarli emas");
        } else {
          toast.error(result.error);
        }
        return;
      }
      toast.success("Reklama faollashtirildi!");
      window.location.reload();
    });
  };

  return (
    <div className="rounded-[18px] bg-white p-4 ring-1 ring-[#E2E8F0]">
      <p className="text-[13px] font-bold text-[#0F172A]">E&apos;lonni ko&apos;tarish</p>
      <p className="mt-0.5 text-[11px] text-[#64748B]">Monetka bilan reklama xizmatlari</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {PROMOS.map((promo) => {
          const Icon = promo.icon;
          const isActive = activeMap[promo.type];
          const cost = costMap[promo.type];
          const loading = pending && loadingType === promo.type;

          return (
            <button
              key={promo.type}
              type="button"
              disabled={pending || isActive}
              onClick={() => handleBuy(promo.type)}
              className={cn(
                "flex flex-col items-center rounded-2xl p-3 transition-all active:scale-95",
                isActive
                  ? "bg-emerald-50 ring-2 ring-emerald-400"
                  : "bg-[#F8FAFC] ring-1 ring-[#E2E8F0] hover:ring-primary/30"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                  promo.color
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <p className="mt-2 text-[11px] font-bold text-[#0F172A]">{promo.label}</p>
              {isActive ? (
                <p className="mt-0.5 text-[10px] font-bold text-emerald-600">Faol</p>
              ) : (
                <div className="mt-0.5 flex items-center gap-0.5">
                  <MonetkaIcon size={12} showShine={false} />
                  <span className="text-[10px] font-extrabold text-amber-800">{cost}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
