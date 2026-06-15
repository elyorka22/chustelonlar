import { requireAdmin } from "@/lib/session";
import { getAnalytics, getReports } from "@/lib/services/ads";
import { AdminShell } from "@/components/admin/admin-shell";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const [analytics, reports] = await Promise.all([
    getAnalytics(),
    getReports(),
  ]);

  const notificationCount = analytics.pendingAds + reports.length;

  return (
    <AdminShell
      pendingCount={analytics.pendingAds}
      notificationCount={notificationCount}
    >
      <div className="mx-auto max-w-lg">{children}</div>
    </AdminShell>
  );
}
