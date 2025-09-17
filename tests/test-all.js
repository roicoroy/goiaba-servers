#!/usr/bin/env node

const testMedusaIntegration = require('./test-medusa-integration');
const testStrapiIntegration = require('./test-strapi-integration');
const testCrossService = require('./test-cross-service');
const testSecurity = require('./test-security');

async function runAllTests() {
  console.log('🧪 Running Complete Unified Auth Test Suite\n');
  console.log('=' .repeat(60));

  const overallResults = {
    totalPassed: 0,
    totalFailed: 0,
    totalTests: 0,
    suites: []
  };

  const testSuites = [
    { name: 'Medusa Integration', fn: testMedusaIntegration },
    { name: 'Strapi Integration', fn: testStrapiIntegration },
    { name: 'Cross-Service Auth', fn: testCrossService },
    { name: 'Security Validation', fn: testSecurity }
  ];

  for (const suite of testSuites) {
    console.log(`\n🔍 Running ${suite.name} Tests...`);
    console.log('-'.repeat(40));
    
    try {
      const results = await suite.fn();
      
      overallResults.totalPassed += results.passed;
      overallResults.totalFailed += results.failed;
      overallResults.totalTests += results.tests.length;
      overallResults.suites.push({
        name: suite.name,
        passed: results.passed,
        failed: results.failed,
        total: results.tests.length,
        tests: results.tests
      });
      
      console.log(`✅ ${suite.name}: ${results.passed}/${results.tests.length} passed`);
      
    } catch (error) {
      console.log(`❌ ${suite.name}: Failed to run - ${error.message}`);
      overallResults.totalFailed++;
      overallResults.totalTests++;
      overallResults.suites.push({
        name: suite.name,
        passed: 0,
        failed: 1,
        total: 1,
        error: error.message
      });
    }
  }

  // Overall Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 OVERALL TEST RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\n🎯 Summary:`);
  console.log(`   Total Tests: ${overallResults.totalTests}`);
  console.log(`   ✅ Passed: ${overallResults.totalPassed}`);
  console.log(`   ❌ Failed: ${overallResults.totalFailed}`);
  console.log(`   📈 Success Rate: ${((overallResults.totalPassed / overallResults.totalTests) * 100).toFixed(1)}%`);

  console.log(`\n📋 Test Suite Breakdown:`);
  overallResults.suites.forEach(suite => {
    const status = suite.failed === 0 ? '✅' : '❌';
    console.log(`   ${status} ${suite.name}: ${suite.passed}/${suite.total} passed`);
  });

  // Detailed Results
  console.log(`\n📝 Detailed Results:`);
  overallResults.suites.forEach(suite => {
    console.log(`\n   ${suite.name}:`);
    if (suite.tests) {
      suite.tests.forEach(test => {
        const status = test.status === 'PASS' ? '✅' : 
                      test.status === 'FAIL' ? '❌' : 
                      test.status === 'SKIP' ? '⏭️' : '⚠️';
        console.log(`     ${status} ${test.name}`);
        if (test.error) {
          console.log(`       Error: ${test.error}`);
        }
        if (test.note) {
          console.log(`       Note: ${test.note}`);
        }
      });
    }
  });

  // Recommendations
  console.log(`\n💡 Recommendations:`);
  
  if (overallResults.totalFailed === 0) {
    console.log('   🎉 All tests passed! Your unified auth system is working perfectly.');
    console.log('   🚀 System is ready for production use.');
  } else {
    console.log('   ⚠️  Some tests failed. Please review the following:');
    
    overallResults.suites.forEach(suite => {
      if (suite.failed > 0) {
        console.log(`   📌 ${suite.name}: Review failed tests and fix issues`);
      }
    });
    
    console.log('   🔧 Fix the issues and run tests again.');
  }

  // Critical Issues Check
  const criticalIssues = overallResults.suites
    .filter(suite => suite.name === 'Security Validation' && suite.failed > 0);
  
  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL SECURITY ISSUES DETECTED!');
    console.log('   🛡️  Do not deploy to production until security issues are resolved.');
  }

  // Environment Info
  console.log(`\n🌍 Environment Information:`);
  console.log(`   Node.js: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);
  console.log(`   Test Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);

  // Exit with appropriate code
  const exitCode = overallResults.totalFailed === 0 ? 0 : 1;
  
  console.log('\n' + '='.repeat(60));
  console.log(exitCode === 0 ? '🎉 ALL TESTS PASSED!' : '❌ SOME TESTS FAILED!');
  console.log('='.repeat(60));

  return {
    success: exitCode === 0,
    results: overallResults,
    exitCode
  };
}

if (require.main === module) {
  runAllTests()
    .then(result => {
      process.exit(result.exitCode);
    })
    .catch(error => {
      console.error('❌ Test suite failed to run:', error);
      process.exit(1);
    });
}

module.exports = runAllTests;