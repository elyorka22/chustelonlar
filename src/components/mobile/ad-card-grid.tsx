"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import type { AdWithImages, CategoryData } from "@/types";
import { findCategory } from "@/lib/category-helpers";
import { CategoryEmoji } from "@/components/ui/category-emoji";

interface AdCardGridProps {
  ad: AdWithImages;
  categories?: CategoryData[];
  index?: number;
}

export function AdCardGrid({ ad, categories = [], index = 0 }: AdCardGridProps) {
  const thumbUrl = ad.images[0]?.thumbUrl;
  const category = findCategory(categories, ad.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/ads/${ad.id}`} className="block">
        <div className="overflow-hidden rounded-[20px] bg-white card-shadow">
          <div className="relative aspect-[4/3] bg-secondary">
            {thumbUrl ? (
              <Image
                src={thumbUrl}
                alt={ad.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 200px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                {category?.emoji && <CategoryEmoji emoji={category.emoji} size={40} />}
              </div>
            )}
            <button
              className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
              onClick={(e) => e.preventDefault()}
              aria-label="Favorite"
            >
              <Heart className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <div className="p-3">
            <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900">
              {ad.title}
            </h3>
            <p className="mt-1.5 text-[15px] font-extrabold text-primary">
              {formatPrice(ad.price, ad.priceCurrency, ad.priceNegotiable)}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
              <MapPin className="h-3 w-3" />
              {ad.district}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
