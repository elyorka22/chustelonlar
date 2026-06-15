"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, type LucideIcon } from "lucide-react";

interface SettingsRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
  index?: number;
}

export function SettingsRow({
  icon: Icon,
  title,
  subtitle,
  href,
  onClick,
  danger = false,
  index = 0,
}: SettingsRowProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 px-4 py-3.5"
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          danger ? "bg-[#EF4444]/10" : "bg-[#F1F5F9]"
        }`}
      >
        <Icon className={`h-[18px] w-[18px] ${danger ? "text-[#EF4444]" : "text-[#64748B]"}`} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${danger ? "text-[#EF4444]" : "text-[#0F172A]"}`}>
          {title}
        </p>
        {subtitle && <p className="text-xs text-[#94A3B8]">{subtitle}</p>}
      </div>
      <ChevronRight className="h-4 w-4 text-[#CBD5E1]" />
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block border-b border-[#F1F5F9] last:border-0">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full border-b border-[#F1F5F9] text-left last:border-0"
    >
      {content}
    </button>
  );
}
