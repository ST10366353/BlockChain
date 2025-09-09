/**
 * Jest Test Setup
 * Configures testing environment and global test utilities
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock WebSocket
(global as any).WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1, // OPEN
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};
global.sessionStorage = sessionStorageMock;

// Mock indexedDB
global.indexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
  cmp: jest.fn(),
  databases: jest.fn(),
};

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock crypto.getRandomValues
global.crypto = {
  ...global.crypto,
  getRandomValues: jest.fn((array: any) => array.fill(0)),
};

// Polyfill TextEncoder and TextDecoder with proper typing
const TextEncoderPolyfill = class TextEncoder {
  readonly encoding = 'utf-8';

  encode(input?: string): Uint8Array {
    const buffer = Buffer.from(input || '', 'utf-8');
    return new Uint8Array(buffer);
  }

  encodeInto(input: string, dest: Uint8Array): TextEncoderEncodeIntoResult {
    const encoded = this.encode(input);
    const copied = Math.min(encoded.length, dest.length);
    dest.set(encoded.subarray(0, copied));
    return { read: input.length, written: copied };
  }
};

const TextDecoderPolyfill = class TextDecoder {
  readonly encoding = 'utf-8';
  readonly fatal = false;
  readonly ignoreBOM = false;

  constructor(_label?: string, _options?: TextDecoderOptions) {
    // Constructor parameters are intentionally ignored for simplicity
  }

  decode(input?: Uint8Array | ArrayBuffer | ArrayBufferView): string {
    if (!input) return '';
    if (input instanceof ArrayBuffer) {
      return Buffer.from(input).toString('utf-8');
    }
    if (ArrayBuffer.isView(input)) {
      return Buffer.from(input.buffer, input.byteOffset, input.byteLength).toString('utf-8');
    }
    return Buffer.from(input).toString('utf-8');
  }
};

global.TextEncoder = TextEncoderPolyfill as any;
global.TextDecoder = TextDecoderPolyfill as any;

// Mock navigator.credentials
Object.defineProperty(navigator, 'credentials', {
  value: {
    get: jest.fn(),
    create: jest.fn(),
    store: jest.fn(),
  },
});

// Mock PublicKeyCredential
global.PublicKeyCredential = {
  isUserVerifyingPlatformAuthenticatorAvailable: jest.fn().mockResolvedValue(true),
  prototype: {},
  getClientCapabilities: jest.fn(),
  isConditionalMediationAvailable: jest.fn(),
  parseCreationOptionsFromJSON: jest.fn(),
  parseRequestOptionsFromJSON: jest.fn(),
} as any;

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock console methods to reduce noise during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock the http-client to avoid import.meta issues
jest.mock('../lib/api/http-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  default: {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }
}));

// Mock the API services
jest.mock('../lib/api/auth-service', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  }
}));

jest.mock('../lib/api/credentials-service', () => ({
  credentialsService: {
    createCredential: jest.fn(),
    updateCredential: jest.fn(),
    deleteCredential: jest.fn(),
    getCredentials: jest.fn(),
    shareCredential: jest.fn(),
    verifyCredential: jest.fn(),
  },
  Credential: {},
}));

jest.mock('../lib/api/handshake-service', () => ({
  handshakeService: {
    createRequest: jest.fn(),
    getRequests: jest.fn(),
    respondToRequest: jest.fn(),
  },
  HandshakeRequest: {},
}));

// Custom test utilities
(global as any).testUtils = {
  // Wait for all promises to resolve
  flushPromises: () => new Promise(resolve => setImmediate(resolve)),

  // Create mock store
  createMockStore: (initialState = {}) => ({
    getState: jest.fn(() => initialState),
    setState: jest.fn(),
    subscribe: jest.fn(),
    destroy: jest.fn(),
  }),

  // Mock API responses
  mockApiResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  }),

  // Generate mock credentials
  generateMockCredential: (overrides = {}) => ({
    id: `cred_${Date.now()}`,
    name: 'Test Credential',
    type: 'education',
    issuer: 'Test University',
    holder: 'test@example.com',
    description: 'Test credential description',
    status: 'verified',
    issuedAt: new Date().toISOString(),
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {},
    ...overrides,
  }),

  // Generate mock handshake request
  generateMockHandshakeRequest: (overrides = {}) => ({
    id: `handshake_${Date.now()}`,
    requester: 'Test Organization',
    credential: 'Test Credential',
    fields: ['name', 'issuer', 'issuedAt'],
    purpose: 'Employment verification',
    urgency: 'medium' as const,
    status: 'pending' as const,
    requestedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  }),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();

  // Reset localStorage mocks
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();

  // Reset sessionStorage mocks
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});
