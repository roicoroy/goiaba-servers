#!/bin/bash

# Shared Auth Middleware Docker Startup Script
set -e

echo "🔐 Starting Shared Auth Middleware"

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

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_warning "Please review and update the .env file with your configuration"
    print_warning "Especially check MEDUSA_URL and STRAPI_URL to point to your existing services"
fi

# Create logs directory
mkdir -p logs

# Determine environment
ENVIRONMENT=${1:-production}

print_status "Starting in $ENVIRONMENT mode..."

case $ENVIRONMENT in
    "dev"|"development")
        print_status "Starting development environment with hot reload..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
        ;;
    "prod"|"production")
        print_status "Starting production environment..."
        docker-compose up --build -d
        ;;
    "with-proxy")
        print_status "Starting with Nginx proxy..."
        docker-compose --profile with-proxy up --build -d
        ;;
    *)
        print_error "Unknown environment: $ENVIRONMENT"
        print_status "Usage: $0 [dev|prod|with-proxy]"
        exit 1
        ;;
esac

# Wait for service to be ready
print_status "Waiting for service to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Shared Auth Middleware is healthy"
else
    print_warning "Service is not responding yet, checking logs..."
    docker-compose logs shared-auth-middleware
fi

print_success "Startup complete!"

echo ""
echo "🎉 Shared Auth Middleware is running!"
echo ""
echo "📋 Service Information:"
echo "   Service URL:      http://localhost:3000"
echo "   Health Check:     http://localhost:3000/health"
echo "   Documentation:    http://localhost:3000/docs"
if [ "$ENVIRONMENT" = "with-proxy" ]; then
    echo "   Nginx Proxy:      http://localhost:8080"
fi
echo ""
echo "🔐 API Endpoints:"
echo "   Generate Token:   POST /auth/generate-token"
echo "   Verify Token:     POST /auth/verify-token"
echo "   Validate Medusa:  POST /auth/validate-user-medusa"
echo "   Validate Strapi:  POST /auth/validate-user-strapi"
echo ""
echo "📊 Management Commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop service:     docker-compose down"
echo "   Restart:          docker-compose restart"
echo "   Clean up:         docker-compose down -v"
echo ""
echo "🧪 Test the service:"
echo "   curl http://localhost:3000/health"
echo "   curl http://localhost:3000/docs"