/**
 * Offline Queue Manager
 * Enhanced queue management with persistence and conflict resolution
 */

import { useOfflineStore } from '@/stores/offline-store';
import { dataPersistence } from '../persistence/data-persistence';
// import { syncService } from '../sync/sync-service'; // Commented out - not currently used

export interface QueueItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'share' | 'verify';
  resource: 'credential' | 'handshake' | 'profile';
  data: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[]; // IDs of items this depends on
  version?: number;
  originalData?: any;
}

export interface QueueOptions {
  priority?: 'high' | 'medium' | 'low';
  dependencies?: string[];
  immediate?: boolean;
  background?: boolean;
}

class QueueManager {
  private processing = false;
  // private processingQueue: QueueItem[] = []; // Not currently used
  private maxRetries = 3;
  private retryDelay = 1000; // Base delay in milliseconds

  /**
   * Add item to offline queue
   */
  async addToQueue(
    type: QueueItem['type'],
    resource: QueueItem['resource'],
    data: any,
    options: QueueOptions = {}
  ): Promise<string> {
    const item: QueueItem = {
      id: this.generateId(),
      type,
      resource,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      priority: options.priority || 'medium',
      dependencies: options.dependencies,
      version: data.version || 1,
      originalData: data.originalData
    };

    // Add to offline store
    const { addToQueue } = useOfflineStore.getState();
    addToQueue({
      type: item.type,
      resource: item.resource,
      data: item.data,
      version: item.version,
      originalData: item.originalData
    });

    // Also persist locally for backup
    await dataPersistence.setCache(`queue_${item.id}`, item, { ttl: 24 * 60 * 60 * 1000 }); // 24 hours

    console.log(`Added ${type} ${resource} to offline queue:`, item.id);

    // Process immediately if requested and online
    if (options.immediate && navigator.onLine) {
      this.processQueueItem(item);
    }

    // Process in background if requested
    if (options.background) {
      setTimeout(() => this.processQueue(), 100);
    }

    return item.id;
  }

  /**
   * Process offline queue
   */
  async processQueue(): Promise<void> {
    if (this.processing || !navigator.onLine) {
      return;
    }

    this.processing = true;

    try {
      const { queue, removeFromQueue } = useOfflineStore.getState();

      // Sort by priority and timestamp
      const sortedQueue = this.sortQueue(queue);

      for (const item of sortedQueue) {
        if (!navigator.onLine) break;

        try {
          await this.processQueueItem(item);
          removeFromQueue(item.id);
          await dataPersistence.setCache(`queue_${item.id}`, null); // Remove from cache
        } catch (error) {
          await this.handleQueueError(item, error);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process individual queue item
   */
  private async processQueueItem(item: QueueItem): Promise<void> {
    // Check dependencies
    if (item.dependencies && item.dependencies.length > 0) {
      const dependenciesMet = await this.checkDependencies(item.dependencies);
      if (!dependenciesMet) {
        throw new Error('Dependencies not met');
      }
    }

    // Process based on resource type
    switch (item.resource) {
      case 'credential':
        await this.processCredentialItem(item);
        break;
      case 'handshake':
        await this.processHandshakeItem(item);
        break;
      case 'profile':
        await this.processProfileItem(item);
        break;
      default:
        throw new Error(`Unknown resource type: ${item.resource}`);
    }
  }

  private async processCredentialItem(item: QueueItem): Promise<void> {
    const { credentialsService } = await import('../api/credentials-service');

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

  private async processHandshakeItem(item: QueueItem): Promise<void> {
    const { handshakeService } = await import('../api/handshake-service');

    switch (item.type) {
      case 'create':
        const newRequest = await handshakeService.createRequest(item.data);
        await dataPersistence.saveHandshakeRequest(newRequest);
        break;

      case 'update':
        // Handshake updates might require different handling
        console.warn('Handshake update processing not fully implemented');
        break;

      default:
        throw new Error(`Unknown handshake operation: ${item.type}`);
    }
  }

  private async processProfileItem(item: QueueItem): Promise<void> {
    const { authService } = await import('../api/auth-service');

    switch (item.type) {
      case 'update':
        await authService.updateProfile(item.data);
        await dataPersistence.saveProfileData('profile', item.data);
        break;

      default:
        throw new Error(`Unknown profile operation: ${item.type}`);
    }
  }

  /**
   * Handle queue processing errors
   */
  private async handleQueueError(item: QueueItem, error: any): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const { updateQueueItem } = useOfflineStore.getState();

    if (item.retryCount < this.maxRetries) {
      // Increment retry count and schedule retry
      updateQueueItem(item.id, {
        retryCount: item.retryCount + 1,
        lastError: errorMessage
      });

      // Schedule retry with exponential backoff
      const delay = this.retryDelay * Math.pow(2, item.retryCount);
      setTimeout(() => {
        this.processQueueItem(item);
      }, delay);
    } else {
      // Mark as failed
      updateQueueItem(item.id, {
        retryCount: item.retryCount + 1,
        lastError: `Max retries exceeded: ${errorMessage}`
      });

      // Notify user of failed operation
      const { addNotification } = (await import('@/stores')).useAppStore.getState();
      addNotification({
        type: 'error',
        title: 'Offline Operation Failed',
        message: `${item.type} ${item.resource} operation failed after ${this.maxRetries} attempts.`
      });
    }
  }

  /**
   * Check if dependencies are met
   */
  private async checkDependencies(dependencyIds: string[]): Promise<boolean> {
    const { queue } = useOfflineStore.getState();

    for (const depId of dependencyIds) {
      // Check if dependency exists in queue
      const dependency = queue.find(item => item.id === depId);
      if (!dependency) {
        // If not in queue, check if it exists in persistent storage
        const exists = await this.checkDependencyInStorage(depId);
        if (!exists) {
          return false;
        }
      }
    }

    return true;
  }

  private async checkDependencyInStorage(depId: string): Promise<boolean> {
    // Check in local storage
    const cached = await dataPersistence.getCache(`queue_${depId}`);
    return !!cached;
  }

  /**
   * Sort queue by priority and timestamp
   */
  private sortQueue(queue: QueueItem[]): QueueItem[] {
    const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };

    return queue.sort((a, b) => {
      // Sort by priority first
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;

      // Then by timestamp (older first)
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Retry failed items
   */
  async retryFailedItems(): Promise<void> {
    const { queue, updateQueueItem } = useOfflineStore.getState();

    const failedItems = queue.filter(item => item.retryCount >= this.maxRetries);

    for (const item of failedItems) {
      updateQueueItem(item.id, { retryCount: 0, lastError: undefined });
    }

    if (failedItems.length > 0) {
      await this.processQueue();
    }
  }

  /**
   * Clear completed items from queue
   */
  async clearCompletedItems(): Promise<void> {
    const { queue, removeFromQueue } = useOfflineStore.getState();

    const completedItems = queue.filter(item => item.retryCount === 0 && !item.lastError);

    for (const item of completedItems) {
      removeFromQueue(item.id);
      await dataPersistence.setCache(`queue_${item.id}`, null);
    }
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): {
    total: number;
    pending: number;
    failed: number;
    processing: boolean;
    byPriority: Record<string, number>;
    byResource: Record<string, number>;
  } {
    const { queue } = useOfflineStore.getState();

    const stats = {
      total: queue.length,
      pending: queue.filter(item => item.retryCount === 0).length,
      failed: queue.filter(item => item.retryCount >= this.maxRetries).length,
      processing: this.processing,
      byPriority: {} as Record<string, number>,
      byResource: {} as Record<string, number>
    };

    queue.forEach(item => {
      const priority = item.priority as keyof typeof stats.byPriority;
      const resource = item.resource as keyof typeof stats.byResource;

      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
      stats.byResource[resource] = (stats.byResource[resource] || 0) + 1;
    });

    return stats;
  }

  /**
   * Bulk operations
   */
  async addBulkToQueue(items: Array<{
    type: QueueItem['type'];
    resource: QueueItem['resource'];
    data: any;
    options?: QueueOptions;
  }>): Promise<string[]> {
    const ids: string[] = [];

    for (const item of items) {
      const id = await this.addToQueue(item.type, item.resource, item.data, item.options);
      ids.push(id);
    }

    return ids;
  }

  /**
   * Remove items from queue
   */
  async removeFromQueue(ids: string[]): Promise<void> {
    const { removeFromQueue } = useOfflineStore.getState();

    for (const id of ids) {
      removeFromQueue(id);
      await dataPersistence.setCache(`queue_${id}`, null);
    }
  }

  /**
   * Generate unique ID for queue items
   */
  private generateId(): string {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize queue manager
   */
  async initialize(): Promise<void> {
    // Restore queue from persistent storage if available
    await this.restoreQueueFromStorage();

    // Set up online/offline listeners
    window.addEventListener('online', () => {
      console.log('Back online, processing offline queue');
      this.processQueue();
    });

    console.log('Queue manager initialized');
  }

  /**
   * Restore queue from persistent storage
   */
  private async restoreQueueFromStorage(): Promise<void> {
    try {
      const cacheKeys = await dataPersistence.getCache('queue_keys') || [];
      const restoredItems: any[] = [];

      for (const key of cacheKeys) {
        const item = await dataPersistence.getCache(key);
        if (item) {
          restoredItems.push(item);
        }
      }

      if (restoredItems.length > 0) {
        console.log(`Restored ${restoredItems.length} items from persistent storage`);
      }
    } catch (error) {
      console.error('Failed to restore queue from storage:', error);
    }
  }
}

// Create singleton instance
export const queueManager = new QueueManager();

// Initialize queue manager
if (typeof window !== 'undefined') {
  queueManager.initialize().catch(console.error);
}
