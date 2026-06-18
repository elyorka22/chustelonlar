import { z } from "zod";
import { MAX_IMAGES } from "@/lib/constants";

export const createAdSchema = z.object({
  title: z
    .string()
    .min(5, "Sarlavha kamida 5 ta belgidan iborat bo'lishi kerak")
    .max(120, "Sarlavha 120 ta belgidan oshmasligi kerak"),
  description: z
    .string()
    .min(20, "Tavsif kamida 20 ta belgidan iborat bo'lishi kerak")
    .max(5000, "Tavsif 5000 ta belgidan oshmasligi kerak"),
  category: z
    .string()
    .min(1, "Kategoriyani tanlang")
    .max(50, "Kategoriya noto'g'ri"),
  price: z
    .number()
    .min(0, "Narx manfiy bo'lishi mumkin emas")
    .max(999999999999, "Narx juda katta"),
  priceCurrency: z.enum(["UZS", "USD"]).default("UZS"),
  priceNegotiable: z.boolean().default(false),
  latitude: z.number().min(40.9).max(41.2),
  longitude: z.number().min(71.1).max(71.4),
  district: z.string().min(2).max(100).default("Chust"),
  phone: z
    .string()
    .min(9, "Telefon raqam noto'g'ri")
    .max(20, "Telefon raqam noto'g'ri"),
  telegram: z.string().max(32).optional(),
  imageIds: z
    .array(z.string())
    .min(1, "Kamida 1 ta rasm yuklang")
    .max(MAX_IMAGES, `Maksimum ${MAX_IMAGES} ta rasm`),
});

export const updateAdSchema = createAdSchema.partial().extend({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SOLD", "DELETED"]).optional(),
});

export const adFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().min(1).max(50).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  district: z.string().optional(),
  sort: z.enum(["newest", "popular", "price_asc", "price_desc"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

export const reportSchema = z.object({
  adId: z.string(),
  reason: z
    .string()
    .min(10, "Sabab kamida 10 ta belgidan iborat bo'lishi kerak")
    .max(500, "Sabab 500 ta belgidan oshmasligi kerak"),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email("Email noto'g'ri"),
  password: z
    .string()
    .min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak")
    .max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createChegirmaSchema = z.object({
  businessName: z
    .string()
    .min(2, "Do'kon nomi kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(100),
  description: z
    .string()
    .min(10, "Tavsif kamida 10 ta belgidan iborat bo'lishi kerak")
    .max(2000),
  discountLabel: z
    .string()
    .min(2, "Chegirma belgisini kiriting (masalan: -30%)")
    .max(50),
  category: z.enum(["food", "clothing", "tech", "beauty", "services", "other"]),
  imageUrls: z
    .array(z.string().min(1))
    .min(1, "Kamida bitta rasm yuklang")
    .max(5, "Maksimum 5 ta rasm"),
  latitude: z.number().min(40.9).max(41.2),
  longitude: z.number().min(71.1).max(71.4),
  district: z.string().min(2).max(100),
  address: z.string().max(200).optional(),
  phone: z.string().min(9).max(20),
  telegram: z.string().max(32).optional(),
});

export type CreateChegirmaInput = z.infer<typeof createChegirmaSchema>;

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(100, "Ism 100 ta belgidan oshmasligi kerak"),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Joriy parolni kiriting"),
    newPassword: z
      .string()
      .min(8, "Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak")
      .max(100),
    confirmPassword: z.string().min(1, "Parolni tasdiqlang"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Parollar mos kelmadi",
    path: ["confirmPassword"],
  });

export type CreateAdInput = z.infer<typeof createAdSchema>;
export type AdFilterInput = z.infer<typeof adFilterSchema>;
