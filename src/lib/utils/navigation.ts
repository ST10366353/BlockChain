/**
 * Safe navigation utilities that work across different environments
 */

// Safe navigation function that works in browsers, SSR, and mobile apps
export function safeNavigate(path: string, replace: boolean = false): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.warn('Navigation attempted in non-browser environment:', path);
    return;
  }

  try {
    if (replace) {
      window.location.replace(path);
    } else {
      window.location.href = path;
    }
  } catch (error) {
    console.error('Navigation failed:', error);
    // Fallback: try using history API if available
    if (typeof window.history !== 'undefined' && !replace) {
      try {
        window.history.pushState(null, '', path);
      } catch (historyError) {
        console.error('History navigation also failed:', historyError);
      }
    }
  }
}

// Safe redirect to login page
export function redirectToLogin(): void {
  safeNavigate('/login', true);
}

// Safe redirect to home page
export function redirectToHome(): void {
  safeNavigate('/', true);
}

// Get current URL safely
export function getCurrentUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return window.location.href;
  } catch (error) {
    console.warn('Failed to get current URL:', error);
    return '';
  }
}

// Get current path safely
export function getCurrentPath(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return window.location.pathname;
  } catch (error) {
    console.warn('Failed to get current path:', error);
    return '';
  }
}
