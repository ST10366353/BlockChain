import React from 'react';
import {
  HandshakeRequest,
  HandshakeResponse,
  SelectiveDisclosure,
  ZeroKnowledgeProof,
  NotificationType,
  UserType
} from '../../shared/types';
import { notificationsAPI } from '../../services';

export interface HandshakeConfig {
  defaultExpiryHours: number;
  maxRequestsPerHour: number;
  requireApprovalForHighRisk: boolean;
  enableZeroKnowledgeProofs: boolean;
  enableSelectiveDisclosure: boolean;
}

export interface HandshakeParticipant {
  did: string;
  name: string;
  type: UserType;
  publicKey: string;
  endpoint?: string;
}

export interface HandshakeSession {
  id: string;
  requester: HandshakeParticipant;
  responder: HandshakeParticipant;
  request: HandshakeRequest;
  response?: HandshakeResponse;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'completed';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  metadata: Record<string, any>;
}

export class HandshakeProtocol {
  private config: HandshakeConfig;
  private activeSessions: Map<string, HandshakeSession> = new Map();

  constructor(config: Partial<HandshakeConfig> = {}) {
    this.config = {
      defaultExpiryHours: 24,
      maxRequestsPerHour: 10,
      requireApprovalForHighRisk: true,
      enableZeroKnowledgeProofs: false,
      enableSelectiveDisclosure: true,
      ...config
    };
  }

  /**
   * Initiates a new handshake request
   */
  async initiateHandshake(params: {
    requester: HandshakeParticipant;
    responderDID: string;
    requestedFields: string[];
    purpose: string;
    metadata?: Record<string, any>;
    expiryHours?: number;
  }): Promise<HandshakeRequest> {
    // Validate request
    await this.validateHandshakeRequest(params);

    // Create handshake request
    const request: HandshakeRequest = {
      id: this.generateRequestId(),
      requesterDID: params.requester.did,
      requesterName: params.requester.name,
      requestedFields: params.requestedFields,
      purpose: params.purpose,
      expiresAt: new Date(Date.now() + (params.expiryHours || this.config.defaultExpiryHours) * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: params.metadata || {}
    };

    // Create session
    const session: HandshakeSession = {
      id: request.id,
      requester: params.requester,
      responder: await this.getParticipant(params.responderDID),
      request,
      status: 'pending',
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      expiresAt: request.expiresAt,
      metadata: params.metadata || {}
    };

    // Store session
    this.activeSessions.set(session.id, session);

    // Send notification to responder
    await this.notifyResponder(session);

    // Log handshake initiation
    await this.logHandshakeEvent('initiated', session);

    return request;
  }

  /**
   * Responds to a handshake request
   */
  async respondToHandshake(params: {
    sessionId: string;
    responder: HandshakeParticipant;
    approvedFields: string[];
    rejectedFields: string[];
    useZeroKnowledgeProofs?: boolean;
    useSelectiveDisclosure?: boolean;
  }): Promise<HandshakeResponse> {
    const session = this.activeSessions.get(params.sessionId);
    if (!session) {
      throw new Error('Handshake session not found');
    }

    if (session.status !== 'pending') {
      throw new Error('Handshake session is not pending');
    }

    if (session.request.expiresAt < new Date().toISOString()) {
      session.status = 'expired';
      throw new Error('Handshake request has expired');
    }

    // Generate response
    const response: HandshakeResponse = {
      id: this.generateResponseId(),
      requestId: params.sessionId,
      responderDID: params.responder.did,
      approvedFields: params.approvedFields,
      rejectedFields: params.rejectedFields,
      timestamp: new Date().toISOString(),
      metadata: {}
    };

    // Add cryptographic proofs if enabled
    if (params.useZeroKnowledgeProofs && this.config.enableZeroKnowledgeProofs) {
      response.zeroKnowledgeProof = await this.generateZeroKnowledgeProof(
        params.approvedFields,
        session.request.requester.did
      );
    }

    if (params.useSelectiveDisclosure && this.config.enableSelectiveDisclosure) {
      response.selectiveDisclosure = await this.generateSelectiveDisclosure(
        params.approvedFields,
        session.request.requester.did
      );
    }

    // Update session
    session.response = response;
    session.status = params.approvedFields.length > 0 ? 'approved' : 'rejected';
    session.updatedAt = new Date().toISOString();

    // Update request status
    session.request.status = session.status;
    session.request.updatedAt = session.updatedAt;

    // Store updated session
    this.activeSessions.set(session.id, session);

    // Send notification to requester
    await this.notifyRequester(session);

    // Log handshake response
    await this.logHandshakeEvent('responded', session);

    return response;
  }

  /**
   * Cancels a handshake request
   */
  async cancelHandshake(sessionId: string, reason?: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Handshake session not found');
    }

    if (session.status !== 'pending') {
      throw new Error('Cannot cancel non-pending handshake');
    }

    // Update session
    session.status = 'rejected';
    session.updatedAt = new Date().toISOString();
    session.metadata.cancellationReason = reason;

    // Update request
    session.request.status = 'rejected';
    session.request.updatedAt = session.updatedAt;

    // Store updated session
    this.activeSessions.set(sessionId, session);

    // Send cancellation notification
    await this.notifyCancellation(session, reason);

    // Log cancellation
    await this.logHandshakeEvent('cancelled', session);
  }

  /**
   * Gets handshake session by ID
   */
  getHandshakeSession(sessionId: string): HandshakeSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Gets all handshake sessions for a participant
   */
  getParticipantSessions(participantDID: string): HandshakeSession[] {
    return Array.from(this.activeSessions.values()).filter(
      session =>
        session.requester.did === participantDID ||
        session.responder.did === participantDID
    );
  }

  /**
   * Cleans up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_sessionId, session] of this.activeSessions) {
      if (session.expiresAt < now && session.status === 'pending') {
        session.status = 'expired';
        session.updatedAt = now;
        session.request.status = 'expired';
        session.request.updatedAt = now;

        this.logHandshakeEvent('expired', session);
      }
    }
  }

  // Private helper methods

  private async validateHandshakeRequest(params: {
    requester: HandshakeParticipant;
    responderDID: string;
    requestedFields: string[];
    purpose: string;
  }): Promise<void> {
    // Check rate limits
    const recentRequests = this.getRecentRequests(params.requester.did);
    if (recentRequests >= this.config.maxRequestsPerHour) {
      throw new Error('Rate limit exceeded for handshake requests');
    }

    // Validate requested fields
    if (!params.requestedFields || params.requestedFields.length === 0) {
      throw new Error('At least one field must be requested');
    }

    // Validate purpose
    if (!params.purpose || params.purpose.trim().length === 0) {
      throw new Error('Purpose must be provided');
    }

    // Check if responder exists and is available
    const responder = await this.getParticipant(params.responderDID);
    if (!responder) {
      throw new Error('Responder not found or unavailable');
    }
  }

  private async getParticipant(did: string): Promise<HandshakeParticipant> {
    // This would integrate with your DID resolution service
    // For now, return mock data
    return {
      did,
      name: did.split(':').pop() || 'Unknown',
      type: 'consumer',
      publicKey: 'mock-public-key',
      endpoint: undefined
    };
  }

  private async generateZeroKnowledgeProof(
    fields: string[],
    verifierDID: string
  ): Promise<ZeroKnowledgeProof> {
    // This would integrate with a ZKP library like snarkjs
    // For now, return mock data
    return {
      type: 'BBS+Signature2020',
      proofPurpose: 'verification',
      verificationMethod: `${verifierDID}#key-1`,
      challenge: this.generateChallenge(),
      proofValue: this.generateProofValue(verifierDID, fields),
      created: new Date().toISOString()
    };
  }

  private async generateSelectiveDisclosure(
    fields: string[],
    verifierDID: string
  ): Promise<SelectiveDisclosure> {
    // Generate selective disclosure with proper proofs
    const disclosedFields = await Promise.all(
      fields.map(async (field) => ({
        fieldName: field,
        value: await this.generateFieldValue(field), // Generate or retrieve actual value
        proof: this.generateFieldProof(field, verifierDID),
        timestamp: new Date().toISOString()
      }))
    );

    return {
      credentialId: this.generateCredentialId(),
      disclosedFields,
      nonDisclosedFields: this.getNonDisclosedFields(fields),
      proof: this.generateAggregateProof(verifierDID, disclosedFields)
    };
  }

  // Generate proof value for verification
  private generateProofValue(verifierDID: string, fields: string[]): string {
    // In production, this would create a cryptographic proof
    // For now, return a properly formatted placeholder
    const timestamp = Date.now();
    const challenge = this.generateChallenge();
    return `z${verifierDID.split(':').pop()}_${fields.join('_')}_${timestamp}_${challenge}`;
  }

  // Generate field value (would retrieve from credential store)
  private async generateFieldValue(field: string): Promise<any> {
    // In production, this would retrieve actual field values from credentials
    const mockValues: Record<string, any> = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      birthDate: '1990-01-01',
      address: '123 Main St, Anytown, USA',
      phone: '+1-555-0123',
      ssn: '***-**-****',
      license: 'DL123456789'
    };
    return mockValues[field] || `Value for ${field}`;
  }

  // Generate field-specific proof
  private generateFieldProof(field: string, verifierDID: string): string {
    const timestamp = Date.now();
    return `proof_${field}_${verifierDID.split(':').pop()}_${timestamp}`;
  }

  // Generate credential ID
  private generateCredentialId(): string {
    const cryptoRandom = typeof window !== 'undefined' && window.crypto?.getRandomValues
      ? Array.from(window.crypto.getRandomValues(new Uint8Array(8)), byte => byte.toString(16).padStart(2, '0')).join('')
      : Math.random().toString(36).substring(2, 11);
    return `cred_${Date.now()}_${cryptoRandom}`;
  }

  // Get non-disclosed fields (for privacy)
  private getNonDisclosedFields(disclosedFields: string[]): string[] {
    const allFields = ['name', 'email', 'birthDate', 'address', 'phone', 'ssn', 'license'];
    return allFields.filter(field => !disclosedFields.includes(field));
  }

  // Generate aggregate proof for all disclosed fields
  private generateAggregateProof(verifierDID: string, disclosedFields: any[]): string {
    const timestamp = Date.now();
    const fieldHash = disclosedFields.map(f => f.fieldName || f.field || f).join('_');
    return `aggregate_${verifierDID.split(':').pop()}_${fieldHash}_${timestamp}`;
  }

  private async notifyResponder(session: HandshakeSession): Promise<void> {
    const notification = {
      recipientDID: session.responder.did,
      type: 'handshake.request' as NotificationType,
      title: 'New Verification Request',
      message: `${session.requester.name} is requesting to verify your information for: ${session.request.purpose}`,
      actionUrl: `/handshake/${session.id}`,
      metadata: {
        sessionId: session.id,
        requesterName: session.requester.name,
        purpose: session.request.purpose,
        requestedFields: session.request.requestedFields
      }
    };

    await notificationsAPI.sendNotification(notification);
  }

  private async notifyRequester(session: HandshakeSession): Promise<void> {
    if (!session.response) return;

    const statusMessage = session.status === 'approved'
      ? `${session.response.approvedFields.length} fields approved`
      : 'Request rejected';

    const notification = {
      recipientDID: session.requester.did,
      type: 'handshake.response' as NotificationType,
      title: 'Verification Response Received',
      message: `${session.responder.name} has responded to your verification request: ${statusMessage}`,
      metadata: {
        sessionId: session.id,
        responderName: session.responder.name,
        status: session.status,
        approvedFields: session.response.approvedFields,
        rejectedFields: session.response.rejectedFields
      }
    };

    await notificationsAPI.sendNotification(notification);
  }

  private async notifyCancellation(session: HandshakeSession, reason?: string): Promise<void> {
    const notification = {
      recipientDID: session.responder.did,
      type: 'system.update' as NotificationType,
      title: 'Verification Request Cancelled',
      message: `${session.requester.name} cancelled their verification request${reason ? `: ${reason}` : ''}`,
      metadata: {
        sessionId: session.id,
        reason: reason || 'No reason provided'
      }
    };

    await notificationsAPI.sendNotification(notification);
  }

  private async logHandshakeEvent(event: string, session: HandshakeSession): Promise<void> {
    // This would integrate with your audit logging service
    console.log(`Handshake ${event}:`, {
      sessionId: session.id,
      requester: session.requester.did,
      responder: session.responder.did,
      status: session.status,
      timestamp: new Date().toISOString()
    });
  }

  private generateRequestId(): string {
    return `hs_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResponseId(): string {
    return `hs_res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChallenge(): string {
    return `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getRecentRequests(requesterDID: string): number {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    return Array.from(this.activeSessions.values()).filter(
      session =>
        session.requester.did === requesterDID &&
        session.createdAt > oneHourAgo
    ).length;
  }
}

// Export singleton instance
export const handshakeProtocol = new HandshakeProtocol();
