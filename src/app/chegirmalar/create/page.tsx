import { requireBusiness } from "@/lib/session";
import { getUserCoinWallet } from "@/lib/services/coins";
import { CreateChegirmaMobile } from "@/components/mobile/create-chegirma-mobile";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = { title: "Aksiya joylash" };

export default async function CreateChegirmaPage() {
  const user = await requireBusiness();
  const wallet = await getUserCoinWallet(user.id);

  return <CreateChegirmaMobile initialBalance={wallet.coinBalance} />;
}
