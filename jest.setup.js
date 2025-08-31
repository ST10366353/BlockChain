// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    onLine: true,
    permissions: {
      query: jest.fn().mockResolvedValue({ state: 'granted' }),
    },
  },
  writable: true,
});

// Mock fetch
global.fetch = jest.fn();

// Mock crypto for DID operations
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      generateKey: jest.fn(),
      exportKey: jest.fn(),
      importKey: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
    },
  },
});

// Mock MediaDevices for QR scanner
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
      getVideoTracks: () => [{ getCapabilities: () => ({ torch: false }) }],
    }),
  },
  writable: true,
});

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to create mock credentials
  createMockCredential: (overrides = {}) => ({
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id: 'urn:uuid:12345678-1234-1234-1234-123456789012',
    type: ['VerifiableCredential'],
    issuer: 'did:web:example.com',
    issuanceDate: '2024-01-01T00:00:00Z',
    credentialSubject: {
      id: 'did:key:z6Mkexample',
      name: 'John Doe',
      degree: 'Bachelor of Science'
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: '2024-01-01T00:00:00Z',
      verificationMethod: 'did:web:example.com#key-1',
      proofPurpose: 'assertionMethod',
      proofValue: 'mock-proof-value'
    },
    ...overrides
  }),

  // Helper to create mock handshake request
  createMockHandshakeRequest: (overrides = {}) => ({
    id: 'hs_req_123',
    requesterDID: 'did:web:requester.com',
    requesterName: 'Example Corp',
    requestedFields: ['name', 'email', 'license'],
    purpose: 'Employment verification',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  // Helper to create mock user
  createMockUser: (overrides = {}) => ({
    id: 'user_123',
    did: 'did:key:z6Mkexample',
    name: 'John Doe',
    email: 'john@example.com',
    type: 'consumer',
    preferences: {
      theme: 'system',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
        security: true,
        credentialUpdates: true,
        handshakeRequests: true
      },
      privacy: {
        profileVisibility: 'private',
        credentialSharing: 'selective',
        dataRetention: 365,
        analyticsOptOut: false,
        anonymousIdentity: false
      },
      security: {
        autoLock: true,
        biometricEnabled: false,
        twoFactorEnabled: false,
        sessionTimeout: 15,
        loginAlerts: true
      },
      display: {
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h',
        currency: 'USD',
        itemsPerPage: 20
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
    ...overrides
  }),

  // Helper to render components with providers
  renderWithProviders: (component, options = {}) => {
    const { userType = 'consumer', theme = 'light', ...rest } = options;

    // This would wrap the component with all necessary providers
    // Implementation depends on your testing library setup
    return component;
  }
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});
