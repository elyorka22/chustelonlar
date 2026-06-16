"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import type { AdWithImages, CategoryData } from "@/types";
import { findCategory } from "@/lib/category-helpers";

interface AdCardHorizontalProps {
  ad: AdWithImages;
  categories?: CategoryData[];
  index?: number;
}

export function AdCardHorizontal({
  ad,
  categories = [],
  index = 0,
}: AdCardHorizontalProps) {
  const thumbUrl = ad.images[0]?.thumbUrl;
  const category = findCategory(categories, ad.category);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      whileTap={{ scale: 0.98 }}
      className="w-[260px] shrink-0 snap-start"
    >
      <Link href={`/ads/${ad.id}`} className="block">
        <div className="overflow-hidden rounded-[20px] bg-white card-shadow">
          <div className="relative aspect-[16/10] bg-secondary">
            {thumbUrl ? (
              <Image
                src={thumbUrl}
                alt={ad.title}
                fill
                className="object-cover"
                sizes="260px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">
                {category?.emoji}
              </div>
            )}
          </div>
          <div className="p-3.5">
            <h3 className="line-clamp-1 text-[15px] font-bold text-gray-900">
              {ad.title}
            </h3>
            <p className="mt-1 text-[16px] font-extrabold text-primary">
              {formatPrice(ad.price)}
            </p>
            <p className="mt-0.5 text-[12px] text-gray-500">{ad.district}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
