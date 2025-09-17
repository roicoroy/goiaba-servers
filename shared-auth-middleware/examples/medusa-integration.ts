// Example: Integrating with Medusa 2.0
import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { createUnifiedAuth } from '../src';

const { authService, crossServiceMiddleware } = createUnifiedAuth({
  jwtSecret: process.env.JWT_SECRET || 'supersecret',
  medusaUrl: process.env.MEDUSA_URL || 'http://localhost:9000',
  strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
  tokenExpiry: '24h'
});

// Custom middleware for Medusa routes
export const unifiedAuthMiddleware = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: () => void
) => {
  // Convert to Express-like middleware
  await crossServiceMiddleware(req as any, res as any, next);
};

// Example: Custom login endpoint that generates unified tokens
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { email, password } = req.body;
    
    // Validate user credentials (implement your own logic)
    const user = await validateUserCredentials(email, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate unified token
    const token = authService.generateToken(user, 'medusa');
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}

async function validateUserCredentials(email: string, password: string) {
  // Implement your user validation logic here
  // This would typically check against your user database
  return null;
}