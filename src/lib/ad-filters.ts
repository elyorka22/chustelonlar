export type AdsFilterValues = {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  district?: string;
  sort?: string;
};

const FILTER_KEYS = [
  "search",
  "category",
  "minPrice",
  "maxPrice",
  "district",
  "sort",
] as const;

export function filtersFromRecord(
  params: Record<string, string | undefined>
): AdsFilterValues {
  return {
    search: params.search,
    category: params.category,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    district: params.district,
    sort: params.sort,
  };
}

export function buildAdsSearchParams(
  filters: AdsFilterValues,
  options?: { resetPage?: boolean }
): URLSearchParams {
  const params = new URLSearchParams();

  for (const key of FILTER_KEYS) {
    const value = filters[key]?.trim();
    if (!value) continue;
    if (key === "sort" && value === "newest") continue;
    params.set(key, value);
  }

  if (!options?.resetPage && filters.search) {
    // page handled by caller when paginating
  }

  return params;
}

export function mergeAdsFilters(
  current: AdsFilterValues,
  patch: Partial<AdsFilterValues>
): AdsFilterValues {
  return { ...current, ...patch };
}

export function countActiveFilters(filters: AdsFilterValues): number {
  let count = 0;
  if (filters.category) count++;
  if (filters.minPrice || filters.maxPrice) count++;
  if (filters.district) count++;
  if (filters.sort && filters.sort !== "newest") count++;
  return count;
}

export const SORT_OPTIONS = [
  { label: "Eng yangi", value: "newest" },
  { label: "Mashhur", value: "popular" },
  { label: "Arzon", value: "price_asc" },
  { label: "Qimmat", value: "price_desc" },
] as const;
