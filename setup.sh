#!/bin/bash

# Goiaba Servers Setup Script
# This script sets up the development environment using Docker

set -e

echo "🚀 Setting up Goiaba Servers Development Environment"

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Running Docker setup from .devcontainer directory..."

# Change to .devcontainer directory and run the setup
cd .devcontainer
chmod +x docker-setup.sh
./docker-setup.sh

print_success "Setup completed! All services should now be running."

echo ""
echo "🎉 Goiaba Servers Development Environment is ready!"
echo ""
echo "📋 Service URLs:"
echo "   Medusa API:           http://localhost:9000"
echo "   Medusa Health:        http://localhost:9000/health"
echo "   Strapi API:           http://localhost:1337"
echo "   Strapi Admin:         http://localhost:1337/admin"
echo ""
echo "📊 Management Commands (run from .devcontainer directory):"
echo "   View logs:      cd .devcontainer && docker-compose logs -f"
echo "   Stop services:  cd .devcontainer && docker-compose down"
echo "   Restart:        cd .devcontainer && docker-compose restart"
echo "   Clean up:       cd .devcontainer && docker-compose down -v"
echo ""
echo "🧪 Run tests:"
echo "   cd tests && npm install && npm test"