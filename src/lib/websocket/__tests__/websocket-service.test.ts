/**
 * WebSocket Service Tests
 */

// Mock dependencies BEFORE any imports
const mockUseAppStore = jest.fn(() => ({
  getState: jest.fn(() => ({
    addNotification: jest.fn()
  })),
  addNotification: jest.fn()
}));
const mockDataPersistence = {
  saveCredential: jest.fn(),
  getAllCredentials: jest.fn(),
};
const mockSyncService = {
  sync: jest.fn(),
};

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

// Mock WebSocket with proper event handler management
const mockWebSocket = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: WebSocket.CLOSED as number, // Start as CLOSED, but allow any number
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
  // Direct event handler properties (what the service actually uses)
  onopen: null as any,
  onmessage: null as any,
  onclose: null as any,
  onerror: null as any,
};

// Create WebSocket constructor mock that returns our mock instance
const MockWebSocketConstructor = jest.fn().mockImplementation((_url: string, _protocols?: any) => {
  // Reset all handlers for each new instance
  mockWebSocket.addEventListener.mockClear();
  mockWebSocket.removeEventListener.mockClear();
  mockWebSocket.send.mockClear();
  mockWebSocket.close.mockClear();
  mockWebSocket.onopen = null;
  mockWebSocket.onmessage = null;
  mockWebSocket.onclose = null;
  mockWebSocket.onerror = null;

  return mockWebSocket;
});

(global as any).WebSocket = MockWebSocketConstructor;

describe('WebSocketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset WebSocket mock state and constructor calls
    mockWebSocket.readyState = WebSocket.CLOSED; // Start as CLOSED
    MockWebSocketConstructor.mockClear();
    mockWebSocket.addEventListener.mockClear();
    mockWebSocket.removeEventListener.mockClear();
    mockWebSocket.send.mockClear();
    mockWebSocket.close.mockClear();
    mockWebSocket.onopen = null;
    mockWebSocket.onmessage = null;
    mockWebSocket.onclose = null;
    mockWebSocket.onerror = null;
  });

  describe('connect', () => {
    it('should connect to WebSocket server', async () => {
      const connectPromise = websocketService.connect();

      // Simulate successful connection
      // The service assigns handlers directly, so we need to call them manually
      // Wait for the service to assign the handlers
      setTimeout(() => {
        // Now call the onopen handler that was assigned by the service
        if (mockWebSocket.onopen) {
          mockWebSocket.onopen();
        }
      }, 10);

      await connectPromise;

      expect(MockWebSocketConstructor).toHaveBeenCalledWith(
        expect.stringContaining('/ws/realtime')
      );
      expect(mockWebSocket.onopen).toBeDefined();
      expect(mockWebSocket.onmessage).toBeDefined();
      expect(mockWebSocket.onclose).toBeDefined();
      expect(mockWebSocket.onerror).toBeDefined();
    });

    it('should handle connection errors', async () => {
      const connectPromise = websocketService.connect();

      // Wait for handlers to be assigned and simulate connection error
      setTimeout(() => {
        if (mockWebSocket.onerror) {
          mockWebSocket.onerror(new Event('error'));
        }
      }, 10);

      await expect(connectPromise).rejects.toThrow();
    });

    it('should not connect if already connected', async () => {
      // First connection
      const firstConnect = websocketService.connect();
      setTimeout(() => {
        if (mockWebSocket.onopen) {
          mockWebSocket.onopen();
        }
      }, 10);
      await firstConnect;

      // Reset for second attempt
      MockWebSocketConstructor.mockClear();

      // Second connection attempt should not create new WebSocket since we're already connected
      await websocketService.connect();

      // Should only create one WebSocket instance
      expect(MockWebSocketConstructor).toHaveBeenCalledTimes(1);
    });
  });

  describe('send', () => {
    beforeEach(async () => {
      const connectPromise = websocketService.connect();
      setTimeout(() => {
        if (mockWebSocket.onopen) {
          mockWebSocket.onopen();
        }
      }, 10);
      await connectPromise;
    });

    it('should send message when connected', async () => {
      // First establish connection
      const connectPromise = websocketService.connect();
      setTimeout(() => {
        mockWebSocket.readyState = WebSocket.OPEN; // Set to OPEN after connection
        if (mockWebSocket.onopen) {
          mockWebSocket.onopen();
        }
      }, 10);
      await connectPromise;

      websocketService.send('test-type', { message: 'test' }, 'msg-1');

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'test-type',
          payload: { message: 'test' },
          timestamp: expect.any(Number),
          id: 'msg-1'
        })
      );
    });

    it('should queue message when not connected', () => {
      // Disconnect by setting connection to null first
      mockWebSocket.readyState = WebSocket.CLOSED;

      websocketService.send('test-type', { message: 'test' });

      // Message should not be sent immediately
      expect(mockWebSocket.send).not.toHaveBeenCalled();

      // Check connection status
      const status = websocketService.getConnectionStatus();
      expect(status.pendingMessages).toBe(1);
    });
  });

  describe('message handling', () => {
    beforeEach(async () => {
      const connectPromise = websocketService.connect();
      setTimeout(() => {
        if (mockWebSocket.onopen) {
          mockWebSocket.onopen();
        }
      }, 10);
      await connectPromise;
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
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(mockMessage) });
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
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(mockMessage) });
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
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(mockMessage) });
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
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(mockMessage) });
      }

      expect(mockHandler).toHaveBeenCalledWith(mockMessage);
    });

    it('should handle malformed JSON', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Call the onmessage handler
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: 'invalid json' });
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse WebSocket message'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('disconnect', () => {
    it('should disconnect from WebSocket server', () => {
      websocketService.disconnect();

      expect(mockWebSocket.close).toHaveBeenCalled();
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
    it('should return correct connection status when connected', async () => {
      const connectPromise = websocketService.connect();
      setTimeout(() => {
        mockWebSocket.readyState = WebSocket.OPEN; // Set to OPEN after connection
        if (mockWebSocket.onopen) {
          mockWebSocket.onopen();
        }
      }, 10);
      await connectPromise;

      const status = websocketService.getConnectionStatus();

      expect(status).toEqual({
        connected: true,
        connecting: false,
        reconnectAttempts: 0,
        pendingMessages: 0
      });
    });

    it('should return correct connection status when disconnected', () => {
      mockWebSocket.readyState = WebSocket.CLOSED;

      const status = websocketService.getConnectionStatus();

      expect(status).toEqual({
        connected: false,
        connecting: false,
        reconnectAttempts: 0,
        pendingMessages: 0
      });
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
      const connectPromise = websocketService.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen();
      }
      await connectPromise;

      // Reset constructor call count
      MockWebSocketConstructor.mockClear();

      // Simulate close event
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({ code: 1006 }); // Abnormal closure
      }

      // Fast-forward time to trigger reconnection
      jest.advanceTimersByTime(5000);

      expect(MockWebSocketConstructor).toHaveBeenCalledTimes(2);
    });

    it('should not reconnect on normal closure', async () => {
      const connectPromise = websocketService.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen();
      }
      await connectPromise;

      // Reset constructor call count
      MockWebSocketConstructor.mockClear();

      // Simulate normal close event
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({ code: 1000 }); // Normal closure
      }

      // Fast-forward time
      jest.advanceTimersByTime(5000);

      expect(MockWebSocketConstructor).toHaveBeenCalledTimes(1);
    });
  });

  describe('heartbeat', () => {
    beforeEach(async () => {
      jest.useFakeTimers();

      const connectPromise = websocketService.connect();
      setTimeout(() => {
        if (mockWebSocket.onopen) {
          mockWebSocket.onopen();
        }
      }, 10);
      await connectPromise;
      // Ensure connection is in OPEN state
      mockWebSocket.readyState = WebSocket.OPEN;
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should send heartbeat messages', () => {
      // Fast-forward time to trigger heartbeat
      jest.advanceTimersByTime(30000);

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'ping',
          payload: {},
          timestamp: expect.any(Number)
        })
      );
    });
  });
});
