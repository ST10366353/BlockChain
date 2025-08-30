import { apiClient, handleAPIResponse, createQueryParams, APIResponse } from './api-client';
import { API_ENDPOINTS, SearchParams, RateLimitStatus, SystemMetrics, FeatureFlags, APIConfig } from './api-config';

// Search interfaces
export interface SearchResult<T> {
  results: T[];
  total: number;
  facets?: Record<string, any>;
  took?: number;
}

export interface CredentialSearchResult {
  id: string;
  type: string[];
  issuer: string;
  subject: string;
  issued_at: string;
  status: string;
  score: number;
  metadata?: any;
}

export interface ConnectionSearchResult {
  did: string;
  name: string;
  type: string;
  status: string;
  tags: string[];
  score: number;
  last_active?: string;
}

export interface PresentationSearchResult {
  id: string;
  name: string;
  verifier: string;
  status: string;
  created_at: string;
  score: number;
}

export interface AuditSearchResult {
  id: string;
  action: string;
  actor: string;
  target: string;
  success: boolean;
  timestamp: string;
  score: number;
}

// System configuration interfaces
export interface ConfigUpdateRequest {
  features?: Partial<FeatureFlags>;
  limits?: Partial<APIConfig['limits']>;
}

export interface FeatureUpdateRequest {
  enabled: boolean;
  version?: string;
}

export interface RateLimitResetRequest {
  user_did: string;
  scope: 'hourly' | 'daily' | 'monthly';
}

// Metrics interfaces
export interface RequestMetrics {
  period: string;
  total_requests: number;
  requests_by_endpoint: Record<string, number>;
  requests_by_method: Record<string, number>;
  response_times: {
    average: number;
    p95: number;
    p99: number;
  };
  error_rate: number;
}

export interface ErrorMetrics {
  period: string;
  total_errors: number;
  errors_by_status: Record<number, number>;
  errors_by_endpoint: Record<string, number>;
  top_error_messages: string[];
}

export interface PerformanceMetrics {
  period: string;
  system: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
  };
  database: {
    connections: number;
    query_time_avg: number;
    slow_queries: number;
  };
  cache: {
    hit_rate: number;
    miss_rate: number;
    size: string;
  };
  uptime: string;
}

export interface UsageMetrics {
  period: string;
  users: {
    total_active: number;
    new_registrations: number;
    returning_users: number;
  };
  credentials: {
    total_issued: number;
    total_verified: number;
    average_per_user: number;
  };
  api_usage: {
    total_calls: number;
    average_per_user: number;
    peak_hourly: number;
  };
  storage: {
    used: string;
    available: string;
    growth_rate: string;
  };
}

// Search API Client
export class SearchAPI {
  // Advanced search for credentials
  async searchCredentials(params: SearchParams & { 
    filters?: { 
      status?: string[]; 
      type?: string[]; 
      issuer?: string[]; 
      issued_after?: string; 
      expires_before?: string; 
    } 
  }): Promise<SearchResult<CredentialSearchResult>> {
    const response = await apiClient.post<SearchResult<CredentialSearchResult>>(
      API_ENDPOINTS.search.credentials,
      params
    );
    return handleAPIResponse(response);
  }

  // Search user connections
  async searchConnections(params: SearchParams & {
    filters?: {
      status?: string[];
      type?: string[];
      tags?: string[];
    }
  }): Promise<SearchResult<ConnectionSearchResult>> {
    const response = await apiClient.post<SearchResult<ConnectionSearchResult>>(
      API_ENDPOINTS.search.connections,
      params
    );
    return handleAPIResponse(response);
  }

  // Search presentations
  async searchPresentations(params: SearchParams & {
    filters?: {
      status?: string[];
      verifier?: string;
      created_after?: string;
    }
  }): Promise<SearchResult<PresentationSearchResult>> {
    const response = await apiClient.post<SearchResult<PresentationSearchResult>>(
      API_ENDPOINTS.search.presentations,
      params
    );
    return handleAPIResponse(response);
  }

  // Search audit logs
  async searchAuditLogs(params: SearchParams & {
    filters?: {
      action?: string[];
      actor?: string;
      success?: boolean;
      start_date?: string;
      end_date?: string;
    }
  }): Promise<SearchResult<AuditSearchResult>> {
    const response = await apiClient.post<SearchResult<AuditSearchResult>>(
      API_ENDPOINTS.search.audit,
      params
    );
    return handleAPIResponse(response);
  }

  // Get available credential filters
  async getCredentialFilters(): Promise<{
    status: string[];
    types: string[];
    issuers: Array<{ did: string; name: string; count: number }>;
    date_ranges: Record<string, number>;
  }> {
    const response = await apiClient.get(API_ENDPOINTS.filters.credentials);
    return handleAPIResponse(response);
  }

  // Get available connection filters
  async getConnectionFilters(): Promise<{
    status: string[];
    types: string[];
    tags: string[];
    regions: string[];
    last_active: Record<string, number>;
  }> {
    const response = await apiClient.get(API_ENDPOINTS.filters.connections);
    return handleAPIResponse(response);
  }

  // Get available presentation filters
  async getPresentationFilters(): Promise<{
    status: string[];
    verifiers: Array<{ did: string; name: string; count: number }>;
    templates: string[];
    date_ranges: Record<string, number>;
  }> {
    const response = await apiClient.get(API_ENDPOINTS.filters.presentations);
    return handleAPIResponse(response);
  }
}

// System Configuration API Client
export class SystemAPI {
  // Get API configuration
  async getConfig(): Promise<APIConfig> {
    const response = await apiClient.get<APIConfig>(API_ENDPOINTS.config);
    return handleAPIResponse(response);
  }

  // Update API configuration
  async updateConfig(config: ConfigUpdateRequest): Promise<{ success: boolean; updated_at: string }> {
    const response = await apiClient.put(API_ENDPOINTS.config, config);
    return handleAPIResponse(response);
  }

  // Get feature flags
  async getFeatures(): Promise<{ features: FeatureFlags }> {
    const response = await apiClient.get(API_ENDPOINTS.features);
    return handleAPIResponse(response);
  }

  // Update feature flag
  async updateFeature(flag: keyof FeatureFlags, update: FeatureUpdateRequest): Promise<{ success: boolean; feature: string; enabled: boolean; updated_at: string }> {
    const response = await apiClient.put(\\$\{API_ENDPOINTS.features\}/\$\{flag\}\, update);
    return handleAPIResponse(response);
  }

  // Get rate limit status
  async getRateLimitStatus(): Promise<RateLimitStatus> {
    const response = await apiClient.get(API_ENDPOINTS.ratelimit.status);
    return handleAPIResponse(response);
  }

  // Reset rate limits
  async resetRateLimits(request: RateLimitResetRequest): Promise<{ reset: boolean; user: string; scope: string; reset_at: string }> {
    const response = await apiClient.post(API_ENDPOINTS.ratelimit.reset, request);
    return handleAPIResponse(response);
  }

  // Get request metrics
  async getRequestMetrics(params?: { period?: string; start_date?: string; end_date?: string }): Promise<RequestMetrics> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get();
    return handleAPIResponse(response);
  }

  // Get error metrics
  async getErrorMetrics(params?: { period?: string; status_code?: number }): Promise<ErrorMetrics> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await apiClient.get(\\\\);
    return handleAPIResponse(response);
  }

  // Get performance metrics
  async getPerformanceMetrics(params?: { period?: string }): Promise<PerformanceMetrics> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(\\\\);
    return handleAPIResponse(response);
  }

  // Get usage metrics
  async getUsageMetrics(params?: { period?: string; user_did?: string }): Promise<UsageMetrics> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(\\\\);
    return handleAPIResponse(response);
  }

  // Get system status
  async getStatus(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    services: Record<string, string>;
    metrics: Record<string, any>;
  }> {
    const response = await apiClient.get(API_ENDPOINTS.status);
    return handleAPIResponse(response);
  }
}

// Create singleton instances
export const searchAPI = new SearchAPI();
export const systemAPI = new SystemAPI();

