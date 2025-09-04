import React from 'react';
import { apiClient, handleAPIResponse } from './api-client';
import { API_ENDPOINTS, API_CONFIG } from './api-config';
import { mockData, simulateNetworkDelay } from './mock-data';

// Credential interfaces
export interface CredentialSubject {
  id: string;
  [key: string]: any;
}

export interface Proof {
  type: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  proofValue?: string;
  jws?: string;
}

export interface VerifiableCredential {
  '@context': string[];
  type: string[];
  id?: string;
  issuer: string | { id: string; [key: string]: any };
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: CredentialSubject;
  proof?: Proof;
  [key: string]: any;
}

export interface CredentialIssuanceRequest {
  issuerDid: string;
  subjectDid: string;
  credentialData: {
    type: string[];
    credentialSubject: any;
    [key: string]: any;
  };
  issuerPrivateKey: string;
  expiresIn?: string;
  issuanceDate?: string;
}

export interface SimpleCredentialIssuanceRequest {
  issuer: string;
  subject: string;
  type: string[];
  credentialSubject: any;
  issuerPrivateKey: string;
  expiresIn?: string;
}

export interface CredentialVerificationRequest {
  credential: string | VerifiableCredential;
  challenge?: string;
  domain?: string;
  verifyRevocation?: boolean;
  verifyIssuer?: boolean;
  verifyExpiration?: boolean;
  trustedIssuers?: string[];
}

export interface VerificationResult {
  verified: boolean;
  valid: boolean;
  checks?: Array<{
    type: string;
    verified: boolean;
    message: string;
    error?: string;
  }>;
  timestamp: string;
  credential?: VerifiableCredential;
  errors?: string[];
}

export interface CredentialRevocationRequest {
  issuerDid: string;
  credentialId: string;
  reason?: string;
}

export interface RevocationStatus {
  revoked: boolean;
  revokedAt?: string;
  reason?: string;
}

export interface CredentialQueryParams {
  subject?: string;
  issuer?: string;
  type?: string[];
  status?: 'valid' | 'expired' | 'revoked';
  limit?: number;
  offset?: number;
  issued_after?: string;
  issued_before?: string;
  expires_after?: string;
  expires_before?: string;
}

export interface CredentialSummary {
  id: string;
  type: string[];
  issuerDid: string;
  subjectDid: string;
  status: 'valid' | 'expired' | 'revoked' | 'pending';
  issuedAt: string;
  expiresAt?: string;
  lastVerified?: string;
  metadata?: {
    name?: string;
    description?: string;
    tags?: string[];
  };
}

export interface CredentialTemplate {
  id: string;
  name: string;
  description: string;
  type: string[];
  requiredFields: string[];
  optionalFields?: string[];
  issuer: string;
  schema?: any;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
}

export interface CredentialRequest {
  id: string;
  requesterDid: string;
  issuerDid: string;
  credentialType: string[];
  claims: any;
  status: 'pending' | 'approved' | 'rejected' | 'issued';
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  issuedCredentialId?: string;
}

// Credentials API Client
export class CredentialsAPI {
  // Issue a new credential
  async issueCredential(request: CredentialIssuanceRequest): Promise<VerifiableCredential> {
    // Use mock data in development to avoid external API calls
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      const mockCredentials = await mockData.getCredentials();
      return mockCredentials[0] as any; // Cast to VerifiableCredential for now
    }

    const response = await apiClient.post<VerifiableCredential>(
      API_ENDPOINTS.credentials.issue,
      request
    );
    return handleAPIResponse(response);
  }

  // Simple credential issuance for basic use cases
  async issueSimpleCredential(request: SimpleCredentialIssuanceRequest): Promise<VerifiableCredential> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      const mockCredentials = await mockData.getCredentials();
      return {
        ...mockCredentials[0],
        issuer: request.issuer,
        credentialSubject: {
          ...mockCredentials[0].credentialSubject,
          ...request.credentialSubject
        }
      } as any;
    }

    // Convert simple request to full request
    const fullRequest: CredentialIssuanceRequest = {
      issuer: request.issuer,
      subject: request.subject,
      credentialSubject: request.credentialSubject,
      type: request.type || ['VerifiableCredential'],
      format: 'jwt_vc',
      issuanceDate: new Date().toISOString()
    };

    return this.issueCredential(fullRequest);
  }

  // Verify a credential
  async verifyCredential(credential: VerifiableCredential | string): Promise<VerificationResult>;
  async verifyCredential(request: CredentialVerificationRequest): Promise<VerificationResult>;
  async verifyCredential(credentialOrRequest: VerifiableCredential | string | CredentialVerificationRequest): Promise<VerificationResult> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();

      if (typeof credentialOrRequest === 'string') {
        // If it's a string, treat it as a credential ID
        return {
          verified: true,
          valid: true,
          checks: [{
            type: 'signature',
            verified: true,
            message: 'Signature verification passed'
          }],
          timestamp: new Date().toISOString(),
          errors: []
        };
      } else if (typeof credentialOrRequest === 'object' && 'credential' in credentialOrRequest) {
        // If it's a CredentialVerificationRequest
        return {
          verified: true,
          valid: true,
          checks: [{
            type: 'signature',
            verified: true,
            message: 'Signature verification passed'
          }, {
            type: 'revocation',
            verified: !credentialOrRequest.verifyRevocation,
            message: 'Revocation check passed'
          }],
          timestamp: new Date().toISOString(),
          errors: []
        };
      } else {
        // If it's a full credential object
        return {
          verified: true,
          issuer: credentialOrRequest.issuer,
          subject: credentialOrRequest.subject || 'unknown',
          issuanceDate: credentialOrRequest.issuanceDate,
          errors: []
        };
      }
    }

    const response = await apiClient.post<VerificationResult>(
      API_ENDPOINTS.credentials.verify,
      typeof credentialOrRequest === 'object' && 'credential' in credentialOrRequest
        ? credentialOrRequest
        : { credential: credentialOrRequest }
    );
    return handleAPIResponse(response);
  }

  // Revoke a credential
  async revokeCredential(credentialId: string, request: CredentialRevocationRequest): Promise<{ success: boolean; revocationId: string }> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        success: true,
        revocationId: `revocation-${Date.now()}`
      };
    }

    const response = await apiClient.post<{ success: boolean; revocationId: string }>(
      `${API_ENDPOINTS.credentials.revoke}/${credentialId}/revoke`,
      request
    );
    return handleAPIResponse(response);
  }

  // All other methods with mock data support
  async batchRevokeCredentials(requests: Array<{ credentialId: string; request: CredentialRevocationRequest }>): Promise<Array<{ credentialId: string; success: boolean; revocationId?: string; error?: string }>> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return requests.map(req => ({
        credentialId: req.credentialId,
        success: true,
        revocationId: `revocation-${Date.now()}-${req.credentialId}`
      }));
    }
    // Real implementation would make batch API call
    return Promise.all(requests.map(async ({ credentialId, request }) => {
      try {
        const result = await this.revokeCredential(credentialId, request);
        return { credentialId, success: result.success, revocationId: result.revocationId };
      } catch (error) {
        return { credentialId, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }));
  }

  async getRevocationStatus(credentialId: string): Promise<RevocationStatus> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        revoked: false,
        revocationDate: undefined,
        revocationReason: undefined
      };
    }
    const response = await apiClient.get<RevocationStatus>(`${API_ENDPOINTS.credentials.revocationStatus}/${credentialId}/revocation-status`);
    return handleAPIResponse(response);
  }

  async getCredentialsBySubject(subjectDid: string, params?: CredentialQueryParams): Promise<CredentialSummary[]> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      const mockCredentials = await mockData.getCredentials();
      return mockCredentials.map(cred => ({
        id: cred.id,
        type: cred.type,
        issuer: cred.issuer,
        subject: cred.subject,
        issuanceDate: cred.issuanceDate,
        status: cred.status || 'valid'
      }));
    }
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await apiClient.get<CredentialSummary[]>(`${API_ENDPOINTS.credentials.bySubject}/${encodeURIComponent(subjectDid)}${queryString}`);
    return handleAPIResponse(response);
  }

  async getCredentialsByIssuer(issuerDid: string, params?: CredentialQueryParams): Promise<CredentialSummary[]> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      const mockCredentials = await mockData.getCredentials();
      return mockCredentials
        .filter(cred => cred.issuer === issuerDid)
        .map(cred => ({
          id: cred.id,
          type: cred.type,
          issuer: cred.issuer,
          subject: cred.subject,
          issuanceDate: cred.issuanceDate,
          status: cred.status || 'valid'
        }));
    }
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await apiClient.get<CredentialSummary[]>(`${API_ENDPOINTS.credentials.byIssuer}/${encodeURIComponent(issuerDid)}${queryString}`);
    return handleAPIResponse(response);
  }

  async queryCredentials(params: CredentialQueryParams): Promise<CredentialSummary[]> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      const mockCredentials = await mockData.getCredentials();
      return mockCredentials.map(cred => ({
        id: cred.id,
        type: cred.type,
        issuer: cred.issuer,
        subject: cred.subject,
        issuanceDate: cred.issuanceDate,
        status: cred.status || 'valid'
      }));
    }
    const queryString = '?' + new URLSearchParams(params as any).toString();
    const response = await apiClient.get<CredentialSummary[]>(`${API_ENDPOINTS.credentials.query}${queryString}`);
    return handleAPIResponse(response);
  }

  // Continue with other methods, all following the same pattern...
  async getCredential(credentialId: string): Promise<VerifiableCredential> {
    return this.getCredentialById(credentialId);
  }

  async getCredentialById(credentialId: string): Promise<VerifiableCredential> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      const mockCredentials = await mockData.getCredentials();
      return mockCredentials.find(cred => cred.id === credentialId) || mockCredentials[0] as any;
    }
    const response = await apiClient.get<VerifiableCredential>(`${API_ENDPOINTS.credentials.query}/${credentialId}`);
    return handleAPIResponse(response);
  }

  async updateCredential(credentialId: string, updates: Partial<VerifiableCredential>): Promise<VerifiableCredential> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      const mockCredentials = await mockData.getCredentials();
      return { ...mockCredentials[0], ...updates } as any;
    }
    const response = await apiClient.put<VerifiableCredential>(`${API_ENDPOINTS.credentials.query}/${credentialId}`, updates);
    return handleAPIResponse(response);
  }

  async deleteCredential(credentialId: string): Promise<{ success: boolean }> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return { success: true };
    }
    const response = await apiClient.delete<{ success: boolean }>(`${API_ENDPOINTS.credentials.query}/${credentialId}`);
    return handleAPIResponse(response);
  }

  async verifyCredentialById(credentialId: string): Promise<VerificationResult> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        verified: true,
        issuer: 'did:web:mock-issuer.com',
        subject: 'did:web:mock-subject.com',
        issuanceDate: new Date().toISOString(),
        errors: []
      };
    }
    const response = await apiClient.get<VerificationResult>(`${API_ENDPOINTS.credentials.query}/${credentialId}/verify`);
    return handleAPIResponse(response);
  }

  async getCredentialTemplates(params?: { type?: string; issuer?: string }): Promise<CredentialTemplate[]> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return [
        {
          id: 'template-1',
          name: 'Education Credential',
          type: 'EducationCredential',
          description: 'Template for educational achievements',
          schema: { type: 'object', properties: {} },
          issuer: 'did:web:university.edu'
        }
      ];
    }
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get<CredentialTemplate[]>(`${API_ENDPOINTS.credentials.templates}${queryString}`);
    return handleAPIResponse(response);
  }

  async createCredentialTemplate(template: Omit<CredentialTemplate, 'id'>): Promise<CredentialTemplate> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        id: `template-${Date.now()}`,
        ...template
      };
    }
    const response = await apiClient.post<CredentialTemplate>(API_ENDPOINTS.credentials.templates, template);
    return handleAPIResponse(response);
  }

  // Continue with remaining methods following same pattern
  async requestCredential(request: CredentialRequest): Promise<{ success: boolean; requestId: string }> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        success: true,
        requestId: `request-${Date.now()}`
      };
    }
    const response = await apiClient.post<{ success: boolean; requestId: string }>(API_ENDPOINTS.credentials.request, request);
    return handleAPIResponse(response);
  }

  async batchVerifyCredentials(credentials: VerifiableCredential[]): Promise<VerificationResult[]> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return credentials.map(cred => ({
        verified: true,
        issuer: cred.issuer,
        subject: cred.subject || 'unknown',
        issuanceDate: cred.issuanceDate,
        errors: []
      }));
    }
    const response = await apiClient.post<VerificationResult[]>(API_ENDPOINTS.credentials.batchVerify, { credentials });
    return handleAPIResponse(response);
  }

  async createPresentation(credentials: VerifiableCredential[], holderDid: string, challenge?: string, domain?: string): Promise<any> {
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay();
      return {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        verifiableCredential: credentials,
        holder: holderDid,
        proof: {
          type: 'Ed25519Signature2020',
          created: new Date().toISOString(),
          verificationMethod: `${holderDid}#key-1`,
          proofPurpose: 'authentication',
          challenge: challenge || 'default-challenge',
          domain: domain || 'example.com'
        }
      };
    }
    const response = await apiClient.post<any>(API_ENDPOINTS.credentials.presentations, {
      credentials,
      holderDid,
      challenge,
      domain
    });
    return handleAPIResponse(response);
  }
}

// Create singleton instance
export const credentialsAPI = new CredentialsAPI();
