// API Fallback service to ensure robust API handling
import { API_CONFIG } from './api-config';
import { simulateNetworkDelay } from './mock-data';

export class APIFallback {
  static async safeAPICall<T>(
    apiCall: () => Promise<T>,
    fallbackData: T,
    context: string = 'API Call'
  ): Promise<T> {
    try {
      // If in development mode, always use mock data to prevent external calls
      if (API_CONFIG.useMockData) {
        console.log(`[APIFallback] Using mock data for: ${context}`);
        await simulateNetworkDelay(200);
        return fallbackData;
      }
      
      return await apiCall();
    } catch (error) {
      console.warn(`[APIFallback] ${context} failed, using fallback:`, error);
      return fallbackData;
    }
  }

  static createSafeEndpoint(endpoint: any): string {
    if (!endpoint) {
      console.warn('[APIFallback] Undefined endpoint detected, using fallback');
      return '/api/fallback';
    }

    if (typeof endpoint === 'object') {
      console.warn('[APIFallback] Object passed as endpoint, using fallback');
      return '/api/fallback';
    }

    return String(endpoint);
  }

  static getMockProfile() {
    return {
      id: 'fallback-user',
      did: 'did:key:z6MkFallbackUser123',
      name: 'Fallback User',
      email: 'fallback@example.com',
      bio: 'Fallback profile for development',
      avatar: undefined,
      isActive: true,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferences: {
        theme: 'light' as const,
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
          profileVisibility: 'public' as const,
          credentialSharing: 'selective' as const,
          dataRetention: 365,
          analyticsOptOut: false,
          anonymousIdentity: false
        },
        security: {
          biometricEnabled: false,
          twoFactorEnabled: false,
          sessionTimeout: 30,
          loginAlerts: true
        },
        display: {
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          itemsPerPage: 10
        }
      }
    };
  }

  static getMockNotifications() {
    return [
      {
        id: 'fallback-notif-1',
        title: 'System Ready',
        message: 'Your blockchain wallet is ready to use',
        type: 'credential.issued' as const,
        priority: 'medium' as const,
        timestamp: new Date().toISOString(),
        read: false
      }
    ];
  }

  static getMockStats() {
    return {
      totalCredentials: 0,
      totalConnections: 0,
      totalPresentations: 0,
      accountAge: 1,
      lastActivity: new Date().toISOString(),
      securityScore: 100
    };
  }
} 