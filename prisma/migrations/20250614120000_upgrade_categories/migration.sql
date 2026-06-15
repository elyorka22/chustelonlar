-- Upgrade path: old schema (AdCategory enum) -> dynamic categories table
-- Safe to run on DBs that already have 0_init with AdCategory enum

-- Create categories table if missing
CREATE TABLE IF NOT EXISTS "categories" (
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "short_label" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📦',
    "icon_bg" TEXT NOT NULL DEFAULT 'bg-blue-100',
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("slug")
);

INSERT INTO "categories" ("slug", "label", "short_label", "emoji", "icon_bg", "sort_order", "updated_at") VALUES
  ('AUTOMOBILES', 'Avtomobillar', 'Avtomobil', '🚗', 'bg-blue-100', 0, CURRENT_TIMESTAMP),
  ('REAL_ESTATE', 'Ko''chmas mulk', 'Mulk', '🏠', 'bg-emerald-100', 1, CURRENT_TIMESTAMP),
  ('ITEMS', 'Sotiladigan buyumlar', 'Buyumlar', '📦', 'bg-orange-100', 2, CURRENT_TIMESTAMP),
  ('OTHER', 'Boshqa e''lonlar', 'Boshqa', '📢', 'bg-purple-100', 3, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- Convert ads.category from enum to text (if still enum type)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ads'
      AND column_name = 'category'
      AND udt_name = 'AdCategory'
  ) THEN
    ALTER TABLE "ads" ALTER COLUMN "category" TYPE TEXT USING "category"::text;
  END IF;
END $$;

-- Drop old enum if exists
DROP TYPE IF EXISTS "AdCategory";

-- Drop legacy table if exists
DROP TABLE IF EXISTS "category_configs";

-- Add FK if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ads_category_fkey'
  ) THEN
    ALTER TABLE "ads" ADD CONSTRAINT "ads_category_fkey"
      FOREIGN KEY ("category") REFERENCES "categories"("slug")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
