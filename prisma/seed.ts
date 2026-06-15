import { PrismaClient, AdStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CHUST_CENTER = { lat: 41.0033, lng: 71.2370 };

const defaultCategories = [
  {
    slug: "AUTOMOBILES",
    label: "Avtomobillar",
    shortLabel: "Avtomobil",
    emoji: "🚗",
    iconBg: "bg-blue-100",
    sortOrder: 0,
  },
  {
    slug: "REAL_ESTATE",
    label: "Ko'chmas mulk",
    shortLabel: "Mulk",
    emoji: "🏠",
    iconBg: "bg-emerald-100",
    sortOrder: 1,
  },
  {
    slug: "ITEMS",
    label: "Sotiladigan buyumlar",
    shortLabel: "Buyumlar",
    emoji: "📦",
    iconBg: "bg-orange-100",
    sortOrder: 2,
  },
  {
    slug: "OTHER",
    label: "Boshqa e'lonlar",
    shortLabel: "Boshqa",
    emoji: "📢",
    iconBg: "bg-purple-100",
    sortOrder: 3,
  },
];

const sampleAds = [
  {
    title: "Toyota Camry 2018 — ideal holatda",
    description:
      "Toyota Camry 2018 yil, 85 000 km yurgan. To'liq xizmat ko'rsatilgan, barcha hujjatlari tayyor. Rang: oq. Ichki jihozlari to'liq.",
    category: "AUTOMOBILES",
    price: 185000000,
    district: "Markaz",
    phone: "+998901234567",
    telegram: "camry_seller",
    isPremium: true,
    latOffset: 0.005,
    lngOffset: -0.003,
  },
  {
    title: "3 xonali kvartira sotiladi — Markaz",
    description:
      "Chust markazida 3 xonali kvartira. 75 kv.m, 5-qavat, lift bor. Remont qilingan, mebellar bilan. Maktab va bozor yaqinida.",
    category: "REAL_ESTATE",
    price: 450000000,
    district: "Markaz",
    phone: "+998907654321",
    isPremium: true,
    latOffset: -0.002,
    lngOffset: 0.004,
  },
  {
    title: "iPhone 15 Pro Max 256GB",
    description:
      "iPhone 15 Pro Max, 256GB, Natural Titanium rang. 3 oy ishlatilgan, ideal holatda. Quti va aksessuarlar bilan.",
    category: "ITEMS",
    price: 14500000,
    district: "Yangi hayot",
    phone: "+998909876543",
    telegram: "iphone_chust",
    latOffset: 0.008,
    lngOffset: 0.002,
  },
  {
    title: "Samsung 55\" Smart TV",
    description:
      "Samsung 55 dyuymli Smart TV, 4K UHD. 1 yil ishlatilgan, muammosiz ishlaydi. Pult va quti bilan.",
    category: "ITEMS",
    price: 3500000,
    district: "Qorasaroy",
    phone: "+998901112233",
    latOffset: -0.006,
    lngOffset: -0.005,
  },
  {
    title: "Ishchi qidirilmoqda — do'kon sotuvchisi",
    description:
      "Chust markazidagi do'konga tajribali sotuvchi kerak. Maosh kelishiladi. Yotoqxona beriladi.",
    category: "OTHER",
    price: 0,
    district: "Markaz",
    phone: "+998903334455",
    latOffset: 0.003,
    lngOffset: 0.006,
  },
  {
    title: "Chevrolet Cobalt 2020",
    description:
      "Chevrolet Cobalt 2020, 45 000 km. Gaz + benzin. Ideal holatda, kreditga beriladi.",
    category: "AUTOMOBILES",
    price: 95000000,
    district: "Oltinsoy",
    phone: "+998905556677",
    latOffset: 0.01,
    lngOffset: -0.008,
  },
  {
    title: "2 xonali uy sotiladi",
    description:
      "2 xonali mustaqil uy, 4 sotix. Bog'cha va garaj bor. Remont qilingan.",
    category: "REAL_ESTATE",
    price: 280000000,
    district: "Bog'iston",
    phone: "+998907778899",
    isPremium: true,
    latOffset: -0.009,
    lngOffset: 0.007,
  },
  {
    title: "Velosiped — yangi",
    description: "Sport velosiped, yangi, quti bilan. 21 pog'onali.",
    category: "ITEMS",
    price: 2500000,
    district: "Chust tumani",
    phone: "+998909990011",
    latOffset: 0.004,
    lngOffset: -0.002,
  },
];

const PLACEHOLDER_FULL = "https://placehold.co/800x600/e2e8f0/64748b?text=Chust+E%27lon";
const PLACEHOLDER_THUMB = "https://placehold.co/400x300/e2e8f0/64748b?text=Chust+E%27lon";

async function main() {
  if (process.env.SEED_DB !== "true") {
    console.log("⏭️  Seed skipped (set SEED_DB=true to enable)");
    return;
  }

  console.log("🌱 Seeding database...");

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${defaultCategories.length} categories`);

  const adminPassword = await bcrypt.hash("admin123456", 12);
  const userPassword = await bcrypt.hash("user123456", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@chustelon.uz" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@chustelon.uz",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@chustelon.uz" },
    update: {},
    create: {
      name: "Test Foydalanuvchi",
      email: "user@chustelon.uz",
      password: userPassword,
      role: UserRole.USER,
    },
  });

  console.log(`✅ Admin: ${admin.email} (parol: admin123456)`);
  console.log(`✅ User: ${user.email} (parol: user123456)`);

  const existingAds = await prisma.ad.count();
  if (existingAds === 0) {
    for (const [index, ad] of sampleAds.entries()) {
      const created = await prisma.ad.create({
        data: {
          title: ad.title,
          description: ad.description,
          category: ad.category,
          price: ad.price,
          latitude: CHUST_CENTER.lat + ad.latOffset,
          longitude: CHUST_CENTER.lng + ad.lngOffset,
          district: ad.district,
          phone: ad.phone,
          telegram: ad.telegram || null,
          status: AdStatus.APPROVED,
          isPremium: ad.isPremium || false,
          views: Math.floor(Math.random() * 500) + 10,
          createdById: index % 2 === 0 ? admin.id : user.id,
          images: {
            create: [
              {
                fullUrl: PLACEHOLDER_FULL,
                thumbUrl: PLACEHOLDER_THUMB,
                order: 0,
              },
            ],
          },
        },
      });
      console.log(`  📋 ${created.title}`);
    }

    const pendingAd = await prisma.ad.create({
      data: {
        title: "Kutilayotgan e'lon — test",
        description: "Bu e'lon admin tasdiqlashini kutmoqda. Moderatsiya testi uchun.",
        category: "OTHER",
        price: 1000000,
        latitude: CHUST_CENTER.lat,
        longitude: CHUST_CENTER.lng,
        district: "Markaz",
        phone: "+998900000000",
        status: AdStatus.PENDING,
        createdById: user.id,
        images: {
          create: [
            {
              fullUrl: PLACEHOLDER_FULL,
              thumbUrl: PLACEHOLDER_THUMB,
              order: 0,
            },
          ],
        },
      },
    });
    console.log(`  ⏳ Pending: ${pendingAd.title}`);
  }

  console.log("\n🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
