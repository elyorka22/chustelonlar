import {
  getCachedActiveCategories,
  getCachedMapAds,
  PUBLIC_PAGE_REVALIDATE,
} from "@/lib/cached-data";
import { MapPageClient } from "./map-page-client";

export const revalidate = PUBLIC_PAGE_REVALIDATE;

export default async function MapPage() {
  let initialAds: Awaited<ReturnType<typeof getCachedMapAds>> = [];
  let initialCategories: Awaited<ReturnType<typeof getCachedActiveCategories>> = [];

  try {
    [initialAds, initialCategories] = await Promise.all([
      getCachedMapAds(""),
      getCachedActiveCategories(),
    ]);
  } catch {
    // DB unavailable — client can retry via API
  }

  return (
    <MapPageClient
      initialAds={initialAds}
      initialCategories={initialCategories}
    />
  );
}
