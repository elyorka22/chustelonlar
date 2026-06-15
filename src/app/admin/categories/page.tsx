import { getAnalytics, getReports } from "@/lib/services/ads";
import { getAllCategories } from "@/lib/services/categories";
import { AdminCategoriesClient } from "@/components/admin/admin-categories-client";

export const metadata = {
  title: "Kategoriyalar — Admin",
};

export default async function AdminCategoriesPage() {
  const [categories, analytics, reports] = await Promise.all([
    getAllCategories(),
    getAnalytics(),
    getReports(),
  ]);

  return (
    <AdminCategoriesClient
      categories={categories}
      notificationCount={analytics.pendingAds + reports.length}
    />
  );
}
