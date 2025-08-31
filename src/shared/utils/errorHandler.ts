import { APIError } from '../types';

export interface ErrorHandlerOptions {
  logError?: boolean;
  showToast?: boolean;
  fallbackMessage?: string;
}

export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | null> => {
  const {
    logError = true,
    showToast = false,
    fallbackMessage = 'An error occurred'
  } = options;

  try {
    return await asyncFn();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : fallbackMessage;

    if (logError) {
      console.error('Async operation failed:', error);
    }

    if (showToast) {
      // This would integrate with your toast system
      console.warn('Toast:', errorMessage);
    }

    return null;
  }
};

export const createAPIError = (
  code: string,
  message: string,
  details?: any
): APIError => ({
  code,
  message,
  details,
  timestamp: new Date().toISOString()
});

export const isAPIError = (error: any): error is APIError => {
  return error && typeof error.code === 'string' && typeof error.message === 'string';
};

export const formatErrorMessage = (error: any): string => {
  if (isAPIError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

export const withRetry = async <T>(
  asyncFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  operationName?: string
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        if (operationName) {
          console.warn(`${operationName} failed (attempt ${attempt}/${maxRetries}), retrying...`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // If we reach here, all retries failed
  if (!lastError) {
    lastError = new Error('All retry attempts failed');
  }

  throw lastError;
};

export const handleNetworkError = (error: any): string => {
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again.';
  }

  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  return formatErrorMessage(error);
};
