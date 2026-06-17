import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { getUserAdById } from "@/lib/services/ads";
import { getMonetizationSettings } from "@/lib/services/monetization";
import { AdSettingsMobile } from "@/components/mobile/ad-settings-mobile";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = { title: "E'lon sozlamalari" };

interface AdSettingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdSettingsPage({ params }: AdSettingsPageProps) {
  const user = await requireAuth();
  const { id } = await params;

  const [ad, settings] = await Promise.all([
    getUserAdById(user.id, id),
    getMonetizationSettings(),
  ]);

  if (!ad) {
    notFound();
  }

  if (ad.status === "DELETED") {
    redirect("/dashboard");
  }

  return (
    <AdSettingsMobile
      ad={ad as never}
      promotionCosts={{
        top: settings.topPromotionCost,
        vip: settings.vipPromotionCost,
        urgent: settings.urgentPromotionCost,
      }}
      renewCost={settings.renewListingCost}
      durations={{
        top: settings.topDurationDays,
        vip: settings.vipDurationDays,
        urgent: settings.urgentDurationDays,
      }}
    />
  );
}
