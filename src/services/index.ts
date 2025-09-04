import React from 'react';
// Main API services exports
export { apiClient, APIClient } from './api-client';
export { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from './api-config';
export type { APIResponse, APIError, PaginationParams, SearchParams, RateLimitStatus, SystemMetrics, FeatureFlags, APIConfig } from './api-config';

// Helper functions
export { handleAPIResponse, createQueryParams } from './api-client';

// DID API
export { didAPI, DIDAPI } from './did-api';
export type {
  DIDDocument,
  DIDResolutionResult,
  DIDRegistrationRequest,
  DIDUpdateRequest,
  DIDEvent,
  DIDRegistryEntry,
  VerificationMethod,
  Service,
} from './did-api';

// Credentials API
export { credentialsAPI, CredentialsAPI } from './credentials-api';
export type {
  VerifiableCredential,
  CredentialSubject,
  Proof,
  CredentialIssuanceRequest,
  SimpleCredentialIssuanceRequest,
  VerificationResult,
  CredentialRevocationRequest,
  RevocationStatus,
  CredentialQueryParams,
  CredentialSummary,
  CredentialTemplate,
  CredentialRequest,
} from './credentials-api';

// Trust Registry API
export { trustAPI, TrustAPI } from './trust-api';
export type {
  TrustedIssuer,
  IssuerRegistrationRequest,
  IssuerUpdateRequest,
  CredentialSchema,
  TrustQueryParams,
} from './trust-api';

// Profile API
export { profileAPI, ProfileAPI } from './profile-api';
export type {
  UserProfile,
  UserPreferences,
  PrivacyPreferences,
  SecurityPreferences,
  DisplayPreferences,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  AccountDeletionRequest,
  ProfileStats,
} from './profile-api';

// OIDC API
export { oidcAPI, OIDCAPI } from './oidc-api';
export type {
  OIDCAuthorizationRequest,
  OIDCAuthorizationResponse,
  OIDCCallbackRequest,
  OIDCTokenRequest,
  OIDCTokenResponse,
  OIDCTokenVerificationRequest,
  OIDCTokenVerificationResponse,
  OIDCProviderConfig,
  JWKSet,
  JWK,
  OIDCUserInfo,
} from './oidc-api';

// Audit API
export { auditAPI, AuditAPI } from './audit-api';
export type {
  AuditLogEntry,
  AuditLogQueryParams,
  AuditStats,
  SystemMetrics,
  AuditExportParams,
} from './audit-api';

// Presentations API
export { presentationsAPI, PresentationsAPI } from './presentations-api';
export type {
  VerifiablePresentation,
  PresentationProof,
  PresentationTemplate,
} from './presentations-api';

// Data Export/Import API
export { dataExportImportAPI, DataExportImportAPI } from './data-export-import';
export type {
  WalletExportData,
  WalletIdentity,
  WalletCredential,
  WalletConnection,
  AuditLogSummary,
  UserPreferences,
  ExportMetadata,
  ImportResult,
  ImportCounts,
} from './data-export-import';

// Notifications API
export { notificationsAPI, NotificationsAPI } from './notifications-api';
export type {
  NotificationType,
  NotificationPriority,
  NotificationData,
  NotificationPreferences,
  NotificationQuery,
  WebSocketMessage,
} from './notifications-api';

// Search API
export { searchAPI, SearchAPI } from './search-api';
export type {
  SearchResult,
  CredentialSearchResult,
  ConnectionSearchResult,
  PresentationSearchResult,
  AuditSearchResult,
} from './search-api';

// System API
export { systemAPI, SystemAPI } from './system-api';
export type {
  ConfigUpdateRequest,
  FeatureUpdateRequest,
  RateLimitResetRequest,
  RequestMetrics,
  ErrorMetrics,
  PerformanceMetrics,
  UsageMetrics,
} from './system-api';

// Handshake Service (from handshake module)
export { handshakeService } from '../handshake/services/handshake-service';
export type {
  HandshakeRequest,
  HandshakeResponse,
  HandshakeStatus,
  SelectiveDisclosure,
  ZeroKnowledgeProof,
  ConsentRecord,
} from '../handshake/services/handshake-service';
