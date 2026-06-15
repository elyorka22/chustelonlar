#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "❌ .env file not found. Copy .env.example to .env first."
  exit 1
fi

set -a
source .env
set +a

DOMAIN="${DOMAIN:-chustelon.uz}"

echo "🚀 Chust E'lon — Production Deployment"
echo "======================================="

required_vars=(
  "AUTH_SECRET"
  "POSTGRES_PASSWORD"
  "DO_SPACES_KEY"
  "DO_SPACES_SECRET"
  "DO_SPACES_BUCKET"
  "DO_SPACES_CDN_URL"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "❌ Missing required env var: $var"
    exit 1
  fi
done

if [ "$AUTH_SECRET" = "generate-with-openssl-rand-base64-32" ] || [ "$AUTH_SECRET" = "dev-secret-change-in-production-32chars" ]; then
  echo "❌ AUTH_SECRET must be changed from the default value"
  echo "   Generate: openssl rand -base64 32"
  exit 1
fi

if [ -d .git ]; then
  echo "📦 Pulling latest changes..."
  git pull origin main || git pull origin master || true
fi

echo "🔨 Building Docker images..."
docker compose build app

echo "🗄️ Starting database services..."
docker compose up -d postgres redis

echo "⏳ Waiting for PostgreSQL..."
sleep 5

echo "🗄️ Running database migrations..."
docker compose run --rm migrate

if [ "${SEED_DB:-false}" = "true" ]; then
  echo "🌱 Seeding database (SEED_DB=true)..."
  docker compose --profile seed run --rm seed
else
  echo "⏭️  Seed skipped (set SEED_DB=true in .env for first deploy)"
fi

echo "🔄 Starting all services..."
docker compose up -d

echo "⏳ Waiting for app health check..."
for i in $(seq 1 30); do
  if docker compose exec -T app curl -sf http://localhost:3000/api/categories > /dev/null 2>&1; then
    echo "✅ App is healthy!"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "⚠️  Health check timed out. Check logs: docker compose logs app"
    exit 1
  fi
  sleep 2
done

echo ""
echo "🎉 Deployment complete!"
echo "   App:  https://$DOMAIN"
echo "   Logs: docker compose logs -f app"
echo ""
echo "Next: run SSL setup if not done yet:"
echo "   ./scripts/setup-ssl.sh $DOMAIN admin@$DOMAIN"
