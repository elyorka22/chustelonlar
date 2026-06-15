#!/bin/bash
set -euo pipefail

DOMAIN="${1:-chustelon.uz}"
EMAIL="${2:-admin@chustelon.uz}"

echo "🔒 Setting up SSL for $DOMAIN..."

# Start nginx for ACME challenge
docker compose up -d nginx

# Get certificate
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

# Reload nginx
docker compose exec nginx nginx -s reload

echo "✅ SSL certificate installed for $DOMAIN"
echo "   Auto-renewal is configured via certbot container"
