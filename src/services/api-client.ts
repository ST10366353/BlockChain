import { API_CONFIG, API_ENDPOINTS, getDefaultHeaders, type APIResponse, type APIError } from './api-config';
import { mockData, simulateNetworkDelay } from './mock-data';

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
    return `${this.baseURL}/${cleanPath}`;
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
    // In development with mock data, avoid real HTTP requests for certain endpoints
    if (API_CONFIG.useMockData && this.shouldUseMockResponse(path, method)) {
      await simulateNetworkDelay(200);
      return this.getMockResponse<T>(path, method, data);
    }

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
          error: responseData?.error || `HTTP ${response.status}`,
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

  // Check if we should use mock response for this endpoint
  private shouldUseMockResponse(path: string, method: string): boolean {
    // In development mode, use mock data for ALL API calls to prevent any real HTTP requests
    if (API_CONFIG.useMockData) {
      return true;
    }
    
    // Mock common profile operations that might not have real endpoints
    const mockPaths = [
      '/profile',
      '/profile/avatar',
      '/profile/change-password',
      '/profile/stats',
      '/profile/activity',
      '/profile/preferences'
    ];
    
    return mockPaths.some(mockPath => path.includes(mockPath));
  }

  // Generate mock response for development
  private async getMockResponse<T>(path: string, method: string, data?: any): Promise<APIResponse<T>> {
    // Handle profile-related mock responses
    if (path.includes('/profile')) {
      if (method === 'GET' && path === '/profile') {
        // Get profile - return mock profile
        const mockProfile = await mockData.getUserProfile();
        return {
          success: true,
          status: 200,
          data: mockProfile as T
        };
      }
      
      if (method === 'PUT' && path === '/profile') {
        // Profile update - return success
        return {
          success: true,
          status: 200,
          data: { success: true, message: 'Profile updated successfully' } as T
        };
      }
      
      if (method === 'POST' && path.includes('/avatar')) {
        // Avatar upload - return mock URL
        return {
          success: true,
          status: 200,
          data: { avatarUrl: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff' } as T
        };
      }
      
      if (method === 'DELETE' && path.includes('/avatar')) {
        // Avatar delete - return success
        return {
          success: true,
          status: 200,
          data: { success: true } as T
        };
      }
      
      if (method === 'POST' && path.includes('/change-password')) {
        // Password change - return success
        return {
          success: true,
          status: 200,
          data: { success: true } as T
        };
      }
      
      if (method === 'GET' && path.includes('/stats')) {
        // Profile stats - return mock stats
        return {
          success: true,
          status: 200,
          data: {
            totalCredentials: 5,
            totalConnections: 12,
            totalPresentations: 3,
            securityScore: 85,
            accountAge: 45,
            lastActivity: new Date().toISOString()
          } as T
        };
      }
    }
    
    // Handle credentials-related mock responses
    if (path.includes('/credentials')) {
      if (method === 'GET') {
        const mockCredentials = await mockData.getCredentials();
        return {
          success: true,
          status: 200,
          data: mockCredentials as T
        };
      }
      
      if (method === 'POST' && path.includes('/issue')) {
        const mockCredentials = await mockData.getCredentials();
        return {
          success: true,
          status: 200,
          data: {
            credentialId: `cred-${Date.now()}`,
            status: 'issued',
            credential: mockCredentials[0]
          } as T
        };
      }
      
      if (method === 'POST' && path.includes('/verify')) {
        return {
          success: true,
          status: 200,
          data: {
            valid: true,
            credentialId: 'mock-credential-id',
            verificationResult: {
              verified: true,
              issuer: 'mock-issuer',
              subject: 'mock-subject'
            }
          } as T
        };
      }
    }
    
    // Handle DID-related mock responses
    if (path.includes('/did')) {
      if (method === 'GET' && path.includes('/resolve')) {
        return {
          success: true,
          status: 200,
          data: {
            didDocument: {
              id: 'did:web:example.com',
              authentication: ['did:web:example.com#key-1'],
              verificationMethod: [{
                id: 'did:web:example.com#key-1',
                type: 'Ed25519VerificationKey2020',
                controller: 'did:web:example.com',
                publicKeyMultibase: 'zMockPublicKey'
              }]
            }
          } as T
        };
      }
      
      if (method === 'POST' && path.includes('/register')) {
        return {
          success: true,
          status: 200,
          data: {
            success: true,
            did: `did:web:mock-${Date.now()}.com`,
            status: 'registered'
          } as T
        };
      }
    }
    
    // Handle trust registry mock responses
    if (path.includes('/trust')) {
      if (method === 'GET' && path.includes('/issuers')) {
        return {
          success: true,
          status: 200,
          data: [
            {
              did: 'did:web:university.edu',
              name: 'Mock University',
              status: 'trusted',
              credentialTypes: ['EducationCredential'],
              verificationMethods: ['verification-method-1']
            }
          ] as T
        };
      }
    }
    
    // Handle audit-related mock responses
    if (path.includes('/audit')) {
      if (method === 'GET' && path.includes('/logs')) {
        return {
          success: true,
          status: 200,
          data: [
            {
              id: `audit-${Date.now()}`,
              action: 'credential.verify',
              actor: 'did:web:user.com',
              timestamp: new Date().toISOString(),
              target: 'mock-credential-id',
              outcome: 'success'
            }
          ] as T
        };
      }
      
      if (method === 'GET' && path.includes('/stats')) {
        return {
          success: true,
          status: 200,
          data: {
            totalEvents: 25,
            successfulActions: 23,
            failedActions: 2,
            averageResponseTime: 150
          } as T
        };
      }
    }
    
    // Handle notifications mock responses
    if (path.includes('/notifications')) {
      if (method === 'GET') {
        const mockNotifications = await mockData.getNotifications();
        return {
          success: true,
          status: 200,
          data: mockNotifications as T
        };
      }
      
      if (method === 'PUT' || method === 'POST' || method === 'DELETE') {
        return {
          success: true,
          status: 200,
          data: { success: true } as T
        };
      }
    }
    
    // Handle system/config mock responses
    if (path.includes('/config') || path.includes('/features') || path.includes('/status')) {
      if (method === 'GET') {
        return {
          success: true,
          status: 200,
          data: {
            version: '1.0.0',
            environment: 'development',
            features: {
              handshake: true,
              selectiveDisclosure: true,
              biometricAuth: true
            },
            status: 'healthy'
          } as T
        };
      }
      
      if (method === 'PUT' || method === 'POST') {
        return {
          success: true,
          status: 200,
          data: { success: true, updated_at: new Date().toISOString() } as T
        };
      }
    }
    
    // Handle metrics mock responses
    if (path.includes('/metrics')) {
      return {
        success: true,
        status: 200,
        data: {
          period: 'daily',
          total_requests: 150,
          average_response_time: 200,
          error_rate: 0.02,
          uptime: '99.9%'
        } as T
      };
    }
    
    // Handle search mock responses
    if (path.includes('/search')) {
      return {
        success: true,
        status: 200,
        data: {
          results: [],
          total: 0,
          page: 1,
          limit: 10
        } as T
      };
    }
    
    // Handle presentations mock responses
    if (path.includes('/presentations')) {
      if (method === 'GET') {
        return {
          success: true,
          status: 200,
          data: [] as T
        };
      }
      
      if (method === 'POST' && path.includes('/verify')) {
        return {
          success: true,
          status: 200,
          data: {
            valid: true,
            presentationId: 'mock-presentation-id',
            verificationResult: {
              verified: true,
              holder: 'mock-holder'
            }
          } as T
        };
      }
    }
    
    // Handle OIDC mock responses
    if (path.includes('/oidc')) {
      if (method === 'GET' && path.includes('/authorize')) {
        return {
          success: true,
          status: 200,
          data: {
            authorizationUrl: 'https://mock-oidc.com/auth',
            state: 'mock-state',
            nonce: 'mock-nonce'
          } as T
        };
      }
      
      if (method === 'POST' && path.includes('/token')) {
        return {
          success: true,
          status: 200,
          data: {
            access_token: 'mock-access-token',
            id_token: 'mock-id-token',
            token_type: 'Bearer',
            expires_in: 3600
          } as T
        };
      }
    }
    
    // Default mock success response
    return {
      success: true,
      status: 200,
      data: { success: true, message: 'Mock operation completed' } as T
    };
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
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay(200);
      return {
        success: true,
        status: 200,
        data: await mockData.getHealth()
      };
    }
    return this.get(API_ENDPOINTS.health);
  }

  // Get API info
  async getAPIInfo(): Promise<APIResponse<any>> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay(200);
      return {
        success: true,
        status: 200,
        data: {
          version: '1.0.0',
          name: 'Blockchain API',
          description: 'Decentralized Identity and Credential Management API'
        }
      };
    }
    return this.get(API_ENDPOINTS.api);
  }
}

// Create singleton instance
export const apiClient = new APIClient();

// Helper function to handle API responses
export function handleAPIResponse<T>(response: APIResponse<T>): T {
  if (!response.success) {
    const errorMessage = response.error?.message || 'API request failed';
    
    // In development with mock data, log the error but provide more graceful handling
    if (API_CONFIG.useMockData) {
      console.warn('Mock API Response Error:', errorMessage);
      console.warn('This is likely a configuration issue with mock data. Check your API endpoints and mock responses.');
    }
    
    throw new Error(errorMessage);
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
