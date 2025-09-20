#!/bin/bash

# Security Setup Script - Generate Secure Secrets
set -e

echo "🔒 Generating Secure Secrets for Goiaba Servers"

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

# Check if OpenSSL is available
if ! command -v openssl &> /dev/null; then
    print_error "OpenSSL is required but not installed."
    exit 1
fi

print_status "Generating secure secrets..."

# Generate secrets
JWT_SECRET=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -hex 16)
STRAPI_APP_KEY1=$(openssl rand -base64 32)
STRAPI_APP_KEY2=$(openssl rand -base64 32)
STRAPI_API_TOKEN_SALT=$(openssl rand -base64 32)
STRAPI_ADMIN_JWT_SECRET=$(openssl rand -base64 32)
STRAPI_TRANSFER_TOKEN_SALT=$(openssl rand -base64 32)
STRAPI_JWT_SECRET=$(openssl rand -base64 32)

print_success "Secrets generated successfully!"

# Create secure .env file
print_status "Creating secure .env file..."

cat > .env.secure << EOF
# SECURE ENVIRONMENT VARIABLES - Generated $(date)
# Copy these values to your .env file

# Database Configuration
POSTGRES_USER=marketplace
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
MEDUSA_DB_NAME=medusa_store
STRAPI_DB_NAME=strapi

# Medusa Configuration
DATABASE_URL=postgres://marketplace:${POSTGRES_PASSWORD}@medusa-db:5432/medusa_store?sslmode=require
REDIS_URL=redis://:${REDIS_PASSWORD}@medusa-redis:6379
REDIS_PASSWORD=${REDIS_PASSWORD}
NODE_ENV=development
JWT_SECRET=${JWT_SECRET}
COOKIE_SECRET=${COOKIE_SECRET}
API_KEY=noop
VITE_BACKEND_URL=http://localhost:9000
MEDUSA_PUBLISHABLE_API_KEY=GENERATE_PUBLISHABLE_KEY_HERE

# CORS Configuration
STORE_CORS=http://localhost:8000,https://docs.medusajs.com,http://localhost:8100,http://localhost:46247/,http://localhost:5173
ADMIN_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com,http://localhost:8100,http://localhost:46247/,http://localhost:5173
AUTH_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com,http://localhost:8100,http://localhost:46247/,http://localhost:5173

# Strapi Configuration
STRAPI_HOST=0.0.0.0
STRAPI_PORT=1337
STRAPI_APP_KEYS=${STRAPI_APP_KEY1},${STRAPI_APP_KEY2}
STRAPI_API_TOKEN_SALT=${STRAPI_API_TOKEN_SALT}
STRAPI_ADMIN_JWT_SECRET=${STRAPI_ADMIN_JWT_SECRET}
STRAPI_TRANSFER_TOKEN_SALT=${STRAPI_TRANSFER_TOKEN_SALT}
STRAPI_JWT_SECRET=${STRAPI_JWT_SECRET}
STRAPI_DATABASE_CLIENT=postgres
STRAPI_DATABASE_HOST=strapi-db
STRAPI_DATABASE_PORT=5432
STRAPI_DATABASE_NAME=strapi
STRAPI_DATABASE_USERNAME=strapi
STRAPI_DATABASE_PASSWORD=${POSTGRES_PASSWORD}
STRAPI_DATABASE_SSL=true

# External API Keys (REPLACE WITH YOUR ACTUAL KEYS)
STRIPE_API_KEY=YOUR_STRIPE_API_KEY_HERE
CLOUDINARY_NAME=YOUR_CLOUDINARY_NAME_HERE
CLOUDINARY_KEY=YOUR_CLOUDINARY_KEY_HERE
CLOUDINARY_SECRET=YOUR_CLOUDINARY_SECRET_HERE
EOF

print_success "Secure environment file created: .env.secure"

echo ""
print_warning "IMPORTANT NEXT STEPS:"
echo "1. Copy .env.secure to .env: cp .env.secure .env"
echo "2. Replace YOUR_*_HERE placeholders with your actual API keys"
echo "3. Delete .env.secure after copying: rm .env.secure"
echo "4. Never commit .env files to version control"
echo ""
print_success "Security setup complete!"