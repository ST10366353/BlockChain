const fs = require('fs');

const fixedContent = `import { API_CONFIG, API_ENDPOINTS, getDefaultHeaders, type APIResponse, type APIError } from './api-config';

// Re-export types for use in other modules
export type { APIResponse, APIError };

// Base API client class
export class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  // Build full URL from endpoint path
  private buildURL(path: string): string {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return \`\${this.baseURL}/\${cleanPath}\`;
  }

  // Create timeout signal for compatibility
  private createTimeoutSignal(): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.timeout);
    return controller.signal;
  }

  // Generic request method
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<APIResponse<T>> {
    const url = this.buildURL(path);
    const headers = {
      ...getDefaultHeaders(),
      ...customHeaders,
    };

    const config: RequestInit = {
      method,
      headers,
      signal: this.createTimeoutSignal(),
    };

    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const error: APIError = {
          error: responseData?.error || 'HTTP Error',
          message: responseData?.message || response.statusText,
          code: responseData?.code,
        };

        return {
          error,
          status: response.status,
          success: false,
        };
      }

      return {
        data: responseData,
        status: response.status,
        success: true,
      };
    } catch (error) {
      const apiError: APIError = {
        error: 'Network Error',
        message: error instanceof Error ? error.message : 'Unknown network error',
      };

      return {
        error: apiError,
        status: 0,
        success: false,
      };
    }
  }

  // HTTP method wrappers
  async get<T>(path: string, params?: Record<string, string>): Promise<APIResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>('GET', path + queryString);
  }

  async post<T>(path: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>('POST', path, data);
  }

  async put<T>(path: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>('PUT', path, data);
  }

  async delete<T>(path: string): Promise<APIResponse<T>> {
    return this.request<T>('DELETE', path);
  }

  async patch<T>(path: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>('PATCH', path, data);
  }

  // Health check
  async healthCheck(): Promise<APIResponse<{ status: string; timestamp: string }>> {
    return this.get(API_ENDPOINTS.health);
  }

  // Get API info
  async getAPIInfo(): Promise<APIResponse<any>> {
    return this.get(API_ENDPOINTS.api);
  }
}

// Create singleton instance
export const apiClient = new APIClient();

// Helper function to handle API responses
export function handleAPIResponse<T>(response: APIResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error?.message || 'API request failed');
  }
  return response.data as T;
}

// Helper function to create query parameters
export function createQueryParams(params: Record<string, string | number | boolean | undefined>): Record<string, string> {
  const queryParams: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams[key] = String(value);
    }
  });

  return queryParams;
}
`;

fs.writeFileSync('src/services/api-client.ts', fixedContent);
console.log('Fixed API client syntax errors');
