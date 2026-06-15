#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

DOMAIN="${1:-chustelon.uz}"

echo "🚀 Chust E'lon — First-time Production Setup"
echo "============================================="

if [ ! -f .env ]; then
  echo "📋 Creating .env from .env.example..."
  cp .env.example .env
  echo ""
  echo "⚠️  Edit .env with your production values before continuing:"
  echo "   nano .env"
  echo ""
  echo "Required:"
  echo "   AUTH_SECRET=$(openssl rand -base64 32)"
  echo "   POSTGRES_PASSWORD=<strong password>"
  echo "   DO_SPACES_KEY / DO_SPACES_SECRET"
  echo "   NEXTAUTH_URL / NEXT_PUBLIC_APP_URL"
  exit 1
fi

set -a
source .env
set +a

if ! command -v docker &> /dev/null; then
  echo "❌ Docker not installed. Run scripts/setup-server.sh on the server first."
  exit 1
fi

echo "1️⃣  Building and starting infrastructure..."
docker compose up -d postgres redis

echo "2️⃣  Running migrations..."
docker compose build migrate
docker compose run --rm migrate

echo "3️⃣  Seeding (optional)..."
read -p "Seed demo data? Only for staging/test (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  docker compose --profile seed run --rm seed
fi

echo "4️⃣  Starting application..."
docker compose up -d --build

echo ""
echo "✅ First deploy complete!"
echo ""
echo "5️⃣  Setup SSL (after DNS points to this server):"
echo "   ./scripts/setup-ssl.sh $DOMAIN admin@$DOMAIN"
echo ""
echo "6️⃣  Future updates:"
echo "   ./scripts/deploy.sh"
