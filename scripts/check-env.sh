#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "❌ .env not found"
  exit 1
fi

set -a
source .env
set +a

errors=0

check() {
  local var="$1"
  local label="$2"
  if [ -z "${!var:-}" ]; then
    echo "❌ $label ($var) — not set"
    errors=$((errors + 1))
  else
    echo "✅ $label"
  fi
}

echo "🔍 Checking production environment..."
echo ""

check AUTH_SECRET "Auth secret"
check POSTGRES_PASSWORD "Postgres password"
check DO_SPACES_KEY "Spaces access key"
check DO_SPACES_SECRET "Spaces secret"
check DO_SPACES_BUCKET "Spaces bucket"
check DO_SPACES_CDN_URL "Spaces CDN URL"
check NEXTAUTH_URL "NextAuth URL"
check NEXT_PUBLIC_APP_URL "Public app URL"

if [ "${AUTH_SECRET:-}" = "generate-with-openssl-rand-base64-32" ] || [ "${AUTH_SECRET:-}" = "dev-secret-change-in-production-32chars" ]; then
  echo "❌ AUTH_SECRET is still the default dev value"
  errors=$((errors + 1))
fi

if [ "${POSTGRES_PASSWORD:-}" = "change-this-strong-password" ]; then
  echo "❌ POSTGRES_PASSWORD is still the default value"
  errors=$((errors + 1))
fi

echo ""
if [ "$errors" -gt 0 ]; then
  echo "❌ $errors issue(s) found. Fix .env before deploying."
  exit 1
fi

echo "✅ Environment ready for deployment"
