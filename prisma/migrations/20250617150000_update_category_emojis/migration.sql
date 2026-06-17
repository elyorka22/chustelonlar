-- Update default category emojis to 3D-style object icons (matching Sotiladigan buyumlar)
UPDATE "categories" SET "emoji" = '🚙' WHERE "slug" = 'AUTOMOBILES';
UPDATE "categories" SET "emoji" = '🏡' WHERE "slug" = 'REAL_ESTATE';
UPDATE "categories" SET "emoji" = '📮' WHERE "slug" = 'OTHER';
