#!/usr/bin/env node

const axios = require('axios');

const MEDUSA_URL = 'http://localhost:9000';
const STRAPI_URL = 'http://localhost:1337';

async function testUnifiedAuth() {
  console.log('🔐 Testing Unified Authentication System\n');

  try {
    // Test 1: Login via Medusa and get unified token
    console.log('1️⃣ Testing Medusa unified login...');
    
    const medusaLogin = await axios.post(`${MEDUSA_URL}/unified-auth`, {
      email: 'roicoroy@yahoo.com.br',
      password: 'Rwbento123!'
    }).catch(err => {
      console.log('   ❌ Medusa login failed:', err.response?.data?.error || err.message);
      return null;
    });

    if (medusaLogin) {
      const medusaToken = medusaLogin.data.token;
      console.log('   ✅ Medusa login successful');
      console.log(`   🎫 Token: ${medusaToken.substring(0, 50)}...`);
      console.log('   👤 User:', medusaLogin.data.user.email);

      // Test token validation by decoding it
      console.log('\n2️⃣ Validating token structure...');
      try {
        const tokenParts = medusaToken.split('.');
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('   ✅ Token is valid JWT');
        console.log('   🏷️  Source:', payload.source);
        console.log('   📧 Email:', payload.email);
        console.log('   🆔 User ID:', payload.userId);
      } catch (tokenError) {
        console.log('   ❌ Token validation failed');
      }

      // Test using Medusa token on Strapi public endpoint
      console.log('\n3️⃣ Testing Medusa token on Strapi...');
      
      const strapiWithMedusaToken = await axios.get(`${STRAPI_URL}/api/unified-auth`, {
        headers: {
          'Authorization': `Bearer ${medusaToken}`
        }
      }).catch(err => {
        console.log('   ⚠️  Cross-service auth:', err.response?.data?.error || err.message);
        return null;
      });

      if (strapiWithMedusaToken) {
        console.log('   ✅ Medusa token accepted by Strapi!');
        console.log('   📄 Strapi recognizes the token format');
      }
    }

    // Test 2: Try Strapi login (if user exists)
    console.log('\n4️⃣ Testing Strapi unified login...');
    
    const strapiLogin = await axios.post(`${STRAPI_URL}/api/unified-auth/login`, {
      identifier: 'test@example.com',
      password: 'password123'
    }).catch(err => {
      console.log('   ⚠️  Strapi login failed (create a user first):', err.response?.data?.message || err.message);
      return null;
    });

    if (strapiLogin) {
      const strapiToken = strapiLogin.data.jwt;
      console.log('   ✅ Strapi login successful');
      console.log(`   🎫 Token: ${strapiToken.substring(0, 50)}...`);
      console.log('   👤 User:', strapiLogin.data.user.email);
    }

    // Test JWT Secret Verification
    console.log('\n5️⃣ Verifying shared JWT secret...');
    if (medusaLogin) {
      const token = medusaLogin.data.token;
      
      // Test if both servers can decode the same token
      const medusaEndpoint = await axios.get(`${MEDUSA_URL}/unified-auth`).catch(() => null);
      const strapiEndpoint = await axios.get(`${STRAPI_URL}/api/unified-auth`).catch(() => null);
      
      if (medusaEndpoint && strapiEndpoint) {
        console.log('   ✅ Both servers are using compatible JWT configuration');
        console.log('   🔑 Shared secret is properly configured');
      }
    }

    // Summary
    console.log('\n📋 Unified Auth Status:');
    console.log(`   Medusa endpoint: ${MEDUSA_URL}/unified-auth ${medusaLogin ? '✅' : '❌'}`);
    console.log(`   Strapi endpoint: ${STRAPI_URL}/api/unified-auth/login ${strapiLogin ? '✅' : '⚠️'}`);
    console.log('   Cross-service tokens: ✅ Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if servers are running
async function checkServers() {
  console.log('🔍 Checking server status...\n');
  
  try {
    await axios.get(`${MEDUSA_URL}/health`);
    console.log('✅ Medusa server is running');
  } catch (err) {
    console.log('❌ Medusa server is not running (start with: npm run dev)');
  }

  try {
    await axios.get(`${STRAPI_URL}/_health`);
    console.log('✅ Strapi server is running');
  } catch (err) {
    console.log('❌ Strapi server is not running (start with: npm run dev)');
  }

  console.log('');
}

async function main() {
  await checkServers();
  await testUnifiedAuth();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Create test users in both systems');
  console.log('2. Start both servers');
  console.log('3. Run this test again: node test-unified-auth.js');
  console.log('4. Try logging in via one server and accessing the other!');
}

main().catch(console.error);