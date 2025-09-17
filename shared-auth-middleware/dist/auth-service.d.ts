import { AuthConfig, User, TokenPayload } from './types';
export declare class AuthService {
    private config;
    constructor(config: AuthConfig);
    generateToken(user: User, source: 'medusa' | 'strapi'): string;
    verifyToken(token: string): TokenPayload | null;
    validateUserInMedusa(userId: string): Promise<User | null>;
    validateUserInStrapi(userId: string): Promise<User | null>;
    syncUserBetweenServices(user: User, fromService: 'medusa' | 'strapi'): Promise<void>;
    private createOrUpdateStrapiUser;
    private createOrUpdateMedusaUser;
    private generateServiceToken;
}
//# sourceMappingURL=auth-service.d.ts.map