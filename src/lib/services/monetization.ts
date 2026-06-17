import { getPrisma } from "@/lib/db";
import {
  resolveCategoryFreeLimit,
  resolveCategoryListingCost,
  type CategoryPricingFields,
} from "@/lib/category-pricing";
import type { CategoryPricingType, CoinTransactionType, MonetizationSettings } from "@prisma/client";

const SETTINGS_ID = "default";

export type MonetizationSettingsData = MonetizationSettings;

export async function getMonetizationSettings(): Promise<MonetizationSettingsData> {
  const settings = await getPrisma().monetizationSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  if (settings) return settings;

  return getPrisma().monetizationSettings.create({
    data: { id: SETTINGS_ID },
  });
}

export async function updateMonetizationSettings(
  data: Partial<
    Omit<MonetizationSettingsData, "id" | "updatedAt">
  >
) {
  return getPrisma().monetizationSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });
}

export async function countUserCategoryListings(
  userId: string,
  categorySlug: string
): Promise<number> {
  return getPrisma().ad.count({
    where: {
      createdById: userId,
      category: categorySlug,
      status: { not: "DELETED" },
    },
  });
}

export interface ListingCostResult {
  required: number;
  reason: "FREE" | "LIMITED_FREE" | "PAID";
  freeRemaining: number;
  pricingType: CategoryPricingType;
}

export async function calculateListingCost(
  userId: string,
  categorySlug: string
): Promise<ListingCostResult> {
  const category = await getPrisma().category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    return { required: 0, reason: "FREE", freeRemaining: 0, pricingType: "FREE" };
  }

  const settings = await getMonetizationSettings();
  const published = await countUserCategoryListings(userId, categorySlug);
  const pricing: CategoryPricingFields = {
    slug: category.slug,
    pricingType: category.pricingType,
    listingCoinCost: category.listingCoinCost,
    freeLimit: category.freeLimit,
  };

  if (category.pricingType === "FREE") {
    return {
      required: 0,
      reason: "FREE",
      freeRemaining: 0,
      pricingType: "FREE",
    };
  }

  const coinCost = resolveCategoryListingCost(pricing, settings);

  if (category.pricingType === "LIMITED_FREE") {
    const limit = resolveCategoryFreeLimit(pricing, settings.freeListingsLimit);
    const freeRemaining = Math.max(0, limit - published);
    if (freeRemaining > 0) {
      return {
        required: 0,
        reason: "LIMITED_FREE",
        freeRemaining,
        pricingType: "LIMITED_FREE",
      };
    }
    return {
      required: coinCost,
      reason: "LIMITED_FREE",
      freeRemaining: 0,
      pricingType: "LIMITED_FREE",
    };
  }

  return {
    required: coinCost,
    reason: "PAID",
    freeRemaining: 0,
    pricingType: "PAID",
  };
}

export function getPromotionCost(
  type: "TOP" | "VIP" | "URGENT",
  settings: MonetizationSettingsData
): number {
  switch (type) {
    case "TOP":
      return settings.topPromotionCost;
    case "VIP":
      return settings.vipPromotionCost;
    case "URGENT":
      return settings.urgentPromotionCost;
  }
}

export function getPromotionDurationDays(
  type: "TOP" | "VIP" | "URGENT",
  settings: MonetizationSettingsData
): number {
  switch (type) {
    case "TOP":
      return settings.topDurationDays;
    case "VIP":
      return settings.vipDurationDays;
    case "URGENT":
      return settings.urgentDurationDays;
  }
}

export async function getContactLinks() {
  const settings = await getMonetizationSettings();
  return {
    telegram: settings.contactTelegram,
    phone: settings.contactPhone,
    whatsapp: settings.contactWhatsapp,
  };
}

export async function getChegirmaListingCost(): Promise<number> {
  const settings = await getMonetizationSettings();
  return settings.chegirmaListingCost;
}

export const COIN_TYPE_LABELS: Record<CoinTransactionType, string> = {
  TOPUP: "TOPUP",
  SPEND: "SPEND",
  REFUND: "REFUND",
  BONUS: "BONUS",
  AD_PROMOTION: "AD_PROMOTION",
};
