"use client"

import { useCallback } from 'react'
import { useToast } from './use-toast'

export interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  fallbackMessage?: string
  onError?: (error: Error) => void
}

export interface APIError extends Error {
  status?: number
  code?: string
  details?: any
}

export function useErrorHandler() {
  const { toastError, toastSuccess, toastWarning, toastInfo } = useToast()

  const handleError = React.useCallback((
    error: Error | APIError | unknown,
    context?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred',
      onError
    } = options

    // Normalize error
    const normalizedError = error instanceof Error ? error : new Error(String(error))

    // Log error if requested
    if (logError) {
      console.error(`Error${context ? ` in ${context}` : ''}:`, {
        message: normalizedError.message,
        stack: normalizedError.stack,
        status: (normalizedError as APIError).status,
        code: (normalizedError as APIError).code,
        details: (normalizedError as APIError).details
      })
    }

    // Call custom error handler
    onError?.(normalizedError)

    // Show toast notification
    if (showToast) {
      const apiError = normalizedError as APIError

      // Determine error message based on error type
      let message = fallbackMessage

      if (apiError.status) {
        switch (apiError.status) {
          case 400:
            message = 'Invalid request. Please check your input.'
            break
          case 401:
            message = 'Authentication required. Please log in again.'
            break
          case 403:
            message = 'Access denied. You don\'t have permission for this action.'
            break
          case 404:
            message = 'Resource not found.'
            break
          case 409:
            message = 'Conflict with existing data.'
            break
          case 422:
            message = 'Validation failed. Please check your input.'
            break
          case 429:
            message = 'Too many requests. Please try again later.'
            break
          case 500:
            message = 'Server error. Please try again later.'
            break
          case 503:
            message = 'Service temporarily unavailable. Please try again later.'
            break
          default:
            message = apiError.message || fallbackMessage
        }
      } else if (apiError.code) {
        // Handle specific error codes
        switch (apiError.code) {
          case 'NETWORK_ERROR':
            message = 'Network connection failed. Please check your internet connection.'
            break
          case 'TIMEOUT':
            message = 'Request timed out. Please try again.'
            break
          case 'VALIDATION_ERROR':
            message = 'Please check your input and try again.'
            break
          default:
            message = apiError.message || fallbackMessage
        }
      } else {
        message = normalizedError.message || fallbackMessage
      }

      toastError(context || 'Error', message)
    }

    return normalizedError
  }, [toastError])

  const handleAsyncError = React.useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, context, options)
      return null
    }
  }, [handleError])

  const handleFormError = React.useCallback((
    error: Error | APIError | unknown,
    field?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    const formOptions = {
      ...options,
      showToast: false, // Forms typically show field-level errors
      fallbackMessage: field ? `${field} validation failed` : 'Form validation failed'
    }

    return handleError(error, 'Form', formOptions)
  }, [handleError])

  const handleNetworkError = React.useCallback((
    error: Error | APIError | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const networkOptions = {
      ...options,
      fallbackMessage: 'Network error. Please check your connection and try again.'
    }

    return handleError(error, 'Network', networkOptions)
  }, [handleError])

  const handleAuthError = React.useCallback((
    error: Error | APIError | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const authOptions = {
      ...options,
      fallbackMessage: 'Authentication failed. Please log in again.'
    }

    return handleError(error, 'Authentication', authOptions)
  }, [handleError])

  return {
    handleError,
    handleAsyncError,
    handleFormError,
    handleNetworkError,
    handleAuthError,
    toastSuccess,
    toastWarning,
    toastInfo
  }
}

// Hook for API error handling with retry logic
export function useAPIErrorHandler() {
  const errorHandler = useErrorHandler()

  const withRetry = React.useCallback(async <T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: string
  ): Promise<T | null> => {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall()
      } catch (error) {
        lastError = error as Error

        // Don't retry on client errors (4xx)
        if ((error as APIError).status && (error as APIError).status! >= 400 && (error as APIError).status! < 500) {
          break
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }

    // Handle the final error
    if (lastError) {
      errorHandler.handleError(lastError, context || 'API Call', {
        fallbackMessage: `Failed after ${maxRetries} attempts`
      })
    }

    return null
  }, [errorHandler])

  return {
    ...errorHandler,
    withRetry
  }
}

// Hook for form validation errors
export function useFormErrorHandler() {
  const { handleFormError, toastSuccess } = useErrorHandler()

  const handleValidationError = React.useCallback((
    errors: Record<string, string[]>,
    options: ErrorHandlerOptions = {}
  ) => {
    // Show first validation error
    const firstField = Object.keys(errors)[0]
    const firstError = errors[firstField]?.[0]

    if (firstError) {
      handleFormError(
        new Error(firstError),
        firstField,
        { showToast: true, ...options }
      )
    }
  }, [handleFormError])

  const handleSubmitError = React.useCallback((
    error: Error | APIError | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    return handleFormError(error, undefined, {
      fallbackMessage: 'Failed to submit form. Please try again.',
      ...options
    })
  }, [handleFormError])

  return {
    handleValidationError,
    handleSubmitError,
    handleFormError,
    toastSuccess
  }
}

export interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  fallbackMessage?: string
  onError?: (error: Error) => void
}

export interface APIError extends Error {
  status?: number
  code?: string
  details?: any
}

export function useErrorHandler() {
  const { toastError, toastSuccess, toastWarning, toastInfo } = useToast()

  const handleError = React.useCallback((
    error: Error | APIError | unknown,
    context?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred',
      onError
    } = options

    // Normalize error
    const normalizedError = error instanceof Error ? error : new Error(String(error))

    // Log error if requested
    if (logError) {
      console.error(`Error${context ? ` in ${context}` : ''}:`, {
        message: normalizedError.message,
        stack: normalizedError.stack,
        status: (normalizedError as APIError).status,
        code: (normalizedError as APIError).code,
        details: (normalizedError as APIError).details
      })
    }

    // Call custom error handler
    onError?.(normalizedError)

    // Show toast notification
    if (showToast) {
      const apiError = normalizedError as APIError

      // Determine error message based on error type
      let message = fallbackMessage

      if (apiError.status) {
        switch (apiError.status) {
          case 400:
            message = 'Invalid request. Please check your input.'
            break
          case 401:
            message = 'Authentication required. Please log in again.'
            break
          case 403:
            message = 'Access denied. You don\'t have permission for this action.'
            break
          case 404:
            message = 'Resource not found.'
            break
          case 409:
            message = 'Conflict with existing data.'
            break
          case 422:
            message = 'Validation failed. Please check your input.'
            break
          case 429:
            message = 'Too many requests. Please try again later.'
            break
          case 500:
            message = 'Server error. Please try again later.'
            break
          case 503:
            message = 'Service temporarily unavailable. Please try again later.'
            break
          default:
            message = apiError.message || fallbackMessage
        }
      } else if (apiError.code) {
        // Handle specific error codes
        switch (apiError.code) {
          case 'NETWORK_ERROR':
            message = 'Network connection failed. Please check your internet connection.'
            break
          case 'TIMEOUT':
            message = 'Request timed out. Please try again.'
            break
          case 'VALIDATION_ERROR':
            message = 'Please check your input and try again.'
            break
          default:
            message = apiError.message || fallbackMessage
        }
      } else {
        message = normalizedError.message || fallbackMessage
      }

      toastError(context || 'Error', message)
    }

    return normalizedError
  }, [toastError])

  const handleAsyncError = React.useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, context, options)
      return null
    }
  }, [handleError])

  const handleFormError = React.useCallback((
    error: Error | APIError | unknown,
    field?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    const formOptions = {
      ...options,
      showToast: false, // Forms typically show field-level errors
      fallbackMessage: field ? `${field} validation failed` : 'Form validation failed'
    }

    return handleError(error, 'Form', formOptions)
  }, [handleError])

  const handleNetworkError = React.useCallback((
    error: Error | APIError | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const networkOptions = {
      ...options,
      fallbackMessage: 'Network error. Please check your connection and try again.'
    }

    return handleError(error, 'Network', networkOptions)
  }, [handleError])

  const handleAuthError = React.useCallback((
    error: Error | APIError | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const authOptions = {
      ...options,
      fallbackMessage: 'Authentication failed. Please log in again.'
    }

    return handleError(error, 'Authentication', authOptions)
  }, [handleError])

  return {
    handleError,
    handleAsyncError,
    handleFormError,
    handleNetworkError,
    handleAuthError,
    toastSuccess,
    toastWarning,
    toastInfo
  }
}

// Hook for API error handling with retry logic
export function useAPIErrorHandler() {
  const errorHandler = useErrorHandler()

  const withRetry = React.useCallback(async <T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: string
  ): Promise<T | null> => {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall()
      } catch (error) {
        lastError = error as Error

        // Don't retry on client errors (4xx)
        if ((error as APIError).status && (error as APIError).status! >= 400 && (error as APIError).status! < 500) {
          break
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }

    // Handle the final error
    if (lastError) {
      errorHandler.handleError(lastError, context || 'API Call', {
        fallbackMessage: `Failed after ${maxRetries} attempts`
      })
    }

    return null
  }, [errorHandler])

  return {
    ...errorHandler,
    withRetry
  }
}

// Hook for form validation errors
export function useFormErrorHandler() {
  const { handleFormError, toastSuccess } = useErrorHandler()

  const handleValidationError = React.useCallback((
    errors: Record<string, string[]>,
    options: ErrorHandlerOptions = {}
  ) => {
    // Show first validation error
    const firstField = Object.keys(errors)[0]
    const firstError = errors[firstField]?.[0]

    if (firstError) {
      handleFormError(
        new Error(firstError),
        firstField,
        { showToast: true, ...options }
      )
    }
  }, [handleFormError])

  const handleSubmitError = React.useCallback((
    error: Error | APIError | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    return handleFormError(error, undefined, {
      fallbackMessage: 'Failed to submit form. Please try again.',
      ...options
    })
  }, [handleFormError])

  return {
    handleValidationError,
    handleSubmitError,
    handleFormError,
    toastSuccess
  }
}
