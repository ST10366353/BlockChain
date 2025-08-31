"use client"

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { useToast } from '../shared/hooks'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showErrorDetails?: boolean
  enableRetry?: boolean
  name?: string
}

export interface ErrorFallbackProps {
  error: Error
  errorInfo?: ErrorInfo
  errorId?: string
  onRetry?: () => void
  onReport?: () => void
  onGoHome?: () => void
}

// Default error fallback component
export function DefaultErrorFallback({
  error,
  errorInfo,
  errorId,
  onRetry,
  onReport,
  onGoHome
}: ErrorFallbackProps) {
  const { toastError } = useToast()

  const handleReport = () => {
    // In a real app, this would send error to monitoring service
    console.error('Error Report:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      errorId
    })

    toastError("Error Reported", "Thank you for reporting this error. Our team will investigate.")
    onReport?.()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Something went wrong
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>

        {errorId && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Error ID</p>
            <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{errorId}</p>
          </div>
        )}

        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}

          <button
            onClick={handleReport}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            <Bug className="w-4 h-4 mr-2" />
            Report Error
          </button>

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </button>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              Error Details (Development)
            </summary>
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-auto max-h-32">
                {error.stack}
              </pre>
              {errorInfo?.componentStack && (
                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-auto max-h-32 mt-2">
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

// Page-level error boundary
export function PageErrorBoundary({
  error,
  errorInfo,
  errorId,
  onRetry,
  onReport,
  onGoHome
}: ErrorFallbackProps) {
  return (
    <div className="min-h-[60vh] bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Page Error
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This page encountered an unexpected error. You can try refreshing or return to the dashboard.
        </p>

        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Page
            </button>
          )}

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Component-level error boundary for smaller sections
export function SectionErrorBoundary({
  error,
  onRetry
}: Omit<ErrorFallbackProps, 'onReport' | 'onGoHome'>) {
  return (
    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            Component Error
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            This section failed to load properly.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 rounded-md transition-colors"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Error Boundary class component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error(`ErrorBoundary (${this.props.name || 'Unknown'}):`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId
    })

    // Update state with error info
    this.setState({ errorInfo })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // In production, you would send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToService(error, errorInfo, this.state.errorId)
    }
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      })
    }
  }

  handleReport = () => {
    // Additional error reporting logic can go here
    console.log('Error reported:', this.state.errorId)
  }

  handleGoHome = () => {
    // Navigate to home/dashboard
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard'
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback

      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo || undefined}
          errorId={this.state.errorId || undefined}
          onRetry={this.props.enableRetry !== false ? this.handleRetry : undefined}
          onReport={this.handleReport}
          onGoHome={this.handleGoHome}
        />
      )
    }

    return this.props.children
  }
}

// Hook for functional components to catch async errors
export function useAsyncError() {
  const [, setError] = React.useState()

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Specialized error boundaries for different contexts
export function APIErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="API"
      fallback={SectionErrorBoundary}
      enableRetry={true}
      onError={(error, errorInfo) => {
        console.error('API Error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="Form"
      fallback={SectionErrorBoundary}
      enableRetry={true}
      onError={(error, errorInfo) => {
        console.error('Form Error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function PageErrorBoundaryWrapper({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="Page"
      fallback={PageErrorBoundary}
      enableRetry={true}
      onError={(error, errorInfo) => {
        console.error('Page Error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
