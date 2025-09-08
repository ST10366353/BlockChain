import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Offline Queue Item
interface QueueItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'share' | 'verify';
  resource: 'credential' | 'handshake' | 'profile';
  data: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

// Sync Status
interface SyncStatus {
  isOnline: boolean;
  lastSync: number | null;
  pendingItems: number;
  failedItems: number;
}

// Offline Store State
interface OfflineState extends SyncStatus {
  queue: QueueItem[];
  isProcessingQueue: boolean;

  // Actions
  setOnline: (online: boolean) => void;
  addToQueue: (item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>) => void;
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
        // Initial state
        isOnline: navigator.onLine,
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
                // Here you would make the actual API call based on item.type and item.resource
                // For now, we'll simulate success/failure
                await simulateApiCall(item);

                // Remove successful item from queue
                get().removeFromQueue(item.id);
              } catch (error) {
                // Increment retry count and update error
                get().updateQueueItem(item.id, {
                  retryCount: item.retryCount + 1,
                  lastError: error instanceof Error ? error.message : 'Unknown error',
                });
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

// Simulate API call for demonstration
async function simulateApiCall(item: QueueItem): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate random failure (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Network error');
  }

  // Simulate successful API call
  console.log(`Processed ${item.type} operation for ${item.resource}:`, item.data);
}

// Selectors
export const useOfflineStatus = () => useOfflineStore((state) => ({
  isOnline: state.isOnline,
  lastSync: state.lastSync,
  pendingItems: state.pendingItems,
  failedItems: state.failedItems,
  isProcessingQueue: state.isProcessingQueue,
}));

export const useOfflineQueue = () => useOfflineStore((state) => state.queue);

// Network status listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.getState().setOnline(true);
    // Automatically process queue when coming online
    useOfflineStore.getState().processQueue();
  });

  window.addEventListener('offline', () => {
    useOfflineStore.getState().setOnline(false);
  });
}
