import type { CategoryData } from "@/types";

export function findCategory(
  categories: CategoryData[],
  slug: string
): CategoryData | undefined {
  return categories.find((c) => c.slug === slug);
}

export const CATEGORY_ICON_BGS = [
  { value: "bg-blue-100", label: "Ko'k" },
  { value: "bg-emerald-100", label: "Yashil" },
  { value: "bg-orange-100", label: "To'q sariq" },
  { value: "bg-purple-100", label: "Binafsha" },
  { value: "bg-pink-100", label: "Pushti" },
  { value: "bg-cyan-100", label: "Moviy" },
] as const;

export const CATEGORY_EMOJI_PRESETS = ["🚗", "🏠", "📦", "📢", "💼", "🛠️", "🐾", "👕", "📱", "🍽️"];
