import { getAds } from "@/lib/services/ads";
import {
  getCachedActiveCategories,
  PUBLIC_PAGE_REVALIDATE,
} from "@/lib/cached-data";
import { AdsListingClient } from "@/components/mobile/ads-listing-client";

export const revalidate = PUBLIC_PAGE_REVALIDATE;

interface AdsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdsPage({ searchParams }: AdsPageProps) {
  const params = await searchParams;

  try {
    const [result, categories] = await Promise.all([
      getAds(params),
      getCachedActiveCategories(),
    ]);

    return <AdsListingClient result={result} params={params} categories={categories} />;
  } catch (error) {
    console.error("[/ads]", error);
    return (
      <AdsListingClient
        result={{ data: [], total: 0, page: 1, totalPages: 0 }}
        params={params}
        categories={[]}
      />
    );
  }
}
