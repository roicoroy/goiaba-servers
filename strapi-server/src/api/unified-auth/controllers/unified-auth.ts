import jwt from 'jsonwebtoken';

interface UnifiedTokenPayload {
  userId: string;
  email: string;
  role?: string;
  source: 'medusa' | 'strapi';
}

export default {
  async login(ctx) {
    try {
      const { identifier, password } = ctx.request.body;

      if (!identifier || !password) {
        return ctx.badRequest('Email and password are required');
      }

      console.log('Unified auth attempt:', { identifier, password: '***' });

      // Demo users for testing (same as Medusa)
      const demoUsers = [
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
      console.log('Demo user found:', !!demoUser);
      
      let user = null;
      
      if (demoUser) {
        console.log('Using demo user:', demoUser.email);
        user = demoUser;
      } else {
        console.log('Demo user not found, trying Strapi auth...');
        // Try Strapi's built-in authentication for real users
        try {
          const authResult = await strapi.plugins['users-permissions'].services.user.validatePassword(
            identifier,
            password
          );
          if (authResult && authResult.user) {
            user = authResult.user;
          }
        } catch (authError) {
          console.log('Strapi auth failed:', authError.message);
        }
      }

      if (!user) {
        console.log('No user found for credentials:', identifier);
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
      const jwtSecret = process.env.JWT_SECRET || 'bnXXqww2fy/GOmHij32EX8D9LaqSPYVCtpZ5QQRI6GaI4QPcfuDHnSzqKGpUr+M+2kQ41wo9ZrJxfXMbBJLhiA==';
      console.log('Using JWT secret:', jwtSecret ? 'configured' : 'not configured');

      const payload: UnifiedTokenPayload = {
        userId: user.id.toString(),
        email: user.email,
        role: user.role?.name,
        source: 'strapi'
      };

      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: '24h'
      });

      console.log('Login successful for user:', user.email);

      ctx.send({
        jwt: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
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
          password: 'Password123'
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
      ],
      debug: {
        timestamp: new Date().toISOString(),
        controller_loaded: true
      }
    });
  },

  async test(ctx) {
    console.log('Test endpoint called');
    ctx.send({
      message: 'Test endpoint working',
      timestamp: new Date().toISOString()
    });
  }
};