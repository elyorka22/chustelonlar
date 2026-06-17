export const CHEGIRMA_CATEGORIES = [
  { value: "food", label: "Oziq-ovqat", emoji: "🍔" },
  { value: "clothing", label: "Kiyim", emoji: "👕" },
  { value: "tech", label: "Texnika", emoji: "📱" },
  { value: "beauty", label: "Go'zallik", emoji: "💄" },
  { value: "services", label: "Xizmatlar", emoji: "🛠️" },
  { value: "other", label: "Boshqa", emoji: "🏷️" },
] as const;

export type ChegirmaCategory = (typeof CHEGIRMA_CATEGORIES)[number]["value"];

export function getChegirmaCategoryLabel(value: string): string {
  return CHEGIRMA_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getChegirmaCategoryEmoji(value: string): string {
  return CHEGIRMA_CATEGORIES.find((c) => c.value === value)?.emoji ?? "🏷️";
}
