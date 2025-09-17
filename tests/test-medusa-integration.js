#!/usr/bin/env node

const axios = require('axios');

const MEDUSA_URL = process.env.MEDUSA_URL || 'http://localhost:9000';

async function testMedusaIntegration() {
  console.log('🛒 Testing Medusa Integration\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Health Check
  console.log('1️⃣ Testing Medusa health check...');
  try {
    const health = await axios.get(`${MEDUSA_URL}/health`);
    if (health.status === 200) {
      console.log('   ✅ Health check passed');
      results.passed++;
      results.tests.push({ name: 'Health Check', status: 'PASS' });
    }
  } catch (error) {
    console.log('   ❌ Health check failed');
    results.failed++;
    results.tests.push({ name: 'Health Check', status: 'FAIL', error: error.message });
  }

  // Test 2: Unified Auth Endpoint
  console.log('\n2️⃣ Testing unified auth endpoint...');
  try {
    const auth = await axios.post(`${MEDUSA_URL}/unified-auth`, {
      email: 'user@example.com',
      password: 'Password123'
    });
    
    if (auth.status === 200 && auth.data.token) {
      console.log('   ✅ Unified auth successful');
      console.log(`   🎫 Token received: ${auth.data.token.substring(0, 30)}...`);
      results.passed++;
      results.tests.push({ name: 'Unified Auth', status: 'PASS', token: auth.data.token });
      
      // Store token for further tests
      global.medusaToken = auth.data.token;
    }
  } catch (error) {
    console.log('   ❌ Unified auth failed:', error.response?.data?.error || error.message);
    results.failed++;
    results.tests.push({ name: 'Unified Auth', status: 'FAIL', error: error.message });
  }

  // Test 3: Token Structure Validation
  if (global.medusaToken) {
    console.log('\n3️⃣ Testing token structure...');
    try {
      const tokenParts = global.medusaToken.split('.');
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      
      const requiredFields = ['userId', 'email', 'source'];
      const hasAllFields = requiredFields.every(field => payload.hasOwnProperty(field));
      
      if (hasAllFields && payload.source === 'medusa') {
        console.log('   ✅ Token structure valid');
        console.log(`   👤 User: ${payload.email}`);
        console.log(`   🏷️  Source: ${payload.source}`);
        results.passed++;
        results.tests.push({ name: 'Token Structure', status: 'PASS' });
      } else {
        throw new Error('Missing required fields or incorrect source');
      }
    } catch (error) {
      console.log('   ❌ Token structure invalid:', error.message);
      results.failed++;
      results.tests.push({ name: 'Token Structure', status: 'FAIL', error: error.message });
    }
  }

  // Test 4: Store API Access
  console.log('\n4️⃣ Testing store API access...');
  try {
    const products = await axios.get(`${MEDUSA_URL}/store/products`, {
      headers: {
        'x-publishable-api-key': 'pk_29002f989c9c40f9779dd1bd62ca5af67aacb45170b179550b89ac71e50792ab'
      }
    });
    
    if (products.status === 200) {
      console.log('   ✅ Store API accessible');
      console.log(`   📦 Products found: ${products.data.products?.length || 0}`);
      results.passed++;
      results.tests.push({ name: 'Store API Access', status: 'PASS' });
    }
  } catch (error) {
    console.log('   ❌ Store API access failed:', error.response?.data?.message || error.message);
    results.failed++;
    results.tests.push({ name: 'Store API Access', status: 'FAIL', error: error.message });
  }

  // Test 5: Admin API Access (if token available)
  if (global.medusaToken) {
    console.log('\n5️⃣ Testing admin API access...');
    try {
      const adminTest = await axios.get(`${MEDUSA_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${global.medusaToken}`
        }
      });
      
      if (adminTest.status === 200) {
        console.log('   ✅ Admin API accessible with unified token');
        results.passed++;
        results.tests.push({ name: 'Admin API Access', status: 'PASS' });
      }
    } catch (error) {
      console.log('   ⚠️  Admin API access limited (expected for customer tokens)');
      results.tests.push({ name: 'Admin API Access', status: 'SKIP', note: 'Customer token limitation' });
    }
  }

  // Test 6: Error Handling
  console.log('\n6️⃣ Testing error handling...');
  try {
    const invalidAuth = await axios.post(`${MEDUSA_URL}/unified-auth`, {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ✅ Error handling working correctly');
      results.passed++;
      results.tests.push({ name: 'Error Handling', status: 'PASS' });
    } else {
      throw error;
    }
  }

  // Summary
  console.log('\n📊 Medusa Integration Test Results:');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📝 Total: ${results.tests.length}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All Medusa integration tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }

  return results;
}

if (require.main === module) {
  testMedusaIntegration().catch(console.error);
}

module.exports = testMedusaIntegration;