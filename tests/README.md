# 🧪 Unified Auth Testing Suite

This directory contains all testing files for the unified authentication system.

## 📁 Test Files

### **Core Tests**
- `test-unified-auth.js` - Basic unified auth functionality tests
- `test-docker-unified-auth.js` - Docker containerized system tests
- `test-postman-collection.js` - Automated Postman collection tests

### **Integration Tests**
- `test-medusa-integration.js` - Medusa-specific integration tests
- `test-strapi-integration.js` - Strapi-specific integration tests
- `test-cross-service.js` - Cross-service authentication tests

### **Performance Tests**
- `test-load.js` - Load testing for auth endpoints
- `test-stress.js` - Stress testing for concurrent requests

### **Security Tests**
- `test-security.js` - Security validation tests
- `test-jwt-validation.js` - JWT token security tests

## 🚀 Running Tests

### **Quick Test (Local)**
```bash
# Basic functionality
node tests/test-unified-auth.js

# Docker environment
node tests/test-docker-unified-auth.js
```

### **Full Test Suite**
```bash
# Run all tests
npm run test:all

# Run specific test category
npm run test:integration
npm run test:security
npm run test:performance
```

### **Prerequisites**
- Both Medusa and Strapi servers running
- Shared JWT secret configured
- Demo users created

## 📊 Test Coverage

- ✅ Authentication endpoints
- ✅ Token generation and validation
- ✅ Cross-service token usage
- ✅ Error handling
- ✅ Security validation
- ✅ Performance benchmarks
- ✅ Docker containerization

## 🔧 Configuration

Tests use environment variables:
```bash
MEDUSA_URL=http://localhost:9000
STRAPI_URL=http://localhost:1337
SHARED_AUTH_URL=http://localhost:3000
JWT_SECRET=your-shared-secret
```

## 📝 Test Reports

Test results are saved to:
- `tests/reports/` - Test execution reports
- `tests/logs/` - Detailed test logs
- `tests/coverage/` - Code coverage reports