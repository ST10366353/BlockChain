import React from 'react';
// Shared Type Definitions for Dual-Purpose DID Wallet

// ============================================================================
// USER TYPES & AUTHENTICATION
// ============================================================================

export type UserType = 'consumer' | 'enterprise' | 'power-user';

export interface UserProfile {
  id: string;
  did: string;
  name: string;
  email?: string;
  avatar?: string;
  type: UserType;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isActive: boolean;
  role?: string;
  organization?: Organization;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  security: SecurityPreferences;
  display: DisplayPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  security: boolean;
  credentialUpdates: boolean;
  handshakeRequests: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'connections' | 'private';
  credentialSharing: 'selective' | 'minimal' | 'full';
  dataRetention: number; // days
  analyticsOptOut: boolean;
  anonymousIdentity: boolean;
}

export interface SecurityPreferences {
  autoLock: number; // minutes
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number; // minutes
  loginAlerts: boolean;
}

export interface DisplayPreferences {
  dateFormat: string;
  timeFormat: string;
  currency: string;
  itemsPerPage: number;
}

export interface Organization {
  id: string;
  did: string;
  name: string;
  domain?: string;
  type: 'corporation' | 'government' | 'education' | 'healthcare' | 'nonprofit';
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  compliance: ComplianceRequirements[];
}

export interface ComplianceRequirements {
  standard: 'GDPR' | 'HIPAA' | 'SOX' | 'KYC' | 'AML' | 'CCPA';
  level: 'basic' | 'advanced' | 'comprehensive';
  auditor?: string;
  lastAudit?: string;
  nextAudit?: string;
}

// ============================================================================
// DID & CREDENTIAL TYPES
// ============================================================================

export interface DIDDocument {
  '@context': string[];
  id: string;
  controller?: string;
  verificationMethod?: VerificationMethod[];
  authentication?: (string | VerificationMethod)[];
  assertionMethod?: (string | VerificationMethod)[];
  keyAgreement?: (string | VerificationMethod)[];
  capabilityInvocation?: (string | VerificationMethod)[];
  capabilityDelegation?: (string | VerificationMethod)[];
  service?: Service[];
  created?: string;
  updated?: string;
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase?: string;
  publicKeyJwk?: any;
  publicKeyBase58?: string;
  blockchainAccountId?: string;
}

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: string | any;
}

export interface DIDResolutionResult {
  didDocument?: DIDDocument;
  didResolutionMetadata: DIDResolutionMetadata;
  didDocumentMetadata: DIDDocumentMetadata;
}

export interface DIDResolutionMetadata {
  contentType?: string;
  retrieved?: string;
  duration?: number;
  error?: string;
}

export interface DIDDocumentMetadata {
  created?: string;
  updated?: string;
  deactivated?: boolean;
  versionId?: string;
  nextUpdate?: string;
  nextVersionId?: string;
  equivalentId?: string[];
  canonicalId?: string;
}

export interface DIDRegistryEntry {
  did: string;
  method: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  controller: string;
  metadata?: Record<string, any>;
}

export interface VerifiableCredential {
  '@context': string[];
  id?: string;
  type: string[];
  issuer: string | Issuer;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: CredentialSubject;
  proof?: Proof[];
}

export interface Issuer {
  id: string;
  name?: string;
  image?: string;
  url?: string;
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
  proofValue?: string;
  jws?: string;
  [key: string]: any;
}

export interface VerifiablePresentation {
  '@context': string[];
  id?: string;
  type: string[];
  holder?: string;
  verifiableCredential: VerifiableCredential[];
  proof?: Proof[];
}

export interface CredentialRequest {
  id: string;
  requesterDID: string;
  requestedCredentials: CredentialRequestItem[];
  purpose: string;
  expiresAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface CredentialRequestItem {
  type: string;
  required: boolean;
  constraints?: Record<string, any>;
  description?: string;
}

// ============================================================================
// HANDSHAKE PROTOCOL TYPES
// ============================================================================

export interface HandshakeRequest {
  id: string;
  requesterDID: string;
  requesterName: string;
  requestedFields: string[];
  purpose: string;
  expiresAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface HandshakeResponse {
  id: string;
  requestId: string;
  responderDID: string;
  approvedFields: string[];
  rejectedFields: string[];
  zeroKnowledgeProof?: any;
  selectiveDisclosure?: SelectiveDisclosure;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SelectiveDisclosure {
  credentialId: string;
  disclosedFields: DisclosedField[];
  nonDisclosedFields: string[];
  proof: any;
}

export interface DisclosedField {
  fieldName: string;
  value: any;
  proof: any;
  timestamp: string;
}

export interface ZeroKnowledgeProof {
  type: string;
  proofPurpose: string;
  verificationMethod: string;
  challenge: string;
  proofValue: string;
  created: string;
}

// ============================================================================
// NOTIFICATION & ACTIVITY TYPES
// ============================================================================

export type NotificationType =
  | 'credential.issued'
  | 'credential.verified'
  | 'credential.expired'
  | 'credential.revoked'
  | 'handshake.request'
  | 'handshake.response'
  | 'connection.request'
  | 'connection.accepted'
  | 'security.alert'
  | 'system.update'
  | 'audit.event';

export type NotificationPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface NotificationData {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  level: 'info' | 'warning' | 'error';
}

// ============================================================================
// API & RESPONSE TYPES
// ============================================================================

export interface APIResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  requestId?: string;
  meta?: ResponseMetadata;
}

export interface ResponseMetadata {
  total?: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
  page?: number;
  totalPages?: number;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
  path?: string;
  statusCode?: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

// ============================================================================
// TRUST & REGISTRY TYPES
// ============================================================================

export interface TrustedIssuer {
  id: string;
  did: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  status: 'active' | 'suspended' | 'revoked';
  trustLevel: 'high' | 'medium' | 'low';
  credentials: string[]; // credential types they can issue
  compliance: ComplianceRequirements[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastVerified?: string;
}

export interface TrustRelationship {
  id: string;
  requesterDID: string;
  targetDID: string;
  type: 'issuer' | 'verifier' | 'peer';
  status: 'pending' | 'active' | 'suspended' | 'revoked';
  trustLevel: 'high' | 'medium' | 'low';
  permissions: string[];
  constraints?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

// ============================================================================
// UI & COMPONENT TYPES
// ============================================================================

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  error?: APIError;
  retry?: () => void;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string | number;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: any }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
  helpText?: string;
  disabled?: boolean;
}

// ============================================================================
// ANALYTICS & METRICS TYPES
// ============================================================================

export interface SystemMetrics {
  uptime: number; // seconds
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  requests: {
    total: number;
    averageResponseTime: number;
    errorRate: number;
    byEndpoint: Record<string, number>;
  };
  database: {
    connected: boolean;
    collections: number;
    connectionPool: {
      used: number;
      available: number;
      pending: number;
    };
  };
  blockchain: {
    lastBlock: number;
    gasPrice: number;
    pendingTransactions: number;
  };
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  userTypes: Record<UserType, number>;
  geographicDistribution: Record<string, number>;
  deviceTypes: Record<string, number>;
}

export interface BusinessMetrics {
  totalCredentials: number;
  totalPresentations: number;
  totalHandshakes: number;
  averageHandshakeTime: number;
  successRate: number;
  revenue: {
    total: number;
    byService: Record<string, number>;
    growth: number;
  };
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  buildNumber: string;
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  blockchain: {
    network: string;
    rpcUrl: string;
    chainId: number;
  };
  features: FeatureFlags;
  limits: {
    maxFileSize: number;
    maxCredentials: number;
    maxRequestsPerMinute: number;
  };
}

export interface FeatureFlags {
  handshake: boolean;
  selectiveDisclosure: boolean;
  zeroKnowledgeProofs: boolean;
  biometricAuth: boolean;
  enterprisePortal: boolean;
  consumerMobileApp: boolean;
  aiRiskAssessment: boolean;
  multiTenant: boolean;
  auditLogging: boolean;
  complianceReporting: boolean;
}

// ============================================================================
// MOBILE & RESPONSIVE TYPES
// ============================================================================

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveBreakpoint {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface MobileConfig {
  biometricEnabled: boolean;
  offlineMode: boolean;
  pushNotifications: boolean;
  hapticFeedback: boolean;
  autoLock: boolean;
  lockTimeout: number;
}

// ============================================================================
// EXPORT & UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

export type ValueOf<T> = T[keyof T];

export type ArrayElement<T> = T extends (infer U)[] ? U : never;

export type NonNullable<T> = T extends null | undefined ? never : T;

// Utility type for API responses
export type ApiResponseData<T> = T extends APIResponse<infer U> ? U : never;

// Utility type for form data
export type FormDataType<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};
