require('dotenv').config({ path: __dirname + '/.env' });
const axios = require('axios');

describe('Medusa Server Health Check', () => {
  const MEDUSA_URL = process.env.MEDUSA_URL;
  const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY;
  const TIMEOUT = parseInt(process.env.TEST_TIMEOUT) || 30000;

  beforeAll(async () => {
    // Wait a bit for the server to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  test('should respond to health check endpoint', async () => {
    try {
      const response = await axios.get(`${MEDUSA_URL}/health`, {
        timeout: 10000
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    } catch (error) {
      console.error('Health check failed:', error.message);
      throw error;
    }
  }, TIMEOUT);

  test('should respond to store endpoint (with or without API key)', async () => {
    try {
      const response = await axios.get(`${MEDUSA_URL}/store`, {
        timeout: 10000,
        validateStatus: function (status) {
          // Accept 200 (success) or 400 (missing API key) - both indicate server is working
          return status === 200 || status === 400;
        }
      });
      
      expect([200, 400]).toContain(response.status);
      expect(response.data).toBeDefined();
    } catch (error) {
      console.error('Store endpoint check failed:', error.message);
      throw error;
    }
  }, TIMEOUT);

  test('should respond to admin endpoint (even if disabled)', async () => {
    try {
      const response = await axios.get(`${MEDUSA_URL}/admin`, {
        timeout: 10000,
        validateStatus: function (status) {
          // Accept 200, 401 (unauthorized), or 404 (disabled)
          return status === 200 || status === 401 || status === 404;
        }
      });
      
      expect([200, 401, 404]).toContain(response.status);
    } catch (error) {
      console.error('Admin endpoint check failed:', error.message);
      throw error;
    }
  }, TIMEOUT);

  test('should handle CORS preflight requests', async () => {
    try {
      const response = await axios.options(`${MEDUSA_URL}/store`, {
        timeout: 10000,
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET'
        },
        validateStatus: function (status) {
          // Accept 200 (CORS enabled) or 400 (CORS not configured) - both indicate server responds
          return status === 200 || status === 400;
        }
      });
      
      expect([200, 400]).toContain(response.status);
    } catch (error) {
      console.error('CORS check failed:', error.message);
      throw error;
    }
  }, TIMEOUT);

  test('server should be accessible and not return connection errors', async () => {
    try {
      const response = await axios.get(`${MEDUSA_URL}`, {
        timeout: 10000,
        validateStatus: function (status) {
          // Any HTTP response is better than connection refused
          return status >= 200 && status < 600;
        }
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Medusa server is not running on ${MEDUSA_URL}`);
      }
      throw error;
    }
  }, TIMEOUT);

  test('should accept requests with publishable API key', async () => {
    try {
      const response = await axios.get(`${MEDUSA_URL}/store/products`, {
        timeout: 10000,
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.products).toBeDefined();
    } catch (error) {
      console.error('Publishable API key test failed:', error.message);
      throw error;
    }
  }, TIMEOUT);

  test('should return regions with publishable API key', async () => {
    try {
      const response = await axios.get(`${MEDUSA_URL}/store/regions`, {
        timeout: 10000,
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.regions).toBeDefined();
    } catch (error) {
      console.error('Regions API test failed:', error.message);
      throw error;
    }
  }, TIMEOUT);

  test('should validate publishable API key format', () => {
    expect(PUBLISHABLE_API_KEY).toMatch(/^pk_[a-f0-9]{64}$/);
    expect(PUBLISHABLE_API_KEY.length).toBe(67); // 'pk_' + 64 hex characters
  });
});