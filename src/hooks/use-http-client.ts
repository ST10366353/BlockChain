"use client"

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/src/contexts/session-context'
import { useAPIErrorHandler } from './use-error-handler'

export interface HttpClientOptions extends RequestInit {
  skipAuth?: boolean
  timeout?: number
  retries?: number
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
}

export class HttpClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: any
  ) {
    super(message)
    this.name = 'HttpClientError'
  }
}

export function useHttpClient(baseURL: string = '') {
  const { session, refreshTokens, logout } = useSession()
  const { handleAsyncError } = useAPIErrorHandler()

  const createRequest = useCallback(async (
    url: string,
    options: HttpClientOptions = {}
  ): Promise<Request> => {
    const {
      skipAuth = false,
      timeout = 30000,
      retries = 1,
      headers = {},
      ...requestOptions
    } = options

    const fullUrl = baseURL ? `${baseURL}${url}` : url

    // Prepare headers
    const requestHeaders = new Headers(headers)

    // Add authentication header if not skipped and we have a token
    if (!skipAuth && session.tokens?.accessToken) {
      requestHeaders.set('Authorization', `${session.tokens.tokenType} ${session.tokens.accessToken}`)
    }

    // Add content type if not set and we have a body
    if (!requestHeaders.has('Content-Type') && requestOptions.body) {
      requestHeaders.set('Content-Type', 'application/json')
    }

    return new Request(fullUrl, {
      ...requestOptions,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout)
    })
  }, [baseURL, session.tokens])

  const handleResponse = useCallback(async <T>(
    response: Response
  ): Promise<ApiResponse<T>> => {
    let data: T

    try {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = (await response.text()) as T
      }
    } catch (error) {
      data = null as T
    }

    if (!response.ok) {
      throw new HttpClientError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        response.statusText,
        data
      )
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    }
  }, [])

  const makeRequest = useCallback(async <T>(
    url: string,
    options: HttpClientOptions = {}
  ): Promise<ApiResponse<T>> => {
    const request = await createRequest(url, options)
    const response = await fetch(request)
    return handleResponse<T>(response)
  }, [createRequest, handleResponse])

  const makeAuthenticatedRequest = useCallback(async <T>(
    url: string,
    options: HttpClientOptions = {}
  ): Promise<ApiResponse<T>> => {
    // First attempt
    try {
      return await makeRequest<T>(url, options)
    } catch (error) {
      // If unauthorized and we have a refresh token, try to refresh
      if (
        error instanceof HttpClientError &&
        error.status === 401 &&
        session.tokens?.refreshToken &&
        !options.skipAuth
      ) {
        console.log('Token expired, attempting refresh...')

        const refreshSuccess = await refreshTokens()

        if (refreshSuccess) {
          console.log('Token refreshed, retrying request...')
          // Retry with new token
          return makeRequest<T>(url, options)
        } else {
          console.log('Token refresh failed, logging out...')
          // Refresh failed, logout
          await logout()
          throw error
        }
      }

      // If it's a different error or no refresh token, throw it
      throw error
    }
  }, [makeRequest, session.tokens, refreshTokens, logout])

  // Convenience methods for different HTTP methods
  const get = useCallback(<T = any>(
    url: string,
    options: HttpClientOptions = {}
  ): Promise<ApiResponse<T>> => {
    return makeAuthenticatedRequest<T>(url, { ...options, method: 'GET' })
  }, [makeAuthenticatedRequest])

  const post = useCallback(<T = any>(
    url: string,
    data?: any,
    options: HttpClientOptions = {}
  ): Promise<ApiResponse<T>> => {
    return makeAuthenticatedRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }, [makeAuthenticatedRequest])

  const put = useCallback(<T = any>(
    url: string,
    data?: any,
    options: HttpClientOptions = {}
  ): Promise<ApiResponse<T>> => {
    return makeAuthenticatedRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }, [makeAuthenticatedRequest])

  const patch = useCallback(<T = any>(
    url: string,
    data?: any,
    options: HttpClientOptions = {}
  ): Promise<ApiResponse<T>> => {
    return makeAuthenticatedRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }, [makeAuthenticatedRequest])

  const delete_ = useCallback(<T = any>(
    url: string,
    options: HttpClientOptions = {}
  ): Promise<ApiResponse<T>> => {
    return makeAuthenticatedRequest<T>(url, { ...options, method: 'DELETE' })
  }, [makeAuthenticatedRequest])

  return {
    request: makeRequest,
    authenticatedRequest: makeAuthenticatedRequest,
    get,
    post,
    put,
    patch,
    delete: delete_,
    handleResponse
  }
}

// Enhanced API client that integrates with session management
export function useAPIClient(apiConfig: {
  baseURL: string
  timeout?: number
  retries?: number
} = { baseURL: '/api' }) {
  const httpClient = useHttpClient(apiConfig.baseURL)
  const { handleAsyncError } = useAPIErrorHandler()

  const callAPI = useCallback(async <T = any>(
    endpoint: string,
    options: HttpClientOptions & {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      data?: any
    } = {}
  ): Promise<T> => {
    const { method = 'GET', data, ...requestOptions } = options

    const result = await handleAsyncError(async () => {
      let response: ApiResponse<T>

      switch (method) {
        case 'GET':
          response = await httpClient.get<T>(endpoint, requestOptions)
          break
        case 'POST':
          response = await httpClient.post<T>(endpoint, data, requestOptions)
          break
        case 'PUT':
          response = await httpClient.put<T>(endpoint, data, requestOptions)
          break
        case 'PATCH':
          response = await httpClient.patch<T>(endpoint, data, requestOptions)
          break
        case 'DELETE':
          response = await httpClient.delete<T>(endpoint, requestOptions)
          break
        default:
          throw new Error(`Unsupported HTTP method: ${method}`)
      }

      return response.data
    }, `API ${method} ${endpoint}`)

    if (result === null) {
      throw new Error(`API call failed: ${method} ${endpoint}`)
    }

    return result
  }, [httpClient, handleAsyncError])

  return {
    call: callAPI,
    get: (endpoint: string, options?: Omit<HttpClientOptions, 'method' | 'data'>) =>
      callAPI(endpoint, { ...options, method: 'GET' }),
    post: (endpoint: string, data?: any, options?: Omit<HttpClientOptions, 'method' | 'data'>) =>
      callAPI(endpoint, { ...options, method: 'POST', data }),
    put: (endpoint: string, data?: any, options?: Omit<HttpClientOptions, 'method' | 'data'>) =>
      callAPI(endpoint, { ...options, method: 'PUT', data }),
    patch: (endpoint: string, data?: any, options?: Omit<HttpClientOptions, 'method' | 'data'>) =>
      callAPI(endpoint, { ...options, method: 'PATCH', data }),
    delete: (endpoint: string, options?: Omit<HttpClientOptions, 'method' | 'data'>) =>
      callAPI(endpoint, { ...options, method: 'DELETE' })
  }
}

// Hook for protected routes
export function useProtectedRoute() {
  const { session } = useSession()
  const router = useRouter()

  return useCallback(() => {
    if (!session.isLoading && !session.isAuthenticated) {
      router.push('/login')
      return false
    }
    return session.isAuthenticated
  }, [session.isLoading, session.isAuthenticated, router])
}

// Hook for session-aware API calls
export function useSessionAwareAPI() {
  const { session, updateActivity } = useSession()
  const apiClient = useAPIClient()

  const authenticatedCall = useCallback(async <T>(
    endpoint: string,
    options: any = {}
  ): Promise<T> => {
    // Update activity timestamp
    updateActivity()

    // Make the API call
    return apiClient.call<T>(endpoint, options)
  }, [apiClient, updateActivity])

  return {
    ...apiClient,
    authenticatedCall,
    isAuthenticated: session.isAuthenticated,
    user: session.user
  }
}
