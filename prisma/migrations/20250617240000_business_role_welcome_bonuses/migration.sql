-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'BUSINESS';

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "user_welcome_bonus_granted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "business_welcome_bonus_granted" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "monetization_settings"
ADD COLUMN IF NOT EXISTS "new_user_welcome_bonus" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "new_business_welcome_bonus" INTEGER NOT NULL DEFAULT 0;
