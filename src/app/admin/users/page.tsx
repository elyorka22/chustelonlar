import { requireAdmin } from "@/lib/session";
import { getAllUsers, getAnalytics, getReports } from "@/lib/services/ads";
import { AdminUsersClient } from "@/components/admin/admin-users-client";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Foydalanuvchilar — Admin",
};

export default async function AdminUsersPage() {
  await requireAdmin();

  const [users, analytics, reports] = await Promise.all([
    getAllUsers(),
    getAnalytics(),
    getReports(),
  ]);

  return (
    <AdminUsersClient
      users={users}
      notificationCount={analytics.pendingAds + reports.length}
    />
  );
}
