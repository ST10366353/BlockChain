// Export HTTP client
export { default as httpClient, apiClient } from './http-client';

// Export API services
export { authService } from './auth-service';
export { credentialsService } from './credentials-service';
export { handshakeService } from './handshake-service';

// Export types
export type { Credential, CreateCredentialRequest } from './credentials-service';
export type { HandshakeRequest, CreateHandshakeRequest } from './handshake-service';
