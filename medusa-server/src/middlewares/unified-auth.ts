import { MedusaRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  source: 'medusa' | 'strapi';
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      unifiedUser?: TokenPayload;
    }
  }
}

export const unifiedAuthMiddleware = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  // Skip auth for public endpoints
  const publicPaths = ['/health', '/store/auth', '/admin/auth', '/store/customers'];
  const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
  
  if (isPublicPath) {
    return next();
  }

  const token = extractToken(req);
  
  if (!token) {
    return next(); // Let Medusa handle auth
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return next();
    }

    const payload = jwt.verify(token, jwtSecret) as TokenPayload;
    
    // If token is from Strapi, validate and attach user info
    if (payload.source === 'strapi') {
      req.unifiedUser = payload;
      console.log(`Cross-service auth: Strapi user ${payload.email} accessing Medusa`);
    }
    
    next();
  } catch (error) {
    // Invalid token, let Medusa handle it
    next();
  }
};

function extractToken(req: MedusaRequest): string | null {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}