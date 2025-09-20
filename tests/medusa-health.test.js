const axios = require('axios');

describe('Medusa Server Health Check', () => {
  const MEDUSA_URL = process.env.MEDUSA_URL || 'http://localhost:9000';
  const TIMEOUT = 30000; // 30 seconds timeout

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

  test('should respond to store endpoint', async () => {
    try {
      const response = await axios.get(`${MEDUSA_URL}/store`, {
        timeout: 10000
      });
      
      expect(response.status).toBe(200);
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
          // Accept both 200 and 404 (404 if admin is disabled)
          return status === 200 || status === 404;
        }
      });
      
      expect([200, 404]).toContain(response.status);
    } catch (error) {
      console.error('Admin endpoint check failed:', error.message);
      throw error;
    }
  }, TIMEOUT);

  test('should have correct CORS headers', async () => {
    try {
      const response = await axios.options(`${MEDUSA_URL}/store`, {
        timeout: 10000,
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET'
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
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
});