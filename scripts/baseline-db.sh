#!/bin/bash
# Baseline an existing database that was created with `prisma db push`
# Run once on servers where _prisma_migrations table does not exist.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "📌 Baselining existing database..."

npx prisma migrate resolve --applied 0_init
npx prisma migrate resolve --applied 20250614120000_upgrade_categories
npx prisma migrate deploy

echo "✅ Database baselined. Future deploys use: ./scripts/deploy.sh"
