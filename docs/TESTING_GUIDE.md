# 🧪 Unified Auth Testing Guide

Complete testing documentation for the unified authentication system.

## 📁 Test Structure

```
tests/
├── README.md                    # Testing overview
├── config.js                   # Test configuration
├── test-all.js                 # Complete test suite runner
├── test-unified-auth.js         # Basic functionality tests
├── test-docker-unified-auth.js  # Docker environment tests
├── test-medusa-integration.js   # Medusa-specific tests
├── test-strapi-integration.js   # Strapi-specific tests
├── test-cross-service.js        # Cross-service auth tests
└── test-security.js             # Security validation tests
```

## 🚀 Quick Start

### **Run All Tests**
```bash
npm test
```

### **Run Specific Test Suites**
```bash
# Basic functionality
npm run test:basic

# Docker environment
npm run test:docker

# Individual services
npm run test:medusa
npm run test:strapi

# Cross-service authentication
npm run test:cross-service

# Security validation
npm run test:security
```

## 📊 Test Categories

### **1. Basic Functionality Tests**
- ✅ Server health checks
- ✅ Authentication endpoints
- ✅ Token generation and validation
- ✅ Error handling

**Run:** `npm run test:basic`

### **2. Docker Integration Tests**
- ✅ All services running in containers
- ✅ Service communication
- ✅ Nginx proxy functionality
- ✅ Container health checks

**Run:** `npm run test:docker`

### **3. Service Integration Tests**
- ✅ Medusa API integration
- ✅ Strapi API integration
- ✅ Store/Admin API access
- ✅ Content management features

**Run:** `npm run test:medusa` or `npm run test:strapi`

### **4. Cross-Service Authentication**
- ✅ Token sharing between services
- ✅ Cross-validation
- ✅ Source identification
- ✅ JWT secret consistency

**Run:** `npm run test:cross-service`

### **5. Security Validation**
- ✅ JWT token security
- ✅ Token tampering detection
- ✅ Expired token handling
- ✅ SQL injection prevention
- ✅ Rate limiting
- ✅ CORS configuration

**Run:** `npm run test:security`

## 🔧 Configuration

### **Environment Variables**
```bash
# Service URLs
MEDUSA_URL=http://localhost:9000
STRAPI_URL=http://localhost:1337
SHARED_AUTH_URL=http://localhost:3000
NGINX_URL=http://localhost:80

# Test settings
TEST_VERBOSE=true
SKIP_SLOW_TESTS=false
NODE_ENV=test
```

### **Test Credentials**
Tests use these demo credentials:
```javascript
// Medusa
email: 'user@example.com'
password: 'Password123'

// Strapi  
identifier: 'test@example.com'
password: 'password123'

// Alternative
email: 'roicoroy@yahoo.com.br'
password: 'Rwbento123!'
```

## 📈 Test Results

### **Success Criteria**
- ✅ All health checks pass
- ✅ Authentication endpoints return valid JWT tokens
- ✅ Cross-service token validation works
- ✅ Security tests pass
- ✅ No critical vulnerabilities detected

### **Sample Output**
```
🧪 Running Complete Unified Auth Test Suite

🔍 Running Medusa Integration Tests...
   ✅ Health check passed
   ✅ Unified auth successful
   ✅ Token structure valid
   ✅ Store API accessible

🔍 Running Strapi Integration Tests...
   ✅ Health check passed
   ✅ Unified auth successful
   ✅ Token structure valid
   ✅ API accessible

🔍 Running Cross-Service Auth Tests...
   ✅ Medusa token obtained
   ✅ Strapi token obtained
   ✅ Medusa token accepted by Strapi
   ✅ Strapi token accepted by Medusa

🔍 Running Security Validation Tests...
   ✅ JWT token has proper structure
   ✅ Tampered token properly rejected
   ✅ Expired token properly rejected

📊 OVERALL TEST RESULTS
   Total Tests: 32
   ✅ Passed: 32
   ❌ Failed: 0
   📈 Success Rate: 100.0%

🎉 ALL TESTS PASSED!
```

## 🐛 Troubleshooting

### **Common Issues**

**1. Connection Refused**
```bash
❌ Error: connect ECONNREFUSED 127.0.0.1:9000
```
**Solution:** Start the servers first
```bash
# Local development
npm run dev  # in both medusa and strapi directories

# Docker
docker-compose up -d
```

**2. Authentication Failed**
```bash
❌ Unified auth failed: Invalid credentials
```
**Solution:** Check demo users exist or use correct credentials

**3. JWT Secret Mismatch**
```bash
❌ Token verification failed
```
**Solution:** Ensure both servers use the same JWT_SECRET

**4. Docker Build Failures**
```bash
❌ Docker build failed
```
**Solution:** Clean and rebuild
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### **Debug Mode**
Enable verbose logging:
```bash
TEST_VERBOSE=true npm test
```

## 🔄 Continuous Integration

### **GitHub Actions Example**
```yaml
name: Test Unified Auth
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Start services
        run: docker-compose up -d
      
      - name: Wait for services
        run: sleep 30
      
      - name: Run tests
        run: npm test
      
      - name: Cleanup
        run: docker-compose down -v
```

### **Test Reports**
Test results are saved to:
- `tests/reports/` - Execution reports
- `tests/logs/` - Detailed logs
- Console output for immediate feedback

## 📝 Writing New Tests

### **Test Template**
```javascript
#!/usr/bin/env node

const axios = require('axios');
const config = require('./config');

async function testNewFeature() {
  console.log('🧪 Testing New Feature\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Basic functionality
  console.log('1️⃣ Testing basic functionality...');
  try {
    // Your test logic here
    console.log('   ✅ Test passed');
    results.passed++;
    results.tests.push({ name: 'Basic Functionality', status: 'PASS' });
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Basic Functionality', status: 'FAIL', error: error.message });
  }

  return results;
}

if (require.main === module) {
  testNewFeature().catch(console.error);
}

module.exports = testNewFeature;
```

### **Adding to Test Suite**
1. Create your test file in `tests/`
2. Add to `test-all.js` test suites array
3. Add npm script to `package.json`
4. Update this documentation

## 🎯 Best Practices

1. **Test Independence** - Each test should be independent
2. **Clear Assertions** - Use descriptive test names and clear success/failure criteria
3. **Error Handling** - Catch and report errors properly
4. **Cleanup** - Clean up test data after tests
5. **Documentation** - Document test purpose and expected behavior

## 📚 Additional Resources

- **Postman Collection:** `Unified-Auth-Postman-Collection.json`
- **Docker Guide:** `DOCKER_SETUP_GUIDE.md`
- **API Documentation:** Service `/docs` endpoints
- **Security Guide:** Review security test results

---

**🧪 Happy Testing!** 

Your unified authentication system is thoroughly tested and ready for production use.