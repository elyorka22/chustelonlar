import { getCachedChegirmalar, getCachedMapChegirmalar } from "@/lib/cached-data";
import { ChegirmalarClient } from "@/components/mobile/chegirmalar-client";

export const revalidate = 60;

export const metadata = {
  title: "Chegirmalar — Chust E'lon",
  description: "Chust shahridagi do'konlar va bizneslar aksiyalari",
};

export default async function ChegirmalarPage() {
  let items: Awaited<ReturnType<typeof getCachedChegirmalar>> = [];
  let mapItems: Awaited<ReturnType<typeof getCachedMapChegirmalar>> = [];

  try {
    [items, mapItems] = await Promise.all([
      getCachedChegirmalar(""),
      getCachedMapChegirmalar(""),
    ]);
  } catch {
    // DB unavailable during build or cold start — client refetches via API
  }

  return <ChegirmalarClient initialItems={items} initialMapItems={mapItems} />;
}
