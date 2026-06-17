"use server";

import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { ZodError } from "zod";
import {
  createAd,
  deleteAd,
  toggleFavorite,
  createReport,
  updateAdStatus,
} from "@/lib/services/ads";
import type { CreateAdInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function registerUser(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await getPrisma().user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return { error: "Bu email allaqachon ro'yxatdan o'tgan" };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  await getPrisma().user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
    },
  });

  return { success: true };
}

export async function submitAd(input: CreateAdInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Avtorizatsiya talab qilinadi" };
  }

  try {
    const ad = await createAd(session.user.id, input);
    revalidatePath("/dashboard");
    return { success: true, adId: ad.id };
  } catch (error) {
    console.error("Submit ad error:", error);
    if (error instanceof Error && error.message === "INSUFFICIENT_COINS") {
      const { calculateListingCost, getContactLinks } = await import(
        "@/lib/services/monetization"
      );
      const { getUserCoinWallet } = await import("@/lib/services/coins");
      const [cost, wallet, contact] = await Promise.all([
        calculateListingCost(session.user.id, input.category),
        getUserCoinWallet(session.user.id),
        getContactLinks(),
      ]);
      return {
        error: "Hisobingizda monetka yetarli emas",
        code: "INSUFFICIENT_COINS" as const,
        balance: wallet.coinBalance,
        required: cost.required,
        contact,
      };
    }
    if (error instanceof Error && error.message === "Noto'g'ri kategoriya") {
      return { error: "Kategoriyani tanlang" };
    }
    if (error instanceof ZodError) {
      return { error: error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
    }
    return { error: "E'lon yaratishda xatolik yuz berdi" };
  }
}

export async function getListingCostPreview(categorySlug: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Avtorizatsiya talab qilinadi" };
  }

  const { calculateListingCost } = await import("@/lib/services/monetization");
  const { getUserCoinWallet } = await import("@/lib/services/coins");

  const [cost, wallet] = await Promise.all([
    calculateListingCost(session.user.id, categorySlug),
    getUserCoinWallet(session.user.id),
  ]);

  return {
    success: true,
    ...cost,
    balance: wallet.coinBalance,
  };
}

export async function purchasePromotion(
  adId: string,
  type: "TOP" | "VIP" | "URGENT"
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Avtorizatsiya talab qilinadi" };
  }

  try {
    const { purchaseAdPromotion } = await import("@/lib/services/ads");
    await purchaseAdPromotion(session.user.id, adId, type);
    revalidatePath("/dashboard");
    revalidatePath("/ads");
    revalidatePath(`/ads/${adId}`);
    revalidatePath(`/dashboard/ads/${adId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_COINS") {
      return { error: "Monetka yetarli emas", code: "INSUFFICIENT_COINS" as const };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Xatolik yuz berdi" };
  }
}

export async function toggleAdPausedAction(adId: string, paused: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Avtorizatsiya talab qilinadi" };
  }

  try {
    const { toggleAdPaused } = await import("@/lib/services/ads");
    await toggleAdPaused(session.user.id, adId, paused);
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/ads/${adId}`);
    revalidatePath("/ads");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Xatolik yuz berdi" };
  }
}

export async function renewAdAction(adId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Avtorizatsiya talab qilinadi" };
  }

  try {
    const { renewUserAd } = await import("@/lib/services/ads");
    await renewUserAd(session.user.id, adId);
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/ads/${adId}`);
    revalidatePath("/ads");
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_COINS") {
      return { error: "Monetka yetarli emas", code: "INSUFFICIENT_COINS" as const };
    }
    if (error instanceof Error) return { error: error.message };
    return { error: "Xatolik yuz berdi" };
  }
}

export async function trackContactClick(adId: string) {
  const { incrementContactClicks } = await import("@/lib/services/ads");
  await incrementContactClicks(adId);
  return { success: true };
}

export async function adminUpdateMonetizationSettings(data: {
  coinValueUzs: number;
  topPromotionCost: number;
  vipPromotionCost: number;
  urgentPromotionCost: number;
  autoCategoryCost: number;
  houseSaleCategoryCost: number;
  rentCategoryCost: number;
  jobCategoryCost: number;
  freeListingsLimit: number;
  topDurationDays: number;
  vipDurationDays: number;
  urgentDurationDays: number;
  contactTelegram?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const { updateMonetizationSettings } = await import("@/lib/services/monetization");
  await updateMonetizationSettings(data);
  revalidatePath("/admin/monetization");
  return { success: true };
}

export async function adminAdjustCoins(
  userId: string,
  amount: number,
  type: "TOPUP" | "BONUS" | "SPEND" | "REFUND",
  description?: string
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const { adminAdjustUserCoins } = await import("@/lib/services/coins");
  try {
    const result = await adminAdjustUserCoins(userId, amount, type, description);
    revalidatePath("/admin/monetization");
    return { success: true, coinBalance: result.coinBalance };
  } catch (error) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Xatolik yuz berdi" };
  }
}

export async function adminSearchUsers(query: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const { searchUsersForAdmin } = await import("@/lib/services/coins");
  const users = await searchUsersForAdmin(query);
  return { success: true, users };
}

export async function adminUpdateCategoryPricing(
  slug: string,
  data: {
    pricingType: "FREE" | "LIMITED_FREE" | "PAID";
    listingCoinCost: number;
    freeLimit: number;
  }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const { updateCategoryPricing } = await import("@/lib/services/categories");
  try {
    await updateCategoryPricing(slug, data);
    revalidatePath("/admin/monetization");
    revalidatePath("/admin/categories");
    return { success: true };
  } catch {
    return { error: "Kategoriya topilmadi" };
  }
}

export async function markAdSold(adId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Avtorizatsiya talab qilinadi" };

  const ad = await getPrisma().ad.findFirst({
    where: { id: adId, createdById: session.user.id },
  });

  if (!ad) return { error: "E'lon topilmadi" };

  await updateAdStatus(adId, "SOLD");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function removeAd(adId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Avtorizatsiya talab qilinadi" };

  const result = await deleteAd(adId, session.user.id);
  if (!result) return { error: "E'lon topilmadi yoki allaqachon o'chirilgan" };

  revalidatePath("/dashboard");
  revalidatePath("/ads");
  revalidatePath(`/ads/${adId}`);
  revalidatePath(`/dashboard/ads/${adId}`);
  return { success: true };
}

export async function getMyFavoriteAdIds(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const { getUserFavoriteIds } = await import("@/lib/services/ads");
  return getUserFavoriteIds(session.user.id);
}

export async function checkAdFavorited(adId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const { isFavorited } = await import("@/lib/services/ads");
  return isFavorited(session.user.id, adId);
}

export async function toggleAdFavorite(adId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Avtorizatsiya talab qilinadi" };

  const result = await toggleFavorite(session.user.id, adId);
  revalidatePath("/dashboard");
  return { success: true, ...result };
}

export async function submitReport(adId: string, reason: string) {
  const session = await auth();

  try {
    await createReport(adId, reason, session?.user?.id);
    return { success: true };
  } catch (error) {
    console.error("Report error:", error);
    return { error: "Shikoyat yuborishda xatolik" };
  }
}

export async function updateProfile(name: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Avtorizatsiya talab qilinadi" };
  }

  const parsed = (await import("@/lib/validations")).updateProfileSchema.safeParse({
    name,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await getPrisma().user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name.trim() },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updatePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Avtorizatsiya talab qilinadi" };
  }

  const { updatePasswordSchema } = await import("@/lib/validations");
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await getPrisma().user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return { error: "Google orqali kirgan hisob uchun parol o'rnatilmagan" };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) {
    return { error: "Joriy parol noto'g'ri" };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);
  await getPrisma().user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  return { success: true };
}

export async function deleteAccount(confirmationEmail: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Avtorizatsiya talab qilinadi" };
  }

  const user = await getPrisma().user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    return { error: "Foydalanuvchi topilmadi" };
  }

  if (confirmationEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
    return { error: "Email mos kelmadi. Hisobni o'chirish bekor qilindi." };
  }

  if (user.role === "ADMIN") {
    const adminCount = await getPrisma().user.count({
      where: { role: "ADMIN", id: { not: user.id } },
    });
    if (adminCount === 0) {
      return {
        error: "Yagona admin hisobini o'chirib bo'lmaydi. Avval boshqa admin tayinlang.",
      };
    }
  }

  await getPrisma().user.delete({ where: { id: user.id } });

  return { success: true };
}

export async function moderateAd(
  adId: string,
  action: "approve" | "reject"
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const ad = await getPrisma().ad.findUnique({
    where: { id: adId },
    select: { title: true, createdById: true },
  });

  if (!ad) {
    return { error: "E'lon topilmadi" };
  }

  const status = action === "approve" ? "APPROVED" : "REJECTED";
  await updateAdStatus(adId, status);

  const { sendPushToUser } = await import("@/lib/services/push-subscriptions");
  void sendPushToUser(ad.createdById, {
    title:
      action === "approve"
        ? "E'loningiz tasdiqlandi"
        : "E'loningiz rad etildi",
    body:
      action === "approve"
        ? `"${ad.title}" endi saytda ko'rinadi`
        : `"${ad.title}" — qayta tahrir qilishingiz mumkin`,
    url: action === "approve" ? `/ads/${adId}` : "/dashboard",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/ads");
  revalidatePath("/");
  revalidatePath("/ads");
  return { success: true };
}

export async function adminDeleteAd(adId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  await updateAdStatus(adId, "DELETED");
  revalidatePath("/admin");
  revalidatePath("/admin/ads");
  revalidatePath("/admin/reports");
  revalidatePath("/ads");
  revalidatePath(`/ads/${adId}`);
  return { success: true };
}

export async function adminBanUser(userId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const { banUser } = await import("@/lib/services/ads");
  await banUser(userId);
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminUnbanUser(userId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const { unbanUser } = await import("@/lib/services/ads");
  await unbanUser(userId);
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminMakeAdmin(userId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const { promoteToAdmin } = await import("@/lib/services/ads");
  await promoteToAdmin(userId);
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminResolveReport(reportId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  await getPrisma().report.delete({ where: { id: reportId } });
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  return { success: true };
}

export async function adminUpdateCategoryImage(
  slug: string,
  imageUrl: string
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const { upsertCategoryImage } = await import("@/lib/services/categories");
  try {
    await upsertCategoryImage(slug, imageUrl);
  } catch {
    return { error: "Kategoriya topilmadi" };
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function adminRemoveCategoryImage(slug: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const { removeCategoryImage } = await import("@/lib/services/categories");
  try {
    await removeCategoryImage(slug);
  } catch {
    return { error: "Kategoriya topilmadi" };
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function adminCreateCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const label = (formData.get("label") as string)?.trim();
  const shortLabel = (formData.get("shortLabel") as string)?.trim();
  const emoji = (formData.get("emoji") as string)?.trim();
  const iconBg = (formData.get("iconBg") as string)?.trim();
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;

  if (!label || label.length < 2) {
    return { error: "Nom kamida 2 ta belgidan iborat bo'lishi kerak" };
  }
  if (!shortLabel || shortLabel.length < 2) {
    return { error: "Qisqa nom kamida 2 ta belgidan iborat bo'lishi kerak" };
  }

  const { createCategory } = await import("@/lib/services/categories");
  const category = await createCategory({
    label,
    shortLabel,
    emoji: emoji || "📦",
    iconBg: iconBg || "bg-blue-100",
    imageUrl,
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true, category };
}

export async function adminDeleteCategory(slug: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const { deactivateCategory } = await import("@/lib/services/categories");
  try {
    const result = await deactivateCategory(slug);
    revalidatePath("/");
    revalidatePath("/admin/categories");
    if (result.deactivated) {
      return { success: true, message: "Kategoriya yashirildi (e'lonlar mavjud)" };
    }
    return { success: true, message: "Kategoriya o'chirildi" };
  } catch {
    return { error: "Kategoriya topilmadi" };
  }
}

function revalidateBannerPaths() {
  revalidatePath("/");
  revalidatePath("/admin/banners");
}

export async function adminUpdatePromoBannerImage(id: string, imageUrl: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const { updatePromoBanner } = await import("@/lib/services/promo-banners");
  const { invalidatePromoBannersCache } = await import("@/lib/cache-invalidate");
  const { revalidateTag } = await import("next/cache");

  try {
    await updatePromoBanner(id, { imageUrl });
    await invalidatePromoBannersCache();
    revalidateTag("banners", "max");
    revalidateBannerPaths();
    return { success: true };
  } catch {
    return { error: "Banner topilmadi" };
  }
}

export async function adminRemovePromoBannerImage(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const { updatePromoBanner } = await import("@/lib/services/promo-banners");
  const { invalidatePromoBannersCache } = await import("@/lib/cache-invalidate");
  const { revalidateTag } = await import("next/cache");

  try {
    await updatePromoBanner(id, { imageUrl: null });
    await invalidatePromoBannersCache();
    revalidateTag("banners", "max");
    revalidateBannerPaths();
    return { success: true };
  } catch {
    return { error: "Banner topilmadi" };
  }
}

export async function adminSavePromoBanner(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const id = (formData.get("id") as string | null)?.trim() || null;
  const title = (formData.get("title") as string)?.trim();
  const subtitle = (formData.get("subtitle") as string)?.trim();
  const href = (formData.get("href") as string)?.trim() || "/ads";
  const ctaLabel = (formData.get("ctaLabel") as string)?.trim() || "Ko'rish";
  const bgClass =
    (formData.get("bgClass") as string)?.trim() || "from-violet-500 to-purple-600";
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);
  const isActive = formData.get("isActive") === "true";

  if (!title || title.length < 2) {
    return { error: "Sarlavha kamida 2 ta belgidan iborat bo'lishi kerak" };
  }
  if (!subtitle || subtitle.length < 2) {
    return { error: "Qisqa matn kamida 2 ta belgidan iborat bo'lishi kerak" };
  }

  const {
    createPromoBanner,
    updatePromoBanner,
  } = await import("@/lib/services/promo-banners");
  const { invalidatePromoBannersCache } = await import("@/lib/cache-invalidate");
  const { revalidateTag } = await import("next/cache");

  try {
    if (id) {
      await updatePromoBanner(id, {
        title,
        subtitle,
        href,
        ctaLabel,
        bgClass,
        imageUrl,
        sortOrder: Number.isNaN(sortOrder) ? 0 : sortOrder,
        isActive,
      });
    } else {
      await createPromoBanner({
        title,
        subtitle,
        href,
        ctaLabel,
        bgClass,
        imageUrl,
        sortOrder: Number.isNaN(sortOrder) ? undefined : sortOrder,
        isActive,
      });
    }

    await invalidatePromoBannersCache();
    revalidateTag("banners", "max");
    revalidateBannerPaths();
    return { success: true };
  } catch {
    return { error: "Banner saqlanmadi" };
  }
}

export async function adminDeletePromoBanner(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Ruxsat yo'q" };
  }

  const { deletePromoBanner } = await import("@/lib/services/promo-banners");
  const { invalidatePromoBannersCache } = await import("@/lib/cache-invalidate");
  const { revalidateTag } = await import("next/cache");

  try {
    await deletePromoBanner(id);
    await invalidatePromoBannersCache();
    revalidateTag("banners", "max");
    revalidateBannerPaths();
    return { success: true };
  } catch {
    return { error: "Banner topilmadi" };
  }
}
