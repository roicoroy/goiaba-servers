import jwt from 'jsonwebtoken';
import axios from 'axios';
import { AuthConfig, User, TokenPayload } from './types';

export class AuthService {
  constructor(private config: AuthConfig) {}

  generateToken(user: User, source: 'medusa' | 'strapi'): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      source
    };

    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.tokenExpiry || '24h'
    } as jwt.SignOptions);
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.config.jwtSecret) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  async validateUserInMedusa(userId: string): Promise<User | null> {
    try {
      const response = await axios.get(`${this.config.medusaUrl}/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.generateServiceToken('medusa')}`
        }
      });
      return response.data.user;
    } catch (error) {
      return null;
    }
  }

  async validateUserInStrapi(userId: string): Promise<User | null> {
    try {
      const response = await axios.get(`${this.config.strapiUrl}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.generateServiceToken('strapi')}`
        }
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async syncUserBetweenServices(user: User, fromService: 'medusa' | 'strapi'): Promise<void> {
    const targetService = fromService === 'medusa' ? 'strapi' : 'medusa';
    
    try {
      if (targetService === 'strapi') {
        await this.createOrUpdateStrapiUser(user);
      } else {
        await this.createOrUpdateMedusaUser(user);
      }
    } catch (error) {
      console.error(`Failed to sync user to ${targetService}:`, error);
    }
  }

  private async createOrUpdateStrapiUser(user: User): Promise<void> {
    const userData = {
      username: user.email,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      confirmed: true,
      blocked: false
    };

    await axios.post(`${this.config.strapiUrl}/api/users`, userData, {
      headers: {
        'Authorization': `Bearer ${this.generateServiceToken('strapi')}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private async createOrUpdateMedusaUser(user: User): Promise<void> {
    const userData = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      metadata: user.metadata
    };

    await axios.post(`${this.config.medusaUrl}/admin/users`, userData, {
      headers: {
        'Authorization': `Bearer ${this.generateServiceToken('medusa')}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private generateServiceToken(service: 'medusa' | 'strapi'): string {
    // Generate a service-to-service token for internal API calls
    const payload = {
      service,
      type: 'service-token'
    };
    
    return jwt.sign(payload, this.config.jwtSecret, { 
      expiresIn: '1h' 
    } as jwt.SignOptions);
  }
}