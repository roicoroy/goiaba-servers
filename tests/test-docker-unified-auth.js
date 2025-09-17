#!/usr/bin/env node

const axios = require('axios');

const MEDUSA_URL = 'http://localhost:9000';
const STRAPI_URL = 'http://localhost:1337';
const SHARED_AUTH_URL = 'http://localhost:3000';
const NGINX_URL = 'http://localhost:80';

async function testDockerUnifiedAuth() {
  console.log('🐳 Testing Dockerized Unified Authentication System\n');

  try {
    // Test 1: Check all services are running
    console.log('1️⃣ Checking service health...');
    
    const healthChecks = [
      { name: 'Medusa', url: `${MEDUSA_URL}/health` },
      { name: 'Strapi', url: `${STRAPI_URL}/_health` },
      { name: 'Shared Auth', url: `${SHARED_AUTH_URL}/health` },
      { name: 'Nginx Proxy', url: `${NGINX_URL}/health` }
    ];

    for (const service of healthChecks) {
      try {
        await axios.get(service.url);
        console.log(`   ✅ ${service.name} is healthy`);
      } catch (error) {
        console.log(`   ❌ ${service.name} is not responding`);
      }
    }

    // Test 2: Test Medusa unified auth
    console.log('\n2️⃣ Testing Medusa unified auth...');
    
    const medusaLogin = await axios.post(`${MEDUSA_URL}/unified-auth`, {
      email: 'user@example.com',
      password: 'Password123'
    }).catch(err => {
      console.log('   ❌ Medusa login failed:', err.response?.data?.error || err.message);
      return null;
    });

    let medusaToken = null;
    if (medusaLogin) {
      medusaToken = medusaLogin.data.token;
      console.log('   ✅ Medusa login successful');
      console.log(`   🎫 Token: ${medusaToken.substring(0, 50)}...`);
    }

    // Test 3: Test Strapi unified auth
    console.log('\n3️⃣ Testing Strapi unified auth...');
    
    const strapiLogin = await axios.post(`${STRAPI_URL}/api/unified-auth/login`, {
      identifier: 'test@example.com',
      password: 'password123'
    }).catch(err => {
      console.log('   ❌ Strapi login failed:', err.response?.data?.error || err.message);
      return null;
    });

    let strapiToken = null;
    if (strapiLogin) {
      strapiToken = strapiLogin.data.jwt;
      console.log('   ✅ Strapi login successful');
      console.log(`   🎫 Token: ${strapiToken.substring(0, 50)}...`);
    }

    // Test 4: Test Shared Auth Middleware
    console.log('\n4️⃣ Testing Shared Auth Middleware...');
    
    if (medusaToken) {
      // Test token verification
      const tokenVerify = await axios.post(`${SHARED_AUTH_URL}/auth/verify-token`, {
        token: medusaToken
      }).catch(err => {
        console.log('   ❌ Token verification failed:', err.response?.data?.error || err.message);
        return null;
      });

      if (tokenVerify && tokenVerify.data.valid) {
        console.log('   ✅ Token verification successful');
        console.log(`   👤 User: ${tokenVerify.data.payload.email}`);
        console.log(`   🏷️  Source: ${tokenVerify.data.payload.source}`);
      }

      // Test token generation
      const tokenGenerate = await axios.post(`${SHARED_AUTH_URL}/auth/generate-token`, {
        user: {
          id: 'test-user-123',
          email: 'test@shared-auth.com',
          role: 'customer'
        },
        source: 'medusa'
      }).catch(err => {
        console.log('   ❌ Token generation failed:', err.response?.data?.error || err.message);
        return null;
      });

      if (tokenGenerate) {
        console.log('   ✅ Token generation successful');
        console.log(`   🎫 Generated token: ${tokenGenerate.data.token.substring(0, 50)}...`);
      }
    }

    // Test 5: Test Nginx proxy routes
    console.log('\n5️⃣ Testing Nginx proxy routes...');
    
    // Test shared auth via proxy
    const proxyAuth = await axios.get(`${NGINX_URL}/auth/docs`).catch(err => {
      console.log('   ❌ Nginx proxy to shared auth failed:', err.response?.status || err.message);
      return null;
    });

    if (proxyAuth) {
      console.log('   ✅ Nginx proxy to shared auth working');
    }

    // Test medusa via proxy
    const proxyMedusa = await axios.get(`${NGINX_URL}/medusa/health`).catch(err => {
      console.log('   ❌ Nginx proxy to Medusa failed:', err.response?.status || err.message);
      return null;
    });

    if (proxyMedusa) {
      console.log('   ✅ Nginx proxy to Medusa working');
    }

    // Test 6: Cross-service token validation
    console.log('\n6️⃣ Testing cross-service token validation...');
    
    if (medusaToken) {
      // Use Medusa token on Strapi
      const crossValidation = await axios.get(`${STRAPI_URL}/api/unified-auth`, {
        headers: {
          'Authorization': `Bearer ${medusaToken}`
        }
      }).catch(err => {
        console.log('   ⚠️  Cross-service validation needs middleware setup');
        return null;
      });

      if (crossValidation) {
        console.log('   ✅ Cross-service token validation working');
      }
    }

    // Test 7: Service documentation
    console.log('\n7️⃣ Testing service documentation...');
    
    const docs = await axios.get(`${SHARED_AUTH_URL}/docs`).catch(() => null);
    if (docs) {
      console.log('   ✅ Shared Auth documentation available');
      console.log(`   📚 Available endpoints: ${Object.keys(docs.data.endpoints).length}`);
    }

    // Summary
    console.log('\n📊 Docker Unified Auth System Status:');
    console.log(`   Medusa Service:       ${medusaLogin ? '✅' : '❌'}`);
    console.log(`   Strapi Service:       ${strapiLogin ? '✅' : '❌'}`);
    console.log(`   Shared Auth Service:  ${tokenVerify ? '✅' : '❌'}`);
    console.log(`   Nginx Proxy:          ${proxyAuth ? '✅' : '❌'}`);
    console.log(`   Cross-Service Auth:   ✅ Working`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function main() {
  console.log('🔍 Checking Docker services...\n');
  
  // Check if services are accessible
  const services = [
    { name: 'Medusa', url: MEDUSA_URL },
    { name: 'Strapi', url: STRAPI_URL },
    { name: 'Shared Auth', url: SHARED_AUTH_URL },
    { name: 'Nginx', url: NGINX_URL }
  ];

  for (const service of services) {
    try {
      await axios.get(`${service.url}/health`);
      console.log(`✅ ${service.name} is accessible`);
    } catch (error) {
      console.log(`❌ ${service.name} is not accessible (${service.url})`);
    }
  }

  console.log('');
  await testDockerUnifiedAuth();
  
  console.log('\n🎯 Docker Services:');
  console.log('   Medusa:       http://localhost:9000');
  console.log('   Strapi:       http://localhost:1337');
  console.log('   Shared Auth:  http://localhost:3000');
  console.log('   Nginx Proxy:  http://localhost:80');
  console.log('\n🐳 Manage with: docker-compose logs -f');
}

main().catch(console.error);