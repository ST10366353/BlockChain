import React from 'react';
import {
  HandshakeRequest,
  HandshakeResponse,
  HandshakeParticipant,
  APIResponse
} from '../../shared/types';
import { handshakeProtocol } from '../protocol/handshake-protocol';
import { apiClient, profileAPI } from '../../services';

export interface HandshakeServiceConfig {
  enableRealTimeUpdates: boolean;
  enablePushNotifications: boolean;
  enableAuditLogging: boolean;
  maxConcurrentRequests: number;
}

export class HandshakeService {
  private config: HandshakeServiceConfig;

  constructor(config: Partial<HandshakeServiceConfig> = {}) {
    this.config = {
      enableRealTimeUpdates: true,
      enablePushNotifications: true,
      enableAuditLogging: true,
      maxConcurrentRequests: 5,
      ...config
    };
  }

  /**
   * Creates a new handshake request
   */
  async createHandshakeRequest(params: {
    responderDID: string;
    requestedFields: string[];
    purpose: string;
    expiryHours?: number;
    metadata?: Record<string, any>;
  }): Promise<HandshakeRequest> {
    try {
      // Get requester profile
      const requesterProfile = await profileAPI.getProfile();
      if (!requesterProfile) {
        throw new Error('User profile not found');
      }

      const requester: HandshakeParticipant = {
        did: requesterProfile.did,
        name: requesterProfile.name,
        type: requesterProfile.type,
        publicKey: 'mock-public-key', // This would come from DID document
        endpoint: undefined
      };

      // Initiate handshake through protocol
      const request = await handshakeProtocol.initiateHandshake({
        requester,
        responderDID: params.responderDID,
        requestedFields: params.requestedFields,
        purpose: params.purpose,
        expiryHours: params.expiryHours,
        metadata: params.metadata
      });

      // Store request in backend
      await this.persistHandshakeRequest(request);

      // Send push notification if enabled
      if (this.config.enablePushNotifications) {
        await this.sendHandshakeNotification(request, 'created');
      }

      return request;
    } catch (error) {
      console.error('Failed to create handshake request:', error);
      throw new Error(`Failed to create handshake request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Responds to a handshake request
   */
  async respondToHandshakeRequest(params: {
    requestId: string;
    approvedFields: string[];
    rejectedFields: string[];
    useZeroKnowledgeProofs?: boolean;
    useSelectiveDisclosure?: boolean;
  }): Promise<HandshakeResponse> {
    try {
      // Get responder profile
      const responderProfile = await profileAPI.getProfile();
      if (!responderProfile) {
        throw new Error('User profile not found');
      }

      const responder: HandshakeParticipant = {
        did: responderProfile.did,
        name: responderProfile.name,
        type: responderProfile.type,
        publicKey: 'mock-public-key', // This would come from DID document
        endpoint: undefined
      };

      // Respond through protocol
      const response = await handshakeProtocol.respondToHandshake({
        sessionId: params.requestId,
        responder,
        approvedFields: params.approvedFields,
        rejectedFields: params.rejectedFields,
        useZeroKnowledgeProofs: params.useZeroKnowledgeProofs,
        useSelectiveDisclosure: params.useSelectiveDisclosure
      });

      // Store response in backend
      await this.persistHandshakeResponse(response);

      // Send notification if enabled
      if (this.config.enablePushNotifications) {
        await this.sendHandshakeNotification(response.requestId, 'responded');
      }

      return response;
    } catch (error) {
      console.error('Failed to respond to handshake request:', error);
      throw new Error(`Failed to respond to handshake request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancels a handshake request
   */
  async cancelHandshakeRequest(requestId: string, reason?: string): Promise<void> {
    try {
      await handshakeProtocol.cancelHandshake(requestId, reason);

      // Update backend
      await this.updateHandshakeStatus(requestId, 'cancelled', { reason });

      // Send notification
      if (this.config.enablePushNotifications) {
        await this.sendHandshakeNotification(requestId, 'cancelled');
      }
    } catch (error) {
      console.error('Failed to cancel handshake request:', error);
      throw new Error(`Failed to cancel handshake request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets pending handshake requests for the current user
   */
  async getPendingRequests(userDID?: string): Promise<HandshakeRequest[]> {
    try {
      const did = userDID || (await this.getCurrentUserDID());

      // Get from backend
      const response = await apiClient.get<APIResponse<HandshakeRequest[]>>(
        `/handshake/requests/pending?did=${encodeURIComponent(did)}`
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get pending requests:', error);
      // Fallback to protocol layer
      const sessions = handshakeProtocol.getParticipantSessions(userDID || '');
      return sessions
        .filter(session => session.status === 'pending' && session.responder.did === userDID)
        .map(session => session.request);
    }
  }

  /**
   * Gets handshake history for the current user
   */
  async getHandshakeHistory(params: {
    limit?: number;
    offset?: number;
    status?: string;
  } = {}): Promise<{ requests: HandshakeRequest[]; responses: HandshakeResponse[] }> {
    try {
      const userDID = await this.getCurrentUserDID();
      const queryParams = new URLSearchParams({
        did: userDID,
        limit: (params.limit || 20).toString(),
        offset: (params.offset || 0).toString(),
        ...(params.status && { status: params.status })
      });

      const response = await apiClient.get<APIResponse<{
        requests: HandshakeRequest[];
        responses: HandshakeResponse[];
      }>>(`/handshake/history?${queryParams}`);

      return response.data.data || { requests: [], responses: [] };
    } catch (error) {
      console.error('Failed to get handshake history:', error);
      return { requests: [], responses: [] };
    }
  }

  /**
   * Gets a specific handshake session
   */
  async getHandshakeSession(sessionId: string): Promise<any> {
    try {
      const response = await apiClient.get<APIResponse<any>>(
        `/handshake/session/${sessionId}`
      );

      return response.data.data;
    } catch (error) {
      console.error('Failed to get handshake session:', error);
      // Fallback to protocol layer
      return handshakeProtocol.getHandshakeSession(sessionId);
    }
  }

  /**
   * Searches for handshake requests/responses
   */
  async searchHandshakes(params: {
    query?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ requests: HandshakeRequest[]; responses: HandshakeResponse[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params.query) queryParams.set('query', params.query);
      if (params.status) queryParams.set('status', params.status);
      if (params.dateFrom) queryParams.set('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.set('dateTo', params.dateTo);
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.offset) queryParams.set('offset', params.offset.toString());

      const response = await apiClient.get<APIResponse<{
        requests: HandshakeRequest[];
        responses: HandshakeResponse[];
        total: number;
      }>>(`/handshake/search?${queryParams}`);

      return response.data.data || { requests: [], responses: [], total: 0 };
    } catch (error) {
      console.error('Failed to search handshakes:', error);
      return { requests: [], responses: [], total: 0 };
    }
  }

  /**
   * Gets handshake statistics
   */
  async getHandshakeStats(): Promise<{
    totalRequests: number;
    totalResponses: number;
    pendingRequests: number;
    successRate: number;
    averageResponseTime: number;
  }> {
    try {
      const response = await apiClient.get<APIResponse<{
        totalRequests: number;
        totalResponses: number;
        pendingRequests: number;
        successRate: number;
        averageResponseTime: number;
      }>>('/handshake/stats');

      return response.data.data || {
        totalRequests: 0,
        totalResponses: 0,
        pendingRequests: 0,
        successRate: 0,
        averageResponseTime: 0
      };
    } catch (error) {
      console.error('Failed to get handshake stats:', error);
      return {
        totalRequests: 0,
        totalResponses: 0,
        pendingRequests: 0,
        successRate: 0,
        averageResponseTime: 0
      };
    }
  }

  // Private helper methods

  private async getCurrentUserDID(): Promise<string> {
    const profile = await profileAPI.getProfile();
    if (!profile) {
      throw new Error('User profile not found');
    }
    return profile.did;
  }

  private async persistHandshakeRequest(request: HandshakeRequest): Promise<void> {
    try {
      await apiClient.post('/handshake/requests', request);
    } catch (error) {
      console.warn('Failed to persist handshake request to backend:', error);
      // Continue without persisting - protocol layer handles it
    }
  }

  private async persistHandshakeResponse(response: HandshakeResponse): Promise<void> {
    try {
      await apiClient.post('/handshake/responses', response);
    } catch (error) {
      console.warn('Failed to persist handshake response to backend:', error);
      // Continue without persisting - protocol layer handles it
    }
  }

  private async updateHandshakeStatus(
    requestId: string,
    status: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await apiClient.put(`/handshake/requests/${requestId}/status`, {
        status,
        metadata,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to update handshake status in backend:', error);
    }
  }

  private async sendHandshakeNotification(
    referenceId: string,
    action: 'created' | 'responded' | 'cancelled'
  ): Promise<void> {
    try {
      // This would send appropriate notifications based on the action
      // Implementation depends on your notification system
      console.log(`Handshake ${action} notification sent for: ${referenceId}`);
    } catch (error) {
      console.warn('Failed to send handshake notification:', error);
    }
  }
}

// Export singleton instance
export const handshakeService = new HandshakeService();
