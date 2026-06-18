import { getActiveCategories } from "@/lib/services/categories";
import { getMapAds } from "@/lib/services/ads";
import { MapPageClient } from "./map-page-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function MapPage() {
  let initialAds: Awaited<ReturnType<typeof getMapAds>> = [];
  let initialCategories: Awaited<ReturnType<typeof getActiveCategories>> = [];

  try {
    [initialAds, initialCategories] = await Promise.all([
      getMapAds(),
      getActiveCategories(),
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
