# 🔐 Shared Auth Middleware - Docker Setup

Standalone Docker deployment for the Shared Auth Middleware that connects to your existing Medusa and Strapi services.

## 🚀 Quick Start

### **1. Automated Setup**
```bash
./docker-start.sh
```

### **2. Manual Setup**
```bash
# Copy environment file
cp .env.example .env

# Edit configuration (important!)
nano .env

# Start the service
docker-compose up -d
```

## 🔧 Configuration

### **Environment Variables (.env)**
```bash
# JWT Secret (MUST match your existing services)
JWT_SECRET=your-shared-jwt-secret-here

# External Service URLs
MEDUSA_URL=http://localhost:9000        # Your existing Medusa
STRAPI_URL=http://localhost:1337        # Your existing Strapi

# For Docker Desktop (Mac/Windows)
# MEDUSA_URL=http://host.docker.internal:9000
# STRAPI_URL=http://host.docker.internal:1337

# Server Configuration
PORT=3000
NODE_ENV=production
```

### **Docker Network Configuration**

**Option 1: Host Network Access (Recommended)**
```yaml
# Uses host.docker.internal (Docker Desktop)
MEDUSA_URL=http://host.docker.internal:9000
STRAPI_URL=http://host.docker.internal:1337
```

**Option 2: External Docker Network**
```bash
# Connect to existing Docker network
docker network connect your-existing-network shared-auth-middleware
```

**Option 3: Custom Network Bridge**
```yaml
# Add to your existing docker-compose.yml
networks:
  - your-existing-network
```

## 🐳 Deployment Options

### **Production Mode**
```bash
./docker-start.sh prod
# or
docker-compose up -d
```

### **Development Mode**
```bash
./docker-start.sh dev
# or
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### **With Nginx Proxy**
```bash
./docker-start.sh with-proxy
# or
docker-compose --profile with-proxy up -d
```

## 📊 Service Endpoints

Once running, the service provides:

### **Core Endpoints**
- `GET /health` - Health check
- `GET /docs` - API documentation
- `POST /auth/generate-token` - Generate unified JWT token
- `POST /auth/verify-token` - Verify JWT token

### **User Validation**
- `POST /auth/validate-user-medusa` - Validate user in Medusa
- `POST /auth/validate-user-strapi` - Validate user in Strapi

### **Example Usage**
```bash
# Health check
curl http://localhost:3000/health

# Generate token
curl -X POST http://localhost:3000/auth/generate-token \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "role": "customer"
    },
    "source": "medusa"
  }'

# Verify token
curl -X POST http://localhost:3000/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token": "your-jwt-token-here"}'
```

## 🔗 Integration with Existing Services

### **Medusa Integration**
Your existing Medusa service can call the shared auth middleware:

```javascript
// In your Medusa application
const response = await axios.post('http://localhost:3000/auth/verify-token', {
  token: userToken
});

if (response.data.valid) {
  // Token is valid, proceed with request
}
```

### **Strapi Integration**
Your existing Strapi service can use the middleware:

```javascript
// In your Strapi application
const response = await axios.post('http://localhost:3000/auth/generate-token', {
  user: strapiUser,
  source: 'strapi'
});

const unifiedToken = response.data.token;
```

## 🛡️ Security Features

- **JWT Token Validation** - Secure token verification
- **Rate Limiting** - Nginx-based request limiting
- **CORS Configuration** - Proper cross-origin handling
- **Security Headers** - Standard security headers
- **Health Monitoring** - Built-in health checks

## 📈 Monitoring & Logs

### **View Logs**
```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f shared-auth-middleware

# Nginx logs (if using proxy)
docker-compose logs -f nginx
```

### **Health Monitoring**
```bash
# Check health
curl http://localhost:3000/health

# Check service status
docker-compose ps

# View resource usage
docker stats shared-auth-middleware
```

## 🔄 Management Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart shared-auth-middleware

# View service status
docker-compose ps

# Update and restart
docker-compose pull && docker-compose up -d

# Clean up everything
docker-compose down -v --remove-orphans
```

## 🧪 Testing

### **Basic Test**
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test documentation
curl http://localhost:3000/docs
```

### **Integration Test**
```bash
# Run the test suite (from project root)
npm run test:docker

# Or test specific functionality
node tests/test-cross-service.js
```

## 🚨 Troubleshooting

### **Common Issues**

**1. Cannot connect to Medusa/Strapi**
```bash
# Check if services are running
curl http://localhost:9000/health  # Medusa
curl http://localhost:1337/_health # Strapi

# Update URLs in .env file
MEDUSA_URL=http://host.docker.internal:9000
STRAPI_URL=http://host.docker.internal:1337
```

**2. JWT Secret Mismatch**
```bash
# Ensure all services use the same JWT_SECRET
# Check .env files in all projects
```

**3. Port Conflicts**
```bash
# Change port in .env
SHARED_AUTH_PORT=3001

# Or stop conflicting services
docker ps | grep :3000
```

**4. Docker Network Issues**
```bash
# List Docker networks
docker network ls

# Connect to existing network
docker network connect your-network shared-auth-middleware
```

### **Debug Mode**
```bash
# Start with debug logging
LOG_LEVEL=debug docker-compose up -d

# View detailed logs
docker-compose logs -f shared-auth-middleware
```

## 🔧 Advanced Configuration

### **Custom Docker Network**
```yaml
# docker-compose.override.yml
version: '3.8'
services:
  shared-auth-middleware:
    networks:
      - your-existing-network

networks:
  your-existing-network:
    external: true
```

### **Environment-Specific Configs**
```bash
# Staging
cp .env.example .env.staging
# Edit staging-specific values
docker-compose --env-file .env.staging up -d

# Production
cp .env.example .env.production
# Edit production values
docker-compose --env-file .env.production up -d
```

### **SSL/TLS Configuration**
```yaml
# Add SSL certificates
volumes:
  - ./certs:/etc/nginx/certs:ro
```

## 📚 Additional Resources

- **API Documentation**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health
- **Main Project Tests**: `npm run test:cross-service`
- **Docker Logs**: `docker-compose logs -f`

---

**🔐 Your Shared Auth Middleware is now running as a standalone Docker service!**

It can seamlessly integrate with your existing Medusa and Strapi services to provide unified authentication across your entire system.