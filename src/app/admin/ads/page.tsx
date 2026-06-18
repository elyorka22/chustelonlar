import { getAdminAds, getAnalytics, getReports } from "@/lib/services/ads";
import { getAllCategories } from "@/lib/services/categories";
import { AdminAdsClient } from "@/components/admin/admin-ads-client";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "E'lonlar — Admin",
};

export default async function AdminAdsPage() {
  const [ads, analytics, reports, categories] = await Promise.all([
    getAdminAds(),
    getAnalytics(),
    getReports(),
    getAllCategories(),
  ]);

  return (
    <AdminAdsClient
      ads={ads.map((ad) => ({
        id: ad.id,
        title: ad.title,
        price: ad.price,
        priceCurrency: ad.priceCurrency as "UZS" | "USD",
        priceNegotiable: ad.priceNegotiable,
        category: ad.category,
        district: ad.district,
        status: ad.status,
        createdAt: ad.createdAt,
        images: ad.images,
      }))}
      categories={categories}
      notificationCount={analytics.pendingAds + reports.length}
    />
  );
}
