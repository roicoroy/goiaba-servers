#!/bin/bash

# Docker Setup Script for Unified Auth System
set -e

echo "🐳 Setting up Unified Auth System with Docker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
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

# Define the docker-compose files to use
COMPOSE_FILES="-f docker-compose.yml -f medusa-server/docker-compose.yml -f strapi-server/docker-compose.yml"

# Create docker network
print_status "Creating docker network..."
docker network create unified-auth-network || true

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p medusa-server/backups
mkdir -p tests/reports

# Build and start services
print_status "Building Docker images..."
docker-compose $COMPOSE_FILES build

print_status "Starting services..."
docker-compose $COMPOSE_FILES up -d

# Wait for services to be healthy
print_status "Waiting for services to be ready..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check Medusa
if curl -f http://localhost:9000/health > /dev/null 2>&1; then
    print_success "Medusa server is healthy"
else
    print_warning "Medusa server is not responding yet"
fi

# Check Strapi
if curl -f http://localhost:1337/_health > /dev/null 2>&1; then
    print_success "Strapi server is healthy"
else
    print_warning "Strapi server is not responding yet"
fi


print_success "Setup complete!"

echo ""
echo "🎉 Unified Auth System is running!"
echo ""
echo "📋 Service URLs:"
echo "   Medusa API:           http://localhost:9000"
echo "   Medusa Admin:         http://localhost:9000/app"
echo "   Strapi API:           http://localhost:1337"
echo "   Strapi Admin:         http://localhost:1337/admin"
echo "   Nginx Proxy:          http://localhost:80"
echo "   Strapi DB Admin:      http://localhost:9090"
echo ""
echo "🔐 Test Endpoints:"
echo "   Medusa Auth:      POST http://localhost:9000/unified-auth"
echo "   Strapi Auth:      POST http://localhost:1337/api/unified-auth/login"

echo ""
echo "📊 Management Commands:"
echo "   View logs:      docker-compose $COMPOSE_FILES logs -f"
echo "   Stop services:  docker-compose $COMPOSE_FILES down"
echo "   Restart:        docker-compose $COMPOSE_FILES restart"
echo "   Clean up:       docker-compose $COMPOSE_FILES down -v"
echo ""
echo "🧪 Run tests:"
echo "   Full suite:     npm test"
echo "   Postman:        Unified-Auth-Postman-Collection.json"
