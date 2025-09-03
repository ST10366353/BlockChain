#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')

// Test runner configuration
const config = {
  jest: {
    config: path.join(__dirname, '../jest.config.js'),
    testPath: 'tests/(unit|components|pages|services|utils)/.*',
    coverage: true,
  },
  playwright: {
    config: path.join(__dirname, 'playwright.config.ts'),
    testPath: 'tests/e2e',
  },
}

// Parse command line arguments
const args = process.argv.slice(2)
const command = args[0] || 'all'

function runJestTests() {
  console.log('🃏 Running Jest unit tests...')

  try {
    const jestCommand = `npx jest --config=${config.jest.config} --testPathPattern="${config.jest.testPath}" --coverage=${config.jest.coverage}`
    execSync(jestCommand, { stdio: 'inherit', cwd: process.cwd() })
    console.log('✅ Jest tests completed successfully')
  } catch (error) {
    console.error('❌ Jest tests failed')
    process.exit(1)
  }
}

function runPlaywrightTests() {
  console.log('🎭 Running Playwright E2E tests...')

  try {
    // Install Playwright browsers if needed
    execSync('npx playwright install', { stdio: 'inherit', cwd: process.cwd() })

    const playwrightCommand = `npx playwright test --config=${config.playwright.config}`
    execSync(playwrightCommand, { stdio: 'inherit', cwd: process.cwd() })
    console.log('✅ Playwright tests completed successfully')
  } catch (error) {
    console.error('❌ Playwright tests failed')
    process.exit(1)
  }
}

function runApiTests() {
  console.log('🔗 Running API integration tests...')

  try {
    const apiTestCommand = `npx jest --config=${config.jest.config} --testPathPattern="tests/api/.*"`
    execSync(apiTestCommand, { stdio: 'inherit', cwd: process.cwd() })
    console.log('✅ API tests completed successfully')
  } catch (error) {
    console.error('❌ API tests failed')
    process.exit(1)
  }
}

function runCoverageReport() {
  console.log('📊 Generating coverage report...')

  try {
    execSync('npx jest --coverage --coverageReporters=html', {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    console.log('✅ Coverage report generated in coverage/index.html')
  } catch (error) {
    console.error('❌ Coverage report generation failed')
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
🎯 DID Wallet Test Runner

Usage: node tests/test-runner.js [command]

Commands:
  unit          Run unit tests only
  e2e           Run end-to-end tests only
  api           Run API integration tests only
  coverage      Generate coverage report
  all           Run all tests (default)
  help          Show this help message

Examples:
  npm test                      # Run all tests
  npm run test:unit            # Run unit tests only
  npm run test:e2e             # Run E2E tests only
  npm run test:coverage       # Generate coverage report
`)
}

// Main execution
switch (command) {
  case 'unit':
    runJestTests()
    break

  case 'e2e':
    runPlaywrightTests()
    break

  case 'api':
    runApiTests()
    break

  case 'coverage':
    runCoverageReport()
    break

  case 'all':
    runJestTests()
    runApiTests()
    runPlaywrightTests()
    break

  case 'help':
  default:
    showHelp()
    break
}

console.log('🎉 Test execution completed!')
