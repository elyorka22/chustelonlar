CREATE TABLE IF NOT EXISTS "promo_banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "href" TEXT NOT NULL DEFAULT '/ads',
    "cta_label" TEXT NOT NULL DEFAULT 'Ko''rish',
    "image_url" TEXT,
    "bg_class" TEXT NOT NULL DEFAULT 'from-violet-500 to-purple-600',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_banners_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "promo_banners_is_active_sort_order_idx" ON "promo_banners"("is_active", "sort_order");
