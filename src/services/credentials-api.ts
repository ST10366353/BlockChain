import { apiClient, handleAPIResponse, createQueryParams, type APIResponse } from './api-client';
import { API_ENDPOINTS } from './api-config';

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
  // Issue a new verifiable credential
  async issueCredential(request: CredentialIssuanceRequest): Promise<APIResponse<{ jwt: string; credentialId: string; credential: VerifiableCredential }>> {
    return apiClient.post(`${API_ENDPOINTS.credentials.revoke}/${credentialId}/revoke`, request);
  }

  // Issue credential with simplified format
  async issueCredentialSimple(request: SimpleCredentialIssuanceRequest): Promise<APIResponse<{ jwt: string; credentialId: string; credential: VerifiableCredential }>> {
    return apiClient.post(`${API_ENDPOINTS.credentials.revoke}/${credentialId}/revoke`, request);
  }

  // Verify a verifiable credential
  async verifyCredential(credential: string | VerifiableCredential): Promise<APIResponse<VerificationResult>> {
    const request = { credential };
    return apiClient.post(`${API_ENDPOINTS.credentials.revoke}/${credentialId}/revoke`, request);
  }

  // Revoke a credential
  async revokeCredential(credentialId: string, request: CredentialRevocationRequest): Promise<APIResponse<{ success: boolean; credentialId: string }>> {
    return apiClient.post(`${API_ENDPOINTS.credentials.revoke}/${credentialId}/revoke`, request);
  }

  // Check revocation status
  async getRevocationStatus(credentialId: string): Promise<APIResponse<RevocationStatus>> {
    return apiClient.get(`${API_ENDPOINTS.credentials.revocationStatus}/${credentialId}/revocation-status`);
  }

  // Get credentials by subject
  async getCredentialsBySubject(subjectDid: string, params?: { limit?: number; offset?: number }): Promise<APIResponse<CredentialSummary[]>> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiClient.get(`${API_ENDPOINTS.credentials.bySubject}/${encodeURIComponent(subjectDid)}${queryString}`);
  }

  // Get credentials by issuer
  async getCredentialsByIssuer(issuerDid: string, params?: { limit?: number; offset?: number }): Promise<APIResponse<CredentialSummary[]>> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiClient.get(`${API_ENDPOINTS.credentials.byIssuer}/${encodeURIComponent(issuerDid)}${queryString}`);
  }

  // Query credentials
  async queryCredentials(params: CredentialQueryParams): Promise<APIResponse<CredentialSummary[]>> {
    const queryString = createQueryParams(params);
    return apiClient.get(`${API_ENDPOINTS.credentials.query}?${queryString}`);
  }

  // Get credential by ID
  async getCredential(credentialId: string): Promise<APIResponse<{ id: string; jwt: string; issuerDid: string; subjectDid: string; status: string; issuedAt: string; expiresAt?: string; type: string[] }>> {
    return apiClient.get(`${API_ENDPOINTS.credentials.query}/${credentialId}`);
  }

  // Update credential metadata
  async updateCredential(credentialId: string, updates: { status?: string; metadata?: any }): Promise<APIResponse<{ success: boolean; credentialId: string; updatedAt: string }>> {
    return apiClient.put(`${API_ENDPOINTS.credentials.query}/${credentialId}`, updates);
  }

  // Delete credential
  async deleteCredential(credentialId: string): Promise<APIResponse<{ success: boolean; credentialId: string }>> {
    return apiClient.delete(`${API_ENDPOINTS.credentials.query}/${credentialId}`);
  }

  // Get verification status for specific credential
  async getVerificationStatus(credentialId: string): Promise<APIResponse<{ credentialId: string; verified: boolean; lastVerified: string; verificationCount: number; verifiers: string[] }>> {
    return apiClient.get(`${API_ENDPOINTS.credentials.query}/${credentialId}/verify`);
  }

  // Get available credential templates
  async getCredentialTemplates(params?: { category?: string; type?: string }): Promise<APIResponse<{ templates: CredentialTemplate[] }>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`${API_ENDPOINTS.credentials.templates}${queryString}`);
  }

  // Create credential template
  async createCredentialTemplate(template: Omit<CredentialTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<{ templateId: string; name: string; createdAt: string }>> {
    return apiClient.post(API_ENDPOINTS.credentials.templates, template);
  }

  // Request a credential from an issuer
  async requestCredential(request: { issuerDid: string; credentialType: string[]; claims: any; proof?: Proof }): Promise<APIResponse<{ requestId: string; status: string; issuerDid: string; estimatedProcessingTime?: string }>> {
    return apiClient.post(`${API_ENDPOINTS.credentials.revoke}/${credentialId}/revoke`, request);
  }

  // Batch verify multiple credentials
  async batchVerifyCredentials(request: { credentials: string[]; options?: { skipIssuerCheck?: boolean; timeout?: number } }): Promise<APIResponse<{ results: Array<{ index: number; verified: boolean; valid: boolean; credentialId?: string; error?: string }>; summary: { total: number; verified: number; failed: number } }>> {
    return apiClient.post(`${API_ENDPOINTS.credentials.revoke}/${credentialId}/revoke`, request);
  }

  // Batch revoke multiple credentials
  async batchRevokeCredentials(request: { credentials: Array<{ id: string; reason?: string }>; issuerDid: string }): Promise<APIResponse<{ success: boolean; revoked: string[]; failed: string[]; timestamp: string }>> {
    return apiClient.post(`${API_ENDPOINTS.credentials.revoke}/${credentialId}/revoke`, request);
  }
}

// Create singleton instance
export const credentialsAPI = new CredentialsAPI();












