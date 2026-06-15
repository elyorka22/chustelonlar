import { getReports, getAnalytics } from "@/lib/services/ads";
import { AdminReportsClient } from "@/components/admin/admin-reports-client";

export const metadata = {
  title: "Xabarlar — Admin",
};

export default async function AdminReportsPage() {
  const [reports, analytics] = await Promise.all([
    getReports(),
    getAnalytics(),
  ]);

  return (
    <AdminReportsClient
      reports={reports.map((r) => ({
        id: r.id,
        reason: r.reason,
        createdAt: r.createdAt,
        ad: {
          id: r.ad.id,
          title: r.ad.title,
          images: r.ad.images,
        },
        user: r.user,
      }))}
      notificationCount={analytics.pendingAds + reports.length}
    />
  );
}
