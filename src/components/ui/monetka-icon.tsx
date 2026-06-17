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
  const id = `monetka-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-md", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-gold`} x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="45%" stopColor="#FFB800" />
          <stop offset="100%" stopColor="#E68A00" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="100%" stopColor="#C97700" />
        </linearGradient>
        {showShine && (
          <linearGradient id={`${id}-shine`} x1="16" y1="12" x2="40" y2="36">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        )}
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${id}-rim)`} />
      <circle cx="32" cy="32" r="26" fill={`url(#${id}-gold)`} />
      <circle cx="32" cy="32" r="22" fill="none" stroke="#FFF8DC" strokeWidth="1.5" opacity="0.6" />
      {showShine && (
        <ellipse cx="24" cy="22" rx="14" ry="10" fill={`url(#${id}-shine)`} />
      )}
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontSize="26"
        fontWeight="800"
        fill="#7C4A00"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        M
      </text>
    </svg>
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
