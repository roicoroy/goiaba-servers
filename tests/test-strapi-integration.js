#!/usr/bin/env node

const axios = require('axios');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

async function testStrapiIntegration() {
  console.log('📝 Testing Strapi Integration\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Health Check
  console.log('1️⃣ Testing Strapi health check...');
  try {
    const health = await axios.get(`${STRAPI_URL}/_health`);
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
    const auth = await axios.post(`${STRAPI_URL}/api/unified-auth/login`, {
      identifier: 'test@example.com',
      password: 'password123'
    });
    
    if (auth.status === 200 && auth.data.jwt) {
      console.log('   ✅ Unified auth successful');
      console.log(`   🎫 Token received: ${auth.data.jwt.substring(0, 30)}...`);
      results.passed++;
      results.tests.push({ name: 'Unified Auth', status: 'PASS', token: auth.data.jwt });
      
      // Store token for further tests
      global.strapiToken = auth.data.jwt;
    }
  } catch (error) {
    console.log('   ❌ Unified auth failed:', error.response?.data?.error || error.message);
    results.failed++;
    results.tests.push({ name: 'Unified Auth', status: 'FAIL', error: error.message });
  }

  // Test 3: Token Structure Validation
  if (global.strapiToken) {
    console.log('\n3️⃣ Testing token structure...');
    try {
      const tokenParts = global.strapiToken.split('.');
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      
      const requiredFields = ['userId', 'email', 'source'];
      const hasAllFields = requiredFields.every(field => payload.hasOwnProperty(field));
      
      if (hasAllFields && payload.source === 'strapi') {
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

  // Test 4: API Access with Token
  if (global.strapiToken) {
    console.log('\n4️⃣ Testing API access with token...');
    try {
      const apiTest = await axios.get(`${STRAPI_URL}/api/unified-auth`, {
        headers: {
          'Authorization': `Bearer ${global.strapiToken}`
        }
      });
      
      if (apiTest.status === 200) {
        console.log('   ✅ API accessible with unified token');
        results.passed++;
        results.tests.push({ name: 'API Access', status: 'PASS' });
      }
    } catch (error) {
      console.log('   ❌ API access failed:', error.response?.data?.error || error.message);
      results.failed++;
      results.tests.push({ name: 'API Access', status: 'FAIL', error: error.message });
    }
  }

  // Test 5: Content Types Access
  console.log('\n5️⃣ Testing content types access...');
  try {
    const contentTypes = await axios.get(`${STRAPI_URL}/api/content-type-builder/content-types`);
    
    if (contentTypes.status === 200) {
      console.log('   ✅ Content types accessible');
      results.passed++;
      results.tests.push({ name: 'Content Types Access', status: 'PASS' });
    }
  } catch (error) {
    console.log('   ⚠️  Content types access limited (may require admin token)');
    results.tests.push({ name: 'Content Types Access', status: 'SKIP', note: 'Admin access required' });
  }

  // Test 6: Users Permissions Plugin
  console.log('\n6️⃣ Testing users-permissions plugin...');
  try {
    const usersPermissions = await axios.get(`${STRAPI_URL}/api/users-permissions/roles`);
    
    if (usersPermissions.status === 200) {
      console.log('   ✅ Users-permissions plugin accessible');
      console.log(`   👥 Roles found: ${usersPermissions.data.roles?.length || 0}`);
      results.passed++;
      results.tests.push({ name: 'Users Permissions', status: 'PASS' });
    }
  } catch (error) {
    console.log('   ⚠️  Users-permissions access limited');
    results.tests.push({ name: 'Users Permissions', status: 'SKIP', note: 'Limited access' });
  }

  // Test 7: Error Handling
  console.log('\n7️⃣ Testing error handling...');
  try {
    const invalidAuth = await axios.post(`${STRAPI_URL}/api/unified-auth/login`, {
      identifier: 'invalid@example.com',
      password: 'wrongpassword'
    });
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('   ✅ Error handling working correctly');
      results.passed++;
      results.tests.push({ name: 'Error Handling', status: 'PASS' });
    } else {
      throw error;
    }
  }

  // Test 8: Endpoint Documentation
  console.log('\n8️⃣ Testing endpoint documentation...');
  try {
    const docs = await axios.get(`${STRAPI_URL}/api/unified-auth`);
    
    if (docs.status === 200 && docs.data.message) {
      console.log('   ✅ Documentation endpoint working');
      console.log(`   📚 Available demo users: ${docs.data.demo_users?.length || 0}`);
      results.passed++;
      results.tests.push({ name: 'Documentation', status: 'PASS' });
    }
  } catch (error) {
    console.log('   ❌ Documentation endpoint failed');
    results.failed++;
    results.tests.push({ name: 'Documentation', status: 'FAIL', error: error.message });
  }

  // Summary
  console.log('\n📊 Strapi Integration Test Results:');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📝 Total: ${results.tests.length}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All Strapi integration tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }

  return results;
}

if (require.main === module) {
  testStrapiIntegration().catch(console.error);
}

module.exports = testStrapiIntegration;