import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage';
import { logger } from '../logger';
import { redirectToLogin } from '../utils/navigation';

// API Configuration
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8787/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state to prevent race conditions
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Request interceptor for authentication
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Add authentication token if available
    const token = safeGetItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    if (config.headers) {
      config.headers['X-Request-Time'] = new Date().toISOString();
    }

    return config;
  },
  (error: AxiosError) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env?.DEV) {
      logger.debug('API Response', { status: response.status, url: response.config.url });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token might be expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If we're already refreshing, wait for the existing refresh
      if (isRefreshing && refreshPromise) {
        return refreshPromise.then(() => {
          const token = localStorage.getItem('auth_token');
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return httpClient(originalRequest);
        });
      }

      // Start token refresh
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          // Attempt to refresh token
          const refreshToken = localStorage.getItem('auth_refresh_token');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = refreshResponse.data;

          // Update stored tokens safely
          const tokenUpdated = safeSetItem('auth_token', token);
          const refreshTokenUpdated = newRefreshToken ? safeSetItem('auth_refresh_token', newRefreshToken) : true;

          if (!tokenUpdated || !refreshTokenUpdated) {
            console.warn('Failed to update stored tokens');
          }

          return token;
        } catch (refreshError) {
          logger.error('Token refresh failed', refreshError);
          // Clear auth data and redirect to login
          const tokenCleared = safeRemoveItem('auth_token');
          const refreshTokenCleared = safeRemoveItem('auth_refresh_token');
          const userCleared = safeRemoveItem('auth_user');

          if (!tokenCleared || !refreshTokenCleared || !userCleared) {
            logger.warn('Failed to clear some stored authentication data');
          }

          // Use safe navigation utility
          redirectToLogin();

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();

      return refreshPromise.then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return httpClient(originalRequest);
      });
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      logger.error('Access forbidden', { status: 403, data: error.response.data });
      // Could show a permission error toast here
    }

    // Handle 500+ Server errors
    if (error.response?.status && error.response.status >= 500) {
      logger.error('Server error', { status: error.response.status, data: error.response.data });
      // Could show a server error toast here
    }

    // Handle network errors
    if (!error.response) {
      logger.error('Network error', { message: error.message });
      // Could show a network error toast here
    }

    // Log error details in development
    if (import.meta.env?.DEV) {
      logger.error('API Error', {
        url: originalRequest.url,
        method: originalRequest.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    return Promise.reject(error);
  }
);

// Utility functions for common HTTP methods
export const apiClient = {
  get: <T = any>(url: string, config?: any) => httpClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => httpClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => httpClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: any) => httpClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => httpClient.delete<T>(url, config),
};

// Export the configured axios instance as default
export default httpClient;
