// Test Configuration
module.exports = {
  // Service URLs
  services: {
    medusa: process.env.MEDUSA_URL || 'http://localhost:9000',
    strapi: process.env.STRAPI_URL || 'http://localhost:1337',
    sharedAuth: process.env.SHARED_AUTH_URL || 'http://localhost:3000',
    nginx: process.env.NGINX_URL || 'http://localhost:80'
  },

  // Test credentials
  credentials: {
    medusa: {
      email: 'user@example.com',
      password: 'Password123'
    },
    strapi: {
      identifier: 'test@example.com',
      password: 'password123'
    },
    alternative: {
      email: 'roicoroy@yahoo.com.br',
      password: 'Rwbento123!'
    }
  },

  // Test timeouts
  timeouts: {
    request: 10000,      // 10 seconds
    healthCheck: 5000,   // 5 seconds
    auth: 15000          // 15 seconds
  },

  // Test settings
  settings: {
    maxRetries: 3,
    retryDelay: 1000,    // 1 second
    verbose: process.env.TEST_VERBOSE === 'true',
    skipSlow: process.env.SKIP_SLOW_TESTS === 'true'
  },

  // Expected responses
  expected: {
    tokenFields: ['userId', 'email', 'source', 'iat', 'exp'],
    sources: ['medusa', 'strapi'],
    httpCodes: {
      success: [200, 201],
      unauthorized: [401],
      badRequest: [400],
      notFound: [404]
    }
  },

  // Security test parameters
  security: {
    maxRequestsPerMinute: 60,
    weakPasswords: ['123', 'password', 'admin', ''],
    sqlInjectionPayloads: [
      "'; DROP TABLE users; --",
      "admin' OR '1'='1",
      "' UNION SELECT * FROM users --"
    ]
  }
};