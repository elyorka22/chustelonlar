"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  emoji: string;
  label: string;
  href: string;
  iconBg: string;
  imageUrl?: string | null;
  className?: string;
}

export function CategoryCard({
  emoji,
  label,
  href,
  iconBg,
  imageUrl,
  className,
}: CategoryCardProps) {
  return (
    <motion.div whileTap={{ scale: 0.96 }}>
      <Link
        href={href}
        className={cn(
          "flex flex-col items-center gap-2 rounded-[20px] bg-white p-4 card-shadow transition-shadow duration-200 active:card-shadow-lg",
          className
        )}
      >
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl text-2xl",
            iconBg
          )}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            emoji
          )}
        </div>
        <span className="text-center text-xs font-semibold text-gray-800 leading-tight">
          {label}
        </span>
      </Link>
    </motion.div>
  );
}
