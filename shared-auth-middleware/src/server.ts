import express from 'express';
import cors from 'cors';
import { createUnifiedAuth } from './index';

// Utility function to safely extract error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize unified auth
const { authService, middleware, crossServiceMiddleware } = createUnifiedAuth({
  jwtSecret: process.env.JWT_SECRET || 'supersecret',
  medusaUrl: process.env.MEDUSA_URL || 'http://localhost:9000',
  strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
  tokenExpiry: process.env.TOKEN_EXPIRY || '24h'
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'shared-auth-middleware',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Auth service endpoints
app.post('/auth/generate-token', (req, res) => {
  try {
    const { user, source } = req.body;
    
    if (!user || !source) {
      return res.status(400).json({
        error: 'User and source are required',
        usage: {
          user: { id: 'string', email: 'string', role: 'string' },
          source: 'medusa | strapi'
        }
      });
    }

    const token = authService.generateToken(user, source);
    
    res.json({
      token,
      user,
      source,
      expiresIn: process.env.TOKEN_EXPIRY || '24h'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Token generation failed',
      message: getErrorMessage(error)
    });
  }
});

app.post('/auth/verify-token', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: 'Token is required'
      });
    }

    const payload = authService.verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({
        error: 'Invalid or expired token'
      });
    }

    res.json({
      valid: true,
      payload,
      message: 'Token is valid'
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Token verification failed',
      message: getErrorMessage(error)
    });
  }
});

// User validation endpoints
app.post('/auth/validate-user-medusa', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    const user = await authService.validateUserInMedusa(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found in Medusa'
      });
    }

    res.json({
      valid: true,
      user,
      source: 'medusa'
    });
  } catch (error) {
    res.status(500).json({
      error: 'User validation failed',
      message: getErrorMessage(error)
    });
  }
});

app.post('/auth/validate-user-strapi', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    const user = await authService.validateUserInStrapi(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found in Strapi'
      });
    }

    res.json({
      valid: true,
      user,
      source: 'strapi'
    });
  } catch (error) {
    res.status(500).json({
      error: 'User validation failed',
      message: getErrorMessage(error)
    });
  }
});

// API documentation endpoint
app.get('/docs', (req, res) => {
  res.json({
    service: 'Shared Auth Middleware',
    description: 'Unified authentication service for Medusa and Strapi',
    endpoints: {
      'GET /health': 'Health check',
      'POST /auth/generate-token': 'Generate unified JWT token',
      'POST /auth/verify-token': 'Verify JWT token',
      'POST /auth/validate-user-medusa': 'Validate user in Medusa',
      'POST /auth/validate-user-strapi': 'Validate user in Strapi',
      'GET /docs': 'This documentation'
    },
    environment: {
      JWT_SECRET: process.env.JWT_SECRET ? '***' : 'not set',
      MEDUSA_URL: process.env.MEDUSA_URL || 'http://localhost:9000',
      STRAPI_URL: process.env.STRAPI_URL || 'http://localhost:1337',
      TOKEN_EXPIRY: process.env.TOKEN_EXPIRY || '24h'
    }
  });
});

// Default route
app.get('/', (req, res) => {
  res.redirect('/docs');
});

// Error handling middleware
app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: getErrorMessage(error)
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /health',
      'GET /docs',
      'POST /auth/generate-token',
      'POST /auth/verify-token',
      'POST /auth/validate-user-medusa',
      'POST /auth/validate-user-strapi'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔐 Shared Auth Middleware running on port ${PORT}`);
  console.log(`📚 Documentation: http://localhost:${PORT}/docs`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

export default app;