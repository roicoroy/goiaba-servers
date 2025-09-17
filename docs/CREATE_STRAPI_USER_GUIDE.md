# 🔧 Creating Strapi Users for Unified Auth Testing

## Method 1: Via Strapi Admin Panel (Recommended)

### 1. Access Strapi Admin
```
http://localhost:1337/admin
```

### 2. Login to Admin Panel
- Use your admin credentials
- If first time, create an admin account

### 3. Create Test User
1. Go to **Content Manager**
2. Click **User** (under Collection Types)
3. Click **Create new entry**
4. Fill in the details:
   ```
   Username: testuser
   Email: test@example.com
   Password: password123
   Confirmed: ✅ (check this box)
   Blocked: ❌ (leave unchecked)
   Role: Authenticated
   ```
5. Click **Save**

### 4. Test the Login
Now you can test in Postman:
```json
POST {{strapi_url}}/api/unified-auth/login
{
  "identifier": "test@example.com",
  "password": "password123"
}
```

## Method 2: Via API (Programmatic)

### Create User via Strapi API
```bash
curl -X POST http://localhost:1337/api/auth/local/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123"
  }'
```

## Method 3: Update Strapi Controller (Demo Mode)

If you want demo users like in Medusa, I can update the Strapi controller to include hardcoded demo users for testing.

Would you like me to implement this option?