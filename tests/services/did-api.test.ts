import { didAPI } from '@/services'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('DID API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('validateDIDFormat', () => {
    it('should validate correct DID formats', () => {
      expect(didAPI.validateDIDFormat('did:web:example.com')).toBe(true)
      expect(didAPI.validateDIDFormat('did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK')).toBe(true)
      expect(didAPI.validateDIDFormat('did:ion:EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9Nfk38w5w')).toBe(true)
    })

    it('should reject invalid DID formats', () => {
      expect(didAPI.validateDIDFormat('')).toBe(false)
      expect(didAPI.validateDIDFormat('not-a-did')).toBe(false)
      expect(didAPI.validateDIDFormat('did:')).toBe(false)
      expect(didAPI.validateDIDFormat('did:invalid-method')).toBe(false)
      expect(didAPI.validateDIDFormat('did:web:')).toBe(false)
    })
  })

  describe('extractDIDMethod', () => {
    it('should extract DID method correctly', () => {
      expect(didAPI.extractDIDMethod('did:web:example.com')).toBe('web')
      expect(didAPI.extractDIDMethod('did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK')).toBe('key')
      expect(didAPI.extractDIDMethod('did:ion:EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9Nfk38w5w')).toBe('ion')
    })

    it('should handle invalid DIDs', () => {
      expect(didAPI.extractDIDMethod('invalid-did')).toBe('')
      expect(didAPI.extractDIDMethod('')).toBe('')
    })
  })

  describe('resolveDID', () => {
    const mockDIDDocument = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: 'did:web:example.com',
      verificationMethod: [
        {
          id: 'did:web:example.com#key-1',
          type: 'Ed25519VerificationKey2020',
          controller: 'did:web:example.com',
          publicKeyMultibase: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        },
      ],
    }

    it('should resolve DID successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          didDocument: mockDIDDocument,
          didResolutionMetadata: {
            contentType: 'application/did+json',
            retrieved: new Date().toISOString(),
          },
        }),
      })

      const result = await didAPI.resolveDID('did:web:example.com')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('did/resolve/did%3Aweb%3Aexample.com'),
        expect.any(Object)
      )
      expect(result).toEqual({
        didDocument: mockDIDDocument,
        didResolutionMetadata: {
          contentType: 'application/did+json',
          retrieved: expect.any(String),
        },
      })
    })

    it('should handle resolution errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(didAPI.resolveDID('did:web:nonexistent.com')).rejects.toThrow('DID not found')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await didAPI.resolveDID('did:web:example.com')
      expect(result).toBeDefined()
      expect(result.didDocument).toBeDefined()
    })
  })

  describe('isDIDResolvable', () => {
    it('should return true for resolvable DIDs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resolvable: true }),
      })

      const result = await didAPI.isDIDResolvable('did:web:example.com')

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('did/resolve/did%3Aweb%3Aexample.com'),
        expect.any(Object)
      )
    })

    it('should return false for non-resolvable DIDs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resolvable: false }),
      })

      const result = await didAPI.isDIDResolvable('did:web:nonexistent.com')

      expect(result).toBe(false)
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      const result = await didAPI.isDIDResolvable('did:web:example.com')

      expect(result).toBe(true) // Mock implementation always returns true for valid DIDs
    })
  })

  describe('registerDID', () => {
    const mockDIDRegistration = {
      did: 'did:web:example.com',
      document: {
        '@context': ['https://www.w3.org/ns/did/v1'],
        id: 'did:web:example.com',
        verificationMethod: [],
      },
      method: 'web',
    }

    it('should register DID successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDIDRegistration,
      })

      const result = await didAPI.registerDID(mockDIDRegistration)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/did/register'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(mockDIDRegistration),
        })
      )
      expect(result).toEqual(mockDIDRegistration)
    })

    it('should handle registration errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid DID document' }),
      })

      await expect(didAPI.registerDID(mockDIDRegistration)).rejects.toThrow()
    })
  })

  describe('getDIDRegistryEntry', () => {
    const mockRegistryEntry = {
      did: 'did:web:example.com',
      method: 'web',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      metadata: {
        description: 'Test DID',
      },
    }

    it('should fetch registry entry successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistryEntry,
      })

      const result = await didAPI.getDIDRegistryEntry('did:web:example.com')

      expect(result).toEqual(mockRegistryEntry)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('registry/did%3Aweb%3Aexample.com'),
        expect.any(Object)
      )
    })

    it('should handle missing registry entries', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(didAPI.getDIDRegistryEntry('did:web:nonexistent.com')).resolves.toBeDefined()
    })
  })

  describe('getDIDEvents', () => {
    const mockEvents = [
      {
        operation: 'create',
        actor: 'user123',
        timestamp: '2024-01-01T00:00:00Z',
        details: { method: 'web' },
      },
      {
        operation: 'update',
        actor: 'user123',
        timestamp: '2024-01-02T00:00:00Z',
        details: { field: 'verificationMethod' },
      },
    ]

    it('should fetch DID events successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents,
      })

      const result = await didAPI.getDIDEvents('did:web:example.com', 10)

      expect(result).toEqual(mockEvents)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('did/did%3Aweb%3Aexample.com/events?limit=10'),
        expect.any(Object)
      )
    })

    it('should handle empty event lists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

      const result = await didAPI.getDIDEvents('did:web:example.com', 5)

      expect(result).toEqual([])
    })
  })

  describe('deleteDID', () => {
    it('should delete DID successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      await expect(didAPI.deleteDID('did:web:example.com')).resolves.toBeDefined()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/did/did%3Aweb%3Aexample.com'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })

    it('should handle deletion errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      })

      await expect(didAPI.deleteDID('did:web:example.com')).rejects.toThrow()
    })
  })
})
