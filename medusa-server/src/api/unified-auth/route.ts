import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import jwt from 'jsonwebtoken';

interface UnifiedTokenPayload {
  userId: string;
  email: string;
  role?: string;
  source: 'medusa' | 'strapi';
}

interface UnifiedAuthRequestBody {
  email?: string;
  password?: string;
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { email, password } = req.body as UnifiedAuthRequestBody;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Demo users for testing (in production, use proper auth)
    const demoUsers = [
      {
        email: 'roicoroy@yahoo.com.br',
        password: 'Rwbento123!',
        id: 'demo-user-1',
        first_name: 'Ricardo',
        last_name: 'Bento'
      },
      {
        email: 'user@example.com',
        password: 'Password123',
        id: 'demo-user-2', 
        first_name: 'Demo',
        last_name: 'User'
      },
      {
        email: 'test@example.com',
        password: 'password123',
        id: 'demo-user-3',
        first_name: 'Test',
        last_name: 'User'
      }
    ];

    // Check if this is a demo user
    const demoUser = demoUsers.find(user => user.email === email && user.password === password);
    
    if (demoUser) {
      // Generate unified JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }

      const payload: UnifiedTokenPayload = {
        userId: demoUser.id,
        email: demoUser.email,
        role: 'customer',
        source: 'medusa'
      };

      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: '24h'
      });

      return res.json({
        token,
        user: {
          id: demoUser.id,
          email: demoUser.email,
          first_name: demoUser.first_name,
          last_name: demoUser.last_name,
          role: 'customer'
        },
        message: 'Login successful - token valid for both Medusa and Strapi'
      });
    }

    // For other users, try to use Medusa's customer module
    try {
      const query = req.scope.resolve('query');
      
      // Query for customer by email
      const { data: customers } = await query.graph({
        entity: 'customer',
        fields: ['id', 'email', 'first_name', 'last_name'],
        filters: { email }
      });

      if (!customers || customers.length === 0) {
        return res.status(401).json({ 
          error: 'Invalid credentials',
          hint: 'Try demo users: user@example.com/Password123 or roicoroy@yahoo.com.br/Rwbento123!',
          available_demo_users: [
            'user@example.com (Password123)',
            'test@example.com (password123)', 
            'roicoroy@yahoo.com.br (Rwbento123!)'
          ]
        });
      }

      const customer = customers[0];
      
      // For demo, accept any password for existing customers
      // In production, implement proper password validation
      
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }

      const payload: UnifiedTokenPayload = {
        userId: customer.id,
        email: customer.email,
        role: 'customer',
        source: 'medusa'
      };

      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: '24h'
      });

      res.json({
        token,
        user: {
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          role: 'customer'
        },
        message: 'Login successful - token valid for both Medusa and Strapi'
      });

    } catch (queryError) {
      console.error('Query error:', queryError);
      return res.status(401).json({ 
        error: 'Authentication failed' 
      });
    }

  } catch (error) {
    console.error('Unified auth error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({
    message: 'Unified Auth Endpoint',
    description: 'POST to this endpoint with email/password to get a unified JWT token',
    usage: {
      method: 'POST',
      body: {
        email: 'user@example.com',
        password: 'Password123'
      }
    },
    demo_users: [
      {
        email: 'user@example.com',
        password: 'Password123',
        note: 'Standard demo user'
      },
      {
        email: 'test@example.com', 
        password: 'password123',
        note: 'Test user for Strapi compatibility'
      },
      {
        email: 'roicoroy@yahoo.com.br',
        password: 'Rwbento123!',
        note: 'Original demo user'
      }
    ]
  });
}