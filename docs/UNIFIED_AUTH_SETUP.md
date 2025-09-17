# 🔐 Unified Authentication Setup Guide

This guide sets up shared JWT authentication between your Medusa and Strapi servers, allowing users to login once and access both platforms.

## 🎯 What We've Built

- **Shared JWT Secret**: Both servers use the same secret for token validation
- **Cross-Service Middleware**: Validates tokens from either server
- **Unified Login Endpoints**: Generate tokens that work on both platforms
- **User Synchronization**: Optional sync of user data between services

## 📁 Files Created/Modified

### Shared Auth Middleware
```
shared-auth-middleware/
├── src/
│   ├── auth-service.ts      # Core auth logic
│   ├── middleware.ts        # Express middleware
│   ├── types.ts            # TypeScript definitions
│   └── index.ts            # Main exports
├── examples/               # Integration examples
└── package.json           # Dependencies
```

### Medusa Integration
```
medusa2-marketplace-demo/medusa-marketplace-demo/
├── src/
│   ├── middlewares/unified-auth.ts    # Medusa middleware
│   └── api/unified-auth/route.ts      # Unified login endpoint
└── .env                              # Updated with shared JWT secret
```

### Strapi Integration
```
strapi-server/
├── src/
│   ├── middlewares/unified-auth.ts           # Strapi middleware
│   └── api/unified-auth/
│       ├── controllers/unified-auth.ts       # Auth controller
│       └── routes/unified-auth.ts           # Auth routes
├── config/middlewares.ts                    # Registered middleware
└── .env                                    # Updated with shared JWT secret
```

## 🚀 Quick Start

### 1. Start Both Servers

**Terminal 1 - Medusa:**
```bash
cd medusa2-marketplace-demo/medusa-marketplace-demo
npm run dev
```

**Terminal 2 - Strapi:**
```bash
cd strapi-server
npm run dev
```

### 2. Test the Setup

```bash
node test-unified-auth.js
```

### 3. Create Test Users

**In Medusa:**
```bash
cd medusa2-marketplace-demo/medusa-marketplace-demo
npx medusa user --email test@example.com --password Password123
```

**In Strapi:**
- Go to http://localhost:1337/admin
- Create a user in Users & Permissions

## 🔧 How It Works

### 1. Shared JWT Secret
Both servers now use the same JWT secret:
```
JWT_SECRET=bnXXqww2fy/GOmHij32EX8D9LaqSPYVCtpZ5QQRI6GaI4QPcfuDHnSzqKGpUr+M+2kQ41wo9ZrJxfXMbBJLhiA==
```

### 2. Unified Token Format
```json
{
  "userId": "user-id",
  "email": "user@example.com", 
  "role": "user-role",
  "source": "medusa" | "strapi",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 3. Login Endpoints

**Medusa Unified Login:**
```bash
POST http://localhost:9000/unified-auth
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Strapi Unified Login:**
```bash
POST http://localhost:1337/api/unified-auth/login
{
  "identifier": "user@example.com", 
  "password": "Password123"
}
```

### 4. Cross-Service Access

Once you have a token from either server, you can use it on both:

```bash
# Get token from Medusa
TOKEN=$(curl -X POST http://localhost:9000/unified-auth \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}' \
  | jq -r '.token')

# Use Medusa token on Strapi
curl http://localhost:1337/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Use Medusa token on Medusa
curl http://localhost:9000/store/customers/me \
  -H "Authorization: Bearer $TOKEN"
```

## 🛡️ Security Features

- **Strong JWT Secret**: 64-byte cryptographically secure secret
- **Token Expiry**: 24-hour token lifetime (configurable)
- **Source Validation**: Tokens include source server information
- **User Validation**: Middleware validates user exists in source system
- **Public Path Skipping**: Auth skipped for public endpoints

## 🔄 User Synchronization

The middleware can optionally sync users between services:

```typescript
// Enable user sync
const middleware = createCrossServiceAuthMiddleware({
  config: authConfig,
  userSyncEnabled: true  // This will sync users automatically
});
```

## 🧪 Testing Scenarios

1. **Login via Medusa → Access Strapi**
2. **Login via Strapi → Access Medusa** 
3. **Token validation across services**
4. **User synchronization**
5. **Invalid token handling**

## 🚨 Troubleshooting

### Common Issues

**1. JWT_SECRET mismatch**
- Ensure both `.env` files have the same `JWT_SECRET`
- Restart both servers after changing secrets

**2. CORS errors**
- Update CORS settings in both servers
- Add the other server's URL to allowed origins

**3. User not found errors**
- Create test users in both systems
- Enable user synchronization

**4. Middleware not loading**
- Check middleware registration in `config/middlewares.ts`
- Verify file paths are correct

### Debug Mode

Add this to your `.env` files for debug logging:
```
DEBUG=unified-auth:*
```

## 🎯 Next Steps

1. **Production Setup**: Use environment-specific JWT secrets
2. **User Sync**: Implement automatic user synchronization
3. **Role Mapping**: Map roles between Medusa and Strapi
4. **Refresh Tokens**: Add refresh token functionality
5. **Session Management**: Implement session invalidation
6. **Audit Logging**: Log cross-service authentication events

## 📚 API Reference

### Medusa Endpoints
- `POST /unified-auth` - Login and get unified token
- `GET /unified-auth` - Endpoint information

### Strapi Endpoints  
- `POST /api/unified-auth/login` - Login and get unified token
- `GET /api/unified-auth` - Endpoint information

### Token Usage
Include in requests as:
```
Authorization: Bearer <your-jwt-token>
```

## 🤝 Contributing

To extend this system:
1. Add new middleware in `src/middlewares/`
2. Create custom auth endpoints in `src/api/`
3. Update type definitions in `shared-auth-middleware/src/types.ts`
4. Add tests for new functionality

---

**🎉 You now have unified authentication between Medusa and Strapi!**

Users can login once and seamlessly access both platforms. The shared JWT tokens provide a secure, scalable solution for cross-service authentication.