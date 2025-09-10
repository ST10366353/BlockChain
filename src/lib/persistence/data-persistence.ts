/**
 * Data Persistence Service
 * Provides a unified interface for data persistence across different storage backends
 * Supports IndexedDB as primary storage with localStorage fallback
 */

import { indexedDBStorage } from './indexeddb-storage';
import { useAppStore } from '@/stores';
import { logger } from '../logger';
import { Credential } from '@/lib/api/credentials-service';
import { HandshakeRequest } from '@/lib/api/handshake-service';

export interface PersistenceOptions {
  sync?: boolean;
  ttl?: number;
  version?: number;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

class DataPersistenceService {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await indexedDBStorage.init();
      this.initialized = true;
      logger.info('Data persistence service initialized');
    } catch (error) {
      logger.error('Failed to initialize data persistence', error);
    }
  }

  // Credentials persistence
  async saveCredential(credential: Credential, options: PersistenceOptions = {}): Promise<void> {
    await this.init();

    try {
      await indexedDBStorage.set('credentials', credential.id, credential, {
        ttl: options.ttl,
        version: options.version || 1
      });

      // Update the app store if sync is enabled
      if (options.sync !== false) {
        try {
          const { addCredential } = useAppStore.getState();
          addCredential(credential);
        } catch (storeError) {
          logger.warn('Failed to sync credential to app store', undefined, storeError);
          // Don't throw - persistence succeeded even if store sync failed
        }
      }
    } catch (error) {
      logger.error('Failed to save credential', error);
      throw error;
    }
  }

  async getCredential(id: string): Promise<Credential | null> {
    await this.init();

    try {
      return await indexedDBStorage.get<Credential>('credentials', id);
    } catch (error) {
      logger.error('Failed to get credential', error);
      return null;
    }
  }

  async getAllCredentials(): Promise<Credential[]> {
    await this.init();

    try {
      const credentials = await indexedDBStorage.getAll<Credential>('credentials');

      // Update app store with latest data
      try {
        const { setCredentials } = useAppStore.getState();
        setCredentials(credentials);
      } catch (storeError) {
        logger.warn('Failed to sync credentials to app store', undefined, storeError);
        // Don't throw - data retrieval succeeded even if store sync failed
      }

      return credentials;
    } catch (error) {
      logger.error('Failed to get all credentials', error);
      return [];
    }
  }

  async updateCredential(id: string, updates: Partial<Credential>, options: PersistenceOptions = {}): Promise<void> {
    await this.init();

    try {
      const existingCredential = await this.getCredential(id);
      if (!existingCredential) {
        throw new Error(`Credential ${id} not found`);
      }

      const updatedCredential = { ...existingCredential, ...updates };

      await indexedDBStorage.set('credentials', id, updatedCredential, {
        ttl: options.ttl,
        version: options.version || 2
      });

      // Update app store if sync is enabled
      if (options.sync !== false) {
        const { updateCredential } = useAppStore.getState();
        updateCredential(id, updatedCredential);
      }
    } catch (error) {
      logger.error('Failed to update credential', error);
      throw error;
    }
  }

  async deleteCredential(id: string, options: PersistenceOptions = {}): Promise<void> {
    await this.init();

    try {
      await indexedDBStorage.delete('credentials', id);

      // Update app store if sync is enabled
      if (options.sync !== false) {
        const { removeCredential } = useAppStore.getState();
        removeCredential(id);
      }
    } catch (error) {
      logger.error('Failed to delete credential', error);
      throw error;
    }
  }

  // Handshake requests persistence
  async saveHandshakeRequest(request: HandshakeRequest, options: PersistenceOptions = {}): Promise<void> {
    await this.init();

    try {
      await indexedDBStorage.set('handshake', request.id, request, {
        ttl: options.ttl,
        version: options.version || 1
      });

      // Update app store if sync is enabled
      if (options.sync !== false) {
        const { addHandshakeRequest } = useAppStore.getState();
        addHandshakeRequest(request);
      }
    } catch (error) {
      logger.error('Failed to save handshake request:', error);
      throw error;
    }
  }

  async getHandshakeRequest(id: string): Promise<HandshakeRequest | null> {
    await this.init();

    try {
      return await indexedDBStorage.get<HandshakeRequest>('handshake', id);
    } catch (error) {
      logger.error('Failed to get handshake request:', error);
      return null;
    }
  }

  async getAllHandshakeRequests(): Promise<HandshakeRequest[]> {
    await this.init();

    try {
      const requests = await indexedDBStorage.getAll<HandshakeRequest>('handshake');

      // Update app store with latest data
      const { setHandshakeRequests } = useAppStore.getState();
      setHandshakeRequests(requests);

      return requests;
    } catch (error) {
      logger.error('Failed to get all handshake requests:', error);
      return [];
    }
  }

  async updateHandshakeRequest(id: string, updates: Partial<HandshakeRequest>, options: PersistenceOptions = {}): Promise<void> {
    await this.init();

    try {
      const existingRequest = await this.getHandshakeRequest(id);
      if (!existingRequest) {
        throw new Error(`Handshake request ${id} not found`);
      }

      const updatedRequest = { ...existingRequest, ...updates };

      await indexedDBStorage.set('handshake', id, updatedRequest, {
        ttl: options.ttl,
        version: options.version || 2
      });

      // Update app store if sync is enabled
      if (options.sync !== false) {
        const { updateHandshakeRequest } = useAppStore.getState();
        updateHandshakeRequest(id, updatedRequest);
      }
    } catch (error) {
      logger.error('Failed to update handshake request:', error);
      throw error;
    }
  }

  async deleteHandshakeRequest(id: string, options: PersistenceOptions = {}): Promise<void> {
    await this.init();

    try {
      await indexedDBStorage.delete('handshake', id);

      // Update app store if sync is enabled
      if (options.sync !== false) {
        const { removeHandshakeRequest } = useAppStore.getState();
        removeHandshakeRequest(id);
      }
    } catch (error) {
      logger.error('Failed to delete handshake request:', error);
      throw error;
    }
  }

  // Profile data persistence
  async saveProfileData(key: string, data: any, options: PersistenceOptions = {}): Promise<void> {
    await this.init();

    try {
      await indexedDBStorage.set('profile', key, data, {
        ttl: options.ttl,
        version: options.version || 1
      });
    } catch (error) {
      logger.error('Failed to save profile data:', error);
      throw error;
    }
  }

  async getProfileData(key: string): Promise<any> {
    await this.init();

    try {
      return await indexedDBStorage.get('profile', key);
    } catch (error) {
      logger.error('Failed to get profile data:', error);
      return null;
    }
  }

  // Cache operations
  async setCache(key: string, data: any, options: CacheOptions = {}): Promise<void> {
    await this.init();

    try {
      const cacheData = {
        key,
        data,
        expires: options.ttl ? Date.now() + options.ttl : undefined,
        tags: options.tags || []
      };

      await indexedDBStorage.set('cache', key, cacheData, {
        ttl: options.ttl
      });
    } catch (error) {
      logger.error('Failed to set cache:', error);
    }
  }

  async getCache(key: string): Promise<any> {
    await this.init();

    try {
      const cacheData = await indexedDBStorage.get('cache', key);
      return cacheData ? (cacheData as any).data : null;
    } catch (error) {
      logger.error('Failed to get cache:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    await this.init();

    try {
      await indexedDBStorage.clear('cache');
    } catch (error) {
      logger.error('Failed to clear cache:', error);
    }
  }

  // Query operations
  async queryCredentialsByType(type: string): Promise<Credential[]> {
    await this.init();

    try {
      return await indexedDBStorage.query<Credential>('credentials', 'type', type);
    } catch (error) {
      logger.error('Failed to query credentials by type:', error);
      return [];
    }
  }

  async queryCredentialsByStatus(status: string): Promise<Credential[]> {
    await this.init();

    try {
      return await indexedDBStorage.query<Credential>('credentials', 'status', status);
    } catch (error) {
      logger.error('Failed to query credentials by status:', error);
      return [];
    }
  }

  async queryHandshakeRequestsByStatus(status: string): Promise<HandshakeRequest[]> {
    await this.init();

    try {
      return await indexedDBStorage.query<HandshakeRequest>('handshake', 'status', status);
    } catch (error) {
      logger.error('Failed to query handshake requests by status:', error);
      return [];
    }
  }

  // Bulk operations
  async saveCredentialsBatch(credentials: Credential[], options: PersistenceOptions = {}): Promise<void> {
    await this.init();

    try {
      const promises = credentials.map(cred => this.saveCredential(cred, { ...options, sync: false }));
      await Promise.all(promises);

      // Update app store once with all credentials
      if (options.sync !== false) {
        const { setCredentials } = useAppStore.getState();
        setCredentials(credentials);
      }
    } catch (error) {
      logger.error('Failed to save credentials batch:', error);
      throw error;
    }
  }

  async saveHandshakeRequestsBatch(requests: HandshakeRequest[], options: PersistenceOptions = {}): Promise<void> {
    await this.init();

    try {
      const promises = requests.map(req => this.saveHandshakeRequest(req, { ...options, sync: false }));
      await Promise.all(promises);

      // Update app store once with all requests
      if (options.sync !== false) {
        const { setHandshakeRequests } = useAppStore.getState();
        setHandshakeRequests(requests);
      }
    } catch (error) {
      logger.error('Failed to save handshake requests batch:', error);
      throw error;
    }
  }

  // Data migration and backup
  async exportData(): Promise<string> {
    await this.init();

    try {
      const [credentials, handshakeRequests, profileData] = await Promise.all([
        this.getAllCredentials(),
        this.getAllHandshakeRequests(),
        indexedDBStorage.getAll('profile')
      ]);

      const exportData = {
        version: '1.0',
        timestamp: Date.now(),
        credentials,
        handshakeRequests,
        profileData
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      logger.error('Failed to export data:', error);
      throw error;
    }
  }

  async importData(jsonData: string): Promise<void> {
    await this.init();

    try {
      const importData = JSON.parse(jsonData);

      if (importData.credentials) {
        await this.saveCredentialsBatch(importData.credentials, { sync: false });
      }

      if (importData.handshakeRequests) {
        await this.saveHandshakeRequestsBatch(importData.handshakeRequests, { sync: false });
      }

      if (importData.profileData) {
        for (const [key, data] of Object.entries(importData.profileData)) {
          await this.saveProfileData(key, data);
        }
      }

      logger.info('Data import completed successfully');
    } catch (error) {
      logger.error('Failed to import data:', error);
      throw error;
    }
  }

  // Storage statistics
  async getStorageStats(): Promise<{
    totalItems: number;
    storageSize: number;
    lastModified: number;
    credentials: number;
    handshakeRequests: number;
  }> {
    await this.init();

    try {
      const stats = await indexedDBStorage.getStats();
      const credentials = await this.getAllCredentials();
      const handshakeRequests = await this.getAllHandshakeRequests();

      return {
        ...stats,
        credentials: credentials.length,
        handshakeRequests: handshakeRequests.length
      };
    } catch (error) {
      logger.error('Failed to get storage stats:', error);
      return {
        totalItems: 0,
        storageSize: 0,
        lastModified: 0,
        credentials: 0,
        handshakeRequests: 0
      };
    }
  }

  // Data cleanup
  async cleanupExpiredData(): Promise<void> {
    await this.init();

    try {
      // Clear expired cache entries
      await this.clearCache();

      // Additional cleanup logic can be added here
      logger.info('Expired data cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup expired data:', error);
    }
  }
}

// Create singleton instance
export const dataPersistence = new DataPersistenceService();

// Initialize on module load
if (typeof window !== 'undefined') {
  dataPersistence.init().catch(logger.error);
}
