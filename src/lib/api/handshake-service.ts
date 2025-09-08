import { apiClient } from './http-client';
import { ApiResponse } from '@/shared/types';

// Handshake/Verification request types
export interface HandshakeRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterDID: string;
  credentialId: string;
  credentialName: string;
  requestType: 'share' | 'verify' | 'transfer';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  message?: string;
  requestedFields?: string[];
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHandshakeRequest {
  credentialId: string;
  requestType: 'share' | 'verify' | 'transfer';
  message?: string;
  requestedFields?: string[];
  expiresIn?: number; // minutes
}

// Handshake API endpoints
export const handshakeService = {
  // Get handshake requests (sent and received)
  async getRequests(params?: {
    type?: 'sent' | 'received';
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ requests: HandshakeRequest[]; total: number }> {
    const response = await apiClient.get('/handshake/requests', { params });
    return response.data;
  },

  // Get single request
  async getRequest(id: string): Promise<HandshakeRequest> {
    const response = await apiClient.get(`/handshake/requests/${id}`);
    return response.data;
  },

  // Create handshake request
  async createRequest(request: CreateHandshakeRequest): Promise<HandshakeRequest> {
    const response = await apiClient.post('/handshake/requests', request);
    return response.data;
  },

  // Respond to handshake request
  async respondToRequest(
    id: string,
    action: 'approve' | 'reject',
    requestResponse?: {
      message?: string;
      approvedFields?: string[];
    }
  ): Promise<HandshakeRequest> {
    const response = await apiClient.post(`/handshake/requests/${id}/respond`, {
      action,
      ...requestResponse,
    });
    return response.data;
  },

  // Cancel handshake request
  async cancelRequest(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/handshake/requests/${id}`);
    return response.data;
  },

  // Share credential directly (without request)
  async shareCredential(credentialId: string, options: {
    recipientDID: string;
    message?: string;
    expiresIn?: number;
  }): Promise<{ shareId: string; shareUrl: string }> {
    const response = await apiClient.post(`/handshake/share`, {
      credentialId,
      ...options,
    });
    return response.data;
  },

  // Accept shared credential
  async acceptSharedCredential(shareId: string): Promise<{ credential: any }> {
    const response = await apiClient.post(`/handshake/share/${shareId}/accept`);
    return response.data;
  },

  // Reject shared credential
  async rejectSharedCredential(shareId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`/handshake/share/${shareId}/reject`);
    return response.data;
  },

  // Generate QR code for sharing
  async generateShareQR(credentialId: string, options?: {
    expiresIn?: number;
    oneTime?: boolean;
  }): Promise<{ qrCode: string; shareUrl: string }> {
    const response = await apiClient.post(`/handshake/qr/generate`, {
      credentialId,
      ...options,
    });
    return response.data;
  },

  // Verify QR code
  async verifyQRCode(qrData: string): Promise<{
    isValid: boolean;
    type: 'share' | 'request' | 'verification';
    data: any;
  }> {
    const response = await apiClient.post('/handshake/qr/verify', { qrData });
    return response.data;
  },

  // Bulk operations
  async bulkRespondToRequests(
    requestIds: string[],
    action: 'approve' | 'reject',
    bulkResponse?: { message?: string }
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/handshake/bulk/respond', {
      requestIds,
      action,
      ...bulkResponse,
    });
    return response.data;
  },

  // Get sharing history
  async getSharingHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ history: any[]; total: number }> {
    const response = await apiClient.get('/handshake/history', { params });
    return response.data;
  },

  // Analytics
  async getHandshakeStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    successRate: number;
  }> {
    const response = await apiClient.get('/handshake/stats');
    return response.data;
  },
};
