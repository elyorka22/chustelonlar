"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import type { AdWithImages, CategoryData } from "@/types";
import { findCategory } from "@/lib/category-helpers";
import { CategoryEmoji } from "@/components/ui/category-emoji";

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
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      whileTap={{ scale: 0.98 }}
      className="w-[210px] shrink-0 snap-start"
    >
      <Link href={`/ads/${ad.id}`} className="block">
        <div className="flex gap-2.5 overflow-hidden rounded-2xl bg-white p-2 card-shadow">
          <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-secondary">
            {thumbUrl ? (
              <Image
                src={thumbUrl}
                alt={ad.title}
                fill
                className="object-cover"
                sizes="72px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                {category?.emoji && <CategoryEmoji emoji={category.emoji} size={28} />}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <h3 className="line-clamp-2 text-[12px] font-semibold leading-snug text-gray-900">
              {ad.title}
            </h3>
            <p className="mt-1 text-[13px] font-extrabold leading-none text-primary">
              {formatPrice(ad.price, ad.priceCurrency, ad.priceNegotiable)}
            </p>
            <p className="mt-1 truncate text-[10px] text-gray-500">{ad.district}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
