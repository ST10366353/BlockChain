import { apiClient, handleAPIResponse, createQueryParams, APIResponse } from './api-client';
import { API_ENDPOINTS, RateLimitStatus, SystemMetrics, FeatureFlags, APIConfig } from './api-config';

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
    const response = await apiClient.put(`${API_ENDPOINTS.features}/${flag}`, update);
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
    const response = await apiClient.get(`${API_ENDPOINTS.metrics.requests}${queryString}`);
    return handleAPIResponse(response);
  }

  // Get error metrics
  async getErrorMetrics(params?: { period?: string; status_code?: number }): Promise<ErrorMetrics> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await apiClient.get(`${API_ENDPOINTS.metrics.errors}${queryString}`);
    return handleAPIResponse(response);
  }

  // Get performance metrics
  async getPerformanceMetrics(params?: { period?: string }): Promise<PerformanceMetrics> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(`${API_ENDPOINTS.metrics.performance}${queryString}`);
    return handleAPIResponse(response);
  }

  // Get usage metrics
  async getUsageMetrics(params?: { period?: string; user_did?: string }): Promise<UsageMetrics> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(`${API_ENDPOINTS.metrics.usage}${queryString}`);
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

// Create singleton instance
export const systemAPI = new SystemAPI();



