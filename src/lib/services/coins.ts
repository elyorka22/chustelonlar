import { getPrisma } from "@/lib/db";
import type { CoinTransactionType } from "@prisma/client";

export async function getUserCoinWallet(userId: string) {
  const user = await getPrisma().user.findUnique({
    where: { id: userId },
    select: {
      coinBalance: true,
      totalCoinsPurchased: true,
      totalCoinsSpent: true,
    },
  });

  return (
    user ?? {
      coinBalance: 0,
      totalCoinsPurchased: 0,
      totalCoinsSpent: 0,
    }
  );
}

export async function getUserCoinTransactions(
  userId: string,
  limit = 50
) {
  return getPrisma().coinTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function adminAdjustUserCoins(
  userId: string,
  amount: number,
  type: CoinTransactionType,
  description?: string
) {
  if (amount === 0) {
    throw new Error("Summa 0 bo'lishi mumkin emas");
  }

  return getPrisma().$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Foydalanuvchi topilmadi");

    const newBalance = user.coinBalance + amount;
    if (newBalance < 0) {
      throw new Error("Balans manfiy bo'lishi mumkin emas");
    }

    const isTopup = amount > 0;

    await tx.user.update({
      where: { id: userId },
      data: {
        coinBalance: newBalance,
        totalCoinsPurchased: isTopup
          ? { increment: amount }
          : user.totalCoinsPurchased,
        totalCoinsSpent: !isTopup
          ? { increment: Math.abs(amount) }
          : user.totalCoinsSpent,
      },
    });

    await tx.coinTransaction.create({
      data: {
        userId,
        type,
        amount,
        description,
      },
    });

    return { coinBalance: newBalance };
  });
}

export async function spendUserCoins(
  userId: string,
  amount: number,
  type: CoinTransactionType,
  description?: string,
  adId?: string
) {
  if (amount <= 0) throw new Error("Noto'g'ri summa");

  return getPrisma().$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Foydalanuvchi topilmadi");
    if (user.coinBalance < amount) {
      throw new Error("INSUFFICIENT_COINS");
    }

    const newBalance = user.coinBalance - amount;

    await tx.user.update({
      where: { id: userId },
      data: {
        coinBalance: newBalance,
        totalCoinsSpent: { increment: amount },
      },
    });

    await tx.coinTransaction.create({
      data: {
        userId,
        type,
        amount: -amount,
        description,
        adId,
      },
    });

    return { coinBalance: newBalance };
  });
}

export async function searchUsersForAdmin(query: string, limit = 20) {
  const q = query.trim();
  if (!q) return [];

  return getPrisma().user.findMany({
    where: {
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      coinBalance: true,
      totalCoinsPurchased: true,
      totalCoinsSpent: true,
      role: true,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserDashboardStats(userId: string) {
  const prisma = getPrisma();

  const [
    wallet,
    transactions,
    totalListings,
    activeListings,
    soldListings,
    expiredListings,
    viewsAgg,
    favoritesAgg,
    contactClicksAgg,
    promotionSpend,
    listingSpend,
    topAd,
  ] = await Promise.all([
    getUserCoinWallet(userId),
    getUserCoinTransactions(userId, 30),
    prisma.ad.count({ where: { createdById: userId, status: { not: "DELETED" } } }),
    prisma.ad.count({ where: { createdById: userId, status: "APPROVED" } }),
    prisma.ad.count({ where: { createdById: userId, status: "SOLD" } }),
    prisma.ad.count({
      where: {
        createdById: userId,
        status: { in: ["REJECTED", "DELETED"] },
      },
    }),
    prisma.ad.aggregate({
      where: { createdById: userId },
      _sum: { views: true },
    }),
    prisma.favorite.count({
      where: { ad: { createdById: userId } },
    }),
    prisma.ad.aggregate({
      where: { createdById: userId },
      _sum: { contactClicks: true },
    }),
    prisma.coinTransaction.aggregate({
      where: { userId, type: "AD_PROMOTION", amount: { lt: 0 } },
      _sum: { amount: true },
    }),
    prisma.coinTransaction.aggregate({
      where: {
        userId,
        type: "SPEND",
        amount: { lt: 0 },
      },
      _sum: { amount: true },
    }),
    prisma.ad.findFirst({
      where: { createdById: userId, status: "APPROVED" },
      orderBy: { views: "desc" },
      select: { id: true, title: true, views: true },
    }),
  ]);

  const totalViews = viewsAgg._sum.views ?? 0;
  const avgViewsPerListing =
    activeListings > 0 ? Math.round(totalViews / activeListings) : 0;

  return {
    wallet,
    transactions,
    listings: {
      total: totalListings,
      active: activeListings,
      sold: soldListings,
      expired: expiredListings,
    },
    engagement: {
      totalViews,
      favoritesCount: favoritesAgg,
      contactClicks: contactClicksAgg._sum.contactClicks ?? 0,
      avgViewsPerListing,
    },
    coins: {
      spentOnPromotions: Math.abs(promotionSpend._sum.amount ?? 0),
      spentOnPublishing: Math.abs(listingSpend._sum.amount ?? 0),
    },
    topListing: topAd,
  };
}
