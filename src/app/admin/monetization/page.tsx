import { getMonetizationSettings } from "@/lib/services/monetization";
import { getAllCategories } from "@/lib/services/categories";
import { getAnalytics, getReports } from "@/lib/services/ads";
import { AdminMonetizationClient } from "@/components/admin/admin-monetization-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Monetka — Admin",
};

export default async function AdminMonetizationPage() {
  const [settings, categories, analytics, reports] = await Promise.all([
    getMonetizationSettings(),
    getAllCategories(),
    getAnalytics(),
    getReports(),
  ]);

  return (
    <AdminMonetizationClient
      settings={settings}
      categories={categories}
      notificationCount={analytics.pendingAds + reports.length}
    />
  );
}
