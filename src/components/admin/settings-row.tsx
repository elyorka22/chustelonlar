"use client";

import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export function SettingsRow({
  icon: Icon,
  title,
  subtitle,
  href,
  onClick,
  danger = false,
  disabled = false,
}: SettingsRowProps) {
  const inner = (
  <>
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          danger ? "bg-[#EF4444]/10" : "bg-[#F1F5F9]"
        )}
      >
        <Icon className={cn("h-[18px] w-[18px]", danger ? "text-[#EF4444]" : "text-[#64748B]")} />
      </div>
      <div className="flex-1">
        <p className={cn("text-sm font-semibold", danger ? "text-[#EF4444]" : "text-[#0F172A]")}>
          {title}
        </p>
        {subtitle && <p className="text-xs text-[#94A3B8]">{subtitle}</p>}
      </div>
      {!disabled && <ChevronRight className="h-4 w-4 text-[#CBD5E1]" />}
    </>
  );

  const rowClass =
    "flex w-full items-center gap-3 border-b border-[#F1F5F9] px-4 py-3.5 text-left last:border-0 active:scale-[0.99] transition-transform";

  if (href && !disabled) {
    return (
      <Link href={href} className={cn(rowClass, "block")}>
        {inner}
      </Link>
    );
  }

  if (onClick && !disabled) {
    return (
      <button type="button" onClick={onClick} className={rowClass}>
        {inner}
      </button>
    );
  }

  return (
    <div className={cn(rowClass, "cursor-default opacity-55")} aria-disabled>
      {inner}
    </div>
  );
}
