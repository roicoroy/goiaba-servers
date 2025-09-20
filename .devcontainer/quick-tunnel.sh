#!/bin/bash

# LocalTunnel Integration for Goiaba Servers
set -e

echo "🌐 Starting LocalTunnel for External Access"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if LocalTunnel is installed
if ! command -v lt &> /dev/null; then
    print_warning "LocalTunnel not installed. Installing..."
    npm install -g localtunnel
fi

# Generate unique subdomain based on current directory
PROJECT_NAME=$(basename "$(dirname "$(pwd)")")
TIMESTAMP=$(date +%s | tail -c 4)
MEDUSA_SUBDOMAIN="${PROJECT_NAME}-medusa-${TIMESTAMP}"
STRAPI_SUBDOMAIN="${PROJECT_NAME}-strapi-${TIMESTAMP}"

print_status "Starting tunnels with unique subdomains..."
echo ""

print_status "Starting Medusa tunnel..."
lt --port 9000 --subdomain ${MEDUSA_SUBDOMAIN} &
MEDUSA_PID=$!

sleep 2

print_status "Starting Strapi tunnel..."
lt --port 1337 --subdomain ${STRAPI_SUBDOMAIN} &
STRAPI_PID=$!

sleep 3

echo ""
print_success "Tunnels started successfully!"
echo ""
echo "📋 Your External URLs:"
echo "   🛒 Medusa API:    https://${MEDUSA_SUBDOMAIN}.loca.lt"
echo "   📝 Strapi API:    https://${STRAPI_SUBDOMAIN}.loca.lt"
echo "   🔧 Strapi Admin:  https://${STRAPI_SUBDOMAIN}.loca.lt/admin"
echo ""
print_warning "⚠️  Update your CORS settings with these URLs if needed!"
echo ""
echo "🔄 To stop tunnels: Press Ctrl+C"

# Cleanup function
cleanup() {
    echo ""
    print_status "Stopping tunnels..."
    kill $MEDUSA_PID $STRAPI_PID 2>/dev/null || true
    print_success "Tunnels stopped!"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait