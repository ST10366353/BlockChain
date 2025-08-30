const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '^@/lib/utils$': '<rootDir>/src/lib/utils',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/',
    '^@/components/(.*)$': '<rootDir>/src/components/',
    '^@/services$': '<rootDir>/src/services/index.ts',
    '^@/services/(.*)$': '<rootDir>/src/services/',
    '^@/pages/(.*)$': '<rootDir>/src/pages/',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/',
    '^@/utils$': '<rootDir>/src/lib/utils',
  },
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(@radix-ui|lucide-react|class-variance-authority|clsx|tailwind-merge)/)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
}

module.exports = createJestConfig(customJestConfig)
