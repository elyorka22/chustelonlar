import { getAnalytics, getReports } from "@/lib/services/ads";
import { getAllPromoBanners } from "@/lib/services/promo-banners";
import { AdminBannersClient } from "@/components/admin/admin-banners-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Bannerlar — Admin",
};

export default async function AdminBannersPage() {
  const [banners, analytics, reports] = await Promise.all([
    getAllPromoBanners(),
    getAnalytics(),
    getReports(),
  ]);

  return (
    <AdminBannersClient
      banners={banners}
      notificationCount={analytics.pendingAds + reports.length}
    />
  );
}
