import { apiClient } from './http-client';
import { LoginCredentials, LoginResponse, User, ApiResponse } from '@/shared/types';

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

  async loginWithBiometric(): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login/biometric');
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
