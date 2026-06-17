import { notFound } from "next/navigation";
import { getChegirmaById } from "@/lib/services/chegirmalar";
import { ChegirmaDetailMobile } from "@/components/mobile/chegirma-detail-mobile";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getChegirmaById(id);
  if (!item) return { title: "Aksiya topilmadi" };
  return { title: `${item.title} — ${item.businessName}` };
}

export default async function ChegirmaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getChegirmaById(id);

  if (!item) notFound();

  return <ChegirmaDetailMobile item={item} />;
}
