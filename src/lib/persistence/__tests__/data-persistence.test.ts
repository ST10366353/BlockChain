/**
 * Data Persistence Service Tests
 */

// Mock the indexedDB storage
jest.mock('../indexeddb-storage', () => ({
  indexedDBStorage: {
    init: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    getAll: jest.fn().mockResolvedValue([]),
    delete: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue([]),
    clear: jest.fn().mockResolvedValue(undefined),
    getStats: jest.fn().mockResolvedValue({
      stores: [],
      totalItems: 0,
      storageSize: 0,
      lastModified: 0
    })
  }
}));

import { dataPersistence } from '../data-persistence';
import { indexedDBStorage } from '../indexeddb-storage';

const mockIndexedDBStorage = indexedDBStorage as jest.Mocked<typeof indexedDBStorage>;

describe('DataPersistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize successfully', async () => {
      // Reset the initialized flag to test init
      (dataPersistence as any).initialized = false;

      await dataPersistence.init();

      expect(mockIndexedDBStorage.init).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      // Reset the initialized flag to test init
      (dataPersistence as any).initialized = false;

      const error = new Error('Init failed');
      mockIndexedDBStorage.init.mockRejectedValueOnce(error);

      // The init method catches errors internally and logs them
      await dataPersistence.init();

      expect(mockIndexedDBStorage.init).toHaveBeenCalled();
      // The method doesn't throw, it just logs the error
    });
  });

  describe('saveCredential', () => {
    const mockCredential = {
      id: 'cred-1',
      name: 'Test Credential',
      type: 'education',
      issuer: 'Test University',
      holder: 'test@example.com',
      description: 'Test description',
      status: 'active' as const,
      issuedAt: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {}
    };

    it('should save credential successfully', async () => {
      await dataPersistence.saveCredential(mockCredential);

      expect(mockIndexedDBStorage.set).toHaveBeenCalledWith(
        'credentials',
        mockCredential.id,
        mockCredential,
        expect.objectContaining({
          ttl: undefined,
          version: 1
        })
      );
    });

    it('should handle save errors', async () => {
      const error = new Error('Save failed');
      mockIndexedDBStorage.set.mockRejectedValueOnce(error);

      await expect(dataPersistence.saveCredential(mockCredential)).rejects.toThrow('Save failed');
    });

    it('should update credential with new version', async () => {
      const updatedCredential = { ...mockCredential, name: 'Updated Name' };

      await dataPersistence.saveCredential(updatedCredential, { version: 2 });

      expect(mockIndexedDBStorage.set).toHaveBeenCalledWith(
        'credentials',
        mockCredential.id,
        updatedCredential,
        expect.objectContaining({
          version: 2
        })
      );
    });
  });

  describe('getCredential', () => {
    it('should retrieve credential successfully', async () => {
      const mockCredential = {
        id: 'cred-1',
        name: 'Test Credential',
        type: 'education',
        issuer: 'Test University',
        holder: 'test@example.com',
        description: 'Test description',
        status: 'active' as const,
        issuedAt: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {}
      };

      mockIndexedDBStorage.get.mockResolvedValue(mockCredential);

      const result = await dataPersistence.getCredential('cred-1');

      expect(result).toEqual(mockCredential);
      expect(mockIndexedDBStorage.get).toHaveBeenCalledWith('credentials', 'cred-1');
    });

    it('should return null for non-existent credential', async () => {
      mockIndexedDBStorage.get.mockResolvedValue(null);

      const result = await dataPersistence.getCredential('non-existent');

      expect(result).toBeNull();
    });

    it('should handle retrieval errors gracefully', async () => {
      const error = new Error('Retrieval failed');
      mockIndexedDBStorage.get.mockRejectedValueOnce(error);

      const result = await dataPersistence.getCredential('cred-1');

      expect(result).toBeNull();
      expect(mockIndexedDBStorage.get).toHaveBeenCalledWith('credentials', 'cred-1');
    });
  });

  describe('getAllCredentials', () => {
    it('should retrieve all credentials', async () => {
      const mockCredentials = [
        {
          id: 'cred-1',
          name: 'Credential 1',
          type: 'education',
          issuer: 'University A',
          holder: 'user@example.com',
          description: 'Description 1',
          status: 'active' as const,
          issuedAt: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {}
        },
        {
          id: 'cred-2',
          name: 'Credential 2',
          type: 'employment',
          issuer: 'Company B',
          holder: 'user@example.com',
          description: 'Description 2',
          status: 'active' as const,
          issuedAt: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {}
        }
      ];

      mockIndexedDBStorage.getAll.mockResolvedValue(mockCredentials);

      const result = await dataPersistence.getAllCredentials();

      expect(result).toEqual(mockCredentials);
      expect(mockIndexedDBStorage.getAll).toHaveBeenCalledWith('credentials');
    });

    it('should return empty array when no credentials exist', async () => {
      mockIndexedDBStorage.getAll.mockResolvedValue([]);

      const result = await dataPersistence.getAllCredentials();

      expect(result).toEqual([]);
    });
  });

  describe('updateCredential', () => {
    it('should update credential successfully', async () => {
      const existingCredential = {
        id: 'cred-1',
        name: 'Original Name',
        type: 'education',
        issuer: 'Test University',
        holder: 'test@example.com',
        description: 'Test description',
        status: 'active' as const,
        issuedAt: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {},
        version: 1
      };

      const updates = { name: 'Updated Name' };
      const expectedUpdatedCredential = { ...existingCredential, ...updates };

      mockIndexedDBStorage.get.mockResolvedValue(existingCredential);

      await dataPersistence.updateCredential('cred-1', updates);

      expect(mockIndexedDBStorage.set).toHaveBeenCalledWith(
        'credentials',
        'cred-1',
        expectedUpdatedCredential,
        expect.objectContaining({
          version: 2 // Incremented version
        })
      );
    });

    it('should throw error for non-existent credential', async () => {
      mockIndexedDBStorage.get.mockResolvedValue(null);

      await expect(dataPersistence.updateCredential('non-existent', { name: 'New Name' }))
        .rejects.toThrow('Credential non-existent not found');
    });
  });

  describe('deleteCredential', () => {
    it('should delete credential successfully', async () => {
      await dataPersistence.deleteCredential('cred-1');

      expect(mockIndexedDBStorage.delete).toHaveBeenCalledWith('credentials', 'cred-1');
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      mockIndexedDBStorage.delete.mockRejectedValue(error);

      await expect(dataPersistence.deleteCredential('cred-1')).rejects.toThrow('Delete failed');
    });
  });

  describe('queryCredentialsByType', () => {
    it('should query credentials by type', async () => {
      const mockCredentials = [
        {
          id: 'cred-1',
          name: 'Education Credential',
          type: 'education',
          issuer: 'University A',
          holder: 'user@example.com',
          description: 'Education credential',
          status: 'active' as const,
          issuedAt: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {}
        }
      ];

      mockIndexedDBStorage.query.mockResolvedValue(mockCredentials);

      const result = await dataPersistence.queryCredentialsByType('education');

      expect(result).toEqual(mockCredentials);
      expect(mockIndexedDBStorage.query).toHaveBeenCalledWith(
        'credentials',
        'type',
        'education'
      );
    });
  });

  describe('queryCredentialsByStatus', () => {
    it('should query credentials by status', async () => {
      const mockCredentials = [
        {
          id: 'cred-1',
          name: 'Verified Credential',
          type: 'education',
          issuer: 'University A',
          holder: 'user@example.com',
          description: 'Verified credential',
          status: 'active' as const,
          issuedAt: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {}
        }
      ];

      mockIndexedDBStorage.query.mockResolvedValue(mockCredentials);

      const result = await dataPersistence.queryCredentialsByStatus('verified');

      expect(result).toEqual(mockCredentials);
      expect(mockIndexedDBStorage.query).toHaveBeenCalledWith(
        'credentials',
        'status',
        'verified'
      );
    });
  });

  describe('cache operations', () => {
    it('should set cache successfully', async () => {
      const data = { key: 'test', value: 'cached data' };

      await dataPersistence.setCache('test-key', data);

      expect(mockIndexedDBStorage.set).toHaveBeenCalledWith(
        'cache',
        'test-key',
        expect.objectContaining({
          key: 'test-key',
          data,
          expires: undefined,
          tags: []
        }),
        expect.any(Object)
      );
    });

    it('should get cache successfully', async () => {
      const cachedData = { key: 'test', value: 'cached data' };
      const cacheEntry = {
        key: 'test-key',
        data: cachedData,
        expires: undefined,
        tags: []
      };

      mockIndexedDBStorage.get.mockResolvedValue(cacheEntry);

      const result = await dataPersistence.getCache('test-key');

      expect(result).toEqual(cachedData);
    });

    it('should return null for non-existent cache', async () => {
      mockIndexedDBStorage.get.mockResolvedValue(null);

      const result = await dataPersistence.getCache('non-existent');

      expect(result).toBeNull();
    });

    it('should clear cache successfully', async () => {
      await dataPersistence.clearCache();

      expect(mockIndexedDBStorage.clear).toHaveBeenCalledWith('cache');
    });
  });

  describe('bulk operations', () => {
    it('should save credentials batch successfully', async () => {
      const credentials = [
        {
          id: 'cred-1',
          name: 'Credential 1',
          type: 'education',
          issuer: 'University A',
          holder: 'user@example.com',
          description: 'Description 1',
          status: 'active' as const,
          issuedAt: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {}
        },
        {
          id: 'cred-2',
          name: 'Credential 2',
          type: 'employment',
          issuer: 'Company B',
          holder: 'user@example.com',
          description: 'Description 2',
          status: 'active' as const,
          issuedAt: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {}
        }
      ];

      await dataPersistence.saveCredentialsBatch(credentials);

      expect(mockIndexedDBStorage.set).toHaveBeenCalledTimes(2);
      // The bulk save operation completed successfully
      expect(true).toBe(true);
    });
  });

  describe('storage stats', () => {
    it('should get storage statistics', async () => {
      const mockStats = {
        stores: ['credentials', 'handshake', 'profile', 'cache'],
        totalItems: 25,
        storageSize: 1024000,
        lastModified: Date.now()
      };

      mockIndexedDBStorage.getStats.mockResolvedValue(mockStats);
      mockIndexedDBStorage.getAll
        .mockResolvedValueOnce([]) // credentials
        .mockResolvedValueOnce([]) // handshake
        .mockResolvedValue([]); // profile

      const stats = await dataPersistence.getStorageStats();

      expect(stats).toEqual({
        ...mockStats,
        credentials: 0,
        handshakeRequests: 0
      });
    });
  });
});
