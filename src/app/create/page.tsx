import { requireAuth } from "@/lib/session";
import { getActiveCategories } from "@/lib/services/categories";
import { getUserCoinWallet } from "@/lib/services/coins";
import { CreateAdMobile } from "@/components/mobile/create-ad-mobile";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = { title: "E'lon joylash" };

export default async function CreatePage() {
  const user = await requireAuth();
  const [categories, wallet] = await Promise.all([
    getActiveCategories(),
    getUserCoinWallet(user.id),
  ]);
  return <CreateAdMobile categories={categories} initialBalance={wallet.coinBalance} />;
}
