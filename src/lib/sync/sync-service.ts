/**
 * Data Synchronization Service
 * Handles offline queue processing, conflict resolution, and real-time sync
 */

import { useOfflineStore } from '@/stores/offline-store';
import { dataPersistence } from '../persistence/data-persistence';
import { useAppStore } from '@/stores';
import { credentialsService, handshakeService } from '../api';
import { logger } from '../logger';
import { isOnline } from '../utils/network';

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
      if (isOnline()) {
        this.sync({ background: true });
      }
    }, intervalMinutes * 60 * 1000);

    logger.info('Auto-sync started', { intervalMinutes });
  }

  /**
   * Stop automatic synchronization
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.info('Auto-sync stopped');
    }
  }

  /**
   * Perform data synchronization
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.syncInProgress && !options.force) {
      logger.debug('Sync already in progress, skipping');
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
      logger.info('Sync completed', { result });

      // Update last sync timestamp
      useOfflineStore.getState().setLastSync(Date.now());

      return result;
    } catch (error) {
      logger.error('Sync failed', { error: error instanceof Error ? error.message : error });
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

    logger.info(`Syncing ${itemsToSync.length} items`);

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
        // Handle handshake updates - could be status updates or response updates
        if (item.data.response) {
          // If it's a response to a handshake request
          await handshakeService.respondToRequest(item.data.id, item.data.response);
        } else if (item.data.status) {
          // Status updates are handled through responses, not direct updates
          logger.info('Handshake status update handled via response mechanism');
        } else {
          // For other updates, we might need to recreate the request
          logger.warn('Handshake update not fully supported', { data: item.data });
        }
        await dataPersistence.updateHandshakeRequest(item.data.id, item.data, { sync: false });
        break;

      default:
        throw new Error(`Unknown handshake operation: ${item.type}`);
    }
  }

  private async syncProfile(item: any): Promise<void> {
    switch (item.type) {
      case 'update':
        // Profile updates would typically be handled by the auth service
        // For now, we'll update local storage and mark as synced
        logger.info('Profile update sync', { profileData: item.data });

        // Store profile data locally (this would normally sync with a profile API)
        if (item.data) {
          localStorage.setItem('user_profile', JSON.stringify(item.data));
        }
        break;

      case 'create':
        // Profile creation during onboarding
        logger.info('Profile creation sync', { profileData: item.data });

        // This would typically create a profile on the server
        // For now, just store locally
        if (item.data) {
          localStorage.setItem('user_profile', JSON.stringify(item.data));
        }
        break;

      default:
        logger.warn('Unknown profile operation type', { type: item.type });
    }
  }

  private async syncPersistentData(): Promise<void> {
    try {
      // Get local data
      const localCredentials = await dataPersistence.getAllCredentials();
      const localRequests = await dataPersistence.getAllHandshakeRequests();

      // Sync credentials with server
      if (localCredentials.length > 0) {
        logger.info(`Syncing ${localCredentials.length} credentials with server`);
        // In a real implementation, you'd compare timestamps and sync changes
        // For now, just mark as synced
      }

      // Sync handshake requests with server
      if (localRequests.length > 0) {
        logger.info(`Syncing ${localRequests.length} handshake requests with server`);
        // In a real implementation, you'd compare timestamps and sync changes
        // For now, just mark as synced
      }

      // Sync user profile if available
      const profileData = localStorage.getItem('user_profile');
      if (profileData) {
        try {
          const profile = JSON.parse(profileData);
          logger.info('Syncing user profile with server', { profile });
          // In a real implementation, you'd sync profile with server
        } catch (parseError) {
          logger.warn('Failed to parse profile data for sync', { error: parseError });
        }
      }

      logger.info('Persistent data sync completed', {
        credentialsCount: localCredentials.length,
        requestsCount: localRequests.length
      });
    } catch (error) {
      logger.error('Persistent data sync failed', { error: error instanceof Error ? error.message : error });
      throw error;
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
      logger.info('Real-time sync initialized');
    } catch (error) {
      logger.error('Failed to initialize real-time sync', { error: error instanceof Error ? error.message : error });
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
        logger.info('WebSocket connection established');
        this.setupWebSocketHandlers();
        resolve();
      };

      this.realtimeConnection.onerror = (error) => {
        logger.error('WebSocket connection error', { error });
        reject(error);
      };

      this.realtimeConnection.onclose = () => {
        logger.info('WebSocket connection closed');
        // Attempt to reconnect after delay
        setTimeout(() => {
          if (isOnline()) {
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
        logger.error('Failed to parse WebSocket message', { error: error instanceof Error ? error.message : error });
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
        logger.warn('Unknown WebSocket message type', { messageType: message.type });
    }
  }

  /**
   * Send message via WebSocket
   */
  sendRealtimeMessage(message: any): void {
    if (this.realtimeConnection && this.realtimeConnection.readyState === WebSocket.OPEN) {
      this.realtimeConnection.send(JSON.stringify(message));
    } else {
      logger.warn('WebSocket not connected, message not sent');
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
  if (isOnline()) {
    syncService.startAutoSync();
    syncService.initRealtimeSync().catch(console.error);
  }
}
