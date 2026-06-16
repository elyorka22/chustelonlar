"use server";

import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
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
    return { error: "E'lon yaratishda xatolik yuz berdi" };
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
  if (!result) return { error: "E'lon topilmadi" };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleAdFavorite(adId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Avtorizatsiya talab qilinadi" };

  const result = await toggleFavorite(session.user.id, adId);
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

  const status = action === "approve" ? "APPROVED" : "REJECTED";
  await updateAdStatus(adId, status);
  revalidatePath("/admin");
  revalidatePath("/admin/ads");
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
