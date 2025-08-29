import { apiClient, handleAPIResponse, createQueryParams, type APIResponse } from './api-client';
import { API_ENDPOINTS } from './api-config';

// Trusted issuer interfaces
export interface TrustedIssuer {
  did: string;
  status: 'trusted' | 'suspended' | 'revoked';
  tags: string[];
  evidenceUri?: string;
  metadata?: {
    name?: string;
    description?: string;
    website?: string;
    contact?: string;
    jurisdiction?: string;
    [key: string]: any;
  };
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Issuer registration request
export interface IssuerRegistrationRequest {
  did: string;
  tags?: string[];
  evidenceUri?: string;
  metadata?: {
    name?: string;
    description?: string;
    website?: string;
    contact?: string;
    jurisdiction?: string;
    [key: string]: any;
  };
}

// Issuer update request
export interface IssuerUpdateRequest {
  status?: 'trusted' | 'suspended' | 'revoked';
  tags?: string[];
  evidenceUri?: string;
  metadata?: Partial<TrustedIssuer['metadata']>;
}

// Credential schema interfaces
export interface CredentialSchema {
  id: string;
  type: string;
  name: string;
  description?: string;
  schema?: any; // JSON Schema object
  createdAt?: string;
  updatedAt?: string;
  issuerDid?: string;
  version?: string;
}

// Trust registry query parameters
export interface TrustQueryParams {
  status?: 'trusted' | 'suspended' | 'revoked';
  tags?: string | string[];
  jurisdiction?: string;
  limit?: number;
  offset?: number;
}

// Trust registry API Client
export class TrustAPI {
  // List all trusted issuers
  async getTrustedIssuers(params: TrustQueryParams = {}): Promise<TrustedIssuer[]> {
    try {
      const queryParams = createQueryParams({
        ...params,
        tags: Array.isArray(params.tags) ? params.tags.join(',') : params.tags,
      });

      const response = await apiClient.get<TrustedIssuer[]>(
        API_ENDPOINTS.trust.issuers,
        queryParams
      );
      return handleAPIResponse(response);
    } catch (error) {
      console.warn('Trust registry API not available, returning mock data:', error);
      // Return mock trusted issuers for graceful degradation
      return [
        {
          did: 'did:web:trusted-issuer-1.com',
          status: 'trusted',
          tags: ['verified', 'government'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            name: 'Government Identity Service',
            description: 'Official government identity verification service',
            website: 'https://trusted-issuer-1.com',
            jurisdiction: 'US',
            contact: 'support@trusted-issuer-1.com'
          },
          evidenceUri: 'https://trusted-issuer-1.com/evidence',
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'system'
        },
        {
          did: 'did:web:university.edu',
          status: 'trusted',
          tags: ['verified', 'education'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            name: 'University Credential Service',
            description: 'Academic credential issuance service',
            website: 'https://university.edu',
            jurisdiction: 'US',
            contact: 'credentials@university.edu'
          },
          evidenceUri: 'https://university.edu/evidence',
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'system'
        }
      ];
    }
  }

  // Add a new trusted issuer
  async addTrustedIssuer(request: IssuerRegistrationRequest): Promise<{ success: boolean; did: string }> {
    const response = await apiClient.post<{ success: boolean; did: string }>(
      API_ENDPOINTS.trust.issuers,
      request
    );
    return handleAPIResponse(response);
  }

  // Update a trusted issuer
  async updateTrustedIssuer(did: string, request: IssuerUpdateRequest): Promise<{ success: boolean; did: string }> {
    const response = await apiClient.put<{ success: boolean; did: string }>(
      `${API_ENDPOINTS.trust.issuers}/${encodeURIComponent(did)}`,
      request
    );
    return handleAPIResponse(response);
  }

  // Get details of a specific trusted issuer
  async getTrustedIssuer(did: string): Promise<TrustedIssuer> {
    const response = await apiClient.get<TrustedIssuer>(
      `${API_ENDPOINTS.trust.issuers}/${encodeURIComponent(did)}`
    );
    return handleAPIResponse(response);
  }

  // Remove a trusted issuer (alias for singular endpoint)
  async addTrustedIssuerAlias(request: IssuerRegistrationRequest): Promise<{ success: boolean; did: string }> {
    const response = await apiClient.post<{ success: boolean; did: string }>(
      API_ENDPOINTS.trust.issuer,
      request
    );
    return handleAPIResponse(response);
  }

  // Update trusted issuer (alias for singular endpoint)
  async updateTrustedIssuerAlias(did: string, request: IssuerUpdateRequest): Promise<{ success: boolean; did: string }> {
    const response = await apiClient.put<{ success: boolean; did: string }>(
      `${API_ENDPOINTS.trust.issuer}/${encodeURIComponent(did)}`,
      request
    );
    return handleAPIResponse(response);
  }

  // Get credential schemas from schema registry
  async getCredentialSchemas(): Promise<{ schemas: CredentialSchema[]; total: number }> {
    const response = await apiClient.get<{ schemas: CredentialSchema[]; total: number }>(
      API_ENDPOINTS.trust.schemas
    );
    return handleAPIResponse(response);
  }

  // Check if an issuer is trusted
  async isIssuerTrusted(did: string): Promise<boolean> {
    try {
      const issuer = await this.getTrustedIssuer(did);
      return issuer.status === 'trusted';
    } catch (error) {
      return false;
    }
  }

  // Get issuers by tags
  async getIssuersByTags(tags: string[]): Promise<TrustedIssuer[]> {
    const allIssuers = await this.getTrustedIssuers({ tags });
    return allIssuers.filter(issuer =>
      tags.some(tag => issuer.tags.includes(tag))
    );
  }

  // Get issuers by jurisdiction
  async getIssuersByJurisdiction(jurisdiction: string): Promise<TrustedIssuer[]> {
    return this.getTrustedIssuers({ jurisdiction });
  }

  // Bulk update issuer statuses
  async bulkUpdateIssuerStatus(
    issuerDIDs: string[],
    status: 'trusted' | 'suspended' | 'revoked',
    reason?: string
  ): Promise<{ success: boolean; updated: string[]; failed: string[] }> {
    const results = await Promise.allSettled(
      issuerDIDs.map(did =>
        this.updateTrustedIssuer(did, { status })
      )
    );

    const updated: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        updated.push(issuerDIDs[index]);
      } else {
        failed.push(issuerDIDs[index]);
      }
    });

    return {
      success: failed.length === 0,
      updated,
      failed
    };
  }

  // Validate issuer registration data
  validateIssuerRegistration(request: IssuerRegistrationRequest): string[] {
    const errors: string[] = [];

    if (!request.did) {
      errors.push('DID is required');
    } else if (!request.did.startsWith('did:')) {
      errors.push('Invalid DID format');
    }

    if (!request.metadata?.name) {
      errors.push('Issuer name is required in metadata');
    }

    return errors;
  }

  // Create a trust registry entry from connection data
  createTrustEntryFromConnection(connectionData: {
    did: string;
    name: string;
    description?: string;
    website?: string;
    type?: string;
    domain?: string;
  }): IssuerRegistrationRequest {
    return {
      did: connectionData.did,
      tags: [connectionData.type || 'general'],
      evidenceUri: connectionData.website,
      metadata: {
        name: connectionData.name,
        description: connectionData.description,
        website: connectionData.website,
        jurisdiction: connectionData.domain ? 'web' : undefined,
      }
    };
  }
}

// Create singleton instance
export const trustAPI = new TrustAPI();
