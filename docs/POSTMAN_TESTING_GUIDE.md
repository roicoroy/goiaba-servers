# 🧪 Postman Testing Guide - Unified Authentication

This guide will help you test the unified authentication system using Postman.

## 📦 Files Included

1. **`Unified-Auth-Postman-Collection.json`** - Complete test collection
2. **`Unified-Auth-Environment.json`** - Environment variables
3. **This guide** - Step-by-step testing instructions

## 🚀 Quick Setup

### 1. Import into Postman

**Import Collection:**
1. Open Postman
2. Click **Import** button
3. Select `Unified-Auth-Postman-Collection.json`
4. Click **Import**

**Import Environment:**
1. Click **Import** again
2. Select `Unified-Auth-Environment.json` 
3. Click **Import**
4. Select the **"Unified Auth - Local Development"** environment

### 2. Verify Server Status

Before testing, make sure both servers are running:

```bash
# Terminal 1 - Start Medusa
cd medusa2-marketplace-demo/medusa-marketplace-demo
npm run dev

# Terminal 2 - Start Strapi  
cd strapi-server
npm run dev
```

## 🧪 Test Scenarios

### Scenario 1: Health Checks ✅

**Purpose:** Verify both servers are running

1. Run **"Medusa Health Check"**
   - Expected: `200 OK`
   - Response: `{"status": "ok"}`

2. Run **"Strapi Health Check"**
   - Expected: `200 OK` 
   - Response: `{"status": "ok"}`

### Scenario 2: Authentication 🔐

**Purpose:** Test unified login on both servers

1. **Run "Medusa - Unified Login"**
   ```json
   POST {{medusa_url}}/unified-auth
   {
     "email": "roicoroy@yahoo.com.br",
     "password": "Rwbento123!"
   }
   ```
   - Expected: `200 OK`
   - Auto-saves token to `{{medusa_token}}`
   - Response includes user info and JWT token

2. **Run "Strapi - Unified Login"** (Optional)
   ```json
   POST {{strapi_url}}/api/unified-auth/login
   {
     "identifier": "test@example.com", 
     "password": "password123"
   }
   ```
   - May fail if user doesn't exist (that's OK for now)

### Scenario 3: Cross-Service Token Validation 🔄

**Purpose:** Verify tokens work across both servers

1. **Run "Use Medusa Token on Strapi"**
   - Uses `{{medusa_token}}` from previous test
   - Expected: `200 OK`
   - Proves Strapi accepts Medusa tokens

2. **Run "Use Strapi Token on Medusa"** 
   - Uses `{{strapi_token}}` (if available)
   - Expected: `200 OK`
   - Proves Medusa accepts Strapi tokens

### Scenario 4: API Access with Unified Auth 🛒📝

**Purpose:** Test actual API endpoints with unified tokens

1. **Medusa Store API:**
   - "Get Products (Public)" - No auth required
   - "Get Products (with Unified Token)" - Uses unified auth
   - "Get Regions" - Test store functionality

2. **Strapi CMS API:**
   - "Get Content Types" - Public endpoint
   - "Get Users (with Unified Token)" - Protected endpoint

### Scenario 5: Token Validation Tests 🧪

**Purpose:** Verify token structure and security

1. **Run "Decode Medusa Token"**
   - Decodes JWT payload in test script
   - Verifies token structure
   - Shows token contents in console

2. **Run "Test Invalid Token"**
   - Tests with invalid token
   - Expected: `401 Unauthorized`
   - Proves security is working

## 📊 Expected Results

### ✅ Successful Test Run

```
🔍 Health Checks
├── Medusa Health Check: ✅ 200 OK
└── Strapi Health Check: ✅ 200 OK

🔐 Authentication  
├── Medusa - Unified Login: ✅ 200 OK (Token saved)
└── Strapi - Unified Login: ⚠️ May fail (user setup needed)

🔄 Cross-Service Token Validation
├── Use Medusa Token on Strapi: ✅ 200 OK
└── Use Strapi Token on Medusa: ✅ 200 OK (if Strapi login worked)

🛒 Medusa Store API
├── Get Products (Public): ✅ 200 OK
├── Get Products (with Unified Token): ✅ 200 OK  
└── Get Regions: ✅ 200 OK

📝 Strapi CMS API
├── Get Content Types: ✅ 200 OK
└── Get Users (with Unified Token): ✅ 200 OK

🧪 Token Validation Tests
├── Decode Medusa Token: ✅ Valid JWT structure
└── Test Invalid Token: ✅ 401 Unauthorized
```

## 🔧 Environment Variables

The collection uses these variables (auto-configured):

| Variable | Value | Description |
|----------|-------|-------------|
| `medusa_url` | `http://localhost:9000` | Medusa server URL |
| `strapi_url` | `http://localhost:1337` | Strapi server URL |
| `medusa_token` | Auto-set | JWT from Medusa login |
| `strapi_token` | Auto-set | JWT from Strapi login |
| `publishable_key` | `pk_29002...` | Medusa publishable key |
| `test_email` | `roicoroy@yahoo.com.br` | Test user email |
| `test_password` | `Rwbento123!` | Test user password |

## 🐛 Troubleshooting

### Common Issues

**1. Connection Refused**
- ❌ Problem: `ECONNREFUSED`
- ✅ Solution: Start both servers first

**2. Invalid Publishable Key**
- ❌ Problem: `A valid publishable key is required`
- ✅ Solution: Update `publishable_key` in environment

**3. User Not Found (Strapi)**
- ❌ Problem: `Invalid credentials`
- ✅ Solution: Create user in Strapi admin panel

**4. Token Expired**
- ❌ Problem: `Token expired`
- ✅ Solution: Re-run login requests

### Debug Tips

1. **Check Console Logs:** View test results in Postman console
2. **Inspect Responses:** Look at response body and headers
3. **Verify Environment:** Ensure correct environment is selected
4. **Check Server Logs:** Monitor terminal output from both servers

## 🎯 Test Automation

### Run All Tests

1. Click **"Run Collection"** button
2. Select all folders or specific scenarios
3. Click **"Run Unified Auth - Medusa & Strapi"**
4. View automated test results

### Continuous Testing

Set up automated runs:
1. Use Postman Monitor for scheduled testing
2. Integrate with CI/CD pipeline
3. Set up Newman for command-line testing

```bash
# Install Newman
npm install -g newman

# Run collection
newman run Unified-Auth-Postman-Collection.json \
  -e Unified-Auth-Environment.json \
  --reporters cli,json
```

## 🎉 Success Criteria

Your unified auth system is working correctly if:

- ✅ Both servers respond to health checks
- ✅ Medusa login returns valid JWT token
- ✅ Medusa token works on Strapi endpoints
- ✅ Token structure contains correct payload
- ✅ Invalid tokens are properly rejected
- ✅ API endpoints work with unified authentication

## 📚 Additional Resources

- **Collection Documentation:** Built-in request descriptions
- **Test Scripts:** Automated validation in each request
- **Environment Management:** Easy switching between dev/staging/prod
- **Response Examples:** Sample responses for reference

---

**🚀 Happy Testing!** 

This Postman collection provides comprehensive testing for your unified authentication system. Use it to verify functionality, debug issues, and demonstrate the cross-service authentication capabilities.