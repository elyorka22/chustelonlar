#!/bin/bash
set -euo pipefail

echo "🛠️ Chust E'lon — Initial Server Setup"
echo "======================================"

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
  echo "📦 Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
fi

# Install Docker Compose plugin
if ! docker compose version &> /dev/null; then
  echo "📦 Installing Docker Compose..."
  sudo apt-get install -y docker-compose-plugin
fi

# Create app directory
APP_DIR="/opt/chustelon"
sudo mkdir -p "$APP_DIR"
sudo chown "$USER:$USER" "$APP_DIR"

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true

echo ""
echo "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "  1. Clone repo:  cd $APP_DIR && git clone <repo-url> ."
echo "  2. Configure:   cp .env.example .env && nano .env"
echo "  3. Check env:   ./scripts/check-env.sh"
echo "  4. First deploy: ./scripts/first-deploy.sh"
echo "  5. SSL:         ./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com"
echo "  6. Updates:     ./scripts/deploy.sh"
