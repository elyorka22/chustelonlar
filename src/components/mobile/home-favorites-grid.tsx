"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AdCardGrid } from "@/components/mobile/ad-card-grid";
import { getMyFavoriteAdIds } from "@/lib/actions";
import type { AdWithImages, CategoryData } from "@/types";

interface HomeFavoritesGridProps {
  ads: AdWithImages[];
  categories: CategoryData[];
}

export function HomeFavoritesGrid({ ads, categories }: HomeFavoritesGridProps) {
  const { status } = useSession();
  const [favoriteSet, setFavoriteSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status !== "authenticated") {
      setFavoriteSet(new Set());
      return;
    }

    let cancelled = false;

    getMyFavoriteAdIds()
      .then((ids) => {
        if (!cancelled) {
          setFavoriteSet(new Set(ids));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFavoriteSet(new Set());
        }
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  return (
    <div className="grid grid-cols-2 gap-2.5 px-4 md:grid-cols-4 md:gap-3">
      {ads.map((ad, i) => (
        <AdCardGrid
          key={ad.id}
          ad={ad}
          categories={categories}
          index={i}
          favorited={favoriteSet.has(ad.id)}
        />
      ))}
    </div>
  );
}
