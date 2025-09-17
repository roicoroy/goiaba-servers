import { Request, Response, NextFunction } from 'express';
import { AuthMiddlewareOptions, TokenPayload } from './types';
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}
export declare function createAuthMiddleware(options: AuthMiddlewareOptions): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare function createCrossServiceAuthMiddleware(options: AuthMiddlewareOptions): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=middleware.d.ts.map