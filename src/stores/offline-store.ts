import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { credentialsService } from '@/lib/api/credentials-service';
import { handshakeService } from '@/lib/api/handshake-service';
import { authService } from '@/lib/api/auth-service';
import { useAppStore } from './app-store';
import { isOnline } from '../lib/utils/network';
import { logger } from '../lib/logger';

// Offline Queue Item
interface QueueItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'share' | 'verify';
  resource: 'credential' | 'handshake' | 'profile';
  data: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
  priority: 'high' | 'medium' | 'low';
  version?: number; // For conflict resolution
  originalData?: any; // Store original data for conflict resolution
}

// Sync Status
interface SyncStatus {
  isOnline: boolean;
  lastSync: number | null;
  pendingItems: number;
  failedItems: number;
}

// Conflict Resolution
interface ConflictResolution {
  type: 'local-wins' | 'remote-wins' | 'merge' | 'manual';
  resolvedData?: any;
}

interface ConflictData {
  localData: any;
  remoteData: any;
  conflictType: 'version' | 'data' | 'content' | 'deletion';
  resourceId: string;
  timestamp: number;
}

// Offline Store State
interface OfflineState extends SyncStatus {
  queue: QueueItem[];
  isProcessingQueue: boolean;

  // Actions
  setOnline: (online: boolean) => void;
        addToQueue: (item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount' | 'priority'>) => void;
  removeFromQueue: (id: string) => void;
  updateQueueItem: (id: string, updates: Partial<QueueItem>) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
  retryFailedItems: () => Promise<void>;
  setLastSync: (timestamp: number) => void;
  setProcessingQueue: (processing: boolean) => void;
}

// Create the offline store
export const useOfflineStore = create<OfflineState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state - use navigator.onLine as fallback for SSR safety
        isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
        lastSync: null,
        pendingItems: 0,
        failedItems: 0,
        queue: [],
        isProcessingQueue: false,

        // Actions
        setOnline: (online) =>
          set((state) => ({
            isOnline: online,
            pendingItems: state.queue.length,
          })),

        addToQueue: (item) => {
          const queueItem: QueueItem = {
            ...item,
            id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            retryCount: 0,
            priority: 'medium', // Default priority
          };

          set((state) => ({
            queue: [...state.queue, queueItem],
            pendingItems: state.queue.length + 1,
          }));
        },

        removeFromQueue: (id) =>
          set((state) => {
            const filteredQueue = state.queue.filter((item) => item.id !== id);
            const failedItems = filteredQueue.filter((item) => item.retryCount >= 3).length;

            return {
              queue: filteredQueue,
              pendingItems: filteredQueue.length,
              failedItems,
            };
          }),

        updateQueueItem: (id, updates) =>
          set((state) => {
            const updatedQueue = state.queue.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            );
            const failedItems = updatedQueue.filter((item) => item.retryCount >= 3).length;

            return {
              queue: updatedQueue,
              failedItems,
            };
          }),

        processQueue: async () => {
          const state = get();
          if (!state.isOnline || state.isProcessingQueue || state.queue.length === 0) {
            return;
          }

          set({ isProcessingQueue: true });

          try {
            // Process items that haven't failed too many times
            const itemsToProcess = state.queue.filter((item) => item.retryCount < 3);

            for (const item of itemsToProcess) {
              try {
                await processQueueItem(item);

                // Remove successful item from queue
                get().removeFromQueue(item.id);
              } catch (error) {
                // Check if it's a conflict error
                if (error instanceof Error && error.message.includes('conflict')) {
                  await handleConflict(item, error);
                } else {
                  // Increment retry count and update error
                  get().updateQueueItem(item.id, {
                    retryCount: item.retryCount + 1,
                    lastError: error instanceof Error ? error.message : 'Unknown error',
                  });
                }
              }
            }

            // Update last sync time
            set({ lastSync: Date.now() });
          } finally {
            set({ isProcessingQueue: false });
          }
        },

        clearQueue: () => set({ queue: [], pendingItems: 0, failedItems: 0 }),

        retryFailedItems: async () => {
          const state = get();
          const failedItems = state.queue.filter((item) => item.retryCount >= 3);

          for (const item of failedItems) {
            get().updateQueueItem(item.id, { retryCount: 0, lastError: undefined });
          }

          // Process the retried items
          await get().processQueue();
        },

        setLastSync: (timestamp) => set({ lastSync: timestamp }),

        setProcessingQueue: (processing) => set({ isProcessingQueue: processing }),
      }),
      {
        name: 'offline-store',
        partialize: (state) => ({
          lastSync: state.lastSync,
          queue: state.queue,
        }),
      }
    ),
    {
      name: 'offline-store',
    }
  )
);

// Process individual queue item with real API calls
async function processQueueItem(item: QueueItem): Promise<void> {
  const { addCredential, updateCredential, removeCredential, addNotification } = useAppStore.getState();

  switch (item.resource) {
    case 'credential':
      await processCredentialOperation(item, addCredential, updateCredential, removeCredential);
      break;
    case 'handshake':
      await processHandshakeOperation(item);
      break;
    case 'profile':
      await processProfileOperation(item);
      break;
    default:
      throw new Error(`Unknown resource type: ${item.resource}`);
  }

  // Add success notification
  addNotification({
    type: 'success',
    title: 'Offline Operation Synced',
    message: `${item.type} operation for ${item.resource} has been synced successfully.`
  });
}

async function processCredentialOperation(
  item: QueueItem,
  addCredential: any,
  updateCredential: any,
  removeCredential: any
): Promise<void> {
  switch (item.type) {
    case 'create':
      const newCredential = await credentialsService.createCredential(item.data);
      addCredential(newCredential);
      break;

    case 'update':
      const updatedCredential = await credentialsService.updateCredential(item.data.id, item.data.updates);
      updateCredential(updatedCredential.id, updatedCredential);
      break;

    case 'delete':
      await credentialsService.deleteCredential(item.data.id);
      removeCredential(item.data.id);
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

async function processHandshakeOperation(item: QueueItem): Promise<void> {
  switch (item.type) {
    case 'create':
      await handshakeService.createRequest(item.data);
      break;
    case 'update':
      // Update not supported by handshake API - could use respondToRequest for status updates
      logger.warn('Handshake update not implemented in offline sync');
      break;
    default:
      throw new Error(`Unknown handshake operation: ${item.type}`);
  }
}

async function processProfileOperation(item: QueueItem): Promise<void> {
  switch (item.type) {
    case 'update':
      await authService.updateProfile(item.data);
      break;
    default:
      throw new Error(`Unknown profile operation: ${item.type}`);
  }
}

async function handleConflict(item: QueueItem, error: Error): Promise<void> {
  // Extract conflict information from error
  const conflictData = parseConflictError(error);

  // Apply automatic conflict resolution based on strategy
  const resolution = await resolveConflict(conflictData);

  // If resolution requires manual intervention, add to failed items
  if (resolution.type === 'manual') {
    useOfflineStore.getState().updateQueueItem(item.id, {
      retryCount: 3, // Mark as failed
      lastError: 'Conflict requires manual resolution'
    });

    // Notify user about conflict
    const { addNotification } = useAppStore.getState();
    addNotification({
      type: 'warning',
      title: 'Sync Conflict Detected',
      message: `A conflict was detected for ${item.resource}. Please resolve manually.`
    });
  } else {
    // Apply resolved data
    await applyConflictResolution(item, resolution);
  }
}

function parseConflictError(error: Error): ConflictData {
  // Parse conflict information from error message or response
  // This would depend on how the API returns conflict information
  let localData = {};
  let remoteData = {};
  let resourceId = '';
  let conflictType: 'version' | 'content' | 'deletion' = 'version';

  // Try to extract conflict information from error message
  if (error.message.includes('version conflict')) {
    conflictType = 'version';
  } else if (error.message.includes('content conflict')) {
    conflictType = 'content';
  } else if (error.message.includes('deletion conflict')) {
    conflictType = 'deletion';
  }

  // Try to extract resource ID from error message
  const resourceMatch = error.message.match(/resource[:\s]+([a-zA-Z0-9-]+)/i);
  if (resourceMatch) {
    resourceId = resourceMatch[1];
  }

  return {
    localData,
    remoteData,
    conflictType,
    resourceId,
    timestamp: Date.now()
  };
}

async function resolveConflict(_conflictData: ConflictData): Promise<ConflictResolution> {
  // Implement automatic conflict resolution strategies
  // For now, default to local-wins strategy
  return {
    type: 'local-wins'
  };
}

async function applyConflictResolution(item: QueueItem, resolution: ConflictResolution): Promise<void> {
  // Apply the resolved data based on resolution strategy
  switch (resolution.type) {
    case 'local-wins':
      await processQueueItem(item);
      break;
    case 'remote-wins':
      // Skip local changes, remote data takes precedence
      break;
    case 'merge':
      // Merge local and remote data
      if (resolution.resolvedData) {
        const mergedItem = { ...item, data: resolution.resolvedData };
        await processQueueItem(mergedItem);
      }
      break;
  }
}

// Selectors with proper typing
interface OfflineStatus {
  isOnline: boolean;
  lastSync: number | null;
  pendingItems: number;
  failedItems: number;
  isProcessingQueue: boolean;
}

// Stable selector that prevents infinite re-renders
export const useOfflineStatus = (): OfflineStatus => {
  const state = useOfflineStore();

  return {
    isOnline: state.isOnline,
    lastSync: state.lastSync,
    pendingItems: state.pendingItems,
    failedItems: state.failedItems,
    isProcessingQueue: state.isProcessingQueue,
  };
};

export const useOfflineQueue = (): QueueItem[] => useOfflineStore((state) => state.queue);

// Stable function selectors to prevent unnecessary re-renders
export const useProcessQueue = () => useOfflineStore((state) => state.processQueue);
export const useRetryFailedItems = () => useOfflineStore((state) => state.retryFailedItems);

// Network status listener with debouncing to prevent infinite loops
if (typeof window !== 'undefined') {
  let onlineTimeout: NodeJS.Timeout | null = null;

  window.addEventListener('online', () => {
    // Debounce the online event to prevent rapid firing
    if (onlineTimeout) clearTimeout(onlineTimeout);

    onlineTimeout = setTimeout(() => {
      const store = useOfflineStore.getState();
      if (!store.isOnline) {
        store.setOnline(true);
        // Automatically process queue when coming online (debounced)
        setTimeout(() => {
          if (isOnline()) { // Double check we're still online
            store.processQueue();
          }
        }, 100);
      }
      onlineTimeout = null;
    }, 100);
  });

  window.addEventListener('offline', () => {
    // Clear any pending online timeout
    if (onlineTimeout) {
      clearTimeout(onlineTimeout);
      onlineTimeout = null;
    }

    const store = useOfflineStore.getState();
    if (store.isOnline) {
      store.setOnline(false);
    }
  });
}
