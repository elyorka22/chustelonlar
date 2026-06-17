CREATE TYPE "ChegirmaStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'DELETED');

CREATE TABLE IF NOT EXISTS "chegirmalar" (
    "id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "discount_label" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "district" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT NOT NULL,
    "telegram" TEXT,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "status" "ChegirmaStatus" NOT NULL DEFAULT 'PENDING',
    "listing_coin_cost" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chegirmalar_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "monetization_settings"
ADD COLUMN IF NOT EXISTS "chegirma_listing_cost" INTEGER NOT NULL DEFAULT 2;

CREATE INDEX IF NOT EXISTS "chegirmalar_status_valid_until_idx" ON "chegirmalar"("status", "valid_until");
CREATE INDEX IF NOT EXISTS "chegirmalar_category_idx" ON "chegirmalar"("category");
CREATE INDEX IF NOT EXISTS "chegirmalar_district_idx" ON "chegirmalar"("district");

ALTER TABLE "chegirmalar"
ADD CONSTRAINT "chegirmalar_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
