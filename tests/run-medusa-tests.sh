#!/bin/bash

# Medusa Health Check Test Runner
set -e

echo "🧪 Running Medusa Health Check Tests"

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

# Check if Medusa is running
print_status "Checking if Medusa server is accessible..."

MEDUSA_URL=${MEDUSA_URL:-"http://localhost:9000"}

if curl -f -s "$MEDUSA_URL/health" > /dev/null 2>&1; then
    print_success "Medusa server is responding at $MEDUSA_URL"
else
    print_error "Medusa server is not responding at $MEDUSA_URL"
    print_status "Make sure Medusa is running with: docker-compose -f medusa-server/docker-compose.yml up -d"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing test dependencies..."
    npm install
fi

# Run the tests
print_status "Running Medusa health check tests..."
npm test -- medusa-health.test.js

print_success "Medusa health check tests completed!"