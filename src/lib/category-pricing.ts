import type { CategoryPricingType } from "@prisma/client";

export type CategoryPricingFields = {
  slug: string;
  pricingType: CategoryPricingType;
  listingCoinCost: number;
  freeLimit: number;
};

export type DefaultCategoryCostSettings = {
  autoCategoryCost: number;
  houseSaleCategoryCost: number;
  rentCategoryCost: number;
  jobCategoryCost: number;
};

export function resolveDefaultCategoryCost(
  categorySlug: string,
  settings: DefaultCategoryCostSettings
): number {
  const upper = categorySlug.toUpperCase();
  if (upper.includes("AUTO") || upper.includes("AVTO")) return settings.autoCategoryCost;
  if (upper.includes("REAL") || upper.includes("MULK") || upper.includes("HOUSE")) {
    return settings.houseSaleCategoryCost;
  }
  if (upper.includes("RENT")) return settings.rentCategoryCost;
  if (upper.includes("JOB") || upper.includes("ISH") || upper.includes("OTHER")) {
    return settings.jobCategoryCost;
  }
  return settings.jobCategoryCost || 2;
}

/** Per-category cost wins; 0 means use global default for that slug. */
export function resolveCategoryListingCost(
  category: CategoryPricingFields,
  settings: DefaultCategoryCostSettings
): number {
  if (category.listingCoinCost > 0) {
    return category.listingCoinCost;
  }
  return resolveDefaultCategoryCost(category.slug, settings);
}

/** Per-category limit wins; 0 means use global freeListingsLimit. */
export function resolveCategoryFreeLimit(
  category: Pick<CategoryPricingFields, "freeLimit">,
  globalFreeLimit: number
): number {
  if (category.freeLimit > 0) {
    return category.freeLimit;
  }
  return globalFreeLimit;
}

export function describeCategoryPricing(
  category: CategoryPricingFields,
  settings: DefaultCategoryCostSettings & { freeListingsLimit: number }
): {
  pricingType: CategoryPricingType;
  listingCost: number;
  freeLimit: number;
  usesGlobalCost: boolean;
  usesGlobalLimit: boolean;
} {
  const listingCost =
    category.pricingType === "FREE"
      ? 0
      : resolveCategoryListingCost(category, settings);
  const freeLimit =
    category.pricingType === "LIMITED_FREE"
      ? resolveCategoryFreeLimit(category, settings.freeListingsLimit)
      : 0;

  return {
    pricingType: category.pricingType,
    listingCost,
    freeLimit,
    usesGlobalCost: category.listingCoinCost === 0 && category.pricingType !== "FREE",
    usesGlobalLimit: category.freeLimit === 0 && category.pricingType === "LIMITED_FREE",
  };
}
