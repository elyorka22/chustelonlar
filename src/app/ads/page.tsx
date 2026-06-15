export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { getAds } from "@/lib/services/ads";
import { getActiveCategories } from "@/lib/services/categories";
import { AdsListingClient } from "@/components/mobile/ads-listing-client";

interface AdsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdsPage({ searchParams }: AdsPageProps) {
  const params = await searchParams;
  const [result, categories] = await Promise.all([
    getAds(params),
    getActiveCategories(),
  ]);

  return <AdsListingClient result={result} params={params} categories={categories} />;
}
