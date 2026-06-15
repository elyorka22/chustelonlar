import { requireAdmin } from "@/lib/session";
import { getAnalytics, getPendingAds, getReports } from "@/lib/services/ads";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [analytics, pendingAds, reports] = await Promise.all([
    getAnalytics(),
    getPendingAds(),
    getReports(),
  ]);

  const notificationCount = analytics.pendingAds + reports.length;

  return (
    <AdminDashboardClient
      analytics={analytics}
      adminName={admin.name || "Admin"}
      notificationCount={notificationCount}
    />
  );
}
