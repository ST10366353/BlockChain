import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Add authentication token if available
    const token = localStorage.getItem('auth_token');
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
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`API Response [${response.status}]:`, response.config.url);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token might be expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('auth_refresh_token');
        if (refreshToken) {
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = refreshResponse.data;

          // Update stored tokens
          localStorage.setItem('auth_token', token);
          if (newRefreshToken) {
            localStorage.setItem('auth_refresh_token', newRefreshToken);
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          return httpClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear auth data and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_user');

        // Dispatch logout event (if we had a global store)
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
      // Could show a permission error toast here
    }

    // Handle 500+ Server errors
    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
      // Could show a server error toast here
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      // Could show a network error toast here
    }

    // Log error details in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
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
