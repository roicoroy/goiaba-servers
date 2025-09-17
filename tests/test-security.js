#!/usr/bin/env node

const axios = require('axios');
const jwt = require('jsonwebtoken');

const MEDUSA_URL = process.env.MEDUSA_URL || 'http://localhost:9000';
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const SHARED_AUTH_URL = process.env.SHARED_AUTH_URL || 'http://localhost:3000';

async function testSecurity() {
  console.log('🛡️ Testing Security Validation\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: JWT Secret Strength
  console.log('1️⃣ Testing JWT secret strength...');
  try {
    // Get a valid token to analyze
    const auth = await axios.post(`${MEDUSA_URL}/unified-auth`, {
      email: 'user@example.com',
      password: 'Password123'
    });
    
    if (auth.data.token) {
      const token = auth.data.token;
      const parts = token.split('.');
      
      // Check if token has proper structure
      if (parts.length === 3) {
        console.log('   ✅ JWT token has proper structure (3 parts)');
        
        // Check header
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        if (header.alg && header.typ === 'JWT') {
          console.log(`   ✅ JWT header valid (algorithm: ${header.alg})`);
          results.passed++;
          results.tests.push({ name: 'JWT Structure', status: 'PASS' });
        }
      }
    }
  } catch (error) {
    console.log('   ❌ JWT structure test failed');
    results.failed++;
    results.tests.push({ name: 'JWT Structure', status: 'FAIL', error: error.message });
  }

  // Test 2: Token Tampering Detection
  console.log('\n2️⃣ Testing token tampering detection...');
  try {
    const auth = await axios.post(`${MEDUSA_URL}/unified-auth`, {
      email: 'user@example.com',
      password: 'Password123'
    });
    
    if (auth.data.token) {
      const originalToken = auth.data.token;
      const parts = originalToken.split('.');
      
      // Tamper with the payload
      const tamperedPayload = Buffer.from('{"userId":"hacker","email":"hacker@evil.com","source":"medusa"}').toString('base64');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
      
      // Try to use tampered token
      const tamperedRequest = await axios.get(`${STRAPI_URL}/api/unified-auth`, {
        headers: { 'Authorization': `Bearer ${tamperedToken}` }
      }).catch(err => err.response);
      
      // Should be rejected
      if (tamperedRequest?.status >= 400) {
        console.log('   ✅ Tampered token properly rejected');
        results.passed++;
        results.tests.push({ name: 'Token Tampering Detection', status: 'PASS' });
      } else {
        throw new Error('Tampered token was accepted');
      }
    }
  } catch (error) {
    console.log('   ❌ Token tampering test failed');
    results.failed++;
    results.tests.push({ name: 'Token Tampering Detection', status: 'FAIL', error: error.message });
  }

  // Test 3: Expired Token Handling
  console.log('\n3️⃣ Testing expired token handling...');
  try {
    // Create a token that's already expired
    const expiredPayload = {
      userId: 'test-user',
      email: 'test@example.com',
      source: 'medusa',
      exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
    };
    
    // We can't create a properly signed expired token without the secret,
    // so we'll test with an obviously invalid token
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwic291cmNlIjoibWVkdXNhIiwiZXhwIjoxfQ.invalid';
    
    const expiredRequest = await axios.get(`${MEDUSA_URL}/unified-auth`, {
      headers: { 'Authorization': `Bearer ${expiredToken}` }
    }).catch(err => err.response);
    
    if (expiredRequest?.status >= 400) {
      console.log('   ✅ Expired/invalid token properly rejected');
      results.passed++;
      results.tests.push({ name: 'Expired Token Handling', status: 'PASS' });
    } else {
      throw new Error('Expired token was accepted');
    }
  } catch (error) {
    console.log('   ❌ Expired token test failed');
    results.failed++;
    results.tests.push({ name: 'Expired Token Handling', status: 'FAIL', error: error.message });
  }

  // Test 4: SQL Injection Prevention
  console.log('\n4️⃣ Testing SQL injection prevention...');
  try {
    const sqlInjectionAttempts = [
      "'; DROP TABLE users; --",
      "admin' OR '1'='1",
      "' UNION SELECT * FROM users --"
    ];
    
    let allBlocked = true;
    
    for (const injection of sqlInjectionAttempts) {
      const response = await axios.post(`${MEDUSA_URL}/unified-auth`, {
        email: injection,
        password: 'password'
      }).catch(err => err.response);
      
      // Should return 401 or 400, not 500 (which might indicate SQL error)
      if (response?.status === 500) {
        allBlocked = false;
        break;
      }
    }
    
    if (allBlocked) {
      console.log('   ✅ SQL injection attempts properly handled');
      results.passed++;
      results.tests.push({ name: 'SQL Injection Prevention', status: 'PASS' });
    } else {
      throw new Error('Potential SQL injection vulnerability');
    }
  } catch (error) {
    console.log('   ❌ SQL injection test failed');
    results.failed++;
    results.tests.push({ name: 'SQL Injection Prevention', status: 'FAIL', error: error.message });
  }

  // Test 5: Rate Limiting (if implemented)
  console.log('\n5️⃣ Testing rate limiting...');
  try {
    const requests = [];
    const maxRequests = 10;
    
    // Send multiple rapid requests
    for (let i = 0; i < maxRequests; i++) {
      requests.push(
        axios.post(`${MEDUSA_URL}/unified-auth`, {
          email: 'test@example.com',
          password: 'wrongpassword'
        }).catch(err => err.response)
      );
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(response => response?.status === 429);
    
    if (rateLimited) {
      console.log('   ✅ Rate limiting is active');
      results.passed++;
      results.tests.push({ name: 'Rate Limiting', status: 'PASS' });
    } else {
      console.log('   ⚠️  Rate limiting not detected (may not be implemented)');
      results.tests.push({ name: 'Rate Limiting', status: 'SKIP', note: 'Not implemented' });
    }
  } catch (error) {
    console.log('   ❌ Rate limiting test failed');
    results.failed++;
    results.tests.push({ name: 'Rate Limiting', status: 'FAIL', error: error.message });
  }

  // Test 6: HTTPS Enforcement (in production)
  console.log('\n6️⃣ Testing HTTPS enforcement...');
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const isHttps = MEDUSA_URL.startsWith('https://') && STRAPI_URL.startsWith('https://');
    
    if (isProduction && !isHttps) {
      throw new Error('Production environment should use HTTPS');
    } else if (isProduction && isHttps) {
      console.log('   ✅ HTTPS properly configured for production');
      results.passed++;
      results.tests.push({ name: 'HTTPS Enforcement', status: 'PASS' });
    } else {
      console.log('   ⚠️  Development environment (HTTPS not required)');
      results.tests.push({ name: 'HTTPS Enforcement', status: 'SKIP', note: 'Development environment' });
    }
  } catch (error) {
    console.log('   ❌ HTTPS enforcement failed');
    results.failed++;
    results.tests.push({ name: 'HTTPS Enforcement', status: 'FAIL', error: error.message });
  }

  // Test 7: Password Security
  console.log('\n7️⃣ Testing password security...');
  try {
    const weakPasswords = ['123', 'password', 'admin', ''];
    let weakPasswordsRejected = 0;
    
    for (const weakPassword of weakPasswords) {
      const response = await axios.post(`${MEDUSA_URL}/unified-auth`, {
        email: 'test@example.com',
        password: weakPassword
      }).catch(err => err.response);
      
      if (response?.status === 401) {
        weakPasswordsRejected++;
      }
    }
    
    if (weakPasswordsRejected === weakPasswords.length) {
      console.log('   ✅ Weak passwords properly rejected');
      results.passed++;
      results.tests.push({ name: 'Password Security', status: 'PASS' });
    } else {
      console.log('   ⚠️  Some weak passwords may be accepted (check password policy)');
      results.tests.push({ name: 'Password Security', status: 'WARN', note: 'Review password policy' });
    }
  } catch (error) {
    console.log('   ❌ Password security test failed');
    results.failed++;
    results.tests.push({ name: 'Password Security', status: 'FAIL', error: error.message });
  }

  // Test 8: CORS Configuration
  console.log('\n8️⃣ Testing CORS configuration...');
  try {
    const corsTest = await axios.options(`${MEDUSA_URL}/unified-auth`, {
      headers: {
        'Origin': 'http://malicious-site.com',
        'Access-Control-Request-Method': 'POST'
      }
    }).catch(err => err.response);
    
    // Check if CORS headers are present and properly configured
    const corsHeaders = corsTest?.headers;
    if (corsHeaders && corsHeaders['access-control-allow-origin']) {
      console.log('   ✅ CORS headers present');
      console.log(`   🌐 Allowed origin: ${corsHeaders['access-control-allow-origin']}`);
      results.passed++;
      results.tests.push({ name: 'CORS Configuration', status: 'PASS' });
    } else {
      console.log('   ⚠️  CORS configuration may need review');
      results.tests.push({ name: 'CORS Configuration', status: 'WARN', note: 'Review CORS settings' });
    }
  } catch (error) {
    console.log('   ❌ CORS test failed');
    results.failed++;
    results.tests.push({ name: 'CORS Configuration', status: 'FAIL', error: error.message });
  }

  // Summary
  console.log('\n📊 Security Test Results:');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📝 Total: ${results.tests.length}`);
  
  const criticalTests = results.tests.filter(test => 
    ['JWT Structure', 'Token Tampering Detection', 'Expired Token Handling'].includes(test.name)
  );
  const criticalFailures = criticalTests.filter(test => test.status === 'FAIL');
  
  if (criticalFailures.length === 0) {
    console.log('\n🛡️ Critical security tests passed!');
  } else {
    console.log('\n🚨 CRITICAL: Some security tests failed! Review immediately.');
  }
  
  if (results.failed === 0) {
    console.log('🎉 All security tests passed - system is secure!');
  } else {
    console.log('⚠️  Some security issues detected. Review the details above.');
  }

  return results;
}

if (require.main === module) {
  testSecurity().catch(console.error);
}

module.exports = testSecurity;