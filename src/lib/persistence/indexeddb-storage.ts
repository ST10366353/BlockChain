/**
 * IndexedDB Storage Service
 * Provides enhanced data persistence with IndexedDB as primary storage
 * Falls back to localStorage for unsupported environments
 */

interface StorageOptions {
  dbName?: string;
  version?: number;
  stores?: string[];
}

interface StorageItem<T = any> {
  id: string;
  data: T;
  timestamp: number;
  version: number;
  ttl?: number; // Time to live in milliseconds
}

class IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;
  private stores: string[];
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor(options: StorageOptions = {}) {
    this.dbName = options.dbName || 'IdentityVaultDB';
    this.version = options.version || 1;
    this.stores = options.stores || ['credentials', 'handshake', 'profile', 'cache'];
  }

  /**
   * Initialize IndexedDB database
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.initializeDB();
    return this.initPromise;
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if IndexedDB is supported
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported, falling back to localStorage');
        this.initialized = true;
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB initialization failed:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.db = db;

        // Create object stores
        this.stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });

            // Create indexes for better query performance
            if (storeName === 'credentials') {
              store.createIndex('type', 'data.type', { unique: false });
              store.createIndex('status', 'data.status', { unique: false });
              store.createIndex('issuer', 'data.issuer', { unique: false });
              store.createIndex('timestamp', 'timestamp', { unique: false });
            }

            if (storeName === 'handshake') {
              store.createIndex('status', 'data.status', { unique: false });
              store.createIndex('requester', 'data.requester', { unique: false });
              store.createIndex('timestamp', 'timestamp', { unique: false });
            }

            if (storeName === 'cache') {
              store.createIndex('key', 'data.key', { unique: true });
              store.createIndex('expires', 'data.expires', { unique: false });
            }
          }
        });
      };
    });
  }

  /**
   * Check if IndexedDB is available and initialized
   */
  isAvailable(): boolean {
    return this.initialized && !!this.db;
  }

  /**
   * Store data in IndexedDB
   */
  async set<T>(storeName: string, id: string, data: T, options: { ttl?: number; version?: number } = {}): Promise<void> {
    await this.init();

    if (!this.isAvailable()) {
      return this.fallbackStorage.set(storeName, id, data);
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const item: StorageItem<T> = {
        id,
        data,
        timestamp: Date.now(),
        version: options.version || 1,
        ttl: options.ttl
      };

      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve data from IndexedDB
   */
  async get<T>(storeName: string, id: string): Promise<T | null> {
    await this.init();

    if (!this.isAvailable()) {
      return this.fallbackStorage.get<T>(storeName, id);
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as StorageItem<T> | undefined;

        if (!result) {
          resolve(null);
          return;
        }

        // Check TTL
        if (result.ttl && Date.now() > result.timestamp + result.ttl) {
          // Item expired, delete it
          this.delete(storeName, id);
          resolve(null);
          return;
        }

        resolve(result.data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete data from IndexedDB
   */
  async delete(storeName: string, id: string): Promise<void> {
    await this.init();

    if (!this.isAvailable()) {
      return this.fallbackStorage.delete(storeName, id);
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all items from a store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    await this.init();

    if (!this.isAvailable()) {
      return this.fallbackStorage.getAll<T>(storeName);
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as StorageItem<T>[];
        const validResults = results
          .filter(item => {
            // Check TTL
            if (item.ttl && Date.now() > item.timestamp + item.ttl) {
              // Item expired, delete it
              this.delete(storeName, item.id);
              return false;
            }
            return true;
          })
          .map(item => item.data);

        resolve(validResults);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Query items with index
   */
  async query<T>(
    storeName: string,
    indexName: string,
    value: any,
    options: { limit?: number; offset?: number } = {}
  ): Promise<T[]> {
    await this.init();

    if (!this.isAvailable()) {
      return this.fallbackStorage.query<T>(storeName, indexName, value);
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        const results = request.result as StorageItem<T>[];
        let validResults = results
          .filter(item => {
            // Check TTL
            if (item.ttl && Date.now() > item.timestamp + item.ttl) {
              this.delete(storeName, item.id);
              return false;
            }
            return true;
          })
          .map(item => item.data);

        // Apply pagination
        if (options.offset) {
          validResults = validResults.slice(options.offset);
        }
        if (options.limit) {
          validResults = validResults.slice(0, options.limit);
        }

        resolve(validResults);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data from a store
   */
  async clear(storeName: string): Promise<void> {
    await this.init();

    if (!this.isAvailable()) {
      return this.fallbackStorage.clear(storeName);
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    stores: string[];
    totalItems: number;
    storageSize: number;
    lastModified: number;
  }> {
    await this.init();

    if (!this.isAvailable()) {
      return this.fallbackStorage.getStats();
    }

    const stats = {
      stores: this.stores,
      totalItems: 0,
      storageSize: 0,
      lastModified: 0
    };

    for (const storeName of this.stores) {
      const items = await this.getAll(storeName);
      stats.totalItems += items.length;

      // Estimate storage size (rough calculation)
      const itemsSize = JSON.stringify(items).length;
      stats.storageSize += itemsSize;
    }

    return stats;
  }

  /**
   * Fallback storage using localStorage
   */
  private fallbackStorage = {
    set: <T>(storeName: string, id: string, data: T): void => {
      try {
        const key = `idvault_${storeName}_${id}`;
        const item: StorageItem<T> = {
          id,
          data,
          timestamp: Date.now(),
          version: 1
        };
        localStorage.setItem(key, JSON.stringify(item));
      } catch (error) {
        console.error('Fallback storage set failed:', error);
      }
    },

    get: <T>(storeName: string, id: string): T | null => {
      try {
        const key = `idvault_${storeName}_${id}`;
        const item = localStorage.getItem(key);
        if (!item) return null;

        const parsed = JSON.parse(item) as StorageItem<T>;
        return parsed.data;
      } catch (error) {
        console.error('Fallback storage get failed:', error);
        return null;
      }
    },

    delete: (storeName: string, id: string): void => {
      try {
        const key = `idvault_${storeName}_${id}`;
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Fallback storage delete failed:', error);
      }
    },

    getAll: <T>(storeName: string): T[] => {
      try {
        const results: T[] = [];
        const prefix = `idvault_${storeName}_`;

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item) as StorageItem<T>;
              results.push(parsed.data);
            }
          }
        }

        return results;
      } catch (error) {
        console.error('Fallback storage getAll failed:', error);
        return [];
      }
    },

    query: <T>(storeName: string, indexName: string, value: any): T[] => {
      // Simple implementation - in real app, you'd need to maintain indexes
      const allItems = this.fallbackStorage.getAll<T>(storeName);
      return allItems.filter(item => (item as any)[indexName] === value);
    },

    clear: (storeName: string): void => {
      try {
        const prefix = `idvault_${storeName}_`;
        const keysToDelete: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            keysToDelete.push(key);
          }
        }

        keysToDelete.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.error('Fallback storage clear failed:', error);
      }
    },

    getStats: () => ({
      stores: ['fallback'],
      totalItems: 0,
      storageSize: 0,
      lastModified: Date.now()
    })
  };
}

// Create singleton instance
export const indexedDBStorage = new IndexedDBStorage({
  dbName: 'IdentityVaultDB',
  version: 1,
  stores: ['credentials', 'handshake', 'profile', 'cache', 'sync']
});

// Export types
export type { StorageOptions, StorageItem };
