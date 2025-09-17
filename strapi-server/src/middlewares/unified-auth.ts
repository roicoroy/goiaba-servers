import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  source: 'medusa' | 'strapi';
  iat?: number;
  exp?: number;
}

export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Skip auth for public endpoints
    const publicPaths = ['/api/auth', '/api/users-permissions', '/_health'];
    const isPublicPath = publicPaths.some(path => ctx.path.startsWith(path));
    
    if (isPublicPath) {
      return await next();
    }

    const token = extractToken(ctx);
    
    if (!token) {
      return await next(); // Let Strapi handle auth
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET not configured');
        return await next();
      }

      const payload = jwt.verify(token, jwtSecret) as TokenPayload;
      
      // If token is from Medusa, validate and attach user info
      if (payload.source === 'medusa') {
        // Find or create corresponding Strapi user
        const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
          where: { email: payload.email }
        });

        if (existingUser) {
          ctx.state.user = existingUser;
          console.log(`Cross-service auth: Medusa user ${payload.email} accessing Strapi`);
        } else {
          // Optionally create user in Strapi
          console.log(`User ${payload.email} from Medusa not found in Strapi`);
        }
      }
      
      await next();
    } catch (error) {
      // Invalid token, let Strapi handle it
      await next();
    }
  };
};

function extractToken(ctx): string | null {
  const authHeader = ctx.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}