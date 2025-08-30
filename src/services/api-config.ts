// API Configuration
export const API_CONFIG = {
  // Use environment variable for API base URL, fallback to production
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://did-blockchain-380915310329.europe-west1.run.app',

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

// API endpoint paths - Updated to match comprehensive API documentation
export const API_ENDPOINTS = {
  // Health & System
  health: '/health',
  api: '/api/v1',
  status: '/status',

  // DID Management
  did: {
    resolve: '/did/resolve',
    register: '/did/register',
    update: '/did',
    delete: '/did',
    events: '/did',
    registry: '/registry',
    methods: '/did/methods',
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
    templates: '/credentials/templates',
    request: '/credentials/request',
    batchVerify: '/credentials/batch/verify',
    batchRevoke: '/credentials/batch/revoke',
  },

  // Trust Registry
  trust: {
    issuers: '/trust/issuers',
    issuer: '/trust/issuer',
    schemas: '/trust/schemas',
    policies: '/trust/policies',
    verificationPolicies: '/trust/verification-policies',
  },

  // OIDC Bridge
  oidc: {
    authorize: '/oidc/authorize',
    callback: '/oidc/callback',
    token: '/oidc/token',
    verify: '/oidc/verify',
    config: '/oidc/.well-known/openid_configuration',
    configuration: '/oidc/configuration', // Alternative endpoint
    jwks: '/oidc/.well-known/jwks.json',
    userinfo: '/oidc/userinfo',
  },

  // Authentication
  auth: {
    oidc: {
      authorize: '/auth/oidc/authorize',
      token: '/auth/oidc/token',
      userinfo: '/auth/oidc/userinfo',
      introspect: '/auth/oidc/introspect',
      revoke: '/auth/oidc/revoke',
    },
    login: '/auth/login',
    logout: '/auth/logout',
    session: '/auth/session',
    refresh: '/auth/refresh',
    me: '/auth/me',
    webauthn: {
      register: '/auth/webauthn/register',
      authenticate: '/auth/webauthn/authenticate',
      credentials: '/auth/webauthn/credentials',
    },
  },

  // User Profile & Management
  profile: '/profile',
  profileAvatar: '/profile/avatar',
  profilePreferences: '/profile/preferences',
  profileSecurity: '/profile/security',
  profileStats: '/profile/stats',
  profileActivity: '/profile/activity',
  profileUsage: '/profile/usage',

  // Audit & Monitoring
  audit: {
    logs: '/audit/logs',
    stats: '/audit/stats',
    metrics: '/audit/metrics',
    export: '/audit/export',
  },

  // Verifiable Presentations
  presentations: '/presentations',
  presentationTemplates: '/presentations/templates',
  selectivePresentation: '/presentations/selective',

  // Data Export/Import
  export: {
    wallet: '/export/wallet',
    credentials: '/export/credentials',
  },
  import: {
    wallet: '/import/wallet',
  },
  backup: {
    create: '/backup/create',
    list: '/backup/list',
    restore: '/backup/restore',
  },

  // Real-time Notifications
  notifications: '/notifications',
  notificationPreferences: '/notifications/preferences',
  notificationStats: '/notifications/stats',
  notificationTemplates: '/notifications/templates',
  websocketNotifications: '/ws/notifications',

  // Advanced Search & Filtering
  search: {
    credentials: '/search/credentials',
    connections: '/search/connections',
    presentations: '/search/presentations',
    audit: '/search/audit',
  },
  filters: {
    credentials: '/filters/credentials',
    connections: '/filters/connections',
    presentations: '/filters/presentations',
  },

  // System Configuration
  config: '/config',
  features: '/features',
  ratelimit: {
    status: '/ratelimit/status',
    reset: '/ratelimit/reset',
  },

  // Monitoring & Analytics
  metrics: {
    requests: '/metrics/requests',
    errors: '/metrics/errors',
    performance: '/metrics/performance',
    usage: '/metrics/usage',
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

// Additional types for the comprehensive API
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface RateLimitStatus {
  limits: {
    requests_per_hour: {
      limit: number;
      remaining: number;
      reset_time: string;
    };
    requests_per_minute: {
      limit: number;
      remaining: number;
      reset_time: string;
    };
  };
  throttled: boolean;
}

export interface SystemMetrics {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connected: boolean;
    collections: number;
  };
  requests: {
    total: number;
    success: number;
    error: number;
    averageResponseTime: number;
  };
}

export interface FeatureFlags {
  oidc_bridge: {
    enabled: boolean;
    version: string;
  };
  selective_disclosure: {
    enabled: boolean;
    version: string;
  };
  webauthn: {
    enabled: boolean;
    version: string;
  };
  batch_operations: {
    enabled: boolean;
    version: string;
  };
  real_time_notifications: {
    enabled: boolean;
    version: string;
  };
}

export interface APIConfig {
  version: string;
  environment: 'development' | 'production' | 'test';
  features: FeatureFlags;
  limits: {
    max_credentials_per_user: number;
    max_api_calls_per_hour: number;
    max_file_upload_size: string;
  };
  supported_did_methods: string[];
  supported_formats: string[];
}
