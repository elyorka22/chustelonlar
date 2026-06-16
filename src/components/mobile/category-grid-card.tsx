"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryGridCardProps {
  label: string;
  subtitle: string;
  href: string;
  emoji: string;
  imageUrl?: string | null;
  variant?: "default" | "dark";
  className?: string;
}

export function CategoryGridCard({
  label,
  subtitle,
  href,
  emoji,
  imageUrl,
  variant = "default",
  className,
}: CategoryGridCardProps) {
  const isDark = variant === "dark";

  return (
    <motion.div whileTap={{ scale: 0.97 }}>
      <Link
        href={href}
        className={cn(
          "relative flex h-[108px] flex-col overflow-hidden rounded-[20px] p-3.5 card-shadow transition-shadow active:card-shadow-lg",
          isDark ? "bg-gray-900 text-white" : "bg-[#F4F4F5] text-gray-900",
          className
        )}
      >
        <div className="relative z-10">
          <p className={cn("text-[15px] font-bold leading-tight", isDark ? "text-white" : "text-gray-900")}>
            {label}
          </p>
          <p className={cn("mt-0.5 text-[12px] font-medium", isDark ? "text-white/65" : "text-gray-500")}>
            {subtitle}
          </p>
        </div>

        <div className="pointer-events-none absolute -bottom-2 -right-2 flex h-[80px] w-[80px] items-end justify-end overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover object-center drop-shadow-md"
            />
          ) : (
            <span className="pb-1 pr-1 text-[44px] leading-none drop-shadow-sm">{emoji}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
