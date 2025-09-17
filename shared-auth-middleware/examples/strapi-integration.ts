/**
 * Example: Integrating with Strapi
 * 
 * IMPORTANT: This is a reference example showing integration patterns.
 * 
 * For actual implementation, see the working code in:
 * - strapi-server/src/api/unified-auth/controllers/unified-auth.ts
 * - strapi-server/src/middlewares/unified-auth.ts
 * 
 * The 'strapi' global is only available within the Strapi application context,
 * not in standalone example files like this one.
 */

import { createUnifiedAuth } from '../src';

// TypeScript declarations for Strapi context
declare global {
  var strapi: any;
}

interface StrapiContext {
  request: {
    body: any;
  };
  state: {
    user?: any;
  };
  strapi?: any;
  send: (data: any) => void;
  badRequest: (message: string) => void;
}

const { authService, crossServiceMiddleware } = createUnifiedAuth({
  jwtSecret: process.env.JWT_SECRET || 'supersecret',
  medusaUrl: process.env.MEDUSA_URL || 'http://localhost:9000',
  strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
  tokenExpiry: '24h'
});

// Strapi plugin configuration
export default {
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '24h',
      },
      // Custom JWT service that uses our unified auth
      jwtService: {
        getToken: (ctx) => {
          const user = ctx.state.user;
          return authService.generateToken(user, 'strapi');
        },
        verify: (token) => {
          return authService.verifyToken(token);
        }
      }
    },
  },
};

// Custom middleware for Strapi (add to config/middlewares.ts)
export const unifiedAuthMiddleware = {
  name: 'unified-auth',
  initialize() {
    return crossServiceMiddleware;
  }
};

// Custom controller for unified login
// Note: This should be used within a Strapi controller file where 'strapi' global is available
export const unifiedAuthController = {
  async login(ctx: StrapiContext) {
    try {
      const { identifier, password } = ctx.request.body;

      // Access Strapi instance from context (available in actual Strapi controllers)
      const strapiInstance = strapi || ctx.strapi;

      // Use Strapi's built-in user validation
      const authResult = await strapiInstance.plugins['users-permissions'].services.user.validatePassword(
        identifier,
        password
      );

      if (!authResult || !authResult.user) {
        return ctx.badRequest('Invalid credentials');
      }

      const user = authResult.user;

      // Generate unified token
      const token = authService.generateToken({
        id: user.id.toString(),
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role?.name
      }, 'strapi');

      ctx.send({
        jwt: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      ctx.badRequest('Login failed');
    }
  }
};

// Alternative: Factory function that receives strapi instance
export const createUnifiedAuthController = (strapiInstance: any) => ({
  async login(ctx: StrapiContext) {
    try {
      const { identifier, password } = ctx.request.body;

      // Use passed Strapi instance
      const authResult = await strapiInstance.plugins['users-permissions'].services.user.validatePassword(
        identifier,
        password
      );

      if (!authResult || !authResult.user) {
        return ctx.badRequest('Invalid credentials');
      }

      const user = authResult.user;

      // Generate unified token
      const token = authService.generateToken({
        id: user.id.toString(),
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role?.name
      }, 'strapi');

      ctx.send({
        jwt: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      ctx.badRequest('Login failed');
    }
  }
});