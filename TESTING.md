# Testing Guide

This document provides comprehensive information about the testing setup and practices for the IdentityVault application.

## Overview

The application uses a multi-layered testing strategy:

- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test component interactions and user workflows
- **End-to-End Tests**: Test complete user journeys through the application

## Testing Stack

### Unit & Integration Testing
- **Jest**: Test runner and assertion library
- **React Testing Library**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: DOM environment for testing

### End-to-End Testing
- **Playwright**: Cross-browser E2E testing framework
- **Multiple Browsers**: Chromium, Firefox, WebKit
- **Mobile Testing**: Pixel 5 and iPhone 12 device emulation

## Project Structure

```
src/
├── __tests__/                    # Test files
│   └── integration/             # Integration tests
│       └── user-workflows.test.tsx
├── lib/
│   ├── persistence/
│   │   └── __tests__/           # Persistence layer tests
│   │       └── data-persistence.test.ts
│   ├── websocket/
│   │   └── __tests__/           # WebSocket service tests
│   │       └── websocket-service.test.ts
│   └── offline/
│       └── __tests__/           # Offline queue tests
│           └── queue-manager.test.ts
├── test/                        # Test configuration
│   └── setup.ts                 # Jest setup file
e2e/                             # E2E tests
├── auth.spec.ts                 # Authentication E2E tests
├── credentials.spec.ts          # Credential management E2E tests
├── global-setup.ts              # E2E global setup
└── global-teardown.ts           # E2E global teardown
```

## Configuration Files

### Jest Configuration (`jest.config.js`)
```javascript
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.{ts,tsx}'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  // ... additional configuration
}
```

### Playwright Configuration (`playwright.config.ts`)
```typescript
export default defineConfig({
  testDir: './e2e',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // Mobile browsers
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  // ... additional configuration
})
```

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed
```

## Test Categories

### Unit Tests

#### Data Persistence Tests
- **File**: `src/lib/persistence/__tests__/data-persistence.test.ts`
- **Coverage**:
  - Credential CRUD operations
  - Handshake request management
  - Cache operations
  - Bulk operations
  - Storage statistics
  - Error handling

#### WebSocket Service Tests
- **File**: `src/lib/websocket/__tests__/websocket-service.test.ts`
- **Coverage**:
  - Connection management
  - Message sending/receiving
  - Real-time updates
  - Error handling
  - Reconnection logic
  - Heartbeat functionality

#### Queue Manager Tests
- **File**: `src/lib/offline/__tests__/queue-manager.test.ts`
- **Coverage**:
  - Queue operations (add, remove, process)
  - Dependency checking
  - Retry logic
  - Bulk operations
  - Error handling
  - Statistics tracking

### Integration Tests

#### User Workflows Integration
- **File**: `src/__tests__/integration/user-workflows.test.tsx`
- **Coverage**:
  - Dashboard interactions
  - Credential creation workflow
  - Authentication flows
  - Offline/online transitions
  - Error handling
  - State management integration

### End-to-End Tests

#### Authentication E2E Tests
- **File**: `e2e/auth.spec.ts`
- **Coverage**:
  - Home page loading
  - Login page navigation
  - Multiple authentication methods (passphrase, DID, biometric)
  - Form validation
  - Error handling
  - Authentication persistence
  - Logout functionality

#### Credential Management E2E Tests
- **File**: `e2e/credentials.spec.ts`
- **Coverage**:
  - Dashboard credential display
  - Credential list navigation
  - View mode switching (grid/list)
  - Credential filtering and search
  - Add credential workflow (manual, file upload, QR scan)
  - Credential detail viewing
  - Credential sharing
  - Bulk operations
  - Offline operations
  - Error handling

## Test Utilities

### Custom Test Utilities (`src/test/setup.ts`)

```typescript
// Global test utilities
global.testUtils = {
  flushPromises: () => new Promise(resolve => setImmediate(resolve)),
  createMockStore: (initialState) => ({ /* mock store implementation */ }),
  mockApiResponse: (data, status) => ({ /* mock response */ }),
  generateMockCredential: (overrides) => ({ /* mock credential */ }),
  generateMockHandshakeRequest: (overrides) => ({ /* mock request */ }),
};
```

### Mock Implementations

#### API Service Mocks
```typescript
jest.mock('../api/credentials-service');
jest.mock('../api/handshake-service');
jest.mock('../api/auth-service');
```

#### Browser API Mocks
```typescript
// localStorage mock
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// WebSocket mock
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
}));
```

## Best Practices

### Test Organization
1. **Unit tests** should be colocated with the code they test
2. **Integration tests** should be in `__tests__/integration/`
3. **E2E tests** should be in `e2e/` directory
4. Use descriptive test names that explain the behavior being tested

### Test Structure
```typescript
describe('ComponentName', () => {
  describe('when condition', () => {
    it('should behave correctly', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Mocking Strategy
1. **API calls**: Mock at the service level
2. **Browser APIs**: Mock in test setup
3. **External dependencies**: Mock using Jest's mocking capabilities
4. **Complex components**: Mock child components when testing parent behavior

### Test Data
1. Use factories for consistent test data
2. Create realistic test data that matches production schemas
3. Use overrides for specific test scenarios

## Coverage Goals

- **Unit Tests**: 70% coverage minimum
- **Integration Tests**: Key user workflows covered
- **E2E Tests**: Critical user journeys tested

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e
```

### Coverage Reporting
```bash
# Generate coverage report
npm run test:coverage

# Upload to external service (e.g., Codecov)
# Add your coverage upload commands here
```

## Debugging Tests

### Debug Unit Tests
```bash
# Run specific test file
npm test -- data-persistence.test.ts

# Run with debugging
npm test -- --inspect-brk

# Run with verbose output
npm test -- --verbose
```

### Debug E2E Tests
```bash
# Run with UI mode
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run with browser visible
npm run test:e2e:headed

# Generate trace files
DEBUG=pw:api npm run test:e2e
```

## Common Issues & Solutions

### 1. Async Test Issues
```typescript
// ❌ Wrong
it('should work', () => {
  someAsyncFunction().then(() => {
    expect(result).toBe('expected');
  });
});

// ✅ Correct
it('should work', async () => {
  const result = await someAsyncFunction();
  expect(result).toBe('expected');
});
```

### 2. Mock Cleanup
```typescript
// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 3. Timer Issues
```typescript
// Use fake timers for setTimeout/setInterval
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});
```

### 4. DOM Testing
```typescript
// Use React Testing Library patterns
const { getByText, getByRole } = render(<Component />);
expect(getByText('Expected Text')).toBeInTheDocument();
```

## Contributing

### Adding New Tests
1. Follow the existing file structure
2. Use descriptive test names
3. Include both positive and negative test cases
4. Add tests for error conditions
5. Ensure tests are isolated and don't depend on each other

### Test Maintenance
1. Keep tests updated when code changes
2. Remove obsolete tests
3. Review and update flaky tests
4. Monitor test coverage regularly

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library Jest DOM](https://testing-library.com/docs/ecosystem-jest-dom/)
