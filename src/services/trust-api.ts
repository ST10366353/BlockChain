import React from 'react';
import { apiClient, handleAPIResponse, createQueryParams } from './api-client';
import { API_ENDPOINTS } from './api-config';
import { API_CONFIG } from './api-config';
import { mockData, simulateNetworkDelay } from './mock-data';

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

// Trust Registry API Client
export class TrustAPI {
  // Get trusted issuers
  async getTrustedIssuers(params?: TrustQueryParams): Promise<TrustedIssuer[]> {
    // Use mock data in development to avoid external API calls
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      const mockIssuers = await mockData.getTrustedIssuers();
      // Convert mock format to TrustedIssuer format
      return mockIssuers.map(issuer => ({
        did: issuer.did,
        status: issuer.status as 'trusted' | 'suspended' | 'revoked',
        tags: ['verified'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          name: issuer.name,
          description: `Trusted issuer for ${issuer.credentialTypes.join(', ')}`,
          website: `https://${issuer.did.replace('did:web:', '')}`,
          jurisdiction: 'US',
          contact: `contact@${issuer.did.replace('did:web:', '')}`
        },
        evidenceUri: `https://${issuer.did.replace('did:web:', '')}/evidence`,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'system'
      }));
    }

    const queryString = params ? createQueryParams(params as any) : {};
    const response = await apiClient.get<TrustedIssuer[]>(
      API_ENDPOINTS.trust.issuers,
      queryString
    );
    return handleAPIResponse(response);
  }

  // Add a trusted issuer
  async addTrustedIssuer(request: IssuerRegistrationRequest): Promise<{ success: boolean; did: string }> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        success: true,
        did: request.did
      };
    }

    const response = await apiClient.post<{ success: boolean; did: string }>(
      API_ENDPOINTS.trust.issuers,
      request
    );
    return handleAPIResponse(response);
  }

  // Update trusted issuer information
  async updateTrustedIssuer(did: string, request: IssuerUpdateRequest): Promise<{ success: boolean; did: string }> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        success: true,
        did: did
      };
    }

    const response = await apiClient.put<{ success: boolean; did: string }>(
      `${API_ENDPOINTS.trust.issuer}/${encodeURIComponent(did)}`,
      request
    );
    return handleAPIResponse(response);
  }

  // Get issuer details
  async getTrustedIssuer(did: string): Promise<TrustedIssuer> {
    return this.getIssuerDetails(did);
  }

  async getIssuerDetails(did: string): Promise<TrustedIssuer> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      const trustedIssuers = await this.getTrustedIssuers();
      return trustedIssuers.find(issuer => issuer.did === did) || trustedIssuers[0];
    }

    const response = await apiClient.get<TrustedIssuer>(
      `${API_ENDPOINTS.trust.issuer}/${encodeURIComponent(did)}`
    );
    return handleAPIResponse(response);
  }

  // Remove trusted issuer
  async removeTrustedIssuer(did: string): Promise<{ success: boolean; did: string }> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        success: true,
        did: did
      };
    }

    const response = await apiClient.post<{ success: boolean; did: string }>(
      `${API_ENDPOINTS.trust.issuer}/${encodeURIComponent(did)}/remove`,
      {}
    );
    return handleAPIResponse(response);
  }

  // Update issuer trust status
  async updateIssuerTrustStatus(did: string, status: string): Promise<{ success: boolean; did: string }> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        success: true,
        did: did
      };
    }

    const response = await apiClient.put<{ success: boolean; did: string }>(
      `${API_ENDPOINTS.trust.issuer}/${encodeURIComponent(did)}/status`,
      { status }
    );
    return handleAPIResponse(response);
  }

  // Get credential schemas
  async getCredentialSchemas(params?: { type?: string; issuer?: string }): Promise<{ schemas: CredentialSchema[]; total: number }> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        schemas: [
          {
            id: 'schema-1',
            type: 'EducationCredential',
            name: 'Education Credential Schema',
            description: 'Schema for educational achievements',
            version: '1.0',
            schema: {
              type: 'object',
              properties: {
                degree: { type: 'string' },
                institution: { type: 'string' },
                graduationDate: { type: 'string', format: 'date' }
              },
              required: ['degree', 'institution']
            },
            createdAt: new Date().toISOString()
          }
        ],
        total: 1
      };
    }

    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get<{ schemas: CredentialSchema[]; total: number }>(
      `${API_ENDPOINTS.trust.schemas}${queryString}`
    );
    return handleAPIResponse(response);
  }

  // Check if an issuer is trusted
  async isIssuerTrusted(did: string): Promise<boolean> {
    try {
      const issuer = await this.getIssuerDetails(did);
      return issuer.status === 'trusted';
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _reason?: string
  ): Promise<{ success: boolean; updated: string[]; failed: string[] }> {
    const results = await Promise.allSettled(
      issuerDIDs.map(did =>
        this.updateIssuerTrustStatus(did, status)
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

  // Get issuer verification status
  async getIssuerVerificationStatus(did: string): Promise<{ verified: boolean; verifiedAt?: string; verifiedBy?: string; evidence?: string[] }> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      try {
        const issuer = await this.getIssuerDetails(did);
        return {
          verified: issuer.status === 'trusted',
          verifiedAt: issuer.verifiedAt,
          verifiedBy: issuer.verifiedBy,
          evidence: issuer.evidenceUri ? [issuer.evidenceUri] : []
        };
      } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return {
          verified: false
        };
      }
    }

    const response = await apiClient.get<{ verified: boolean; verifiedAt?: string; verifiedBy?: string; evidence?: string[] }>(
      `${API_ENDPOINTS.trust.issuer}/${encodeURIComponent(did)}/verification`
    );
    return handleAPIResponse(response);
  }

  // Get trust policies
  async getTrustPolicies(): Promise<Array<{ id: string; name: string; description: string; rules: any[] }>> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return [
        {
          id: 'policy-1',
          name: 'Basic Trust Policy',
          description: 'Default trust policy for credential verification',
          rules: [
            { type: 'issuer-trust', required: true },
            { type: 'credential-validity', required: true }
          ]
        }
      ];
    }

    const response = await apiClient.get<Array<{ id: string; name: string; description: string; rules: any[] }>>(
      API_ENDPOINTS.trust.policies
    );
    return handleAPIResponse(response);
  }

  // Search issuers
  async searchIssuers(query: { query?: string; filters?: { status?: string; tags?: string[] }; limit?: number }): Promise<TrustedIssuer[]> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      let issuers = await this.getTrustedIssuers();

      // Apply text search
      if (query.query) {
        const searchTerm = query.query.toLowerCase();
        issuers = issuers.filter(issuer =>
          issuer.metadata?.name?.toLowerCase().includes(searchTerm) ||
          issuer.metadata?.description?.toLowerCase().includes(searchTerm) ||
          issuer.did.toLowerCase().includes(searchTerm)
        );
      }

      // Apply filters
      if (query.filters?.status) {
        issuers = issuers.filter(issuer => issuer.status === query.filters!.status);
      }

      if (query.filters?.tags && query.filters.tags.length > 0) {
        issuers = issuers.filter(issuer =>
          query.filters!.tags!.some(tag => issuer.tags.includes(tag))
        );
      }

      // Apply limit
      if (query.limit) {
        issuers = issuers.slice(0, query.limit);
      }

      return issuers;
    }

    const searchParams = new URLSearchParams();
    if (query.query) searchParams.append('q', query.query);
    if (query.filters?.status) searchParams.append('status', query.filters.status);
    if (query.filters?.tags) query.filters.tags.forEach(tag => searchParams.append('tags', tag));
    if (query.limit) searchParams.append('limit', query.limit.toString());

    const response = await apiClient.get<TrustedIssuer[]>(
      `${API_ENDPOINTS.trust.issuers}?${searchParams.toString()}`
    );
    return handleAPIResponse(response);
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
