import { getAnalytics, getMapAds, getReports } from "@/lib/services/ads";
import { AdminAnalyticsClient } from "@/components/admin/admin-analytics-client";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Statistika — Admin",
};

export default async function AdminAnalyticsPage() {
  const [analytics, mapAds, reports] = await Promise.all([
    getAnalytics(),
    getMapAds(),
    getReports(),
  ]);

  return (
    <AdminAnalyticsClient
      analytics={analytics}
      mapAds={mapAds}
      notificationCount={analytics.pendingAds + reports.length}
    />
  );
}
