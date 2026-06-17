import { notFound } from "next/navigation";
import { getSimilarAds, incrementAdViews, isFavorited } from "@/lib/services/ads";
import {
  getCachedAdById,
  getCachedActiveCategories,
  PUBLIC_PAGE_REVALIDATE,
} from "@/lib/cached-data";
import { auth } from "@/lib/auth";
import { AdDetailMobile } from "@/components/mobile/ad-detail-mobile";
import type { Metadata } from "next";

export const revalidate = PUBLIC_PAGE_REVALIDATE;

interface AdPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AdPageProps): Promise<Metadata> {
  const { id } = await params;
  const ad = await getCachedAdById(id);
  if (!ad) return { title: "E'lon topilmadi" };
  return {
    title: ad.title,
    description: ad.description.slice(0, 160),
    openGraph: {
      images: ad.images[0]?.fullUrl ? [ad.images[0].fullUrl] : [],
    },
  };
}

export default async function AdDetailPage({ params }: AdPageProps) {
  const { id } = await params;
  const ad = await getCachedAdById(id);

  if (!ad || ad.status !== "APPROVED" || ad.isPaused) {
    notFound();
  }

  void incrementAdViews(id);

  const session = await auth();
  const [similarAds, favorited, categories] = await Promise.all([
    getSimilarAds(id, ad.category),
    session?.user?.id ? isFavorited(session.user.id, id) : false,
    getCachedActiveCategories(),
  ]);

  return (
    <AdDetailMobile
      ad={ad}
      similarAds={similarAds}
      isFavorited={favorited}
      categories={categories}
    />
  );
}
