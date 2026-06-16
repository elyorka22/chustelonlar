import { requireAuth, getCurrentUserProfile } from "@/lib/session";
import { getUserAds, getUserStats } from "@/lib/services/ads";
import { ProfileMobile } from "@/components/mobile/profile-mobile";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = { title: "Profil" };

export default async function DashboardPage() {
  const user = await requireAuth();
  const profile = await getCurrentUserProfile();

  const [ads, stats] = await Promise.all([
    getUserAds(user.id),
    getUserStats(user.id),
  ]);

  return (
    <ProfileMobile
      user={{
        ...user,
        hasPassword: profile?.hasPassword ?? false,
      }}
      ads={ads as never}
      stats={stats}
    />
  );
}
