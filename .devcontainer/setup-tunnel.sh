#!/bin/bash

# Cloudflare Tunnel Setup Script
set -e

echo "🌐 Setting up Cloudflare Tunnel for Goiaba Servers"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo ""
print_status "Setting up LocalTunnel for external access..."
echo ""
echo "📝 LocalTunnel is a simple, free tunneling solution:"
echo "✅ No signup required"
echo "✅ Completely free"
echo "✅ Easy to use"
echo "⚠️  URLs change on restart"
echo ""

if ! command -v npm &> /dev/null; then
    print_error "Node.js/npm is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

print_status "Installing LocalTunnel..."
npm install -g localtunnel

print_success "LocalTunnel installed successfully!"
echo ""
echo "🚀 To start tunnels, run:"
echo "   ./manage.sh tunnel"
echo ""
echo "Or manually:"
echo "   ./quick-tunnel.sh"

echo ""
print_success "Tunnel setup information provided!"
echo ""
echo "🔗 After setting up your tunnel, update your CORS settings in:"
echo "   - medusa-server/.env (STORE_CORS, ADMIN_CORS, AUTH_CORS)"
echo "   - .devcontainer/docker-compose.yml environment variables"
echo ""
echo "Example CORS update:"
echo "STORE_CORS=https://your-tunnel-domain.com,http://localhost:8000"