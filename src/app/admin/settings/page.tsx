import { getAnalytics, getReports } from "@/lib/services/ads";
import { AdminSettingsClient } from "@/components/admin/admin-settings-client";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Sozlamalar — Admin",
};

export default async function AdminSettingsPage() {
  const [analytics, reports] = await Promise.all([
    getAnalytics(),
    getReports(),
  ]);

  return (
    <AdminSettingsClient
      notificationCount={analytics.pendingAds + reports.length}
    />
  );
}
