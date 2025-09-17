# 🚀 Quick Start - Shared Auth Middleware Docker

## ✅ **Status: WORKING!**

Your standalone Docker deployment is now running successfully!

## 🔧 **Current Setup**

- **Service URL:** http://localhost:3000
- **Health Check:** http://localhost:3000/health ✅
- **Documentation:** http://localhost:3000/docs ✅
- **Container Status:** Running and Healthy ✅

## 🧪 **Test Results**

```
✅ Health Check - Service responding
✅ Documentation - API docs available
✅ Token Generation - Creating JWT tokens
✅ Token Verification - Validating tokens
✅ Invalid Token Handling - Security working
✅ Error Handling - Proper error responses
✅ CORS Configuration - Cross-origin ready
```

## 🔗 **Connect to Your Existing Services**

### **Update Configuration**
```bash
# Edit the environment file
nano .env

# Update these URLs to point to your existing services:
MEDUSA_URL=http://host.docker.internal:9000    # For Docker Desktop
STRAPI_URL=http://host.docker.internal:1337    # For Docker Desktop

# Or if running locally:
MEDUSA_URL=http://localhost:9000
STRAPI_URL=http://localhost:1337
```

### **Restart Service**
```bash
docker-compose restart
```

## 🎯 **API Usage Examples**

### **Generate Token**
```bash
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
```

### **Verify Token**
```bash
curl -X POST http://localhost:3000/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token": "your-jwt-token-here"}'
```

### **Health Check**
```bash
curl http://localhost:3000/health
```

## 📊 **Management Commands**

```bash
# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart service
docker-compose restart

# Stop service
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

## 🔄 **Integration with Your Apps**

### **From Medusa Application**
```javascript
const axios = require('axios');

// Verify a token from your Medusa app
const verifyToken = async (token) => {
  const response = await axios.post('http://localhost:3000/auth/verify-token', {
    token: token
  });
  return response.data.valid;
};
```

### **From Strapi Application**
```javascript
const axios = require('axios');

// Generate a unified token from your Strapi app
const generateToken = async (user) => {
  const response = await axios.post('http://localhost:3000/auth/generate-token', {
    user: user,
    source: 'strapi'
  });
  return response.data.token;
};
```

## 🎉 **Success!**

Your Shared Auth Middleware is now running as a standalone Docker service and ready to:

- ✅ Generate unified JWT tokens
- ✅ Verify tokens from any source
- ✅ Validate users across services
- ✅ Provide centralized authentication
- ✅ Scale independently from your main apps

**Next Step:** Update your Medusa and Strapi applications to use this service for unified authentication! 🔐