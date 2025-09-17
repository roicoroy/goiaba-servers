export { AuthService } from './auth-service';
export { createAuthMiddleware, createCrossServiceAuthMiddleware } from './middleware';
export * from './types';
export declare function createUnifiedAuth(config: {
    jwtSecret: string;
    medusaUrl: string;
    strapiUrl: string;
    tokenExpiry?: string;
}): {
    authService: any;
    middleware: any;
    crossServiceMiddleware: any;
};
//# sourceMappingURL=index.d.ts.map