require('dotenv').config({ path: __dirname + '/.env' });
const { exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');

const execAsync = promisify(exec);

describe('Docker Services Health Check', () => {
  const MEDUSA_URL = process.env.MEDUSA_URL;
  const TIMEOUT = parseInt(process.env.TEST_TIMEOUT) || 30000;

  test('should have Medusa containers running', async () => {
    try {
      const { stdout } = await execAsync('docker ps --format "table {{.Names}}\\t{{.Status}}" | grep medusa');
      
      expect(stdout).toContain('medusa-server-medusa-1');
      expect(stdout).toContain('medusa-server-medusa-db-1');
      expect(stdout).toContain('medusa-server-medusa-redis-1');
      expect(stdout).toContain('Up');
    } catch (error) {
      throw new Error('Medusa Docker containers are not running. Run: docker-compose -f medusa-server/docker-compose.yml up -d');
    }
  }, TIMEOUT);

  test('should have PostgreSQL accessible', async () => {
    try {
      const { stdout } = await execAsync('docker exec medusa-server-medusa-db-1 pg_isready -U marketplace -d goiaba_db');
      expect(stdout).toContain('accepting connections');
    } catch (error) {
      throw new Error('PostgreSQL is not ready or accessible');
    }
  }, TIMEOUT);

  test('should have Redis accessible', async () => {
    try {
      const { stdout } = await execAsync('docker exec medusa-server-medusa-redis-1 redis-cli ping');
      expect(stdout.trim()).toBe('PONG');
    } catch (error) {
      throw new Error('Redis is not accessible');
    }
  }, TIMEOUT);

  test('should have correct port mappings', async () => {
    try {
      const { stdout } = await execAsync('docker port medusa-server-medusa-1');
      expect(stdout).toContain('9000/tcp -> 0.0.0.0:9000');
    } catch (error) {
      throw new Error('Medusa port mapping is incorrect');
    }
  }, TIMEOUT);

  test('Medusa container should have correct environment variables', async () => {
    try {
      const { stdout } = await execAsync('docker exec medusa-server-medusa-1 env | grep -E "(DATABASE_URL|REDIS_URL|NODE_ENV)"');
      
      expect(stdout).toContain('DATABASE_URL=postgres://marketplace:super-secure-password@medusa-db:5432/goiaba_db');
      expect(stdout).toContain('REDIS_URL=redis://medusa-redis:6379');
      expect(stdout).toContain('NODE_ENV=development');
    } catch (error) {
      console.error('Environment check failed:', error.message);
      throw new Error('Medusa container environment variables are not set correctly');
    }
  }, TIMEOUT);

  test('should be able to connect to Medusa API from host', async () => {
    try {
      const response = await axios.get(`${MEDUSA_URL}/health`, {
        timeout: 10000
      });
      
      expect(response.status).toBe(200);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Medusa API. Check if port 9000 is properly mapped.');
      }
      throw error;
    }
  }, TIMEOUT);
});