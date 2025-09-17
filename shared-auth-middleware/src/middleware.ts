import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth-service';
import { AuthMiddlewareOptions, TokenPayload } from './types';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function createAuthMiddleware(options: AuthMiddlewareOptions) {
  const authService = new AuthService(options.config);

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip authentication for specified paths
    if (options.skipPaths?.some(path => req.path.startsWith(path))) {
      return next();
    }

    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const payload = authService.verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Validate user exists in the source system
    let userExists = false;
    
    if (payload.source === 'medusa') {
      userExists = !!(await authService.validateUserInMedusa(payload.userId));
    } else if (payload.source === 'strapi') {
      userExists = !!(await authService.validateUserInStrapi(payload.userId));
    }

    if (!userExists) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user info to request
    req.user = payload;
    next();
  };
}

export function createCrossServiceAuthMiddleware(options: AuthMiddlewareOptions) {
  const authService = new AuthService(options.config);

  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const payload = authService.verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Try to validate user in both systems
    let user = null;
    
    if (payload.source === 'medusa') {
      user = await authService.validateUserInMedusa(payload.userId);
    } else if (payload.source === 'strapi') {
      user = await authService.validateUserInStrapi(payload.userId);
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Sync user to other service if enabled
    if (options.userSyncEnabled) {
      await authService.syncUserBetweenServices(user, payload.source);
    }

    req.user = payload;
    next();
  };
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies
  return req.cookies?.token || null;
}