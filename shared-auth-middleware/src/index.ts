import { AuthService } from './auth-service';
import { createAuthMiddleware, createCrossServiceAuthMiddleware } from './middleware';

export { AuthService } from './auth-service';
export { createAuthMiddleware, createCrossServiceAuthMiddleware } from './middleware';
export * from './types';

// Convenience function to create a complete auth setup
export function createUnifiedAuth(config: {
  jwtSecret: string;
  medusaUrl: string;
  strapiUrl: string;
  tokenExpiry?: string;
}) {
  const authService = new AuthService(config);
  
  return {
    authService,
    middleware: createAuthMiddleware({ config }),
    crossServiceMiddleware: createCrossServiceAuthMiddleware({ 
      config, 
      userSyncEnabled: true 
    })
  };
}