// API Configuration
export const API_CONFIG = {
  // Use environment variable for API base URL, fallback to production
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://didbockchain-380915310329.europe-west1.run.app',

  // Development fallback
  devURL: 'http://localhost:3000',

  // Request timeout in milliseconds
  timeout: 30000,

  // API version
  version: 'v1',
};

// Common headers for all requests
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// API endpoint paths
export const API_ENDPOINTS = {
  // Health & System
  health: '/health',
  api: '/api/v1',

  // DID Management
  did: {
    resolve: '/did/resolve',
    register: '/did/register',
    update: '/did',
    delete: '/did',
    events: '/did',
    registry: '/registry',
  },

  // Credentials
  credentials: {
    issue: '/credentials/issue',
    verify: '/credentials/verify',
    presentations: '/presentations/verify',
    revoke: '/credentials',
    revocationStatus: '/credentials',
    bySubject: '/credentials/subject',
    byIssuer: '/credentials/issuer',
    query: '/credentials',
  },

  // Trust Registry
  trust: {
    issuers: '/trust/issuers',
    issuer: '/trust/issuer',
    schemas: '/trust/schemas',
  },

  // OIDC
  oidc: {
    authorize: '/oidc/authorize',
    callback: '/oidc/callback',
    token: '/oidc/token',
    verify: '/oidc/verify',
    config: '/oidc/.well-known/openid_configuration',
    jwks: '/oidc/.well-known/jwks.json',
    userinfo: '/oidc/userinfo',
  },

  // Audit
  audit: {
    logs: '/audit/logs',
    stats: '/audit/stats',
    metrics: '/audit/metrics',
    export: '/audit/export',
  },

  // Notifications
  notifications: {
    list: '/notifications',
    markAllRead: '/notifications/mark-all-read',
    preferences: '/notifications/preferences',
    stats: '/notifications/stats',
  },
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
} as const;

// Error types
export interface APIError {
  error: string;
  message: string;
  code?: string;
}

// Common response wrapper
export interface APIResponse<T = any> {
  data?: T;
  error?: APIError;
  status: number;
  success: boolean;
}
