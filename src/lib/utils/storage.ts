/**
 * Safe localStorage utilities with error handling
 */

// Safe localStorage get operation
export function safeGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get item from localStorage (${key}):`, error);
    return null;
  }
}

// Safe localStorage set operation
export function safeSetItem(key: string, value: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to set item in localStorage (${key}):`, error);
    return false;
  }
}

// Safe localStorage remove operation
export function safeRemoveItem(key: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove item from localStorage (${key}):`, error);
    return false;
  }
}

// Safe localStorage clear operation
export function safeClear(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    localStorage.clear();
    return true;
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
    return false;
  }
}

// Safe JSON parse from localStorage
export function safeGetJSON<T>(key: string, defaultValue: T): T {
  try {
    const item = safeGetItem(key);
    if (!item) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Failed to parse JSON from localStorage (${key}):`, error);
    return defaultValue;
  }
}

// Safe JSON stringify to localStorage
export function safeSetJSON<T>(key: string, value: T): boolean {
  try {
    const jsonString = JSON.stringify(value);
    return safeSetItem(key, jsonString);
  } catch (error) {
    console.warn(`Failed to stringify JSON for localStorage (${key}):`, error);
    return false;
  }
}
