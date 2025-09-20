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
until PGPASSWORD=${POSTGRES_PASSWORD} pg_isready -h medusa-db -p 5432 -U marketplace; do
  echo "Waiting for database..."
  sleep 2
done

print_success "Database is ready!"

# Wait for Redis to be ready
print_status "Waiting for Redis to be ready..."
until redis-cli -h medusa-redis -p 6379 -a ${REDIS_PASSWORD} ping 2>/dev/null; do
  echo "Waiting for Redis..."
  sleep 2
done

print_success "Redis is ready!"

# Check if database is already initialized by looking for existing tables and data
print_status "Checking if database is initialized..."
DB_INITIALIZED=$(PGPASSWORD=${POSTGRES_PASSWORD} psql -h medusa-db -U marketplace -d medusa_store -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs || echo "0")

# Check if regions exist (indicates successful seeding)
REGIONS_EXIST=$(PGPASSWORD=${POSTGRES_PASSWORD} psql -h medusa-db -U marketplace -d medusa_store -t -c "SELECT COUNT(*) FROM region WHERE id IS NOT NULL;" 2>/dev/null | xargs || echo "0")

# Ensure we have numeric values
DB_INITIALIZED=${DB_INITIALIZED:-0}
REGIONS_EXIST=${REGIONS_EXIST:-0}

if [ "$DB_INITIALIZED" -gt "100" ] && [ "$REGIONS_EXIST" -gt "0" ]; then
    print_status "Database fully initialized with $DB_INITIALIZED tables and $REGIONS_EXIST regions, skipping setup"
    
    # Check if we need to run migrations
    print_status "Checking for pending migrations..."
    if yarn medusa db:migrate --dry-run 2>/dev/null | grep -q "pending"; then
        print_status "Running pending migrations..."
        yarn medusa db:migrate
        print_success "Database migrations completed!"
    else
        print_status "No pending migrations found"
    fi
else
    print_status "Database needs initialization (tables: $DB_INITIALIZED, regions: $REGIONS_EXIST)"
    
    # Always reset database if it's not fully initialized to avoid conflicts
    if [ "${DB_INITIALIZED:-0}" -gt "0" ]; then
        print_status "Resetting database to ensure clean state..."
        PGPASSWORD=${POSTGRES_PASSWORD} psql -h medusa-db -U marketplace -d medusa_store -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>/dev/null || true
        print_success "Database reset completed"
    fi
    
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

print_status "Building admin panel..."
yarn build
print_success "Admin panel built successfully!"

print_status "Starting Medusa server..."
exec yarn start