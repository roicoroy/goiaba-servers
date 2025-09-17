/**
 * Actual Working Strapi Controller Example
 * 
 * This shows the real implementation pattern used in:
 * strapi-server/src/api/unified-auth/controllers/unified-auth.ts
 */

import jwt from 'jsonwebtoken';

interface UnifiedTokenPayload {
  userId: string;
  email: string;
  role?: string;
  source: 'medusa' | 'strapi';
}

interface DemoUser {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: { name: string };
}

interface StrapiUser {
  id: number | string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: { name: string };
}

type AuthenticatedUser = DemoUser | StrapiUser;

// Type guard to check if user has required properties
function isValidUser(user: any): user is AuthenticatedUser {
  return user &&
    typeof user.id !== 'undefined' &&
    typeof user.email === 'string' &&
    typeof user.username === 'string';
}

// This is how the actual working controller is implemented
export default {
  async login(ctx) {
    try {
      const { identifier, password } = ctx.request.body;

      if (!identifier || !password) {
        return ctx.badRequest('Email and password are required');
      }

      // Demo users for testing (same as Medusa)
      const demoUsers: DemoUser[] = [
        {
          id: 'strapi-demo-1',
          username: 'ricardo',
          email: 'roicoroy@yahoo.com.br',
          password: 'Rwbento123!',
          firstName: 'Ricardo',
          lastName: 'Bento',
          role: { name: 'Authenticated' }
        },
        {
          id: 'strapi-demo-2',
          username: 'demouser',
          email: 'user@example.com',
          password: 'Password123',
          firstName: 'Demo',
          lastName: 'User',
          role: { name: 'Authenticated' }
        },
        {
          id: 'strapi-demo-3',
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          role: { name: 'Authenticated' }
        }
      ];

      // Check demo users first
      const demoUser = demoUsers.find(user => user.email === identifier && user.password === password);

      let user: AuthenticatedUser | null = null;

      if (demoUser) {
        user = demoUser;
      } else {
        // Try Strapi's built-in authentication for real users
        // Note: 'strapi' global is available in actual Strapi controllers
        try {
          const authResult = await strapi.plugins['users-permissions'].services.user.validatePassword(
            identifier,
            password
          );
          if (authResult && authResult.user) {
            user = authResult.user as StrapiUser;
          }
        } catch (authError) {
          // User not found in Strapi database
          console.log('Strapi auth failed:', authError);
        }
      }

      if (!user || !isValidUser(user)) {
        return ctx.badRequest('Invalid credentials', {
          hint: 'Try demo users: test@example.com/password123 or user@example.com/Password123',
          available_demo_users: [
            'test@example.com (password123)',
            'user@example.com (Password123)',
            'roicoroy@yahoo.com.br (Rwbento123!)'
          ]
        });
      }

      // Generate unified JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }

      const payload: UnifiedTokenPayload = {
        userId: user.id.toString(),
        email: user.email,
        role: user.role?.name,
        source: 'strapi'
      };

      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: '24h'
      });

      ctx.send({
        jwt: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: user.role
        },
        message: 'Login successful - token valid for both Strapi and Medusa'
      });

    } catch (error) {
      console.error('Unified auth error:', error);
      ctx.badRequest('Authentication failed');
    }
  },

  async info(ctx) {
    ctx.send({
      message: 'Unified Auth Endpoint',
      description: 'POST to /api/unified-auth/login with identifier/password to get a unified JWT token',
      usage: {
        method: 'POST',
        endpoint: '/api/unified-auth/login',
        body: {
          identifier: 'user@example.com',
          password: 'password'
        }
      },
      demo_users: [
        {
          email: 'test@example.com',
          password: 'password123',
          note: 'Test user for compatibility'
        },
        {
          email: 'user@example.com',
          password: 'Password123',
          note: 'Standard demo user'
        },
        {
          email: 'roicoroy@yahoo.com.br',
          password: 'Rwbento123!',
          note: 'Original demo user'
        }
      ]
    });
  }
};

/**
 * Key Points:
 * 
 * 1. The 'strapi' global is automatically available in Strapi controllers
 * 2. Demo users are hardcoded for testing (remove in production)
 * 3. Falls back to real Strapi user authentication
 * 4. Uses the same JWT secret as Medusa for cross-service compatibility
 * 5. Token includes 'source: strapi' to identify origin
 */