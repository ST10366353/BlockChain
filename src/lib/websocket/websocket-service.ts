/**
 * WebSocket Service for Real-time Features
 * Handles real-time updates for credentials, requests, and notifications
 */

import { useAppStore } from '@/stores';
import { dataPersistence } from '../persistence/data-persistence';
import { syncService } from '../sync/sync-service';
import { logger } from '../logger';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  id?: string;
}

export interface WebSocketOptions {
  url?: string;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class WebSocketService {
  private connection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private heartbeatInterval = 30000;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers = new Map<string, (message: WebSocketMessage) => void>();
  private pendingMessages: WebSocketMessage[] = [];
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;
  private connectionResolve: (() => void) | null = null;
  private connectionReject: ((error: Error) => void) | null = null;

  constructor(private options: WebSocketOptions = {}) {
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.heartbeatInterval = options.heartbeatInterval || 30000;

    this.setupMessageHandlers();
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.connection && this.connection.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return this.connectionPromise || Promise.resolve();
    }

    this.isConnecting = true;

    // Create a new promise for this connection attempt
    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.connectionResolve = resolve;
      this.connectionReject = reject;

      try {
        const url = this.options.url || this.getDefaultWebSocketUrl();
        logger.info('Connecting to WebSocket', { url });

        this.connection = new WebSocket(url, this.options.protocols);

        this.connection.onopen = this.handleOpen.bind(this);
        this.connection.onmessage = this.handleMessage.bind(this);
        this.connection.onclose = this.handleClose.bind(this);
        this.connection.onerror = this.handleError.bind(this);

      } catch (error) {
        logger.error('WebSocket connection error', error);
        this.isConnecting = false;
        this.connectionPromise = null;
        this.connectionResolve = null;
        this.connectionReject = null;
        this.scheduleReconnect();
        reject(error as Error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isConnecting = false;

    // Clear connection promise only if there's an active connection attempt
    if (this.connectionReject && this.connection) {
      this.connectionReject(new Error('WebSocket connection cancelled'));
      this.connectionResolve = null;
      this.connectionReject = null;
      this.connectionPromise = null;
    }

    // Clear all timers to prevent memory leaks
    this.clearAllTimers();

    if (this.connection) {
      try {
        this.connection.close();
      } catch (error) {
        logger.warn('Error closing WebSocket connection', undefined, error);
      }
      this.connection = null;
    }

    logger.info('WebSocket disconnected');
  }

  private clearAllTimers(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Send message via WebSocket
   */
  send(type: string, payload: any, id?: string): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      id
    };

    if (this.connection && this.connection.readyState === WebSocket.OPEN) {
      this.connection.send(JSON.stringify(message));
    } else {
      // Queue message for later sending
      this.pendingMessages.push(message);
      logger.info('WebSocket not connected, message queued', { type, queueLength: this.pendingMessages.length });
    }
  }

  /**
   * Subscribe to message type
   */
  onMessage(type: string, handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Unsubscribe from message type
   */
  offMessage(type: string): void {
    this.messageHandlers.delete(type);
  }

  /**
   * Check connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    connecting: boolean;
    reconnectAttempts: number;
    pendingMessages: number;
  } {
    return {
      connected: this.connection?.readyState === WebSocket.OPEN,
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      pendingMessages: this.pendingMessages.length
    };
  }

  private handleOpen(): void {
    logger.info('WebSocket connection established');
    this.isConnecting = false;
    this.reconnectAttempts = 0;

    // Check if connection is still valid before proceeding
    if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
      logger.warn('WebSocket connection became invalid during handleOpen');
      return;
    }

    // Resolve the connection promise
    if (this.connectionResolve) {
      this.connectionResolve();
      this.connectionResolve = null;
      this.connectionReject = null;
      this.connectionPromise = null;
    }

    // Send pending messages safely
    this.sendPendingMessages();

    // Start heartbeat
    this.startHeartbeat();

    // Notify about connection
    this.notifyConnectionStatus(true);
  }

  private sendPendingMessages(): void {
    if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
      logger.warn('Cannot send pending messages: connection not ready');
      return;
    }

    while (this.pendingMessages.length > 0) {
      const message = this.pendingMessages.shift();
      if (message) {
        try {
          this.connection.send(JSON.stringify(message));
        } catch (error) {
          logger.error('Failed to send pending message', error);
          // Put the message back at the front of the queue
          this.pendingMessages.unshift(message);
          break; // Stop sending remaining messages
        }
      }
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.processMessage(message);
    } catch (error) {
      logger.error('Failed to parse WebSocket message', error);
    }
  }


  private handleClose(event: CloseEvent): void {
    logger.info('WebSocket connection closed', { code: event.code, reason: event.reason });
    this.isConnecting = false;

    // Clear all timers to prevent memory leaks
    this.clearAllTimers();

    this.notifyConnectionStatus(false);

    // Attempt to reconnect if not intentionally closed
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    logger.error('WebSocket error occurred', error);
    this.isConnecting = false;

    // Reject the connection promise
    if (this.connectionReject) {
      this.connectionReject(new Error('WebSocket connection failed'));
      this.connectionResolve = null;
      this.connectionReject = null;
      this.connectionPromise = null;
    }
  }

  private processMessage(message: WebSocketMessage): void {
    // Handle built-in message types
    switch (message.type) {
      case 'pong':
        // Heartbeat response
        return;

      case 'credential_updated':
        this.handleCredentialUpdate(message);
        break;

      case 'handshake_updated':
        this.handleHandshakeUpdate(message);
        break;

      case 'notification':
        this.handleNotification(message);
        break;

      case 'sync_required':
        this.handleSyncRequired(message);
        break;

      default:
        // Call custom message handler
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
          handler(message);
        } else {
          logger.info('Unhandled WebSocket message', { type: message.type });
        }
    }
  }

  private handleCredentialUpdate(message: WebSocketMessage): void {
    const { payload } = message;

    if (payload.action === 'created') {
      dataPersistence.saveCredential(payload.credential, { sync: false });
    } else if (payload.action === 'updated') {
      dataPersistence.updateCredential(payload.credential.id, payload.credential, { sync: false });
    } else if (payload.action === 'deleted') {
      dataPersistence.deleteCredential(payload.credentialId, { sync: false });
    }

    // Show notification
    const { addNotification } = useAppStore.getState();
    addNotification({
      type: 'info',
      title: 'Credential Updated',
      message: `Credential "${payload.credential?.name || payload.credentialId}" has been ${payload.action}.`
    });
  }

  private handleHandshakeUpdate(message: WebSocketMessage): void {
    const { payload } = message;

    if (payload.action === 'created') {
      dataPersistence.saveHandshakeRequest(payload.request, { sync: false });
    } else if (payload.action === 'updated') {
      dataPersistence.updateHandshakeRequest(payload.request.id, payload.request, { sync: false });
    } else if (payload.action === 'deleted') {
      dataPersistence.deleteHandshakeRequest(payload.requestId, { sync: false });
    }

    // Show notification
    const { addNotification } = useAppStore.getState();
    addNotification({
      type: 'info',
      title: 'Handshake Request Updated',
      message: `Handshake request has been ${payload.action}.`
    });
  }

  private handleNotification(message: WebSocketMessage): void {
    const { payload } = message;
    const { addNotification } = useAppStore.getState();

    addNotification({
      type: payload.type || 'info',
      title: payload.title,
      message: payload.message
    });
  }

  private handleSyncRequired(_message: WebSocketMessage): void {
    logger.info('Server requested sync');
    syncService.sync({ background: true });
  }

  private setupMessageHandlers(): void {
    // Set up default handlers
    this.onMessage('credential_created', (message) => {
      this.handleCredentialUpdate({ ...message, payload: { ...message.payload, action: 'created' } });
    });

    this.onMessage('credential_updated', (message) => {
      this.handleCredentialUpdate({ ...message, payload: { ...message.payload, action: 'updated' } });
    });

    this.onMessage('credential_deleted', (message) => {
      this.handleCredentialUpdate({ ...message, payload: { ...message.payload, action: 'deleted' } });
    });

    this.onMessage('handshake_created', (message) => {
      this.handleHandshakeUpdate({ ...message, payload: { ...message.payload, action: 'created' } });
    });

    this.onMessage('handshake_updated', (message) => {
      this.handleHandshakeUpdate({ ...message, payload: { ...message.payload, action: 'updated' } });
    });

    this.onMessage('handshake_deleted', (message) => {
      this.handleHandshakeUpdate({ ...message, payload: { ...message.payload, action: 'deleted' } });
    });
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.connection && this.connection.readyState === WebSocket.OPEN) {
        this.send('ping', {});
      }
    }, this.heartbeatInterval);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.warn('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;

    const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);

    logger.info('Scheduling reconnect attempt', {
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      delay
    });

    this.reconnectTimer = setTimeout(() => {
      if (navigator.onLine) {
        this.connect();
      }
    }, delay);
  }

  private notifyConnectionStatus(connected: boolean): void {
    const { addNotification } = useAppStore.getState();

    if (!connected) {
      addNotification({
        type: 'warning',
        title: 'Connection Lost',
        message: 'Real-time updates are currently unavailable. Working in offline mode.'
      });
    } else {
      addNotification({
        type: 'success',
        title: 'Connection Restored',
        message: 'Real-time updates are now active.'
      });
    }
  }

  private getDefaultWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/realtime`;
  }
}

// Create singleton instance
export const websocketService = new WebSocketService({
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000
});

// Initialize WebSocket connection when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    websocketService.connect().catch((error) => {
      logger.error('Failed to connect WebSocket service', error);
    });
  });

  window.addEventListener('offline', () => {
    websocketService.disconnect();
  });

  // Initialize if already online
  if (navigator.onLine) {
    websocketService.connect().catch((error) => {
      logger.error('Failed to connect WebSocket service', error);
    });
  }
}
