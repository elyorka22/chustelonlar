-- Monetka coin economy
CREATE TYPE "CategoryPricingType" AS ENUM ('FREE', 'LIMITED_FREE', 'PAID');
CREATE TYPE "CoinTransactionType" AS ENUM ('TOPUP', 'SPEND', 'REFUND', 'BONUS', 'AD_PROMOTION');

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "coin_balance" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "total_coins_purchased" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "total_coins_spent" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "pricing_type" "CategoryPricingType" NOT NULL DEFAULT 'FREE';
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "listing_coin_cost" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "free_limit" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "ads" ADD COLUMN IF NOT EXISTS "is_top" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ads" ADD COLUMN IF NOT EXISTS "top_until" TIMESTAMP(3);
ALTER TABLE "ads" ADD COLUMN IF NOT EXISTS "is_vip" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ads" ADD COLUMN IF NOT EXISTS "vip_until" TIMESTAMP(3);
ALTER TABLE "ads" ADD COLUMN IF NOT EXISTS "is_urgent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ads" ADD COLUMN IF NOT EXISTS "urgent_until" TIMESTAMP(3);
ALTER TABLE "ads" ADD COLUMN IF NOT EXISTS "contact_clicks" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ads" ADD COLUMN IF NOT EXISTS "listing_coin_cost" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "monetization_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "coin_value_uzs" INTEGER NOT NULL DEFAULT 10000,
    "top_promotion_cost" INTEGER NOT NULL DEFAULT 5,
    "vip_promotion_cost" INTEGER NOT NULL DEFAULT 8,
    "urgent_promotion_cost" INTEGER NOT NULL DEFAULT 3,
    "auto_category_cost" INTEGER NOT NULL DEFAULT 3,
    "house_sale_category_cost" INTEGER NOT NULL DEFAULT 5,
    "rent_category_cost" INTEGER NOT NULL DEFAULT 2,
    "job_category_cost" INTEGER NOT NULL DEFAULT 2,
    "free_listings_limit" INTEGER NOT NULL DEFAULT 2,
    "top_duration_days" INTEGER NOT NULL DEFAULT 7,
    "vip_duration_days" INTEGER NOT NULL DEFAULT 7,
    "urgent_duration_days" INTEGER NOT NULL DEFAULT 7,
    "contact_telegram" TEXT,
    "contact_phone" TEXT,
    "contact_whatsapp" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "monetization_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "monetization_settings" ("id", "updated_at")
VALUES ('default', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

CREATE TABLE IF NOT EXISTS "coin_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "CoinTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "ad_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coin_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "coin_transactions_user_id_idx" ON "coin_transactions"("user_id");
CREATE INDEX IF NOT EXISTS "coin_transactions_created_at_idx" ON "coin_transactions"("created_at");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'coin_transactions_user_id_fkey') THEN
    ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'coin_transactions_ad_id_fkey') THEN
    ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_ad_id_fkey"
      FOREIGN KEY ("ad_id") REFERENCES "ads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Default category pricing (admin can change later)
UPDATE "categories" SET "pricing_type" = 'PAID', "listing_coin_cost" = 3, "free_limit" = 0 WHERE "slug" = 'AUTOMOBILES';
UPDATE "categories" SET "pricing_type" = 'PAID', "listing_coin_cost" = 5, "free_limit" = 0 WHERE "slug" = 'REAL_ESTATE';
UPDATE "categories" SET "pricing_type" = 'LIMITED_FREE', "listing_coin_cost" = 2, "free_limit" = 2 WHERE "slug" = 'ITEMS';
UPDATE "categories" SET "pricing_type" = 'PAID', "listing_coin_cost" = 2, "free_limit" = 0 WHERE "slug" = 'OTHER';
