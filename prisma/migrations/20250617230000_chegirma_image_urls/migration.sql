ALTER TABLE "chegirmalar" ADD COLUMN IF NOT EXISTS "image_urls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "chegirmalar"
SET "image_urls" = ARRAY["image_url"]
WHERE "image_url" IS NOT NULL
  AND "image_url" <> ''
  AND cardinality("image_urls") = 0;
