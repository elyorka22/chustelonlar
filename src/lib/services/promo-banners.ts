import { getPrisma } from "@/lib/db";
import type { PromoBannerData } from "@/types";

export { PROMO_BANNER_BG_OPTIONS } from "@/lib/promo-banner-constants";

const FALLBACK_BANNERS: PromoBannerData[] = [
  {
    id: "fallback-1",
    title: "Chustdagi eng yaxshi e'lonlar",
    subtitle: "Avtomobil, uy-joy, ish va boshqa",
    href: "/ads",
    ctaLabel: "Ko'rish",
    imageUrl: null,
    bgClass: "from-violet-500 to-purple-600",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "fallback-2",
    title: "E'lon joylash — bepul",
    subtitle: "Bir necha daqiqada joylashtiring",
    href: "/create",
    ctaLabel: "Boshlash",
    imageUrl: null,
    bgClass: "from-blue-500 to-indigo-600",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "fallback-3",
    title: "Xaritada qidiring",
    subtitle: "Yaqin atrofdagi e'lonlar",
    href: "/map",
    ctaLabel: "Xarita",
    imageUrl: null,
    bgClass: "from-emerald-500 to-teal-600",
    sortOrder: 2,
    isActive: true,
  },
];

function toPromoBannerData(banner: {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  imageUrl: string | null;
  bgClass: string;
  sortOrder: number;
  isActive: boolean;
}): PromoBannerData {
  return {
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle,
    href: banner.href,
    ctaLabel: banner.ctaLabel,
    imageUrl: banner.imageUrl,
    bgClass: banner.bgClass,
    sortOrder: banner.sortOrder,
    isActive: banner.isActive,
  };
}

export async function getActivePromoBanners(): Promise<PromoBannerData[]> {
  const banners = await getPrisma().promoBanner.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  if (banners.length === 0) {
    return FALLBACK_BANNERS;
  }

  return banners.map(toPromoBannerData);
}

export async function getAllPromoBanners(): Promise<PromoBannerData[]> {
  const banners = await getPrisma().promoBanner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return banners.map(toPromoBannerData);
}

export async function createPromoBanner(data: {
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  imageUrl?: string | null;
  bgClass: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const maxOrder = await getPrisma().promoBanner.aggregate({
    _max: { sortOrder: true },
  });

  return getPrisma().promoBanner.create({
    data: {
      title: data.title,
      subtitle: data.subtitle,
      href: data.href,
      ctaLabel: data.ctaLabel,
      imageUrl: data.imageUrl ?? null,
      bgClass: data.bgClass,
      sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updatePromoBanner(
  id: string,
  data: Partial<{
    title: string;
    subtitle: string;
    href: string;
    ctaLabel: string;
    imageUrl: string | null;
    bgClass: string;
    sortOrder: number;
    isActive: boolean;
  }>
) {
  return getPrisma().promoBanner.update({
    where: { id },
    data,
  });
}

export async function deletePromoBanner(id: string) {
  return getPrisma().promoBanner.delete({ where: { id } });
}
