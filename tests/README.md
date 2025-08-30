# 🧪 DID Wallet Test Suite

A comprehensive test suite for the DID Wallet application, covering unit tests, integration tests, API tests, and end-to-end tests.

## 📋 Test Structure

```
tests/
├── unit/                    # Unit tests for individual functions/components
│   ├── utils.test.ts       # Utility function tests
│   └── ...
├── integration/            # Integration tests for component interactions
├── e2e/                    # End-to-end tests with Playwright
│   ├── auth-flow.spec.ts   # Authentication flow tests
│   ├── dashboard-flow.spec.ts # Dashboard and navigation tests
│   └── ...
├── components/             # Component-specific tests
│   ├── ui/
│   │   └── button.test.tsx # UI component tests
│   └── ...
├── pages/                  # Page component tests
│   └── login-page.test.tsx # Page-specific tests
├── services/               # Service layer tests
│   └── did-api.test.ts     # API service tests
├── api/                    # API integration tests
│   └── credentials-api.test.ts # API endpoint tests
├── fixtures/               # Test data fixtures
│   └── mock-credentials.ts # Mock data for tests
├── __mocks__/              # Jest mocks
│   └── api-client.ts       # Mock API client
├── jest.config.js          # Jest configuration
├── playwright.config.ts    # Playwright configuration
├── setup.js                # Jest setup file
├── test-runner.js          # Custom test runner script
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## 🏃 Running Tests

### All Tests
```bash
npm test
# or
node tests/test-runner.js all
```

### Unit Tests Only
```bash
npm run test:unit
# or
node tests/test-runner.js unit
```

### End-to-End Tests Only
```bash
npm run test:e2e
# or
node tests/test-runner.js e2e
```

### API Integration Tests Only
```bash
npm run test:api
# or
node tests/test-runner.js api
```

### Coverage Report
```bash
npm run test:coverage
# or
node tests/test-runner.js coverage
```

## 📊 Test Categories

### 🧩 Unit Tests (`tests/unit/`)
- Test individual functions and utilities
- Mock external dependencies
- Fast execution, isolated testing

### 🔗 Integration Tests (`tests/integration/`)
- Test component interactions
- Test service layer integrations
- Mock API calls but test real component behavior

### 🌐 API Tests (`tests/api/`)
- Test API endpoints and data flow
- Mock network requests
- Validate API response formats

### 🎭 End-to-End Tests (`tests/e2e/`)
- Test complete user workflows
- Real browser environment
- Test against running application

## 🛠️ Configuration

### Jest Configuration (`jest.config.js`)
```javascript
{
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  }
}
```

### Playwright Configuration (`playwright.config.ts`)
```typescript
{
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ]
}
```

## 📝 Writing Tests

### Unit Test Example
```typescript
import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2')
  })
})
```

### Component Test Example
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test'

test('should display login form', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByText('Welcome Back')).toBeVisible()
  await expect(page.getByLabel('Recovery Passphrase')).toBeVisible()
})

test('should handle login flow', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Recovery Passphrase').fill('valid passphrase')
  await page.getByRole('button', { name: 'Unlock Wallet' }).click()

  await expect(page).toHaveURL('/dashboard')
})
```

## 🎯 Test Fixtures

Test fixtures are located in `tests/fixtures/` and provide mock data for tests:

- `mock-credentials.ts` - Mock credential data
- `mock-users.ts` - Mock user data
- `mock-dids.ts` - Mock DID documents

## 🤖 Mocks

Jest mocks are located in `tests/__mocks__/`:

- `api-client.ts` - Mock API client for testing
- Custom mocks for external dependencies

## 📊 Coverage

Test coverage is automatically generated and includes:

- Statements coverage
- Branches coverage
- Functions coverage
- Lines coverage

View the coverage report:
```bash
npm run test:coverage
# Opens coverage/index.html in browser
```

## 🔧 Debugging Tests

### Debug Unit Tests
```bash
npm test -- --testNamePattern="specific test name" --verbose
```

### Debug E2E Tests
```bash
npx playwright test --debug
# or
npx playwright test --headed --debug
```

### Debug API Tests
```bash
npm run test:api -- --verbose
```

## 🚨 Continuous Integration

### GitHub Actions
The test suite is configured to run on GitHub Actions:

```yaml
- name: Run tests
  run: npm test

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## 📋 Best Practices

### ✅ Do's
- Write descriptive test names
- Use `describe` blocks to group related tests
- Mock external dependencies
- Test both success and error scenarios
- Keep tests isolated and independent
- Use meaningful assertions

### ❌ Don'ts
- Don't test implementation details
- Don't rely on external services in unit tests
- Don't write tests that are brittle
- Don't skip failing tests without investigation
- Don't duplicate test logic

## 🐛 Troubleshooting

### Common Issues

1. **Test timeouts**: Increase timeout in `jest.config.js`
2. **Network errors**: Mock API calls properly
3. **Component rendering issues**: Check React Testing Library setup
4. **E2E failures**: Ensure test server is running

### Debug Commands
```bash
# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test/file.test.ts

# Run tests with coverage
npm test -- --coverage --watchAll=false
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contributing

1. Write tests for new features
2. Ensure all tests pass before committing
3. Maintain test coverage above 80%
4. Update tests when refactoring code
5. Follow the existing test patterns and conventions

---

Happy testing! 🧪✨
