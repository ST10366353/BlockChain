import React from 'react';
import { apiClient, handleAPIResponse } from './api-client';
import { API_ENDPOINTS, API_CONFIG, RateLimitStatus, FeatureFlags, APIConfig } from './api-config';
import { simulateNetworkDelay, mockData } from './mock-data';

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
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        version: '1.0.0',
        environment: 'development',
        features: {
          oidc_bridge: {
            enabled: true,
            version: '1.0'
          },
          selective_disclosure: {
            enabled: false,
            version: '1.0'
          },
          webauthn: {
            enabled: true,
            version: '1.0'
          },
          batch_operations: {
            enabled: false,
            version: '1.0'
          },
          real_time_notifications: {
            enabled: true,
            version: '1.0'
          }
        },
        limits: {
          max_credentials_per_user: 1000,
          max_api_calls_per_hour: 10000,
          max_file_upload_size: '10MB'
        },
        supported_did_methods: ['web', 'key'],
        supported_formats: ['jwt_vc', 'jwt_vp']
      };
    }

    const response = await apiClient.get<APIConfig>(API_ENDPOINTS.config);
    return handleAPIResponse(response);
  }

  // Update API configuration
  async updateConfig(config: ConfigUpdateRequest): Promise<{ success: boolean; updated_at: string }> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        success: true,
        updated_at: new Date().toISOString()
      };
    }

    const response = await apiClient.put(API_ENDPOINTS.config, config);
    return handleAPIResponse(response) as { success: boolean; updated_at: string };
  }

  // Get feature flags
  async getFeatures(): Promise<{ features: FeatureFlags }> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      const config = await mockData.getSystemConfig();
      return { features: config.features };
    }

    const response = await apiClient.get(API_ENDPOINTS.features);
    return handleAPIResponse(response) as { features: FeatureFlags };
  }

  // Update feature flag
  async updateFeature(flag: keyof FeatureFlags, update: FeatureUpdateRequest): Promise<{ success: boolean; feature: string; enabled: boolean; updated_at: string }> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        success: true,
        feature: flag,
        enabled: update.enabled,
        updated_at: new Date().toISOString()
      };
    }

    const response = await apiClient.put(`${API_ENDPOINTS.features}/${flag}`, update);
    return handleAPIResponse(response) as { success: boolean; feature: string; enabled: boolean; updated_at: string };
  }

  // Get rate limit status
  async getRateLimitStatus(): Promise<RateLimitStatus> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        limits: {
          requests_per_hour: {
            limit: 10000,
            remaining: 9523,
            reset_time: new Date(Date.now() + 60 * 60 * 1000).toISOString()
          },
          requests_per_minute: {
            limit: 100,
            remaining: 95,
            reset_time: new Date(Date.now() + 60 * 1000).toISOString()
          }
        },
        throttled: false
      };
    }

    const response = await apiClient.get(API_ENDPOINTS.ratelimit.status);
    return handleAPIResponse(response) as RateLimitStatus;
  }

  // Reset rate limits
  async resetRateLimits(request: RateLimitResetRequest): Promise<{ reset: boolean; user: string; scope: string; reset_at: string }> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        reset: true,
        user: request.user_did,
        scope: request.scope,
        reset_at: new Date().toISOString()
      };
    }

    const response = await apiClient.post(API_ENDPOINTS.ratelimit.reset, request);
    return handleAPIResponse(response) as { reset: boolean; user: string; scope: string; reset_at: string };
  }

  // Get request metrics
  async getRequestMetrics(params?: { period?: string; start_date?: string; end_date?: string }): Promise<RequestMetrics> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        period: params?.period || 'daily',
        total_requests: 1500,
        requests_by_endpoint: {
          '/credentials/verify': 450,
          '/did/resolve': 380,
          '/profile': 220,
          '/audit/logs': 150
        },
        requests_by_method: {
          'GET': 900,
          'POST': 450,
          'PUT': 100,
          'DELETE': 50
        },
        response_times: {
          average: 125,
          p95: 250,
          p99: 500
        },
        error_rate: 0.025
      };
    }

    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(`${API_ENDPOINTS.metrics.requests}${queryString}`);
    return handleAPIResponse(response) as RequestMetrics;
  }

  // Get error metrics
  async getErrorMetrics(params?: { period?: string; status_code?: number }): Promise<ErrorMetrics> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        period: params?.period || 'daily',
        total_errors: 25,
        errors_by_status: {
          400: 8,
          401: 5,
          404: 7,
          500: 3,
          503: 2
        },
        errors_by_endpoint: {
          '/credentials/verify': 10,
          '/did/resolve': 8,
          '/profile': 4,
          '/audit/logs': 3
        },
        top_error_messages: [
          'Invalid credential format',
          'DID not found',
          'Authentication required',
          'Rate limit exceeded'
        ]
      };
    }

    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await apiClient.get(`${API_ENDPOINTS.metrics.errors}${queryString}`);
    return handleAPIResponse(response) as ErrorMetrics;
  }

  // Get performance metrics
  async getPerformanceMetrics(params?: { period?: string }): Promise<PerformanceMetrics> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        period: params?.period || 'daily',
        system: {
          cpu_usage: 45.2,
          memory_usage: 68.5,
          disk_usage: 42.1
        },
        database: {
          connections: 25,
          query_time_avg: 15.3,
          slow_queries: 3
        },
        cache: {
          hit_rate: 85.4,
          miss_rate: 14.6,
          size: '256MB'
        },
        uptime: '99.9%'
      };
    }

    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(`${API_ENDPOINTS.metrics.performance}${queryString}`);
    return handleAPIResponse(response) as PerformanceMetrics;
  }

  // Get usage metrics
  async getUsageMetrics(params?: { period?: string; user_did?: string }): Promise<UsageMetrics> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        period: params?.period || 'daily',
        users: {
          total_active: 125,
          new_registrations: 15,
          returning_users: 110
        },
        credentials: {
          total_issued: 45,
          total_verified: 38,
          average_per_user: 2.3
        },
        api_usage: {
          total_calls: 1500,
          average_per_user: 12,
          peak_hourly: 85
        },
        storage: {
          used: '1.2GB',
          available: '8.8GB',
          growth_rate: '50MB/day'
        }
      };
    }

    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(`${API_ENDPOINTS.metrics.usage}${queryString}`);
    return handleAPIResponse(response) as UsageMetrics;
  }

  // Get system status
  async getStatus(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    services: Record<string, string>;
    metrics: Record<string, any>;
  }> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: 259200, // 3 days in seconds
        services: {
          database: 'healthy',
          cache: 'healthy',
          storage: 'healthy',
          notifications: 'healthy'
        },
        metrics: {
          cpu_usage: 45.2,
          memory_usage: 68.5,
          active_connections: 25,
          requests_per_second: 12.3
        }
      };
    }

    const response = await apiClient.get(API_ENDPOINTS.status);
    return handleAPIResponse(response) as {
      status: string;
      timestamp: string;
      uptime: number;
      services: Record<string, string>;
      metrics: Record<string, any>;
    };
  }
}

// Create singleton instance
export const systemAPI = new SystemAPI();



