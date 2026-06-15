export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getAdById, getSimilarAds, incrementAdViews, isFavorited } from "@/lib/services/ads";
import { getActiveCategories } from "@/lib/services/categories";
import { auth } from "@/lib/auth";
import { AdDetailMobile } from "@/components/mobile/ad-detail-mobile";
import type { Metadata } from "next";

interface AdPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AdPageProps): Promise<Metadata> {
  const { id } = await params;
  const ad = await getAdById(id);
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
  const ad = await getAdById(id);

  if (!ad || ad.status !== "APPROVED") {
    notFound();
  }

  await incrementAdViews(id);

  const session = await auth();
  const [similarAds, favorited, categories] = await Promise.all([
    getSimilarAds(id, ad.category),
    session?.user?.id ? isFavorited(session.user.id, id) : false,
    getActiveCategories(),
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
