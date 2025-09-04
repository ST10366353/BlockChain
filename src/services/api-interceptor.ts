import React from 'react';
// API Interceptor to handle undefined endpoints and provide mock responses
import { API_CONFIG } from './api-config';
import { simulateNetworkDelay } from './mock-data';

export class APIInterceptor {
  static async handleUndefinedEndpoint(path: string, method: string = 'GET'): Promise<any> {
    console.warn(`API Interceptor: Caught undefined endpoint call - ${method} ${path}`);
    
    if (!API_CONFIG.useMockData) {
      throw new Error(`API endpoint not found: ${method} ${path}`);
    }

    await simulateNetworkDelay(300);

    // Return appropriate mock response based on path patterns
    if (path.includes('undefined')) {
      return { success: true, data: [], message: 'Mock response for undefined endpoint' };
    }

    if (path.includes('profile')) {
      return {
        success: true,
        data: {
          id: 'mock-user',
          name: 'Mock User',
          email: 'mock@example.com',
          did: 'did:key:z6MkMockUser123'
        }
      };
    }

    if (path.includes('notifications')) {
      return {
        success: true,
        data: [
          {
            id: 'notif-1',
            title: 'Mock Notification',
            message: 'This is a mock notification',
            type: 'credential.issued' as const,
            priority: 'medium' as const,
            timestamp: new Date().toISOString(),
            read: false
          }
        ]
      };
    }

    if (path.includes('credentials')) {
      return { success: true, data: [] };
    }

    if (path.includes('connections')) {
      return { success: true, data: [] };
    }

    if (path.includes('presentations')) {
      return { success: true, data: [] };
    }

    // Default mock response
    return { 
      success: true, 
      data: null, 
      message: 'Mock response',
      status: 200 
    };
  }

  static isUndefinedEndpoint(path: string): boolean {
    if (!path || path === 'null' || path === 'undefined') return true;
    
    return path.includes('undefined') || 
           path.includes('[object Object]') || 
           path.includes('[object%20Object]') ||
           path === '' || 
           path === null || 
           path === undefined ||
           path.startsWith('/undefined') ||
           path.startsWith('/[object');
  }
}

// Monkey patch the fetch function to intercept undefined endpoints
const originalFetch = global.fetch;

if (typeof window !== 'undefined') {
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Extract just the path from the URL for checking
    const urlPath = url.includes('://') ? new URL(url).pathname : url;
    
    if (APIInterceptor.isUndefinedEndpoint(urlPath)) {
      console.warn(`Intercepted undefined API call: ${url} -> ${urlPath}`);
      
      const mockResponse = await APIInterceptor.handleUndefinedEndpoint(urlPath, init?.method || 'GET');
      
      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return originalFetch(input, init);
  };
}
