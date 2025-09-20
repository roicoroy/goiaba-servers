#!/bin/bash

# Medusa Initialization Script
set -e

echo "🚀 Initializing Medusa server..."

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

# Wait for database to be ready
print_status "Waiting for database to be ready..."
until pg_isready -h medusa-db -p 5432 -U marketplace; do
  echo "Waiting for database..."
  sleep 2
done

print_success "Database is ready!"

# Wait for Redis to be ready
print_status "Waiting for Redis to be ready..."
until redis-cli -h medusa-redis -p 6379 ping; do
  echo "Waiting for Redis..."
  sleep 2
done

print_success "Redis is ready!"

# Check if database is already initialized by looking for existing tables
print_status "Checking if database is initialized..."
DB_INITIALIZED=$(PGPASSWORD=super-secure-password psql -h medusa-db -U marketplace -d goiaba_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)

if [ "$DB_INITIALIZED" -gt "0" ]; then
    print_status "Database already initialized with $DB_INITIALIZED tables, skipping setup"
else
    print_status "Database is empty, running initial setup..."
    
    print_status "Running database migrations..."
    yarn medusa db:migrate
    print_success "Database migrations completed!"

    print_status "Seeding database with initial data..."
    yarn seed
    print_success "Database seeding completed!"

    print_status "Creating admin user..."
    npx medusa user --email roicoroy@yahoo.com.br --password Rwbento123!
    print_success "Admin user created successfully!"
fi

print_status "Starting Medusa server..."
exec yarn start