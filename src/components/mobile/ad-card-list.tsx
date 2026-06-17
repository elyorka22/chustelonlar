"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice, formatDate } from "@/lib/utils";
import type { AdWithImages, CategoryData } from "@/types";
import { findCategory } from "@/lib/category-helpers";
import { CategoryEmoji } from "@/components/ui/category-emoji";

interface AdCardListProps {
  ad: AdWithImages;
  categories?: CategoryData[];
  index?: number;
}

export function AdCardList({ ad, categories = [], index = 0 }: AdCardListProps) {
  const thumbUrl = ad.images[0]?.thumbUrl;
  const category = findCategory(categories, ad.category);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      whileTap={{ scale: 0.99 }}
    >
      <Link href={`/ads/${ad.id}`}>
        <div className="flex gap-3 rounded-[20px] bg-white p-3 card-shadow">
          <div className="relative h-[88px] w-[88px] flex-shrink-0 overflow-hidden rounded-2xl bg-secondary">
            {thumbUrl ? (
              <Image
                src={thumbUrl}
                alt={ad.title}
                fill
                className="object-cover"
                sizes="88px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                {category?.emoji && <CategoryEmoji emoji={category.emoji} size={32} />}
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-gray-900">
              {ad.title}
            </h3>
            <p className="mt-1 text-[16px] font-extrabold text-primary">
              {formatPrice(ad.price, ad.priceCurrency, ad.priceNegotiable)}
            </p>
            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-500">
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {ad.district}
              </span>
              <span>{formatDate(ad.createdAt)}</span>
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {ad.views}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
