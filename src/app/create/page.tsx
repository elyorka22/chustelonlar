import { requireAuth } from "@/lib/session";
import { getActiveCategories } from "@/lib/services/categories";
import { CreateAdMobile } from "@/components/mobile/create-ad-mobile";

export const metadata = { title: "E'lon joylash" };

export default async function CreatePage() {
  await requireAuth();
  const categories = await getActiveCategories();
  return <CreateAdMobile categories={categories} />;
}
