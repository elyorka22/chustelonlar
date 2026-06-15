import { getAnalytics, getReports } from "@/lib/services/ads";
import { AdminSettingsClient } from "@/components/admin/admin-settings-client";

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
