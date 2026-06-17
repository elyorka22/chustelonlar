"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice, cn } from "@/lib/utils";
import type { AdWithImages, CategoryData } from "@/types";
import { findCategory } from "@/lib/category-helpers";
import { CategoryEmoji } from "@/components/ui/category-emoji";
import { FavoriteButton } from "@/components/mobile/favorite-button";
import { AdPromotionBadges, getVipCardClass } from "@/components/ui/ad-promotion-badges";

interface AdCardGridProps {
  ad: AdWithImages;
  categories?: CategoryData[];
  index?: number;
  favorited?: boolean;
  onFavoriteChange?: (adId: string, favorited: boolean) => void;
}

export function AdCardGrid({
  ad,
  categories = [],
  index = 0,
  favorited = false,
  onFavoriteChange,
}: AdCardGridProps) {
  const thumbUrl = ad.images[0]?.thumbUrl;
  const category = findCategory(categories, ad.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/ads/${ad.id}`} prefetch className="block">
        <div className={cn("overflow-hidden rounded-[20px] bg-white card-shadow", getVipCardClass(ad.isVip, ad.vipUntil))}>
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
            <FavoriteButton
              adId={ad.id}
              initialFavorited={favorited}
              className="absolute right-2.5 top-2.5 h-8 w-8"
              onChange={(next) => onFavoriteChange?.(ad.id, next)}
            />
            <AdPromotionBadges
              isTop={ad.isTop}
              topUntil={ad.topUntil}
              isVip={ad.isVip}
              vipUntil={ad.vipUntil}
              isUrgent={ad.isUrgent}
              urgentUntil={ad.urgentUntil}
              className="absolute left-2.5 top-2.5"
            />
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
