import { prisma } from "@/lib/db";
import { cacheDel, cacheGet, cacheSet } from "@/lib/redis";
import type { CategoryData } from "@/types";

const CACHE_KEY = "categories:active";
const CACHE_ALL_KEY = "categories:all";
const CACHE_TTL = 300;

export type CategoryImagesMap = Record<string, string | null>;

function toCategoryData(cat: {
  slug: string;
  label: string;
  shortLabel: string;
  emoji: string;
  iconBg: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}): CategoryData {
  return {
    slug: cat.slug,
    label: cat.label,
    shortLabel: cat.shortLabel,
    emoji: cat.emoji,
    iconBg: cat.iconBg,
    imageUrl: cat.imageUrl,
    sortOrder: cat.sortOrder,
    isActive: cat.isActive,
  };
}

export function generateCategorySlug(label: string): string {
  const transliterated = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (transliterated.length >= 2) {
    return transliterated.toUpperCase();
  }

  return `CAT_${Date.now()}`;
}

async function invalidateCategoryCache() {
  await cacheDel(CACHE_KEY);
  await cacheDel(CACHE_ALL_KEY);
}

export async function getActiveCategories(): Promise<CategoryData[]> {
  const cached = await cacheGet<CategoryData[]>(CACHE_KEY);
  if (cached) return cached;

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });

  const result = categories.map(toCategoryData);
  await cacheSet(CACHE_KEY, result, CACHE_TTL);
  return result;
}

export async function getAllCategories(): Promise<CategoryData[]> {
  const cached = await cacheGet<CategoryData[]>(CACHE_ALL_KEY);
  if (cached) return cached;

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });

  const result = categories.map(toCategoryData);
  await cacheSet(CACHE_ALL_KEY, result, CACHE_TTL);
  return result;
}

export async function getCategoryImages(): Promise<CategoryImagesMap> {
  const categories = await getActiveCategories();
  const map: CategoryImagesMap = {};
  for (const cat of categories) {
    map[cat.slug] = cat.imageUrl;
  }
  return map;
}

export async function isValidCategory(slug: string): Promise<boolean> {
  const category = await prisma.category.findFirst({
    where: { slug, isActive: true },
    select: { slug: true },
  });
  return !!category;
}

export async function createCategory(input: {
  label: string;
  shortLabel: string;
  emoji?: string;
  iconBg?: string;
  imageUrl?: string | null;
}) {
  let slug = generateCategorySlug(input.label);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}_${Date.now().toString(36)}`;
  }

  const maxOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });

  const category = await prisma.category.create({
    data: {
      slug,
      label: input.label.trim(),
      shortLabel: input.shortLabel.trim(),
      emoji: input.emoji?.trim() || "📦",
      iconBg: input.iconBg || "bg-blue-100",
      imageUrl: input.imageUrl ?? null,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  await invalidateCategoryCache();
  return toCategoryData(category);
}

export async function upsertCategoryImage(slug: string, imageUrl: string) {
  const result = await prisma.category.update({
    where: { slug },
    data: { imageUrl },
  });
  await invalidateCategoryCache();
  return toCategoryData(result);
}

export async function removeCategoryImage(slug: string) {
  const result = await prisma.category.update({
    where: { slug },
    data: { imageUrl: null },
  });
  await invalidateCategoryCache();
  return toCategoryData(result);
}

export async function deactivateCategory(slug: string) {
  const adsCount = await prisma.ad.count({
    where: { category: slug, status: { not: "DELETED" } },
  });

  if (adsCount > 0) {
    const result = await prisma.category.update({
      where: { slug },
      data: { isActive: false },
    });
    await invalidateCategoryCache();
    return { category: toCategoryData(result), deactivated: true };
  }

  await prisma.category.delete({ where: { slug } });
  await invalidateCategoryCache();
  return { category: null, deactivated: false, deleted: true };
}
