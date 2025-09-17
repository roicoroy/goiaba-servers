# 🔑 Demo Credentials for Unified Auth Testing

## Available Demo Users

### 1. Standard Demo User ✅

```
Email: user@example.com
Password: Password123
```

- **Use for:** General testing
- **Works with:** Medusa unified auth
- **Postman:** Default credentials in collection

### 2. Test User ✅

```
Email: test@example.com
Password: password123
```

- **Use for:** Strapi compatibility testing
- **Works with:** Both Medusa and Strapi
- **Note:** Lowercase password for Strapi conventions

### 3. Original Demo User ✅

```
Email: roicoroy@yahoo.com.br
Password: Rwbento123!
```

- **Use for:** Original testing setup
- **Works with:** Medusa unified auth
- **Note:** Real user from initial setup

## 🧪 Testing in Postman

### Quick Test Steps:

1. **Import Collection & Environment**

   - `Unified-Auth-Postman-Collection.json`
   - `Unified-Auth-Environment.json`

2. **Run Authentication Tests:**

   - "Medusa - Login (user@example.com)" ✅
   - "Medusa - Login (roicoroy@yahoo.com.br)" ✅
   - "Medusa - Login (test@example.com)" ✅

3. **Test Cross-Service:**
   - "Use Medusa Token on Strapi" ✅
   - Verify token works across both servers

## 🔧 Manual Testing

### Medusa Login:

```bash
curl -X POST http://localhost:9000/unified-auth \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'
```

### Expected Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "demo-user-2",
    "email": "user@example.com",
    "first_name": "Demo",
    "last_name": "User",
    "role": "customer"
  },
  "message": "Login successful - token valid for both Medusa and Strapi"
}
```

### Get Available Users:

```bash
curl -X GET http://localhost:9000/unified-auth
```

## 🚨 Troubleshooting

### ❌ 401 Unauthorized

**Problem:** Wrong credentials
**Solution:** Use one of the demo users above

### ❌ 500 Internal Server Error

**Problem:** JWT_SECRET not configured
**Solution:** Check `.env` files have shared JWT secret

### ❌ Connection Refused

**Problem:** Server not running
**Solution:** Start Medusa server: `npm run dev`

## 🎯 Production Notes

⚠️ **Important:** These are demo credentials for testing only!

In production:

- Remove hardcoded demo users
- Integrate with proper user authentication
- Use secure password hashing
- Implement proper user management

## 🔄 Environment Variables

Update your Postman environment:

```json
{
  "test_email": "user@example.com",
  "test_password": "Password123"
}
```

---

**✅ All credentials are working and tested!**

Use any of these demo users to test the unified authentication system between Medusa and Strapi.
