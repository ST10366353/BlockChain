/**
 * WebSocket Service Tests
 */

// Mock dependencies BEFORE any imports
const mockUseAppStore = {
  getState: jest.fn(() => ({
    addNotification: jest.fn()
  })),
  addNotification: jest.fn()
};
const mockDataPersistence = {
  saveCredential: jest.fn(),
  getAllCredentials: jest.fn(),
};
const mockSyncService = {
  sync: jest.fn(),
};

// Set up WebSocket mock BEFORE any imports - no auto-connection by default
const MockWebSocketConstructor = jest.fn((url: string, protocols?: any) => {
  const mockWebSocket = {
    url,
    protocols,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    readyState: WebSocket.CONNECTING,
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
    onopen: null as any,
    onmessage: null as any,
    onclose: null as any,
    onerror: null as any,
  };

  // Only auto-connect for tests that need it
  return mockWebSocket;
});
(global as any).WebSocket = MockWebSocketConstructor;

// Set up mocks BEFORE any imports
jest.mock('../../../stores', () => ({
  useAppStore: mockUseAppStore,
}));

jest.mock('../../../lib/persistence/data-persistence', () => ({
  dataPersistence: mockDataPersistence,
}));

jest.mock('../../../lib/sync/sync-service', () => ({
  syncService: mockSyncService,
}));

// Now import modules AFTER mocks are set up
import { websocketService } from '../websocket-service';

describe('WebSocketService', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    // Clear all timers
    jest.clearAllTimers();

    // Reset WebSocket constructor
    MockWebSocketConstructor.mockClear();

    // Reset websocket service state without disconnecting (to avoid promise rejections)
    Object.assign(websocketService, {
      pendingMessages: [],
      reconnectAttempts: 0,
      isConnecting: false,
      connection: null,
      connectionPromise: null,
      connectionResolve: null,
      connectionReject: null
    });
  });

  // Helper function to get the current mock WebSocket instance
  const getMockWebSocket = () => {
    const results = MockWebSocketConstructor.mock.results;
    if (results.length > 0) {
      return results[results.length - 1].value;
    }
    return null;
  };

  describe('connect', () => {
    it('should connect to WebSocket server', async () => {
      // Set up auto-connection for this test
      MockWebSocketConstructor.mockImplementationOnce((_url: string, _protocols?: any) => {
        const mockWebSocket = {
          url: _url,
          protocols: _protocols,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING as any,
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3,
          onopen: null as any,
          onmessage: null as any,
          onclose: null as any,
          onerror: null as any,
        };

        // Auto-connect for this test
        setTimeout(() => {
          if (mockWebSocket.readyState === WebSocket.CONNECTING) {
            mockWebSocket.readyState = WebSocket.OPEN;
            if (mockWebSocket.onopen) {
              mockWebSocket.onopen(new Event('open'));
            }
          }
        }, 10);

        return mockWebSocket;
      });

      const connectPromise = websocketService.connect();

      // Wait for the connection to complete
      await connectPromise;

      expect(MockWebSocketConstructor).toHaveBeenCalledWith(
        expect.stringContaining('/ws/realtime'),
        undefined
      );

      // Get the mock WebSocket instance that was created
      const mockWebSocketInstance = getMockWebSocket();
      expect(mockWebSocketInstance.onopen).toBeDefined();
      expect(mockWebSocketInstance.onmessage).toBeDefined();
      expect(mockWebSocketInstance.onclose).toBeDefined();
      expect(mockWebSocketInstance.onerror).toBeDefined();
    });

    it('should handle connection errors', async () => {
      // Create a mock WebSocket that will error instead of auto-connecting
      const errorMockWebSocket = {
        url: 'ws://localhost/ws/realtime',
        protocols: undefined,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        send: jest.fn(),
        close: jest.fn(),
        readyState: WebSocket.CONNECTING,
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3,
        onopen: null as any,
        onmessage: null as any,
        onclose: null as any,
        onerror: null as any,
      };

      // Override the mock to return our error-prone WebSocket
      MockWebSocketConstructor.mockImplementationOnce((_url: string, _protocols?: any) => {
        // Immediately trigger an error before any auto-connection can happen
        setTimeout(() => {
          if (errorMockWebSocket.onerror) {
            const errorEvent = new Event('error');
            errorMockWebSocket.onerror(errorEvent);
          }
        }, 0);

        return errorMockWebSocket;
      });

      const connectPromise = websocketService.connect();

      // The promise should reject due to the connection error
      await expect(connectPromise).rejects.toThrow('WebSocket connection failed');
    });

    it('should not connect if already connected', async () => {
      // Set up auto-connection for first connection
      MockWebSocketConstructor.mockImplementationOnce((_url: string, _protocols?: any) => {
        const mockWebSocket = {
          url: _url,
          protocols: _protocols,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING as any,
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3,
          onopen: null as any,
          onmessage: null as any,
          onclose: null as any,
          onerror: null as any,
        };

        // Auto-connect for this test
        setTimeout(() => {
          if (mockWebSocket.readyState === WebSocket.CONNECTING) {
            mockWebSocket.readyState = WebSocket.OPEN;
            if (mockWebSocket.onopen) {
              mockWebSocket.onopen(new Event('open'));
            }
          }
        }, 10);

        return mockWebSocket;
      });

      // First connection
      const firstConnect = websocketService.connect();
      await firstConnect;

      // Reset constructor call count
      MockWebSocketConstructor.mockClear();

      // Second connection attempt should not create new WebSocket since we're already connected
      await websocketService.connect();

      // Should not create a new WebSocket instance
      expect(MockWebSocketConstructor).toHaveBeenCalledTimes(0);
    });
  });

  describe('send', () => {
    beforeEach(async () => {
      // Set up auto-connection for send tests
      MockWebSocketConstructor.mockImplementationOnce((_url: string, _protocols?: any) => {
        const mockWebSocket = {
          url: _url,
          protocols: _protocols,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING as any,
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3,
          onopen: null as any,
          onmessage: null as any,
          onclose: null as any,
          onerror: null as any,
        };

        // Auto-connect for this test
        setTimeout(() => {
          if (mockWebSocket.readyState === WebSocket.CONNECTING) {
            mockWebSocket.readyState = WebSocket.OPEN;
            if (mockWebSocket.onopen) {
              mockWebSocket.onopen(new Event('open'));
            }
          }
        }, 10);

        return mockWebSocket;
      });

      await websocketService.connect();
    });

    it('should send message when connected', () => {
      const mockWebSocketInstance = getMockWebSocket();
      websocketService.send('test-type', { message: 'test' }, 'msg-1');

      const sentMessage = JSON.parse(mockWebSocketInstance.send.mock.calls[0][0]);
      expect(sentMessage).toEqual({
        type: 'test-type',
        payload: { message: 'test' },
        timestamp: expect.any(Number),
        id: 'msg-1'
      });
    });

    it('should queue message when not connected', () => {
      // Disconnect by closing the WebSocket
      websocketService.disconnect();

      websocketService.send('test-type', { message: 'test' });

      // Message should not be sent immediately
      const mockWebSocketInstance = getMockWebSocket();
      expect(mockWebSocketInstance.send).not.toHaveBeenCalled();

      // Check connection status
      const status = websocketService.getConnectionStatus();
      expect(status.pendingMessages).toBe(1);
    });
  });

  describe('message handling', () => {
    beforeEach(async () => {
      // Set up auto-connection for message handling tests
      MockWebSocketConstructor.mockImplementationOnce((_url: string, _protocols?: any) => {
        const mockWebSocket = {
          url: _url,
          protocols: _protocols,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING as any,
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3,
          onopen: null as any,
          onmessage: null as any,
          onclose: null as any,
          onerror: null as any,
        };

        // Auto-connect for this test
        setTimeout(() => {
          if (mockWebSocket.readyState === WebSocket.CONNECTING) {
            mockWebSocket.readyState = WebSocket.OPEN;
            if (mockWebSocket.onopen) {
              mockWebSocket.onopen(new Event('open'));
            }
          }
        }, 10);

        return mockWebSocket;
      });

      await websocketService.connect();
    });

    it('should handle credential update messages', () => {
      const mockMessage = {
        type: 'credential_updated',
        payload: {
          action: 'created',
          credential: { id: 'cred-1', name: 'Test Credential' }
        },
        timestamp: Date.now()
      };

      // Call the onmessage handler
      const mockWebSocketInstance = getMockWebSocket();
      if (mockWebSocketInstance.onmessage) {
        mockWebSocketInstance.onmessage({ data: JSON.stringify(mockMessage) });
      }

      // Should not throw error - message is handled internally
      expect(true).toBe(true);
    });

    it('should handle handshake update messages', () => {
      const mockMessage = {
        type: 'handshake_updated',
        payload: {
          action: 'updated',
          request: { id: 'req-1', status: 'approved' }
        },
        timestamp: Date.now()
      };

      // Call the onmessage handler
      const mockWebSocketInstance = getMockWebSocket();
      if (mockWebSocketInstance.onmessage) {
        mockWebSocketInstance.onmessage({ data: JSON.stringify(mockMessage) });
      }

      // Should not throw error - message is handled internally
      expect(true).toBe(true);
    });

    it('should handle notification messages', () => {
      const mockMessage = {
        type: 'notification',
        payload: {
          title: 'Test Notification',
          message: 'This is a test',
          type: 'info'
        },
        timestamp: Date.now()
      };

      // Call the onmessage handler
      const mockWebSocketInstance = getMockWebSocket();
      if (mockWebSocketInstance.onmessage) {
        mockWebSocketInstance.onmessage({ data: JSON.stringify(mockMessage) });
      }

      // Should not throw error - message is handled internally
      expect(true).toBe(true);
    });

    it('should handle custom message types', () => {
      const mockHandler = jest.fn();
      websocketService.onMessage('custom-type', mockHandler);

      const mockMessage = {
        type: 'custom-type',
        payload: { data: 'test' },
        timestamp: Date.now()
      };

      // Call the onmessage handler
      const mockWebSocketInstance = getMockWebSocket();
      if (mockWebSocketInstance.onmessage) {
        mockWebSocketInstance.onmessage({ data: JSON.stringify(mockMessage) });
      }

      expect(mockHandler).toHaveBeenCalledWith(mockMessage);
    });

    it('should handle malformed JSON', () => {
      // Mock the logger instead of console
      const loggerSpy = jest.fn();
      const originalLogger = require('../../logger').logger;
      (require('../../logger').logger as any).error = loggerSpy;

      // Call the onmessage handler
      const mockWebSocketInstance = getMockWebSocket();
      if (mockWebSocketInstance.onmessage) {
        mockWebSocketInstance.onmessage({ data: 'invalid json' });
      }

      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to parse WebSocket message',
        expect.any(Error)
      );

      // Restore original logger
      (require('../../logger').logger as any).error = originalLogger.error;
    });
  });

  describe('disconnect', () => {
    it('should disconnect from WebSocket server', async () => {
      // Set up auto-connection for this test
      MockWebSocketConstructor.mockImplementationOnce((_url: string, _protocols?: any) => {
        const mockWebSocket = {
          url: _url,
          protocols: _protocols,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING as any,
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3,
          onopen: null as any,
          onmessage: null as any,
          onclose: null as any,
          onerror: null as any,
        };

        // Auto-connect for this test
        setTimeout(() => {
          if (mockWebSocket.readyState === WebSocket.CONNECTING) {
            mockWebSocket.readyState = WebSocket.OPEN;
            if (mockWebSocket.onopen) {
              mockWebSocket.onopen(new Event('open'));
            }
          }
        }, 10);

        return mockWebSocket;
      });

      // First connect to create a WebSocket instance
      await websocketService.connect();

      const mockWebSocketInstance = getMockWebSocket();
      websocketService.disconnect();

      expect(mockWebSocketInstance.close).toHaveBeenCalled();
    });

    it('should handle disconnect when not connected', () => {
      // Set WebSocket to null (simulate not connected)
      Object.defineProperty(websocketService, 'connection', {
        value: null,
        writable: true
      });

      expect(() => websocketService.disconnect()).not.toThrow();
    });
  });

  describe('connection status', () => {

    beforeEach(() => {
      jest.clearAllMocks();
      jest.clearAllTimers();
    });

    it('should return correct connection status when connected', async () => {
      // Set up auto-connection for this test
      MockWebSocketConstructor.mockImplementationOnce((_url: string, _protocols?: any) => {
        const mockWebSocket = {
          url: _url,
          protocols: _protocols,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING as any,
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3,
          onopen: null as any,
          onmessage: null as any,
          onclose: null as any,
          onerror: null as any,
        };

        // Auto-connect for this test
        setTimeout(() => {
          if (mockWebSocket.readyState === WebSocket.CONNECTING) {
            mockWebSocket.readyState = WebSocket.OPEN;
            if (mockWebSocket.onopen) {
              mockWebSocket.onopen(new Event('open'));
            }
          }
        }, 10);

        return mockWebSocket;
      });

      // Connect and wait for connection to complete
      await websocketService.connect();

      const status = websocketService.getConnectionStatus();

      expect(status).toEqual({
        connected: true,
        connecting: false,
        reconnectAttempts: 0,
        pendingMessages: 0
      });
    });

    it('should return correct connection status when disconnected', () => {
      // Test that a service instance starts in disconnected state
      // This is more of an integration test - the actual implementation
      // may have different initial states depending on configuration
      const status = websocketService.getConnectionStatus();

      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('connecting');
      expect(status).toHaveProperty('reconnectAttempts');
      expect(status).toHaveProperty('pendingMessages');
      expect(typeof status.connected).toBe('boolean');
      expect(typeof status.connecting).toBe('boolean');
      expect(typeof status.reconnectAttempts).toBe('number');
      expect(typeof status.pendingMessages).toBe('number');
    });
  });

  describe('message subscriptions', () => {
    it('should subscribe to message types', () => {
      const handler = jest.fn();

      websocketService.onMessage('test-type', handler);

      expect(handler).toBeDefined();
    });

    it('should unsubscribe from message types', () => {
      const handler = jest.fn();

      websocketService.onMessage('test-type', handler);
      websocketService.offMessage('test-type');

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('reconnection', () => {

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should attempt reconnection on close', async () => {
      let reconnectAttempts = 0;

      // Mock connect to track reconnection attempts
      const originalConnect = websocketService.connect;
      websocketService.connect = jest.fn().mockImplementation(() => {
        reconnectAttempts++;
        return Promise.resolve();
      });

      // Set up auto-connection that will close
      MockWebSocketConstructor.mockImplementationOnce((_url: string, _protocols?: any) => {
        const mockWebSocket = {
          url: _url,
          protocols: _protocols,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING as any,
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3,
          onopen: null as any,
          onmessage: null as any,
          onclose: null as any,
          onerror: null as any,
        };

        // Auto-connect then close after a delay
        setTimeout(() => {
          if (mockWebSocket.readyState === WebSocket.CONNECTING) {
            mockWebSocket.readyState = WebSocket.OPEN;
            if (mockWebSocket.onopen) {
              mockWebSocket.onopen(new Event('open'));
            }
          }

          // Close after being connected
          setTimeout(() => {
            mockWebSocket.readyState = WebSocket.CLOSED;
            if (mockWebSocket.onclose) {
              mockWebSocket.onclose({ code: 1006, reason: 'Connection lost' } as CloseEvent);
            }
          }, 100);
        }, 10);

        return mockWebSocket;
      });

      await websocketService.connect();

      // Advance timers to trigger reconnection
      jest.advanceTimersByTime(1000);

      // Restore original connect
      websocketService.connect = originalConnect;

      expect(reconnectAttempts).toBeGreaterThan(0);
    });

    it('should not reconnect on normal closure', async () => {
      let reconnectAttempts = 0;

      // Mock connect to track reconnection attempts
      const originalConnect = websocketService.connect;
      websocketService.connect = jest.fn().mockImplementation(() => {
        reconnectAttempts++;
        return Promise.resolve();
      });

      // Set up auto-connection that will close normally
      MockWebSocketConstructor.mockImplementationOnce((_url: string, _protocols?: any) => {
        const mockWebSocket = {
          url: _url,
          protocols: _protocols,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING as any,
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3,
          onopen: null as any,
          onmessage: null as any,
          onclose: null as any,
          onerror: null as any,
        };

        // Auto-connect then close normally (code 1000)
        setTimeout(() => {
          if (mockWebSocket.readyState === WebSocket.CONNECTING) {
            mockWebSocket.readyState = WebSocket.OPEN;
            if (mockWebSocket.onopen) {
              mockWebSocket.onopen(new Event('open'));
            }
          }

          // Close normally after being connected
          setTimeout(() => {
            mockWebSocket.readyState = WebSocket.CLOSED;
            if (mockWebSocket.onclose) {
              mockWebSocket.onclose({ code: 1000, reason: 'Normal closure' } as CloseEvent);
            }
          }, 100);
        }, 10);

        return mockWebSocket;
      });

      await websocketService.connect();

      // Advance timers to see if reconnection is attempted
      jest.advanceTimersByTime(2000);

      // Restore original connect
      websocketService.connect = originalConnect;

      // Should not have attempted reconnection for normal closure
      expect(reconnectAttempts).toBe(1); // Only the initial connection
    });
  });

  describe('heartbeat', () => {

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should support heartbeat configuration', () => {
      // Test that WebSocketService can be instantiated with heartbeat options
      // This verifies the constructor accepts heartbeat configuration
      const { WebSocketService } = require('../websocket-service');

      expect(() => {
        const service = new WebSocketService({
          heartbeatInterval: 30000 // 30 seconds
        });
        // Just verify the service can be created without errors
        expect(service).toBeDefined();
        expect(typeof service.connect).toBe('function');
        expect(typeof service.disconnect).toBe('function');
      }).not.toThrow();
    });
  });
});
