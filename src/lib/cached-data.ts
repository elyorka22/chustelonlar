import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-invalidate";

export const getCachedActiveCategories = unstable_cache(
  async () => {
    const { getActiveCategories } = await import("@/lib/services/categories");
    return getActiveCategories();
  },
  ["cached-active-categories"],
  { revalidate: 300, tags: [CACHE_TAGS.categories] }
);

export const getCachedLatestAds = unstable_cache(
  async (limit: number) => {
    const { getLatestAds } = await import("@/lib/services/ads");
    return getLatestAds(limit);
  },
  ["cached-latest-ads"],
  { revalidate: 45, tags: [CACHE_TAGS.ads] }
);

export const getCachedHomeAdsGrid = unstable_cache(
  async () => {
    const { getAds } = await import("@/lib/services/ads");
    const result = await getAds({ limit: "50" });
    return result.data;
  },
  ["cached-home-ads-grid"],
  { revalidate: 45, tags: [CACHE_TAGS.ads] }
);

export const getCachedAdById = unstable_cache(
  async (id: string) => {
    const { getAdById } = await import("@/lib/services/ads");
    return getAdById(id);
  },
  ["cached-ad-by-id"],
  { revalidate: 90, tags: [CACHE_TAGS.ads] }
);

export const getCachedMapAds = unstable_cache(
  async (category: string) => {
    const { getMapAds } = await import("@/lib/services/ads");
    return getMapAds(category || undefined);
  },
  ["cached-map-ads"],
  { revalidate: 60, tags: [CACHE_TAGS.ads] }
);

export const getCachedPromoBanners = unstable_cache(
  async () => {
    const { getActivePromoBanners } = await import("@/lib/services/promo-banners");
    return getActivePromoBanners();
  },
  ["cached-promo-banners"],
  { revalidate: 120, tags: [CACHE_TAGS.banners] }
);
