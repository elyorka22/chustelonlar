import type { MetadataRoute } from "next";
import { getPrisma } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function staticPages(baseUrl: string): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/ads`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];
}

async function getActiveAdPages(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    const ads = await getPrisma().ad.findMany({
      where: {
        status: "APPROVED",
        isPaused: false,
      },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return ads.map((ad) => ({
      url: `${baseUrl}/ads/${ad.id}`,
      lastModified: ad.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[sitemap] Failed to fetch ads:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const adPages = await getActiveAdPages(baseUrl);
  return [...staticPages(baseUrl), ...adPages];
}
