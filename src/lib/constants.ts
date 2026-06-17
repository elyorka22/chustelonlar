export const APP_NAME = "Chust E'lon";
export const APP_DESCRIPTION =
  "Chust shahri uchun zamonaviy e'lonlar platformasi";

export const MAP_CENTER = {
  lat: parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LAT || "41.0033"),
  lng: parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LNG || "71.2370"),
};

export const MAP_ZOOM = 13;

export const CATEGORY_ICON_BGS = [
  "bg-blue-100",
  "bg-emerald-100",
  "bg-orange-100",
  "bg-purple-100",
  "bg-pink-100",
  "bg-cyan-100",
] as const;

export const DISTRICTS = [
  "Markaz",
  "Yangi hayot",
  "Qorasaroy",
  "Oltinsoy",
  "Bog'iston",
  "Chust tumani",
] as const;

export const AD_STATUS_LABELS: Record<string, string> = {
  PENDING: "Kutilmoqda",
  APPROVED: "Faol",
  REJECTED: "Rad etilgan",
  SOLD: "Sotilgan",
  DELETED: "O'chirilgan",
};

export const AD_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  SOLD: "bg-gray-100 text-gray-600",
  DELETED: "bg-red-100 text-red-700",
};

export const MAX_IMAGES = 10;
export const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const IMAGE_CONFIG = {
  fullMaxWidth: 1920,
  thumbWidth: 400,
  webpQuality: 78,
} as const;

export const PRIMARY_COLOR = "#2563EB";

export const NAV_ITEMS = [
  { href: "/", label: "Bosh sahifa", icon: "home" },
  { href: "/chegirmalar", label: "Chegirmalar", icon: "tag" },
  { href: "/create", label: "E'lon joylash", icon: "plus", center: true },
  { href: "/map", label: "Xarita", icon: "map" },
  { href: "/dashboard", label: "Profil", icon: "user" },
] as const;
