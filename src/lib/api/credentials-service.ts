import { apiClient } from './http-client';
import { ApiResponse } from '@/shared/types';

// Credential types
export interface Credential {
  id: string;
  name: string;
  type: string;
  issuer: string;
  holder: string;
  description?: string;
  expirationDate?: string;
  status: 'active' | 'expired' | 'revoked';
  issuedAt: string;
  metadata?: Record<string, any>;
  verifiableCredential?: any; // Full VC data
}

export interface CreateCredentialRequest {
  name: string;
  type: string;
  issuer: string;
  description?: string;
  expirationDate?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCredentialRequest {
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Credentials API endpoints
export const credentialsService = {
  // Get all credentials for current user
  async getCredentials(params?: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ credentials: Credential[]; total: number }> {
    const response = await apiClient.get('/credentials', { params });
    return response.data;
  },

  // Get single credential
  async getCredential(id: string): Promise<Credential> {
    const response = await apiClient.get(`/credentials/${id}`);
    return response.data;
  },

  // Create new credential
  async createCredential(credential: CreateCredentialRequest): Promise<Credential> {
    const response = await apiClient.post('/credentials', credential);
    return response.data;
  },

  // Update credential
  async updateCredential(id: string, updates: UpdateCredentialRequest): Promise<Credential> {
    const response = await apiClient.put(`/credentials/${id}`, updates);
    return response.data;
  },

  // Delete credential
  async deleteCredential(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/credentials/${id}`);
    return response.data;
  },

  // Share credential (generate sharing link/code)
  async shareCredential(id: string, options?: {
    expiresIn?: number; // minutes
    oneTime?: boolean;
  }): Promise<{ shareUrl: string; shareCode: string }> {
    const response = await apiClient.post(`/credentials/${id}/share`, options);
    return response.data;
  },

  // Revoke shared credential
  async revokeSharedCredential(id: string, shareCode: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/credentials/${id}/share/${shareCode}`);
    return response.data;
  },

  // Import credential from external source
  async importCredential(data: {
    format: 'json' | 'jwt' | 'qr';
    content: string;
  }): Promise<Credential> {
    const response = await apiClient.post('/credentials/import', data);
    return response.data;
  },

  // Export credential
  async exportCredential(id: string, format: 'json' | 'jwt' | 'qr' = 'json'): Promise<any> {
    const response = await apiClient.get(`/credentials/${id}/export`, {
      params: { format },
    });
    return response.data;
  },

  // Verify credential
  async verifyCredential(id: string): Promise<{
    isValid: boolean;
    verificationResult: any;
  }> {
    const response = await apiClient.post(`/credentials/${id}/verify`);
    return response.data;
  },

  // Bulk operations
  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/credentials/bulk/delete', { ids });
    return response.data;
  },

  async bulkExport(ids: string[], format: 'json' | 'jwt' = 'json'): Promise<any> {
    const response = await apiClient.post('/credentials/bulk/export', {
      ids,
      format,
    });
    return response.data;
  },

  // Search credentials
  async searchCredentials(query: string, filters?: {
    type?: string;
    issuer?: string;
    status?: string;
  }): Promise<Credential[]> {
    const response = await apiClient.get('/credentials/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  },
};
