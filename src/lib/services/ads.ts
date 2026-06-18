import { getPrisma } from "@/lib/db";
import { adFilterSchema, createAdSchema, reportSchema } from "@/lib/validations";
import { sanitizeText, sanitizePhone, sanitizeTelegram } from "@/lib/sanitize";
import { cacheGet, cacheSet } from "@/lib/redis";
import type { AdFilterInput, CreateAdInput } from "@/lib/validations";
import type { AdWithImages, PaginatedResult, MapAdMarker } from "@/types";
import type { Prisma } from "@prisma/client";
import { isPromotionActive } from "@/lib/promotions";

export { isPromotionActive };

function buildWhereClause(filters: AdFilterInput): Prisma.AdWhereInput {
  const where: Prisma.AdWhereInput = {
    status: "APPROVED",
    isPaused: false,
  };

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { district: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.district) {
    where.district = filters.district;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  return where;
}

function buildOrderBy(sort?: string): Prisma.AdOrderByWithRelationInput[] {
  switch (sort) {
    case "popular":
      return [{ views: "desc" }];
    case "price_asc":
      return [{ price: "asc" }];
    case "price_desc":
      return [{ price: "desc" }];
    default:
      return [{ isTop: "desc" }, { isVip: "desc" }, { createdAt: "desc" }];
  }
}

export async function expireAdPromotions(): Promise<void> {
  const now = new Date();
  await getPrisma().ad.updateMany({
    where: { isTop: true, topUntil: { lt: now } },
    data: { isTop: false, topUntil: null },
  });
  await getPrisma().ad.updateMany({
    where: { isVip: true, vipUntil: { lt: now } },
    data: { isVip: false, vipUntil: null },
  });
  await getPrisma().ad.updateMany({
    where: { isUrgent: true, urgentUntil: { lt: now } },
    data: { isUrgent: false, urgentUntil: null },
  });
}

const adInclude = {
  images: { orderBy: { order: "asc" as const } },
  createdBy: {
    select: { id: true, name: true, image: true },
  },
  _count: { select: { favorites: true } },
};

export async function getAds(
  rawFilters: Record<string, string | undefined>
): Promise<PaginatedResult<AdWithImages>> {
  const filters = adFilterSchema.parse(rawFilters);
  const cacheKey = `ads:${JSON.stringify(filters)}`;

  const cached = await cacheGet<PaginatedResult<AdWithImages>>(cacheKey);
  if (cached) return cached;

  await expireAdPromotions();

  const where = buildWhereClause(filters);
  const orderBy = buildOrderBy(filters.sort);
  const skip = (filters.page - 1) * filters.limit;

  const [data, total] = await Promise.all([
    getPrisma().ad.findMany({
      where,
      include: adInclude,
      orderBy,
      skip,
      take: filters.limit,
    }),
    getPrisma().ad.count({ where }),
  ]);

  const result = {
    data: data as AdWithImages[],
    total,
    page: filters.page,
    totalPages: Math.ceil(total / filters.limit),
  };

  await cacheSet(cacheKey, result, 60);
  return result;
}

export async function getAdById(id: string): Promise<AdWithImages | null> {
  const cacheKey = `ads:detail:${id}`;
  const cached = await cacheGet<AdWithImages>(cacheKey);
  if (cached) return cached;

  const ad = await getPrisma().ad.findUnique({
    where: { id },
    include: adInclude,
  });

  const result = ad as AdWithImages | null;
  if (result?.status === "APPROVED" && !result.isPaused) {
    await cacheSet(cacheKey, result, 90);
  }
  return result;
}

export async function incrementAdViews(id: string): Promise<void> {
  await getPrisma().ad.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

export async function getMapAds(
  category?: string
): Promise<MapAdMarker[]> {
  const cacheKey = `ads:map:${category || "all"}`;
  const cached = await cacheGet<MapAdMarker[]>(cacheKey);
  if (cached) return cached;

  const where: Prisma.AdWhereInput = { status: "APPROVED", isPaused: false };
  if (category) {
    where.category = category;
  }

  const ads = await getPrisma().ad.findMany({
    where,
    select: {
      id: true,
      title: true,
      price: true,
      priceCurrency: true,
      priceNegotiable: true,
      category: true,
      district: true,
      latitude: true,
      longitude: true,
      images: {
        take: 1,
        orderBy: { order: "asc" },
        select: { thumbUrl: true },
      },
    },
  });

  const result = ads.map((ad) => ({
    id: ad.id,
    title: ad.title,
    price: ad.price,
    priceCurrency: ad.priceCurrency as "UZS" | "USD",
    priceNegotiable: ad.priceNegotiable,
    category: ad.category,
    district: ad.district,
    latitude: ad.latitude,
    longitude: ad.longitude,
    thumbUrl: ad.images[0]?.thumbUrl ?? null,
  }));

  await cacheSet(cacheKey, result, 60);
  return result;
}

export async function getLatestAds(limit = 8): Promise<AdWithImages[]> {
  const cacheKey = `ads:latest:${limit}`;
  const cached = await cacheGet<AdWithImages[]>(cacheKey);
  if (cached) return cached;

  await expireAdPromotions();
  const ads = await getPrisma().ad.findMany({
    where: { status: "APPROVED", isPaused: false },
    include: adInclude,
    orderBy: [{ isTop: "desc" }, { isVip: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  const result = ads as AdWithImages[];
  await cacheSet(cacheKey, result, 45);
  return result;
}

export async function getPremiumAds(limit = 4): Promise<AdWithImages[]> {
  const ads = await getPrisma().ad.findMany({
    where: { status: "APPROVED", isPremium: true, isPaused: false },
    include: adInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return ads as AdWithImages[];
}

export async function getSimilarAds(
  adId: string,
  category: string,
  limit = 4
): Promise<AdWithImages[]> {
  const ads = await getPrisma().ad.findMany({
    where: {
      status: "APPROVED",
      isPaused: false,
      category: category,
      id: { not: adId },
    },
    include: adInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return ads as AdWithImages[];
}

export async function createAd(
  userId: string,
  input: CreateAdInput
) {
  const data = createAdSchema.parse(input);

  const { isValidCategory } = await import("@/lib/services/categories");
  const valid = await isValidCategory(data.category);
  if (!valid) {
    throw new Error("Noto'g'ri kategoriya");
  }

  const { calculateListingCost } = await import("@/lib/services/monetization");
  const { spendUserCoins } = await import("@/lib/services/coins");

  const costResult = await calculateListingCost(userId, data.category);

  if (costResult.required > 0) {
    try {
      await spendUserCoins(
        userId,
        costResult.required,
        "SPEND",
        `E'lon joylash: ${data.category}`
      );
    } catch (error) {
      if (error instanceof Error && error.message === "INSUFFICIENT_COINS") {
        throw new Error("INSUFFICIENT_COINS");
      }
      throw error;
    }
  }

  const ad = await getPrisma().ad.create({
    data: {
      title: sanitizeText(data.title),
      description: sanitizeText(data.description),
      category: data.category,
      price: data.price,
      priceCurrency: data.priceCurrency,
      priceNegotiable: data.priceNegotiable,
      latitude: data.latitude,
      longitude: data.longitude,
      district: sanitizeText(data.district),
      phone: sanitizePhone(data.phone),
      telegram: data.telegram ? sanitizeTelegram(data.telegram) : null,
      status: "PENDING",
      createdById: userId,
      listingCoinCost: costResult.required,
      images: {
        create: data.imageIds.map((imageId, index) => ({
          fullUrl: imageId,
          thumbUrl: imageId.replace("/ads/full/", "/ads/thumb/"),
          order: index,
        })),
      },
    },
    include: adInclude,
  });

  void afterAdMutation();
  return ad;
}

export async function purchaseAdPromotion(
  userId: string,
  adId: string,
  type: "TOP" | "VIP" | "URGENT"
) {
  const ad = await getPrisma().ad.findFirst({
    where: { id: adId, createdById: userId, status: { not: "DELETED" } },
  });
  if (!ad) throw new Error("E'lon topilmadi");

  const {
    getMonetizationSettings,
    getPromotionCost,
    getPromotionDurationDays,
  } = await import("@/lib/services/monetization");
  const { spendUserCoins } = await import("@/lib/services/coins");

  const settings = await getMonetizationSettings();
  const cost = getPromotionCost(type, settings);
  const days = getPromotionDurationDays(type, settings);
  const until = new Date();
  until.setDate(until.getDate() + days);

  const promoData: Record<string, unknown> = {};
  const labels = { TOP: "TOP", VIP: "VIP", URGENT: "Shoshilinch" };

  if (type === "TOP") {
    promoData.isTop = true;
    promoData.topUntil = until;
  } else if (type === "VIP") {
    promoData.isVip = true;
    promoData.vipUntil = until;
  } else {
    promoData.isUrgent = true;
    promoData.urgentUntil = until;
  }

  try {
    await spendUserCoins(
      userId,
      cost,
      "AD_PROMOTION",
      `${labels[type]} reklama: ${ad.title}`,
      adId
    );
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_COINS") {
      throw new Error("INSUFFICIENT_COINS");
    }
    throw error;
  }

  return getPrisma().ad.update({
    where: { id: adId },
    data: promoData,
    include: adInclude,
  }).then((result) => {
    void afterAdMutation();
    return result;
  });
}

export async function incrementContactClicks(adId: string): Promise<void> {
  await getPrisma().ad.update({
    where: { id: adId },
    data: { contactClicks: { increment: 1 } },
  });
}

export async function getUserAdById(userId: string, adId: string) {
  return getPrisma().ad.findFirst({
    where: { id: adId, createdById: userId, status: { not: "DELETED" } },
    include: adInclude,
  });
}

export async function toggleAdPaused(userId: string, adId: string, paused: boolean) {
  const ad = await getPrisma().ad.findFirst({
    where: { id: adId, createdById: userId, status: "APPROVED" },
  });
  if (!ad) throw new Error("E'lon topilmadi yoki faol emas");

  return getPrisma().ad.update({
    where: { id: adId },
    data: { isPaused: paused },
    include: adInclude,
  }).then((result) => {
    void afterAdMutation();
    return result;
  });
}

export async function renewUserAd(userId: string, adId: string) {
  const ad = await getPrisma().ad.findFirst({
    where: { id: adId, createdById: userId, status: { not: "DELETED" } },
  });
  if (!ad) throw new Error("E'lon topilmadi");

  const { getMonetizationSettings } = await import("@/lib/services/monetization");
  const { spendUserCoins } = await import("@/lib/services/coins");
  const settings = await getMonetizationSettings();
  const cost = settings.renewListingCost;

  if (cost > 0) {
    try {
      await spendUserCoins(
        userId,
        cost,
        "SPEND",
        `E'lonni yangilash: ${ad.title}`,
        adId
      );
    } catch (error) {
      if (error instanceof Error && error.message === "INSUFFICIENT_COINS") {
        throw new Error("INSUFFICIENT_COINS");
      }
      throw error;
    }
  }

  return getPrisma().ad.update({
    where: { id: adId },
    data: { updatedAt: new Date(), isPaused: false },
    include: adInclude,
  }).then((result) => {
    void afterAdMutation();
    return result;
  });
}

export async function getUserAds(userId: string) {
  return getPrisma().ad.findMany({
    where: { createdById: userId, status: { not: "DELETED" } },
    include: adInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserStats(userId: string) {
  const [total, approved, pending, sold, totalViews] = await Promise.all([
    getPrisma().ad.count({ where: { createdById: userId, status: { not: "DELETED" } } }),
    getPrisma().ad.count({ where: { createdById: userId, status: "APPROVED" } }),
    getPrisma().ad.count({ where: { createdById: userId, status: "PENDING" } }),
    getPrisma().ad.count({ where: { createdById: userId, status: "SOLD" } }),
    getPrisma().ad.aggregate({
      where: { createdById: userId },
      _sum: { views: true },
    }),
  ]);

  return {
    total,
    approved,
    pending,
    sold,
    totalViews: totalViews._sum.views ?? 0,
  };
}

export async function updateAdStatus(
  adId: string,
  status: "APPROVED" | "REJECTED" | "SOLD" | "DELETED"
) {
  const data: { status: typeof status; deletedAt?: Date } = { status };

  if (status === "DELETED") {
    data.deletedAt = new Date();
  }

  const updated = await getPrisma().ad.update({
    where: { id: adId },
    data,
  });

  void afterAdMutation();
  return updated;
}

export async function deleteAd(adId: string, userId: string) {
  const ad = await getPrisma().ad.findFirst({
    where: { id: adId, createdById: userId, status: { not: "DELETED" } },
  });

  if (!ad) return null;

  const deleted = await getPrisma().ad.update({
    where: { id: adId },
    data: {
      status: "DELETED",
      deletedAt: new Date(),
    },
  });

  void afterAdMutation();
  return deleted;
}

export async function createReport(
  adId: string,
  reason: string,
  userId?: string
) {
  const data = reportSchema.parse({ adId, reason });

  return getPrisma().report.create({
    data: {
      adId: data.adId,
      reason: sanitizeText(data.reason),
      userId,
    },
  });
}

export async function toggleFavorite(userId: string, adId: string) {
  const existing = await getPrisma().favorite.findUnique({
    where: { userId_adId: { userId, adId } },
  });

  if (existing) {
    await getPrisma().favorite.delete({ where: { id: existing.id } });
    return { favorited: false };
  }

  await getPrisma().favorite.create({ data: { userId, adId } });
  return { favorited: true };
}

export async function getUserFavorites(userId: string) {
  const favorites = await getPrisma().favorite.findMany({
    where: {
      userId,
      ad: { status: "APPROVED" },
    },
    include: {
      ad: { include: adInclude },
    },
    orderBy: { createdAt: "desc" },
  });

  return favorites.map((f) => f.ad) as AdWithImages[];
}

export async function getUserFavoriteIds(userId: string): Promise<string[]> {
  const favorites = await getPrisma().favorite.findMany({
    where: {
      userId,
      ad: { status: "APPROVED" },
    },
    select: { adId: true },
  });

  return favorites.map((f) => f.adId);
}

export async function isFavorited(userId: string, adId: string) {
  const fav = await getPrisma().favorite.findUnique({
    where: { userId_adId: { userId, adId } },
  });
  return !!fav;
}

export async function getAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    totalAds,
    pendingAds,
    approvedAds,
    rejectedAds,
    viewsAgg,
    categoryStats,
    districtStats,
    recentAds,
    recentUsers,
  ] = await Promise.all([
    getPrisma().user.count(),
    getPrisma().ad.count({ where: { status: { not: "DELETED" } } }),
    getPrisma().ad.count({ where: { status: "PENDING" } }),
    getPrisma().ad.count({ where: { status: "APPROVED" } }),
    getPrisma().ad.count({ where: { status: "REJECTED" } }),
    getPrisma().ad.aggregate({
      where: { status: "APPROVED" },
      _sum: { views: true },
    }),
    getPrisma().ad.groupBy({
      by: ["category"],
      where: { status: "APPROVED" },
      _count: true,
    }),
    getPrisma().ad.groupBy({
      by: ["district"],
      where: { status: "APPROVED" },
      _count: true,
    }),
    getPrisma().ad.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, views: true },
    }),
    getPrisma().user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  const dailyMap = new Map<string, number>();
  const userMap = new Map<string, number>();
  const viewsMap = new Map<string, number>();

  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyMap.set(key, 0);
    userMap.set(key, 0);
    viewsMap.set(key, 0);
  }

  for (const ad of recentAds) {
    const key = ad.createdAt.toISOString().split("T")[0];
    if (dailyMap.has(key)) {
      dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
      viewsMap.set(key, (viewsMap.get(key) || 0) + ad.views);
    }
  }

  for (const user of recentUsers) {
    const key = user.createdAt.toISOString().split("T")[0];
    if (userMap.has(key)) {
      userMap.set(key, (userMap.get(key) || 0) + 1);
    }
  }

  const dailyGrowth = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const userGrowth = Array.from(userMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const viewsGrowth = Array.from(viewsMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalDistrict = districtStats.reduce((s, d) => s + d._count, 0) || 1;
  const sortedDistricts = districtStats
    .map((d) => ({
      district: d.district,
      count: d._count,
      percentage: Math.round((d._count / totalDistrict) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalUsers,
    totalAds,
    pendingAds,
    approvedAds,
    rejectedAds,
    totalViews: viewsAgg._sum.views ?? 0,
    dailyGrowth,
    userGrowth,
    viewsGrowth,
    categoryStats: categoryStats.map((c) => ({
      category: c.category,
      count: c._count,
    })),
    districtStats: sortedDistricts,
  };
}

export async function getPendingAds() {
  return getPrisma().ad.findMany({
    where: { status: "PENDING" },
    include: adInclude,
    orderBy: { createdAt: "asc" },
  });
}

export async function getReports() {
  return getPrisma().report.findMany({
    include: {
      ad: { include: adInclude },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function banUser(userId: string) {
  return getPrisma().user.update({
    where: { id: userId },
    data: { role: "BANNED" },
  });
}

export async function unbanUser(userId: string) {
  return getPrisma().user.update({
    where: { id: userId },
    data: { role: "USER" },
  });
}

export async function promoteToBusiness(userId: string) {
  const user = await getPrisma().user.update({
    where: { id: userId },
    data: { role: "BUSINESS" },
  });

  const { tryGrantBusinessWelcomeBonus } = await import("@/lib/services/welcome-bonuses");
  await tryGrantBusinessWelcomeBonus(userId);

  return user;
}

export async function demoteFromBusiness(userId: string) {
  return getPrisma().user.update({
    where: { id: userId },
    data: { role: "USER" },
  });
}

export async function promoteToAdmin(userId: string) {
  return getPrisma().user.update({
    where: { id: userId },
    data: { role: "ADMIN" },
  });
}

export async function promoteToModerator(userId: string) {
  return getPrisma().user.update({
    where: { id: userId },
    data: { role: "MODERATOR" },
  });
}

export async function demoteToUser(userId: string) {
  return getPrisma().user.update({
    where: { id: userId },
    data: { role: "USER" },
  });
}

export async function getAllUsers() {
  return getPrisma().user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      _count: { select: { ads: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function afterAdMutation() {
  const { invalidatePublicCache, revalidatePublicPages } = await import(
    "@/lib/cache-invalidate"
  );
  await invalidatePublicCache();
  await revalidatePublicPages();
}
