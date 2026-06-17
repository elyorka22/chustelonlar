import { cn } from "@/lib/utils";

interface MonetkaIconProps {
  size?: number;
  className?: string;
  showShine?: boolean;
}

export function MonetkaIcon({
  size = 32,
  className,
  showShine = true,
}: MonetkaIconProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center leading-none select-none",
        showShine && "drop-shadow-[0_2px_8px_rgba(234,179,8,0.5)]",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.92),
        lineHeight: 1,
      }}
      role="img"
      aria-label="Monetka"
    >
      🪙
    </span>
  );
}

export function MonetkaBadge({
  balance,
  className,
}: {
  balance: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 px-2.5 py-1 ring-1 ring-amber-200/80",
        className
      )}
    >
      <MonetkaIcon size={18} showShine={false} />
      <span className="text-[13px] font-extrabold text-amber-900">{balance}</span>
    </div>
  );
}
