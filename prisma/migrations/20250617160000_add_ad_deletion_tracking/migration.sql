ALTER TABLE "ads" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "ads" ADD COLUMN IF NOT EXISTS "images_purged_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "ads_deleted_at_idx" ON "ads"("deleted_at");

UPDATE "ads"
SET "deleted_at" = "updatedAt"
WHERE "status" = 'DELETED' AND "deleted_at" IS NULL;
