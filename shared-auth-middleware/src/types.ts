export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  metadata?: Record<string, any>;
}

export interface AuthConfig {
  jwtSecret: string;
  medusaUrl: string;
  strapiUrl: string;
  tokenExpiry?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  source: 'medusa' | 'strapi';
  iat?: number;
  exp?: number;
}

export interface AuthMiddlewareOptions {
  config: AuthConfig;
  skipPaths?: string[];
  userSyncEnabled?: boolean;
}