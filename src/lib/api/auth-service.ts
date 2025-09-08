import { apiClient } from './http-client';
import { LoginCredentials, LoginResponse, User, ApiResponse } from '@/shared/types';

// Helper function to convert ArrayBuffer to base64
function ArrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Authentication API endpoints
export const authService = {
  // Login with different methods
  async loginWithPassphrase(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login/passphrase', credentials);
    return response.data;
  },

  async loginWithDID(did: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login/did', { did });
    return response.data;
  },

  async loginWithBiometric(credentialData?: {
    id: string;
    rawId: ArrayBuffer;
    response: {
      authenticatorData: ArrayBuffer;
      clientDataJSON: ArrayBuffer;
      signature: ArrayBuffer;
      userHandle?: ArrayBuffer;
    };
    type: string;
  }): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login/biometric', {
      credential: credentialData ? {
        id: credentialData.id,
        rawId: ArrayBufferToBase64(credentialData.rawId),
        response: {
          authenticatorData: ArrayBufferToBase64(credentialData.response.authenticatorData),
          clientDataJSON: ArrayBufferToBase64(credentialData.response.clientDataJSON),
          signature: ArrayBufferToBase64(credentialData.response.signature),
          userHandle: credentialData.response.userHandle
            ? ArrayBufferToBase64(credentialData.response.userHandle)
            : null,
        },
        type: credentialData.type,
      } : null
    });
    return response.data;
  },

  // Token management
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async logout(): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // User profile
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/auth/profile', userData);
    return response.data;
  },

  // Password/Security
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // DID operations
  async registerDID(did: string): Promise<ApiResponse<{ did: string }>> {
    const response = await apiClient.post('/auth/did/register', { did });
    return response.data;
  },

  async verifyDID(did: string, challenge: string, signature: string): Promise<ApiResponse<boolean>> {
    const response = await apiClient.post('/auth/did/verify', {
      did,
      challenge,
      signature,
    });
    return response.data;
  },

  // Biometric/WebAuthn
  async registerBiometric(options: PublicKeyCredentialCreationOptions): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/auth/biometric/register', options);
    return response.data;
  },

  async authenticateBiometric(options: PublicKeyCredentialRequestOptions): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/auth/biometric/authenticate', options);
    return response.data;
  },
};
