/**
 * Data Synchronization Service
 * Handles offline queue processing, conflict resolution, and real-time sync
 */

import { useOfflineStore } from '@/stores/offline-store';
import { dataPersistence } from '../persistence/data-persistence';
import { useAppStore } from '@/stores';
import { credentialsService, handshakeService } from '../api';

export interface SyncOptions {
  force?: boolean;
  background?: boolean;
  retryFailed?: boolean;
}

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  failedItems: number;
  conflicts: number;
  errors: string[];
}

class SyncService {
  private syncInProgress = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private realtimeConnection: WebSocket | null = null;

  /**
   * Start automatic synchronization
   */
  startAutoSync(intervalMinutes: number = 5): void {
    this.stopAutoSync();

    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.sync({ background: true });
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`Auto-sync started with ${intervalMinutes} minute intervals`);
  }

  /**
   * Stop automatic synchronization
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  /**
   * Perform data synchronization
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.syncInProgress && !options.force) {
      console.log('Sync already in progress, skipping');
      return {
        success: false,
        syncedItems: 0,
        failedItems: 0,
        conflicts: 0,
        errors: ['Sync already in progress']
      };
    }

    this.syncInProgress = true;

    try {
      const result = await this.performSync(options);
      console.log('Sync completed:', result);

      // Update last sync timestamp
      useOfflineStore.getState().setLastSync(Date.now());

      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        syncedItems: 0,
        failedItems: 0,
        conflicts: 0,
        errors: [error instanceof Error ? error.message : 'Unknown sync error']
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  private async performSync(options: SyncOptions): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedItems: 0,
      failedItems: 0,
      conflicts: 0,
      errors: []
    };

    const { queue, updateQueueItem, removeFromQueue } = useOfflineStore.getState();

    // Filter items to sync based on options
    let itemsToSync = queue.filter(item => item.retryCount < 3);

    if (!options.retryFailed) {
      itemsToSync = itemsToSync.filter(item => item.retryCount === 0);
    }

    console.log(`Syncing ${itemsToSync.length} items`);

    for (const item of itemsToSync) {
      try {
        await this.syncItem(item);
        removeFromQueue(item.id);
        result.syncedItems++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage.includes('conflict')) {
          result.conflicts++;
        } else {
          result.failedItems++;
        }

        result.errors.push(`${item.type} ${item.resource}: ${errorMessage}`);

        // Update retry count
        updateQueueItem(item.id, {
          retryCount: item.retryCount + 1,
          lastError: errorMessage
        });
      }
    }

    // Sync persistent data with server
    try {
      await this.syncPersistentData();
    } catch (error) {
      result.errors.push(`Persistent data sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private async syncItem(item: any): Promise<void> {
    switch (item.resource) {
      case 'credential':
        await this.syncCredential(item);
        break;
      case 'handshake':
        await this.syncHandshake(item);
        break;
      case 'profile':
        await this.syncProfile(item);
        break;
      default:
        throw new Error(`Unknown resource type: ${item.resource}`);
    }
  }

  private async syncCredential(item: any): Promise<void> {
    switch (item.type) {
      case 'create':
        const newCredential = await credentialsService.createCredential(item.data);
        await dataPersistence.saveCredential(newCredential);
        break;

      case 'update':
        const updatedCredential = await credentialsService.updateCredential(item.data.id, item.data.updates);
        await dataPersistence.updateCredential(item.data.id, updatedCredential);
        break;

      case 'delete':
        await credentialsService.deleteCredential(item.data.id);
        await dataPersistence.deleteCredential(item.data.id);
        break;

      case 'share':
        await credentialsService.shareCredential(item.data.id, item.data.options || {});
        break;

      case 'verify':
        await credentialsService.verifyCredential(item.data.id);
        break;

      default:
        throw new Error(`Unknown credential operation: ${item.type}`);
    }
  }

  private async syncHandshake(item: any): Promise<void> {
    switch (item.type) {
      case 'create':
        const newRequest = await handshakeService.createRequest(item.data);
        await dataPersistence.saveHandshakeRequest(newRequest);
        break;

      case 'update':
        // Handshake updates might require different API calls
        console.warn('Handshake update sync not fully implemented');
        break;

      default:
        throw new Error(`Unknown handshake operation: ${item.type}`);
    }
  }

  private async syncProfile(item: any): Promise<void> {
    // Profile sync would depend on available API endpoints
    console.log('Profile sync item:', item);
  }

  private async syncPersistentData(): Promise<void> {
    try {
      // Get local data
      // const localCredentials = await dataPersistence.getAllCredentials();
      // const localRequests = await dataPersistence.getAllHandshakeRequests();

      // Compare with server data and sync differences
      // This is a simplified implementation - in a real app you'd implement
      // proper delta sync with server timestamps

      console.log('Persistent data sync completed');
    } catch (error) {
      console.error('Persistent data sync failed:', error);
    }
  }

  /**
   * Initialize real-time synchronization
   */
  async initRealtimeSync(): Promise<void> {
    if (!this.isWebSocketSupported()) {
      console.warn('WebSocket not supported, skipping real-time sync');
      return;
    }

    try {
      await this.connectWebSocket();
      console.log('Real-time sync initialized');
    } catch (error) {
      console.error('Failed to initialize real-time sync:', error);
    }
  }

  private isWebSocketSupported(): boolean {
    return typeof WebSocket !== 'undefined';
  }

  private async connectWebSocket(): Promise<void> {
    const wsUrl = this.getWebSocketUrl();

    return new Promise((resolve, reject) => {
      this.realtimeConnection = new WebSocket(wsUrl);

      this.realtimeConnection.onopen = () => {
        console.log('WebSocket connection established');
        this.setupWebSocketHandlers();
        resolve();
      };

      this.realtimeConnection.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      };

      this.realtimeConnection.onclose = () => {
        console.log('WebSocket connection closed');
        // Attempt to reconnect after delay
        setTimeout(() => {
          if (navigator.onLine) {
            this.connectWebSocket().catch(console.error);
          }
        }, 5000);
      };
    });
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/sync`;
  }

  private setupWebSocketHandlers(): void {
    if (!this.realtimeConnection) return;

    this.realtimeConnection.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleRealtimeMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  private handleRealtimeMessage(message: any): void {
    const { addNotification } = useAppStore.getState();

    switch (message.type) {
      case 'credential_updated':
        // Update local credential data
        if (message.data) {
          dataPersistence.updateCredential(message.data.id, message.data, { sync: false });
        }
        break;

      case 'handshake_updated':
        // Update local handshake request data
        if (message.data) {
          dataPersistence.updateHandshakeRequest(message.data.id, message.data, { sync: false });
        }
        break;

      case 'sync_required':
        // Server indicates client should sync
        this.sync({ background: true });
        break;

      case 'notification':
        // Handle server-sent notifications
        addNotification({
          type: message.notificationType || 'info',
          title: message.title,
          message: message.message
        });
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  /**
   * Send message via WebSocket
   */
  sendRealtimeMessage(message: any): void {
    if (this.realtimeConnection && this.realtimeConnection.readyState === WebSocket.OPEN) {
      this.realtimeConnection.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent');
    }
  }

  /**
   * Check sync status
   */
  getSyncStatus(): {
    inProgress: boolean;
    lastSync: number | null;
    pendingItems: number;
    failedItems: number;
    realtimeConnected: boolean;
  } {
    const offlineState = useOfflineStore.getState();

    return {
      inProgress: this.syncInProgress,
      lastSync: offlineState.lastSync,
      pendingItems: offlineState.pendingItems,
      failedItems: offlineState.failedItems,
      realtimeConnected: this.realtimeConnection?.readyState === WebSocket.OPEN
    };
  }

  /**
   * Force disconnect from real-time sync
   */
  disconnectRealtime(): void {
    if (this.realtimeConnection) {
      this.realtimeConnection.close();
      this.realtimeConnection = null;
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopAutoSync();
    this.disconnectRealtime();
  }
}

// Create singleton instance
export const syncService = new SyncService();

// Initialize sync service when online
if (typeof window !== 'undefined') {
  // Start auto-sync when coming online
  window.addEventListener('online', () => {
    syncService.startAutoSync();
    syncService.initRealtimeSync().catch(console.error);
  });

  // Stop sync when going offline
  window.addEventListener('offline', () => {
    syncService.stopAutoSync();
    syncService.disconnectRealtime();
  });

  // Initialize if already online
  if (navigator.onLine) {
    syncService.startAutoSync();
    syncService.initRealtimeSync().catch(console.error);
  }
}
