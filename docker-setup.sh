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
COMPOSE_FILES="-f docker-compose.yml -f medusa-server/docker-compose.yml -f strapi-server/docker-compose.yml -f shared-auth-middleware/docker-compose.yml"

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

# Check Shared Auth Middleware
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Shared Auth Middleware is healthy"
else
    print_warning "Shared Auth Middleware is not responding yet"
fi

print_success "Setup complete!"

echo ""
echo "🎉 Unified Auth System is running!"
echo ""
echo "📋 Service URLs:"
echo "   Medusa API:           http://localhost:9000"
echo "   Strapi API:           http://localhost:1337"
echo "   Strapi Admin:         http://localhost:1337/admin"
echo "   Shared Auth Service:  http://localhost:3000"
echo "   Nginx Proxy:          http://localhost:80"
echo ""
echo "🔐 Test Endpoints:"
echo "   Medusa Auth:      POST http://localhost:9000/unified-auth"
echo "   Strapi Auth:      POST http://localhost:1337/api/unified-auth/login"
echo "   Shared Auth:      POST http://localhost:3000/auth/generate-token"
echo "   Token Verify:     POST http://localhost:3000/auth/verify-token"
echo ""
echo "📊 Management Commands:"
echo "   View logs:      docker-compose $COMPOSE_FILES logs -f"
echo "   Stop services:  docker-compose $COMPOSE_FILES down"
echo "   Restart:        docker-compose $COMPOSE_FILES restart"
echo "   Clean up:       docker-compose $COMPOSE_FILES down -v"
echo ""
echo "🧪 Run tests:"
echo "   Basic tests:    npm run test:basic"
echo "   Docker tests:   npm run test:docker"
echo "   Full suite:     npm test"
echo "   Postman:        Unified-Auth-Postman-Collection.json"
