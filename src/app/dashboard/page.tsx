import { requireAuth, getCurrentUserProfile } from "@/lib/session";
import { getUserAds, getUserFavorites } from "@/lib/services/ads";
import { getActiveCategories } from "@/lib/services/categories";
import { getUserDashboardStats } from "@/lib/services/coins";
import { getMonetizationSettings, getContactLinks } from "@/lib/services/monetization";
import { ProfileMobile } from "@/components/mobile/profile-mobile";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = { title: "Profil" };

export default async function DashboardPage() {
  const user = await requireAuth();
  const profile = await getCurrentUserProfile();

  const [ads, favorites, categories, dashboardStats, settings, contact] = await Promise.all([
    getUserAds(user.id),
    getUserFavorites(user.id),
    getActiveCategories(),
    getUserDashboardStats(user.id),
    getMonetizationSettings(),
    getContactLinks(),
  ]);

  return (
    <ProfileMobile
      user={{
        ...user,
        hasPassword: profile?.hasPassword ?? false,
        coinBalance: dashboardStats.wallet.coinBalance,
      }}
      ads={ads as never}
      favorites={favorites as never}
      categories={categories}
      dashboardStats={dashboardStats}
      coinValueUzs={settings.coinValueUzs}
      contact={contact}
    />
  );
}
