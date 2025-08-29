import { apiClient, handleAPIResponse, createQueryParams, type APIResponse } from './api-client';
import { API_ENDPOINTS } from './api-config';

// Verifiable Credential interfaces
export interface VerifiableCredential {
  '@context': string[];
  type: string[];
  issuer: string | Issuer;
  credentialSubject: CredentialSubject | CredentialSubject[];
  issuanceDate: string;
  expirationDate?: string;
  proof?: Proof;
  id?: string;
}

export interface Issuer {
  id: string;
  name?: string;
  description?: string;
}

export interface CredentialSubject {
  id?: string;
  [key: string]: any;
}

export interface Proof {
  type: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  proofValue: string;
  jws?: string;
}

// Credential issuance request
export interface CredentialIssuanceRequest {
  issuerDid: string;
  subjectDid: string;
  credentialData: {
    type: string | string[];
    credentialSubject: CredentialSubject;
    [key: string]: any;
  };
  issuerPrivateKey: string;
  expiresIn?: string; // Duration like "1y", "30d", etc.
}

// Simplified issuance request
export interface SimpleCredentialIssuanceRequest {
  issuer: string;
  subject: string;
  type: string[];
  credentialSubject: CredentialSubject;
  issuerPrivateKey: string;
  expiresIn?: string;
}

// Credential verification request
export interface CredentialVerificationRequest {
  credential: VerifiableCredential | string; // Can be VC object or JWT string
}

// Verification result
export interface VerificationResult {
  verified: boolean;
  valid: boolean;
  credential?: VerifiableCredential;
  errors?: string[];
}

// Presentation verification request
export interface PresentationVerificationRequest {
  presentation: string; // JWT string
  challenge?: string;
  domain?: string;
}

// Presentation verification result
export interface PresentationVerificationResult {
  valid: boolean;
  presentation?: any;
  errors?: string[];
}

// Credential revocation request
export interface CredentialRevocationRequest {
  issuerDid: string;
  reason?: string;
}

// Revocation status
export interface RevocationStatus {
  revoked: boolean;
  revokedAt?: string;
  reason?: string;
}

// Credential query parameters
export interface CredentialQueryParams {
  subject?: string;
  issuer?: string;
  type?: string;
  status?: 'valid' | 'expired' | 'revoked';
  limit?: number;
  offset?: number;
}

// Credential summary (for listings)
export interface CredentialSummary {
  id: string;
  issuerDid: string;
  subjectDid: string;
  status: 'valid' | 'expired' | 'revoked' | 'pending';
  type: string[];
  issuedAt: string;
  expiresAt?: string;
  credentialSubject?: Partial<CredentialSubject>;
}

// Credentials API Client
export class CredentialsAPI {
  // Issue a new verifiable credential
  async issueCredential(request: CredentialIssuanceRequest): Promise<{
    jwt: string;
    credentialId: string;
    credential: VerifiableCredential;
  }> {
    const response = await apiClient.post<{
      jwt: string;
      credentialId: string;
      credential: VerifiableCredential;
    }>(
      API_ENDPOINTS.credentials.issue,
      request
    );
    return handleAPIResponse(response);
  }

  // Issue credential with simplified format
  async issueCredentialSimple(request: SimpleCredentialIssuanceRequest): Promise<{
    jwt: string;
    credentialId: string;
    credential: VerifiableCredential;
  }> {
    const response = await apiClient.post<{
      jwt: string;
      credentialId: string;
      credential: VerifiableCredential;
    }>(
      API_ENDPOINTS.credentials.issue,
      request
    );
    return handleAPIResponse(response);
  }

  // Verify a verifiable credential
  async verifyCredential(request: CredentialVerificationRequest): Promise<VerificationResult> {
    const response = await apiClient.post<VerificationResult>(
      API_ENDPOINTS.credentials.verify,
      request
    );
    return handleAPIResponse(response);
  }

  // Verify a verifiable presentation
  async verifyPresentation(request: PresentationVerificationRequest): Promise<PresentationVerificationResult> {
    const response = await apiClient.post<PresentationVerificationResult>(
      API_ENDPOINTS.credentials.presentations,
      request
    );
    return handleAPIResponse(response);
  }

  // Revoke a credential
  async revokeCredential(credentialId: string, request: CredentialRevocationRequest): Promise<{ success: boolean; credentialId: string }> {
    const response = await apiClient.post<{ success: boolean; credentialId: string }>(
      `${API_ENDPOINTS.credentials.revoke}/${credentialId}/revoke`,
      request
    );
    return handleAPIResponse(response);
  }

  // Check credential revocation status
  async getRevocationStatus(credentialId: string): Promise<RevocationStatus> {
    const response = await apiClient.get<RevocationStatus>(
      `${API_ENDPOINTS.credentials.revocationStatus}/${credentialId}/revocation-status`
    );
    return handleAPIResponse(response);
  }

  // Get all credentials for a subject DID
  async getCredentialsBySubject(subjectDid: string): Promise<CredentialSummary[]> {
    const response = await apiClient.get<CredentialSummary[]>(
      `${API_ENDPOINTS.credentials.bySubject}/${encodeURIComponent(subjectDid)}`
    );
    return handleAPIResponse(response);
  }

  // Get all credentials issued by an issuer DID
  async getCredentialsByIssuer(issuerDid: string): Promise<CredentialSummary[]> {
    const response = await apiClient.get<CredentialSummary[]>(
      `${API_ENDPOINTS.credentials.byIssuer}/${encodeURIComponent(issuerDid)}`
    );
    return handleAPIResponse(response);
  }

  // Query credentials with filters
  async queryCredentials(params: CredentialQueryParams = {}): Promise<CredentialSummary[]> {
    const queryParams = createQueryParams(params as Record<string, string | number | boolean | undefined>);
    const response = await apiClient.get<CredentialSummary[]>(
      API_ENDPOINTS.credentials.query,
      queryParams
    );
    return handleAPIResponse(response);
  }

  // Batch verify multiple credentials
  async batchVerifyCredentials(credentials: (VerifiableCredential | string)[]): Promise<VerificationResult[]> {
    const promises = credentials.map(async (credential) => {
      try {
        const result = await this.verifyCredential({ credential });
        return result;
      } catch (error) {
        return {
          verified: false,
          valid: false,
          errors: [error instanceof Error ? error.message : 'Verification failed']
        };
      }
    });

    return Promise.all(promises);
  }

  // Batch revoke multiple credentials
  async batchRevokeCredentials(
    credentialIds: string[],
    reason: string = "Bulk revocation",
    issuerDid: string
  ): Promise<{ success: boolean; credentialId: string; error?: string }[]> {
    const promises = credentialIds.map(async (credentialId) => {
      try {
        await this.revokeCredential(credentialId, {
          issuerDid,
          reason
        });
        return { success: true, credentialId };
      } catch (error) {
        return {
          success: false,
          credentialId,
          error: error instanceof Error ? error.message : 'Revocation failed'
        };
      }
    });

    return Promise.all(promises);
  }

  // Batch get revocation status for multiple credentials
  async batchGetRevocationStatus(credentialIds: string[]): Promise<Record<string, RevocationStatus>> {
    const promises = credentialIds.map(async (credentialId) => {
      try {
        const status = await this.getRevocationStatus(credentialId);
        return { credentialId, status };
      } catch (error) {
        return {
          credentialId,
          status: {
            revoked: false,
            revokedAt: undefined,
            reason: undefined,
            error: error instanceof Error ? error.message : 'Status check failed'
          } as RevocationStatus
        };
      }
    });

    const results = await Promise.all(promises);
    return results.reduce((acc, { credentialId, status }) => {
      acc[credentialId] = status;
      return acc;
    }, {} as Record<string, RevocationStatus>);
  }

  // Bulk export credentials
  async bulkExportCredentials(
    credentialIds: string[],
    format: 'json' | 'csv' = 'json',
    includePrivateData: boolean = false
  ): Promise<string> {
    // Get all credential data
    const credentials = await Promise.all(
      credentialIds.map(async (id) => {
        try {
          // In a real implementation, you might have a bulk endpoint
          // For now, we'll simulate getting the data
          return {
            id,
            type: ['VerifiableCredential'],
            issuerDid: 'did:web:example.com',
            subjectDid: 'did:web:subject.com',
            status: 'valid',
            issuedAt: new Date().toISOString(),
            fields: includePrivateData ? { private: 'data' } : {}
          };
        } catch (error) {
          return { id, error: 'Failed to retrieve credential' };
        }
      })
    );

    if (format === 'csv') {
      // Convert to CSV format
      const headers = ['ID', 'Type', 'Issuer', 'Subject', 'Status', 'Issued At'];
      const rows = credentials.map(cred =>
        [
          cred.id,
          Array.isArray(cred.type) ? cred.type.join(';') : cred.type || '',
          cred.issuerDid || '',
          cred.subjectDid || '',
          cred.status || '',
          cred.issuedAt || ''
        ]
      );

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // JSON format
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalCredentials: credentials.length,
      credentials
    }, null, 2);
  }

  // Bulk import credentials
  async bulkImportCredentials(
    credentialsData: any[],
    validateCredentials: boolean = true
  ): Promise<{ success: boolean; imported: number; failed: number; errors: string[] }> {
    const results = {
      success: false,
      imported: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const credentialData of credentialsData) {
      try {
        // Validate credential format if requested
        if (validateCredentials && !this.validateCredentialFormat(credentialData)) {
          throw new Error('Invalid credential format');
        }

        // In a real implementation, you would store the credential
        // For now, we'll just simulate success
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Failed to import credential ${credentialData.id || 'unknown'}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    results.success = results.failed === 0;
    return results;
  }



  // Create a verifiable presentation from credentials
  createPresentation(credentials: (VerifiableCredential | string)[], holderDid: string, challenge?: string): any {
    // This would typically be done on the client side or through a separate endpoint
    // For now, return a basic presentation structure
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
        challenge: challenge || 'random-challenge'
      }
    };
  }

  // Validate credential format
  validateCredentialFormat(credential: any): boolean {
    return (
      credential &&
      typeof credential === 'object' &&
      credential['@context'] &&
      Array.isArray(credential.type) &&
      credential.issuer &&
      credential.credentialSubject
    );
  }

  // Check if credential is expired
  isCredentialExpired(credential: VerifiableCredential): boolean {
    if (!credential.expirationDate) {
      return false;
    }

    const expirationDate = new Date(credential.expirationDate);
    const now = new Date();
    return expirationDate < now;
  }

  // Get credential status based on expiration and revocation
  async getCredentialStatus(credentialId: string): Promise<'valid' | 'expired' | 'revoked' | 'unknown'> {
    try {
      const revocationStatus = await this.getRevocationStatus(credentialId);

      if (revocationStatus.revoked) {
        return 'revoked';
      }

      // Note: We'd need to fetch the full credential to check expiration
      // For now, return 'valid' if not revoked
      return 'valid';
    } catch (error) {
      return 'unknown';
    }
  }
}

// Create singleton instance
export const credentialsAPI = new CredentialsAPI();
