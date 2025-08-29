import { apiClient, handleAPIResponse, createQueryParams, type APIResponse } from './api-client';
import { API_ENDPOINTS } from './api-config';

// OIDC Authorization request
export interface OIDCAuthorizationRequest {
  client_id: string;
  redirect_uri: string;
  scope?: string;
  state?: string;
  response_type?: string;
  nonce?: string;
}

// OIDC Authorization response
export interface OIDCAuthorizationResponse {
  authorizationUrl: string;
  state: string;
  nonce: string;
}

// OIDC Callback request
export interface OIDCCallbackRequest {
  code: string;
  state: string;
  did: string;
  signedNonce: string;
}

// OIDC Token request
export interface OIDCTokenRequest {
  grant_type: 'authorization_code';
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
}

// OIDC Token response
export interface OIDCTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// OIDC Token verification request
export interface OIDCTokenVerificationRequest {
  token: string;
}

// OIDC Token verification response
export interface OIDCTokenVerificationResponse {
  valid: boolean;
  payload?: {
    sub: string;
    scope: string;
    iat: number;
    exp: number;
    aud?: string;
    iss?: string;
    [key: string]: any;
  };
}

// OIDC Provider configuration
export interface OIDCProviderConfig {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  response_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  scopes_supported: string[];
  claims_supported: string[];
  [key: string]: any;
}

// JSON Web Key Set
export interface JWKSet {
  keys: JWK[];
}

export interface JWK {
  kty: string;
  use: string;
  kid: string;
  n?: string;
  e?: string;
  alg?: string;
  [key: string]: any;
}

// OIDC User info
export interface OIDCUserInfo {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: {
    formatted?: string;
    street_address?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
  updated_at?: number;
  [key: string]: any;
}

// OIDC API Client
export class OIDCAPI {
  // Start OIDC authorization flow
  async authorize(request: OIDCAuthorizationRequest): Promise<OIDCAuthorizationResponse> {
    const queryParams = createQueryParams({
      ...request,
      scope: request.scope || 'openid',
      response_type: request.response_type || 'code',
    });

    const response = await apiClient.get<OIDCAuthorizationResponse>(
      API_ENDPOINTS.oidc.authorize,
      queryParams
    );
    return handleAPIResponse(response);
  }

  // Handle OIDC authorization callback
  async callback(request: OIDCCallbackRequest): Promise<OIDCTokenResponse> {
    const response = await apiClient.post<OIDCTokenResponse>(
      API_ENDPOINTS.oidc.callback,
      request
    );
    return handleAPIResponse(response);
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(request: OIDCTokenRequest): Promise<OIDCTokenResponse> {
    const response = await apiClient.post<OIDCTokenResponse>(
      API_ENDPOINTS.oidc.token,
      request
    );
    return handleAPIResponse(response);
  }

  // Verify access token
  async verifyToken(request: OIDCTokenVerificationRequest): Promise<OIDCTokenVerificationResponse> {
    const response = await apiClient.post<OIDCTokenVerificationResponse>(
      API_ENDPOINTS.oidc.verify,
      request
    );
    return handleAPIResponse(response);
  }

  // Get OIDC provider configuration
  async getProviderConfig(): Promise<OIDCProviderConfig> {
    const response = await apiClient.get<OIDCProviderConfig>(
      API_ENDPOINTS.oidc.config
    );
    return handleAPIResponse(response);
  }

  // Get JSON Web Key Set
  async getJWKSet(): Promise<JWKSet> {
    const response = await apiClient.get<JWKSet>(
      API_ENDPOINTS.oidc.jwks
    );
    return handleAPIResponse(response);
  }

  // Get user information (requires valid access token)
  async getUserInfo(accessToken: string): Promise<OIDCUserInfo> {
    const response = await apiClient.get<OIDCUserInfo>(
      API_ENDPOINTS.oidc.userinfo,
      { access_token: accessToken }
    );
    return handleAPIResponse(response);
  }

  // Complete OIDC login flow
  async completeLoginFlow(
    authorizationCode: string,
    state: string,
    did: string,
    signedNonce: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<{
    tokens: OIDCTokenResponse;
    userInfo?: OIDCUserInfo;
  }> {
    // Step 1: Handle callback
    const callbackRequest: OIDCCallbackRequest = {
      code: authorizationCode,
      state,
      did,
      signedNonce,
    };

    const tokens = await this.callback(callbackRequest);

    // Step 2: Get user info if access token is available
    let userInfo: OIDCUserInfo | undefined;
    try {
      if (tokens.access_token) {
        userInfo = await this.getUserInfo(tokens.access_token);
      }
    } catch (error) {
      // User info endpoint might not be implemented, ignore error
      console.warn('User info endpoint not available:', error);
    }

    return {
      tokens,
      userInfo,
    };
  }

  // Generate OIDC authorization URL manually
  generateAuthorizationUrl(
    clientId: string,
    redirectUri: string,
    scope: string = 'openid profile email',
    state?: string,
    nonce?: string
  ): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      response_type: 'code',
      ...(state && { state }),
      ...(nonce && { nonce }),
    });

    return `${API_ENDPOINTS.oidc.authorize}?${params.toString()}`;
  }

  // Check if token is expired
  isTokenExpired(tokenPayload: OIDCTokenVerificationResponse['payload']): boolean {
    if (!tokenPayload?.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return tokenPayload.exp < now;
  }

  // Extract DID from token payload
  extractDIDFromToken(tokenPayload: OIDCTokenVerificationResponse['payload']): string | null {
    return tokenPayload?.sub || null;
  }

  // Validate OIDC configuration
  async validateProviderConfig(): Promise<boolean> {
    try {
      const config = await this.getProviderConfig();

      // Check required fields
      const requiredFields = [
        'issuer',
        'authorization_endpoint',
        'token_endpoint',
        'jwks_uri',
      ];

      return requiredFields.every(field => config[field]);
    } catch (error) {
      return false;
    }
  }

  // Create authorization request with DID authentication
  createAuthorizationRequest(
    clientId: string,
    redirectUri: string,
    userDID: string,
    scope: string = 'openid profile email'
  ): OIDCAuthorizationRequest {
    const state = this.generateState();
    const nonce = this.generateNonce();

    return {
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
      response_type: 'code',
      nonce,
    };
  }

  // Generate cryptographically secure random string
  private generateState(): string {
    return this.generateRandomString(32);
  }

  private generateNonce(): string {
    return this.generateRandomString(32);
  }

  private generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Store OIDC session data (client-side storage)
  storeSession(sessionData: {
    state: string;
    nonce: string;
    clientId: string;
    redirectUri: string;
    timestamp: number;
  }): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oidc_session', JSON.stringify(sessionData));
    }
  }

  // Retrieve OIDC session data
  getStoredSession(): {
    state: string;
    nonce: string;
    clientId: string;
    redirectUri: string;
    timestamp: number;
  } | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const stored = localStorage.getItem('oidc_session');
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch (error) {
      return null;
    }
  }

  // Clear OIDC session data
  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oidc_session');
    }
  }
}

// Create singleton instance
export const oidcAPI = new OIDCAPI();
