"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
class AuthService {
    constructor(config) {
        this.config = config;
    }
    generateToken(user, source) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            source
        };
        return jsonwebtoken_1.default.sign(payload, this.config.jwtSecret, {
            expiresIn: this.config.tokenExpiry || '24h'
        });
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.config.jwtSecret);
        }
        catch (error) {
            return null;
        }
    }
    async validateUserInMedusa(userId) {
        try {
            const response = await axios_1.default.get(`${this.config.medusaUrl}/admin/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${this.generateServiceToken('medusa')}`
                }
            });
            return response.data.user;
        }
        catch (error) {
            return null;
        }
    }
    async validateUserInStrapi(userId) {
        try {
            const response = await axios_1.default.get(`${this.config.strapiUrl}/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${this.generateServiceToken('strapi')}`
                }
            });
            return response.data;
        }
        catch (error) {
            return null;
        }
    }
    async syncUserBetweenServices(user, fromService) {
        const targetService = fromService === 'medusa' ? 'strapi' : 'medusa';
        try {
            if (targetService === 'strapi') {
                await this.createOrUpdateStrapiUser(user);
            }
            else {
                await this.createOrUpdateMedusaUser(user);
            }
        }
        catch (error) {
            console.error(`Failed to sync user to ${targetService}:`, error);
        }
    }
    async createOrUpdateStrapiUser(user) {
        const userData = {
            username: user.email,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            confirmed: true,
            blocked: false
        };
        await axios_1.default.post(`${this.config.strapiUrl}/api/users`, userData, {
            headers: {
                'Authorization': `Bearer ${this.generateServiceToken('strapi')}`,
                'Content-Type': 'application/json'
            }
        });
    }
    async createOrUpdateMedusaUser(user) {
        const userData = {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            metadata: user.metadata
        };
        await axios_1.default.post(`${this.config.medusaUrl}/admin/users`, userData, {
            headers: {
                'Authorization': `Bearer ${this.generateServiceToken('medusa')}`,
                'Content-Type': 'application/json'
            }
        });
    }
    generateServiceToken(service) {
        // Generate a service-to-service token for internal API calls
        const payload = {
            service,
            type: 'service-token'
        };
        return jsonwebtoken_1.default.sign(payload, this.config.jwtSecret, { expiresIn: '1h' });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth-service.js.map