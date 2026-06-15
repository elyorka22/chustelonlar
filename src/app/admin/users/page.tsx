import { getAllUsers, getAnalytics, getReports } from "@/lib/services/ads";
import { AdminUsersClient } from "@/components/admin/admin-users-client";

export const metadata = {
  title: "Foydalanuvchilar — Admin",
};

export default async function AdminUsersPage() {
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
