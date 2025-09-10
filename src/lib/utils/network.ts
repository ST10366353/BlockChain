/**
 * Network utilities for reliable online/offline detection
 */

// More reliable online detection
export function isOnline(): boolean {
  // Check if navigator.onLine is available and reliable
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }

  // Fallback: assume online if we can make requests
  return true;
}

// Enhanced online check with ping test
export async function isOnlineWithTest(timeout: number = 5000): Promise<boolean> {
  if (!isOnline()) {
    return false;
  }

  try {
    // Try to fetch a small resource from the same origin
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Network status change listener
export function onNetworkChange(callback: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
