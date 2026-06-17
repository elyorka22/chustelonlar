import { cn } from "@/lib/utils";
import { isPromotionActive } from "@/lib/promotions";

interface AdPromotionBadgesProps {
  isTop?: boolean;
  topUntil?: Date | null;
  isVip?: boolean;
  vipUntil?: Date | null;
  isUrgent?: boolean;
  urgentUntil?: Date | null;
  className?: string;
}

export function AdPromotionBadges({
  isTop,
  topUntil,
  isVip,
  vipUntil,
  isUrgent,
  urgentUntil,
  className,
}: AdPromotionBadgesProps) {
  const showTop = isPromotionActive(!!isTop, topUntil);
  const showVip = isPromotionActive(!!isVip, vipUntil);
  const showUrgent = isPromotionActive(!!isUrgent, urgentUntil);

  if (!showTop && !showVip && !showUrgent) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {showTop && (
        <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
          TOP
        </span>
      )}
      {showVip && (
        <span className="rounded-md bg-gradient-to-r from-amber-400 to-orange-500 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
          VIP
        </span>
      )}
      {showUrgent && (
        <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
          Shoshilinch
        </span>
      )}
    </div>
  );
}

export function getVipCardClass(isVip?: boolean, vipUntil?: Date | null): string {
  if (!isPromotionActive(!!isVip, vipUntil)) return "";
  return "ring-2 ring-amber-400/80 shadow-[0_4px_20px_rgba(251,191,36,0.25)]";
}
