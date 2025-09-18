# 🐳 Docker Setup Guide - Unified Authentication System

Complete Docker containerization for your Medusa and Strapi unified authentication system.

## 📦 What's Included

### **Services:**
- **Medusa Server** - E-commerce backend (Port 9000)
- **Strapi Server** - CMS backend (Port 1337)
- **PostgreSQL** - Medusa database (Port 5432)
- **PostgreSQL** - Strapi database (Port 5433)
- **Redis** - Caching for Medusa (Port 6379)
- **Nginx** - Reverse proxy and load balancer (Port 80)

### **Files Created:**
```
├── docker-compose.yml          # Main Docker Compose configuration
├── docker-compose.dev.yml      # Development overrides
├── docker-compose.prod.yml     # Production overrides
├── .env.docker                 # Environment variables template
├── docker-setup.sh            # Automated setup script
├── nginx.conf                 # Nginx configuration
├── medusa2-marketplace-demo/medusa-marketplace-demo/Dockerfile
└── strapi-server/Dockerfile
```

## 🚀 Quick Start

### 1. **Automated Setup (Recommended)**
```bash
# Run the setup script
./docker-setup.sh
```

### 2. **Manual Setup**
```bash
# Copy environment file
cp .env.docker .env

# Build and start services
docker-compose up -d

# Check status
docker-compose ps
```

## 🔧 Configuration

### **Environment Variables (.env)**
```bash
# Shared JWT Secret (CRITICAL - must be same for both services)
JWT_SECRET=bnXXqww2fy/GOmHij32EX8D9LaqSPYVCtpZ5QQRI6GaI4QPcfuDHnSzqKGpUr+M+2kQ41wo9ZrJxfXMbBJLhiA==

# Service URLs
MEDUSA_URL=http://localhost:9000
STRAPI_URL=http://localhost:1337

# Database configurations
MEDUSA_DATABASE_URL=postgres://marketplace:super-secure-password@medusa-db:5432/marketplace
STRAPI_DB_HOST=strapi-db
STRAPI_DB_NAME=strapi
```

### **Network Architecture**
```
┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   Client Apps   │
│   Port: 80      │◄───┤  (External)     │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│  Medusa Server  │    │  Strapi Server  │
│   Port: 9000    │◄──►│   Port: 1337    │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  Medusa DB      │    │  Strapi DB      │
│   Port: 5432    │    │   Port: 5433    │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│     Redis       │
│   Port: 6379    │
└─────────────────┘
```

## 🎯 Usage Examples

### **Development Mode**
```bash
# Start with development overrides
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f medusa strapi

# Access containers
docker-compose exec medusa sh
docker-compose exec strapi sh
```

### **Production Mode**
```bash
# Start with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale medusa=2 --scale strapi=2
```

### **Testing Unified Auth**
```bash
# Test Medusa login
curl -X POST http://localhost:9000/unified-auth \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'

# Test Strapi login
curl -X POST http://localhost:1337/api/unified-auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"password123"}'

# Test via Nginx proxy
curl -X POST http://localhost/auth/medusa \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'
```

## 🔍 Monitoring & Debugging

### **Health Checks**
```bash
# Check all services
docker-compose ps

# Check specific service health
curl http://localhost:9000/health    # Medusa
curl http://localhost:1337/_health   # Strapi
curl http://localhost/health         # Nginx
```

### **Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f medusa
docker-compose logs -f strapi
docker-compose logs -f nginx

# Database logs
docker-compose logs -f medusa-db strapi-db
```

### **Database Access**
```bash
# Connect to Medusa database
docker-compose exec medusa-db psql -U marketplace -d marketplace

# Connect to Strapi database
docker-compose exec strapi-db psql -U strapi -d strapi

# Backup databases
docker-compose exec medusa-db pg_dump -U marketplace marketplace > medusa_backup.sql
docker-compose exec strapi-db pg_dump -U strapi strapi > strapi_backup.sql
```

## 🛡️ Security Features

### **Network Isolation**
- Services communicate via internal Docker network
- Only necessary ports exposed to host
- Database access restricted to application containers

### **Environment Security**
- Sensitive data in environment variables
- Separate secrets for development/production
- JWT secrets properly configured

### **Nginx Security**
- Rate limiting configured
- Security headers added
- CORS properly configured
- SSL termination ready

## 📊 Performance Optimization

### **Resource Limits**
```yaml
# Production resource limits
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### **Caching**
- Redis for Medusa session storage
- Nginx proxy caching
- Database connection pooling

### **Scaling**
```bash
# Scale horizontally
docker-compose up -d --scale medusa=3 --scale strapi=2

# Load balancing via Nginx
# Automatic failover configured
```

## 🔄 CI/CD Integration

### **GitHub Actions Example**
```yaml
name: Deploy Unified Auth
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
          docker-compose exec -T medusa npm run db:migrate
```

### **Environment Promotion**
```bash
# Development → Staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# Staging → Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🧪 Testing

### **Automated Testing**
```bash
# Run test suite
docker-compose exec medusa npm test
docker-compose exec strapi npm test

# Integration tests
node test-unified-auth.js

# Load testing
docker run --rm -i loadimpact/k6 run - <test-script.js
```

### **Postman Integration**
- Import `Unified-Auth-Postman-Collection.json`
- Update environment to use Docker URLs
- Run automated test suite

## 🚨 Troubleshooting

### **Common Issues**

**1. Port Conflicts**
```bash
# Check port usage
netstat -tulpn | grep :9000
lsof -i :1337

# Solution: Update ports in docker-compose.yml
```

**2. Database Connection Issues**
```bash
# Check database status
docker-compose exec medusa-db pg_isready -U marketplace
docker-compose exec strapi-db pg_isready -U strapi

# Reset databases
docker-compose down -v
docker-compose up -d
```

**3. JWT Secret Mismatch**
```bash
# Verify environment variables
docker-compose exec medusa env | grep JWT_SECRET
docker-compose exec strapi env | grep JWT_SECRET

# Should be identical!
```

**4. Build Issues**
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### **Debug Mode**
```bash
# Enable debug logging
export DEBUG=*
docker-compose up -d

# Access container for debugging
docker-compose exec medusa sh
docker-compose exec strapi sh
```

## 📋 Management Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart medusa

# View service status
docker-compose ps

# Clean up everything
docker-compose down -v --remove-orphans
docker system prune -a

# Update services
docker-compose pull
docker-compose up -d

# Backup volumes
docker run --rm -v unified-auth_medusa_db_data:/data -v $(pwd):/backup alpine tar czf /backup/medusa_db_backup.tar.gz -C /data .
```

## 🎉 Success Verification

Your Docker setup is working correctly when:

- ✅ All services show "healthy" status
- ✅ Medusa API responds at http://localhost:9000/health
- ✅ Strapi API responds at http://localhost:1337/_health
- ✅ Unified auth endpoints return JWT tokens
- ✅ Cross-service authentication works
- ✅ Databases are accessible and populated
- ✅ Nginx proxy routes requests correctly

---

**🐳 Your unified authentication system is now fully containerized and production-ready!**