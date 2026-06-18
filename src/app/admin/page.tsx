import { requireStaff } from "@/lib/session";
import { getAnalytics, getPendingAds, getReports } from "@/lib/services/ads";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { isAdmin } from "@/lib/roles";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminDashboardPage() {
  const user = await requireStaff();

  const [analytics, pendingAds, reports] = await Promise.all([
    getAnalytics(),
    getPendingAds(),
    getReports(),
  ]);

  const notificationCount = analytics.pendingAds + reports.length;

  return (
    <AdminDashboardClient
      analytics={analytics}
      staffName={user.name || (isAdmin(user.role) ? "Admin" : "Moderator")}
      notificationCount={notificationCount}
      isAdmin={isAdmin(user.role)}
    />
  );
}
