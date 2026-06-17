import { cacheDel, cacheDelByPrefix } from "@/lib/redis";
import { memCacheDelPrefix } from "@/lib/memory-cache";

export const CACHE_TAGS = {
  categories: "categories",
  ads: "ads",
  banners: "banners",
  chegirmalar: "chegirmalar",
} as const;

/** Bust list/detail/map caches after ad mutations */
export async function invalidateAdsCache(): Promise<void> {
  memCacheDelPrefix("ads:");
  await cacheDelByPrefix("ads:");
}

export async function invalidateCategoriesCache(): Promise<void> {
  memCacheDelPrefix("categories:");
  await cacheDel("categories:active");
  await cacheDel("categories:all");
}

export async function invalidatePublicCache(): Promise<void> {
  await Promise.all([invalidateAdsCache(), invalidateCategoriesCache()]);
}

export async function invalidatePromoBannersCache(): Promise<void> {
  memCacheDelPrefix("banners:");
  await cacheDelByPrefix("banners:");
}

export async function invalidateChegirmalarCache(): Promise<void> {
  memCacheDelPrefix("chegirmalar:");
  await cacheDelByPrefix("chegirmalar:");
}

export async function revalidatePublicPages(): Promise<void> {
  const { revalidatePath, revalidateTag } = await import("next/cache");
  revalidateTag(CACHE_TAGS.ads, "max");
  revalidateTag(CACHE_TAGS.categories, "max");
  revalidateTag(CACHE_TAGS.banners, "max");
  revalidateTag(CACHE_TAGS.chegirmalar, "max");
  revalidatePath("/");
  revalidatePath("/ads");
  revalidatePath("/map");
  revalidatePath("/chegirmalar");
}
