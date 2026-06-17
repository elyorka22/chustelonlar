import { getCachedChegirmalar, getCachedMapChegirmalar } from "@/lib/cached-data";
import { ChegirmalarClient } from "@/components/mobile/chegirmalar-client";

export const revalidate = 60;

export const metadata = {
  title: "Chegirmalar — Chust E'lon",
  description: "Chust shahridagi do'konlar va bizneslar aksiyalari",
};

export default async function ChegirmalarPage() {
  const [items, mapItems] = await Promise.all([
    getCachedChegirmalar(""),
    getCachedMapChegirmalar(""),
  ]);

  return <ChegirmalarClient initialItems={items} initialMapItems={mapItems} />;
}
