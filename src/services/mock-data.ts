// Mock data service to provide consistent test data across the application
import { UserProfile } from '../shared/types';

export const simulateNetworkDelay = (ms: number = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const mockData = {
  // User Profile
  getUserProfile: (): Promise<UserProfile> => {
    return Promise.resolve({
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      name: 'Mpho',
      email: 'mpho@gmail.com',
      type: 'consumer',
      did: `did:key:z6Mk${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      preferences: {
        theme: 'light',
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
          profileVisibility: 'public',
          credentialSharing: 'selective',
          dataRetention: 365,
          analyticsOptOut: false,
          anonymousIdentity: false
        },
        security: {
          autoLock: 15,
          biometricEnabled: false,
          twoFactorEnabled: false,
          sessionTimeout: 60,
          loginAlerts: true
        },
        display: {
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          currency: 'USD',
          itemsPerPage: 10
        }
      }
    });
  },

  // Update profile data
  updateUserProfile: (updates: any): Promise<UserProfile> => {
    return Promise.resolve({
      id: 'user-123',
      name: updates.name || 'Demo User',
      email: updates.email || 'demo@example.com',
      bio: updates.bio || '',
      type: 'consumer',
      did: `did:key:z6Mk${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      preferences: {
        theme: 'light',
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
          profileVisibility: 'public',
          credentialSharing: 'selective',
          dataRetention: 365,
          analyticsOptOut: false,
          anonymousIdentity: false
        },
        security: {
          autoLock: 15,
          biometricEnabled: false,
          twoFactorEnabled: false,
          sessionTimeout: 60,
          loginAlerts: true
        },
        display: {
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          currency: 'USD',
          itemsPerPage: 10
        }
      }
    });
  },

  // Credentials
  getCredentials: (): Promise<Array<{
    id: string;
    type: string;
    issuer: string;
    subject: string;
    issuanceDate: string;
    credentialSubject: {
      name: string;
      description: string;
    };
    status?: string;
  }>> => {
    return Promise.resolve([
      {
        id: 'credential-1',
        type: 'EducationCredential',
        issuer: 'did:web:university.edu',
        subject: 'did:web:alice.com',
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          name: 'Bachelor of Science',
          description: 'Computer Science Degree'
        },
        status: 'valid'
      },
      {
        id: 'credential-2',
        type: 'EmploymentCredential',
        issuer: 'did:web:company.com',
        subject: 'did:web:alice.com',
        issuanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        credentialSubject: {
          name: 'Software Engineer',
          description: 'Full-time employment verification'
        },
        status: 'valid'
      }
    ]);
  },

  // DID Registration
  registerDID: (request: any): Promise<{ success: boolean; did: string; status: string }> => {
    return Promise.resolve({
      success: true,
      did: `did:${request.method || 'web'}:mock-${Date.now()}.com`,
      status: 'registered'
    });
  },

  // DID Resolution
  resolveDID: (did: string): Promise<{
    didDocument: any;
    didDocumentMetadata: any;
    didResolutionMetadata: any;
  }> => {
    return Promise.resolve({
      didDocument: {
        id: did,
        '@context': ['https://www.w3.org/ns/did/v1'],
        authentication: [`${did}#key-1`],
        verificationMethod: [{
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: 'zMockPublicKey123456789'
        }],
        service: [{
          id: `${did}#endpoint`,
          type: 'MessagingService',
          serviceEndpoint: 'https://example.com/messaging'
        }]
      },
      didDocumentMetadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      },
      didResolutionMetadata: {
        contentType: 'application/did+ld+json',
        pattern: '^(did:web:.+)$'
      }
    });
  },

  // Trusted Issuers
  getTrustedIssuers: (): Promise<Array<{
    did: string;
    name: string;
    status: string;
    credentialTypes: string[];
    verificationMethods: string[];
  }>> => {
    return Promise.resolve([
      {
        did: 'did:web:university.edu',
        name: 'Mock University',
        status: 'trusted',
        credentialTypes: ['EducationCredential', 'AcademicAchievement'],
        verificationMethods: ['verification-method-1']
      },
      {
        did: 'did:web:government.gov',
        name: 'Government Authority',
        status: 'trusted',
        credentialTypes: ['IdentityCredential', 'CitizenshipCredential'],
        verificationMethods: ['verification-method-2']
      }
    ]);
  },

  // Audit Logs
  getAuditLogs: (): Promise<Array<{
    id: string;
    action: string;
    actor: string;
    timestamp: string;
    target?: string;
    outcome: string;
    details?: any;
  }>> => {
    const actions = [
      'credential.issue', 'credential.verify', 'credential.revoke',
      'did.create', 'did.update', 'did.resolve',
      'trust.add', 'trust.update', 'user.login', 'profile.update'
    ];
    
    return Promise.resolve(
      Array.from({ length: 10 }, (_, i) => ({
        id: `audit-${Date.now()}-${i}`,
        action: actions[Math.floor(Math.random() * actions.length)],
        actor: 'did:web:user.com',
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        target: i % 3 === 0 ? `target-${i}` : undefined,
        outcome: Math.random() > 0.1 ? 'success' : 'failure',
        details: {
          userAgent: 'MockBrowser/1.0',
          ipAddress: '192.168.1.100'
        }
      }))
    );
  },

  // Notifications
  getNotifications: (): Promise<Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    priority: string;
    timestamp: string;
    read: boolean;
  }>> => {
    return Promise.resolve([
      {
        id: 'notif-1',
        title: 'Welcome to Blockchain App',
        message: 'Your account has been set up successfully',
        type: 'credential.issued' as const,
        priority: 'medium' as const,
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 'notif-2',
        title: 'New Credential Received',
        message: 'You have received a new education credential',
        type: 'credential.issued' as const,
        priority: 'high' as const,
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        read: true
      }
    ]);
  },

  // Presentations
  getPresentations: (): Promise<Array<{
    id: string;
    type: string;
    holder: string;
    verifier: string;
    createdAt: string;
    status: string;
  }>> => {
    return Promise.resolve([
      {
        id: 'presentation-1',
        type: 'EmploymentVerification',
        holder: 'did:web:alice.com',
        verifier: 'did:web:employer.com',
        createdAt: new Date().toISOString(),
        status: 'verified'
      }
    ]);
  },

  // System Health
  getHealth: (): Promise<{ status: string; timestamp: string }> => {
    return Promise.resolve({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  },

  // System Configuration
  getSystemConfig: (): Promise<{
    version: string;
    environment: string;
    features: any;
    limits: any;
  }> => {
    return Promise.resolve({
      version: '1.0.0',
      environment: 'development',
      features: {
        oidc_bridge: { enabled: true, version: '1.0' },
        selective_disclosure: { enabled: false, version: '1.0' },
        webauthn: { enabled: true, version: '1.0' },
        batch_operations: { enabled: false, version: '1.0' },
        real_time_notifications: { enabled: true, version: '1.0' }
      },
      limits: {
        max_credentials_per_user: 1000,
        max_api_calls_per_hour: 10000,
        max_file_upload_size: '10MB'
      }
    });
  },

  // OIDC Configuration
  getOIDCConfig: (): Promise<{
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint: string;
    jwks_uri: string;
  }> => {
    return Promise.resolve({
      issuer: 'https://mock-oidc.com',
      authorization_endpoint: 'https://mock-oidc.com/auth',
      token_endpoint: 'https://mock-oidc.com/token',
      userinfo_endpoint: 'https://mock-oidc.com/userinfo',
      jwks_uri: 'https://mock-oidc.com/.well-known/jwks.json'
    });
  },

  // Search Results
  getSearchResults: (query: string): Promise<{
    results: any[];
    total: number;
    page: number;
    limit: number;
  }> => {
    return Promise.resolve({
      results: [],
      total: 0,
      page: 1,
      limit: 10
    });
  },

  // Handshake Requests
  getHandshakeRequests: (): Promise<Array<{
    id: string;
    requester: string;
    status: string;
    timestamp: string;
    credentialTypes: string[];
  }>> => {
    return Promise.resolve([
      {
        id: 'handshake-1',
        requester: 'did:web:employer.com',
        status: 'pending',
        timestamp: new Date().toISOString(),
        credentialTypes: ['EducationCredential', 'EmploymentCredential']
      }
    ]);
  }
}; 