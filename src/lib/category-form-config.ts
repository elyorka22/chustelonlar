export type CategoryFieldType = "text" | "number" | "select";

export interface CategoryFormField {
  key: string;
  label: string;
  placeholder?: string;
  type: CategoryFieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface CategoryFormConfig {
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  descriptionHint: string;
  fields: CategoryFormField[];
}

const AUTOMOBILES: CategoryFormConfig = {
  titlePlaceholder: "Masalan: Chevrolet Cobalt 2020",
  descriptionPlaceholder: "Holati, komplektatsiya, xizmat tarixi...",
  descriptionHint: "Avtomobil haqida batafsil yozing",
  fields: [
    { key: "brand", label: "Marka", placeholder: "Chevrolet", type: "text", required: true },
    { key: "model", label: "Model", placeholder: "Cobalt", type: "text", required: true },
    { key: "year", label: "Ishlab chiqarilgan yil", placeholder: "2018", type: "number", required: true },
    {
      key: "mileage",
      label: "Yurgan masofa (km)",
      placeholder: "85000",
      type: "number",
      required: true,
    },
    {
      key: "fuel",
      label: "Yoqilg'i turi",
      type: "select",
      required: true,
      options: [
        { value: "Benzin", label: "Benzin" },
        { value: "Gaz", label: "Gaz" },
        { value: "Dizel", label: "Dizel" },
        { value: "Gibrid", label: "Gibrid" },
        { value: "Elektr", label: "Elektr" },
      ],
    },
    {
      key: "transmission",
      label: "Uzatma qutisi",
      type: "select",
      required: true,
      options: [
        { value: "Avtomat", label: "Avtomat" },
        { value: "Mexanik", label: "Mexanik" },
        { value: "Variator", label: "Variator" },
        { value: "Robot", label: "Robot" },
      ],
    },
  ],
};

const REAL_ESTATE: CategoryFormConfig = {
  titlePlaceholder: "Masalan: 3 xonali kvartira — Markaz",
  descriptionPlaceholder: "Remont, qo'shimcha qulayliklar, atrofdagi obyektlar...",
  descriptionHint: "Ko'chmas mulk haqida batafsil yozing",
  fields: [
    {
      key: "propertyType",
      label: "Mulk turi",
      type: "select",
      required: true,
      options: [
        { value: "Kvartira", label: "Kvartira" },
        { value: "Uy", label: "Uy" },
        { value: "Yer", label: "Yer" },
        { value: "Ofis", label: "Ofis" },
        { value: "Do'kon", label: "Do'kon" },
      ],
    },
    { key: "rooms", label: "Xonalar soni", placeholder: "3", type: "number", required: true },
    { key: "area", label: "Maydon (m²)", placeholder: "75", type: "number", required: true },
    { key: "floor", label: "Qavat", placeholder: "5 / 9", type: "text" },
    {
      key: "dealType",
      label: "Bitim turi",
      type: "select",
      required: true,
      options: [
        { value: "Sotish", label: "Sotish" },
        { value: "Ijara", label: "Ijara" },
      ],
    },
  ],
};

const ITEMS: CategoryFormConfig = {
  titlePlaceholder: "Masalan: iPhone 15 Pro Max 256GB",
  descriptionPlaceholder: "Holati, komplekt, ishlatilgan vaqti...",
  descriptionHint: "Buyum haqida batafsil yozing",
  fields: [
    {
      key: "condition",
      label: "Holati",
      type: "select",
      required: true,
      options: [
        { value: "Yangi", label: "Yangi" },
        { value: "Ideal", label: "Ideal" },
        { value: "Yaxshi", label: "Yaxshi" },
        { value: "O'rtacha", label: "O'rtacha" },
      ],
    },
    { key: "brand", label: "Brend", placeholder: "Apple", type: "text" },
    {
      key: "delivery",
      label: "Yetkazib berish",
      type: "select",
      options: [
        { value: "Bor", label: "Bor" },
        { value: "Yo'q", label: "Yo'q" },
        { value: "Kelishiladi", label: "Kelishiladi" },
      ],
    },
  ],
};

const OTHER: CategoryFormConfig = {
  titlePlaceholder: "E'lon sarlavhasi",
  descriptionPlaceholder: "Xizmat yoki e'lon haqida batafsil...",
  descriptionHint: "E'lon haqida batafsil yozing",
  fields: [
    {
      key: "offerType",
      label: "E'lon turi",
      type: "select",
      options: [
        { value: "Xizmat", label: "Xizmat" },
        { value: "Ish", label: "Ish" },
        { value: "Boshqa", label: "Boshqa" },
      ],
    },
  ],
};

export const CATEGORY_FORM_CONFIGS: Record<string, CategoryFormConfig> = {
  AUTOMOBILES,
  REAL_ESTATE,
  ITEMS,
  OTHER,
};

export function getCategoryFormConfig(slug: string): CategoryFormConfig {
  if (CATEGORY_FORM_CONFIGS[slug]) {
    return CATEGORY_FORM_CONFIGS[slug];
  }

  const upper = slug.toUpperCase();
  if (/AUTO|AVTO|MASHINA|CAR/.test(upper)) return AUTOMOBILES;
  if (/REAL|MULK|UY|KVARTIRA|HOUSE|ESTATE/.test(upper)) return REAL_ESTATE;
  if (/ITEM|BUYUM|TOVAR|PHONE|ELECTRON/.test(upper)) return ITEMS;

  return OTHER;
}

export function buildDescriptionWithExtras(
  baseDescription: string,
  config: CategoryFormConfig,
  extras: Record<string, string>
): string {
  const lines = config.fields
    .map((field) => {
      const value = extras[field.key]?.trim();
      if (!value) return null;
      return `${field.label}: ${value}`;
    })
    .filter(Boolean);

  if (lines.length === 0) {
    return baseDescription.trim();
  }

  return `${baseDescription.trim()}\n\n---\n${lines.join("\n")}`;
}

export function validateCategoryExtras(
  config: CategoryFormConfig,
  extras: Record<string, string>
): string | null {
  for (const field of config.fields) {
    if (field.required && !extras[field.key]?.trim()) {
      return `"${field.label}" maydonini to'ldiring`;
    }
  }
  return null;
}
