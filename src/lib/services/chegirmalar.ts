import { getPrisma } from "@/lib/db";
import { sanitizeText, sanitizePhone, sanitizeTelegram } from "@/lib/sanitize";
import { createChegirmaSchema, type CreateChegirmaInput } from "@/lib/validations";
import { CHEGIRMA_DEFAULT_VALIDITY_DAYS } from "@/lib/chegirma-constants";
import type { ChegirmaData, MapChegirmaMarker } from "@/types";
import type { ChegirmaStatus } from "@prisma/client";

function toThumbUrl(imageUrl: string): string {
  return imageUrl.replace("/ads/full/", "/ads/thumb/");
}

function toChegirmaData(chegirma: {
  id: string;
  businessName: string;
  title: string;
  description: string;
  imageUrl: string;
  imageUrls?: string[];
  discountLabel: string;
  category: string;
  latitude: number;
  longitude: number;
  district: string;
  address: string | null;
  phone: string;
  telegram: string | null;
  validUntil: Date;
  status: ChegirmaStatus;
  views: number;
  createdAt: Date;
  createdBy?: { id: string; name: string | null };
}): ChegirmaData {
  const imageUrls =
    chegirma.imageUrls && chegirma.imageUrls.length > 0
      ? chegirma.imageUrls
      : [chegirma.imageUrl];

  return {
    id: chegirma.id,
    businessName: chegirma.businessName,
    title: chegirma.title,
    description: chegirma.description,
    imageUrl: imageUrls[0],
    imageUrls,
    discountLabel: chegirma.discountLabel,
    category: chegirma.category,
    latitude: chegirma.latitude,
    longitude: chegirma.longitude,
    district: chegirma.district,
    address: chegirma.address,
    phone: chegirma.phone,
    telegram: chegirma.telegram,
    validUntil: chegirma.validUntil,
    status: chegirma.status,
    views: chegirma.views,
    createdAt: chegirma.createdAt,
    createdBy: chegirma.createdBy,
  };
}

const activeWhere = {
  status: "APPROVED" as const,
  validUntil: { gte: new Date() },
};

export async function getActiveChegirmalar(category?: string): Promise<ChegirmaData[]> {
  const items = await getPrisma().chegirma.findMany({
    where: {
      ...activeWhere,
      ...(category ? { category } : {}),
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      createdBy: { select: { id: true, name: true } },
    },
  });

  return items.map(toChegirmaData);
}

export async function getMapChegirmalar(category?: string): Promise<MapChegirmaMarker[]> {
  const items = await getPrisma().chegirma.findMany({
    where: {
      ...activeWhere,
      ...(category ? { category } : {}),
    },
    select: {
      id: true,
      title: true,
      businessName: true,
      discountLabel: true,
      imageUrl: true,
      latitude: true,
      longitude: true,
      district: true,
      validUntil: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    businessName: item.businessName,
    discountLabel: item.discountLabel,
    imageUrl: item.imageUrl,
    thumbUrl: toThumbUrl(item.imageUrl),
    latitude: item.latitude,
    longitude: item.longitude,
    district: item.district,
    validUntil: item.validUntil,
  }));
}

export async function getChegirmaById(id: string): Promise<ChegirmaData | null> {
  const item = await getPrisma().chegirma.findFirst({
    where: {
      id,
      status: "APPROVED",
      validUntil: { gte: new Date() },
    },
    include: {
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!item) return null;

  await getPrisma().chegirma.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  return toChegirmaData(item);
}

export async function getPendingChegirmalar(): Promise<ChegirmaData[]> {
  const items = await getPrisma().chegirma.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      createdBy: { select: { id: true, name: true } },
    },
  });

  return items.map(toChegirmaData);
}

export async function createChegirma(userId: string, input: CreateChegirmaInput) {
  const data = createChegirmaSchema.parse(input);

  const { getChegirmaListingCost } = await import("@/lib/services/monetization");
  const { spendUserCoins } = await import("@/lib/services/coins");

  const cost = await getChegirmaListingCost();

  if (cost > 0) {
    try {
      await spendUserCoins(userId, cost, "SPEND", "Chegirma joylash");
    } catch (error) {
      if (error instanceof Error && error.message === "INSUFFICIENT_COINS") {
        throw new Error("INSUFFICIENT_COINS");
      }
      throw error;
    }
  }

  const chegirma = await getPrisma().chegirma.create({
    data: {
      businessName: sanitizeText(data.businessName),
      title: sanitizeText(`${data.businessName} — ${data.discountLabel}`),
      description: sanitizeText(data.description),
      discountLabel: sanitizeText(data.discountLabel),
      category: data.category,
      imageUrl: data.imageUrls[0],
      imageUrls: data.imageUrls,
      latitude: data.latitude,
      longitude: data.longitude,
      district: sanitizeText(data.district),
      address: data.address ? sanitizeText(data.address) : null,
      phone: sanitizePhone(data.phone),
      telegram: data.telegram ? sanitizeTelegram(data.telegram) : null,
      validUntil: new Date(
        Date.now() + CHEGIRMA_DEFAULT_VALIDITY_DAYS * 24 * 60 * 60 * 1000
      ),
      status: "PENDING",
      listingCoinCost: cost,
      createdById: userId,
    },
    include: {
      createdBy: { select: { id: true, name: true } },
    },
  });

  return toChegirmaData(chegirma);
}

export async function updateChegirmaStatus(id: string, status: ChegirmaStatus) {
  const updated = await getPrisma().chegirma.update({
    where: { id },
    data: { status },
    include: {
      createdBy: { select: { id: true, name: true } },
    },
  });

  return toChegirmaData(updated);
}

export async function deleteChegirma(id: string) {
  return getPrisma().chegirma.update({
    where: { id },
    data: { status: "DELETED" },
  });
}

export async function afterChegirmaMutation() {
  const { invalidateChegirmalarCache } = await import("@/lib/cache-invalidate");
  await invalidateChegirmalarCache();
}
