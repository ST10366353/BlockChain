// Shared constants for the DID Blockchain Wallet

// ============================================================================
// API CONSTANTS
// ============================================================================

export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register'
  },
  DID: {
    RESOLVE: '/did/resolve',
    REGISTER: '/did/register',
    UPDATE: '/did/update',
    DELETE: '/did/delete',
    EVENTS: '/did/events'
  },
  CREDENTIALS: {
    LIST: '/credentials',
    CREATE: '/credentials',
    UPDATE: '/credentials',
    DELETE: '/credentials',
    VERIFY: '/credentials/verify',
    REVOKE: '/credentials/revoke'
  },
  HANDSHAKE: {
    REQUESTS: '/handshake/requests',
    RESPONSES: '/handshake/responses',
    SESSION: '/handshake/session',
    HISTORY: '/handshake/history',
    SEARCH: '/handshake/search'
  },
  TRUST: {
    ISSUERS: '/trust/issuers',
    RELATIONSHIPS: '/trust/relationships',
    SCHEMAS: '/trust/schemas'
  },
  AUDIT: {
    LOGS: '/audit/logs',
    STATS: '/audit/stats',
    METRICS: '/audit/metrics',
    EXPORT: '/audit/export'
  },
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile',
    AVATAR: '/profile/avatar',
    STATS: '/profile/stats'
  }
} as const;

// ============================================================================
// TIMEOUTS & LIMITS
// ============================================================================

export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  FILE_UPLOAD: 120000, // 2 minutes
  QR_SCAN: 30000, // 30 seconds
  CACHE: 300000, // 5 minutes
  SESSION: 3600000, // 1 hour
  HANDSHAKE_EXPIRY: 86400000 // 24 hours
} as const;

export const LIMITS = {
  MAX_CREDENTIALS: 1000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_REQUESTS_PER_MINUTE: 100,
  MAX_HANDSHAKE_REQUESTS_PER_HOUR: 10,
  MAX_AUDIT_LOGS_PAGE: 100,
  MAX_CREDENTIALS_PAGE: 50,
  MAX_NOTIFICATIONS_PAGE: 20
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DID_RESOLUTION_ERROR: 'DID_RESOLUTION_ERROR',
  CREDENTIAL_VERIFICATION_ERROR: 'CREDENTIAL_VERIFICATION_ERROR',
  HANDSHAKE_ERROR: 'HANDSHAKE_ERROR'
} as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULTS = {
  THEME: 'system' as const,
  LANGUAGE: 'en' as const,
  ITEMS_PER_PAGE: 20,
  DATE_FORMAT: 'MM/dd/yyyy' as const,
  TIME_FORMAT: '12h' as const,
  CURRENCY: 'USD' as const,
  PRIVACY_LEVEL: 'selective' as const,
  NOTIFICATION_PREFERENCES: {
    email: true,
    push: true,
    sms: false,
    marketing: false,
    security: true,
    credentialUpdates: true,
    handshakeRequests: true
  },
  SECURITY_PREFERENCES: {
    autoLock: true,
    biometricEnabled: false,
    twoFactorEnabled: false,
    sessionTimeout: 15,
    loginAlerts: true
  }
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false
  },
  DID: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 200,
    ALLOWED_METHODS: ['did:key', 'did:web', 'did:ion'] as const
  },
  CREDENTIAL: {
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    SUPPORTED_TYPES: [
      'VerifiableCredential',
      'EducationalCredential',
      'ProfessionalCredential',
      'GovernmentCredential'
    ] as const
  },
  FILE: {
    ALLOWED_TYPES: [
      'application/json',
      'application/ld+json',
      'image/jpeg',
      'image/png',
      'image/webp'
    ],
    MAX_SIZE: 10 * 1024 * 1024 // 10MB
  }
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  HANDSHAKE_PROTOCOL: true,
  SELECTIVE_DISCLOSURE: true,
  ZERO_KNOWLEDGE_PROOFS: false,
  BIOMETRIC_AUTH: true,
  ENTERPRISE_PORTAL: true,
  CONSUMER_MOBILE_APP: true,
  AI_RISK_ASSESSMENT: false,
  MULTI_TENANT: true,
  AUDIT_LOGGING: true,
  COMPLIANCE_REPORTING: true,
  QR_CODE_SCANNING: true,
  OFFLINE_MODE: false,
  WEB_NOTIFICATIONS: true,
  PUSH_NOTIFICATIONS: false
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI = {
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48
  },
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#6B7280',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    BACKGROUND: '#FFFFFF',
    SURFACE: '#F9FAFB',
    TEXT: '#111827',
    TEXT_SECONDARY: '#6B7280'
  },
  ANIMATION: {
    DURATION_FAST: 150,
    DURATION_NORMAL: 300,
    DURATION_SLOW: 500,
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  THEME: 'did-wallet-theme',
  LANGUAGE: 'did-wallet-language',
  USER_TYPE: 'did-wallet-user-type',
  AUTH_TOKEN: 'did-wallet-auth-token',
  REFRESH_TOKEN: 'did-wallet-refresh-token',
  USER_PREFERENCES: 'did-wallet-preferences',
  DEVICE_ID: 'did-wallet-device-id',
  LAST_LOGIN: 'did-wallet-last-login',
  CACHED_DATA: 'did-wallet-cache'
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DID: /^did:[a-z0-9]+:.+/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  BASE64: /^[A-Za-z0-9+/]*={0,2}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
} as const;

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

// ============================================================================
// HANDSHAKE CONSTANTS
// ============================================================================

export const HANDSHAKE = {
  DEFAULT_EXPIRY_HOURS: 24,
  MAX_REQUESTS_PER_HOUR: 10,
  CHALLENGE_LENGTH: 32,
  SUPPORTED_PROOFS: ['Ed25519Signature2020', 'BBS+Signature2020'],
  COMPLIANCE_LEVELS: ['basic', 'standard', 'advanced'] as const
} as const;

// ============================================================================
// AUDIT CONSTANTS
// ============================================================================

export const AUDIT = {
  RETENTION_DAYS: 365,
  MAX_LOGS_PER_PAGE: 100,
  EVENT_TYPES: {
    CREDENTIAL_ISSUED: 'credential.issued',
    CREDENTIAL_VERIFIED: 'credential.verified',
    CREDENTIAL_REVOKED: 'credential.revoked',
    HANDSHAKE_INITIATED: 'handshake.initiated',
    HANDSHAKE_COMPLETED: 'handshake.completed',
    USER_LOGIN: 'user.login',
    USER_LOGOUT: 'user.logout',
    PROFILE_UPDATED: 'profile.updated'
  } as const
} as const;
