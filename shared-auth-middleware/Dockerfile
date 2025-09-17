# Dockerfile for Shared Auth Middleware
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    dumb-init

WORKDIR /app

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S authuser -u 1001

# Development stage
FROM base AS development

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY src/ ./src/
COPY examples/ ./examples/

# Change ownership
RUN chown -R authuser:nodejs /app
USER authuser

# Expose port
EXPOSE 3000

# Development command with hot reload
CMD ["npm", "run", "start:dev"]

# Build stage
FROM base AS build

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/
COPY examples/ ./examples/

# Build the application
RUN npm run build

# Production stage
FROM base AS production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production && \
    npm cache clean --force

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Create logs directory
RUN mkdir -p /app/logs

# Change ownership of the app directory
RUN chown -R authuser:nodejs /app
USER authuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init as init system
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "dist/server.js"]

# Default to production stage
FROM production