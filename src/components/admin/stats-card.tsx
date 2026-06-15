"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  growth?: number;
  iconBg?: string;
  iconColor?: string;
  index?: number;
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  growth = 0,
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
  index = 0,
}: StatsCardProps) {
  const isPositive = growth >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-[20px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]"
    >
      <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-2xl", iconBg)}>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>
      <p className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
        {typeof value === "number" ? value.toLocaleString("uz-UZ") : value}
      </p>
      <p className="mt-0.5 text-xs font-medium text-[#64748B]">{label}</p>
      {growth !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-[#22C55E]" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-[#EF4444]" />
          )}
          <span
            className={cn(
              "text-xs font-semibold",
              isPositive ? "text-[#22C55E]" : "text-[#EF4444]"
            )}
          >
            {isPositive ? "+" : ""}
            {growth}%
          </span>
        </div>
      )}
    </motion.div>
  );
}
