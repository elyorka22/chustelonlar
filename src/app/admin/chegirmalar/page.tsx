import { getAnalytics, getReports } from "@/lib/services/ads";
import { getPendingChegirmalar } from "@/lib/services/chegirmalar";
import { AdminChegirmalarClient } from "@/components/admin/admin-chegirmalar-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Chegirmalar — Admin",
};

export default async function AdminChegirmalarPage() {
  const [items, analytics, reports] = await Promise.all([
    getPendingChegirmalar(),
    getAnalytics(),
    getReports(),
  ]);

  return (
    <AdminChegirmalarClient
      items={items}
      notificationCount={analytics.pendingAds + reports.length}
    />
  );
}
