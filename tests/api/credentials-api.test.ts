import { credentialsAPI } from '@/src/services'
import { mockCredentialSummary, mockCredentialList, mockVerificationResult } from '../fixtures/mock-credentials'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Credentials API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('queryCredentials', () => {
    it('should fetch credentials with default parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockCredentialList,
          meta: {
            total: 3,
            limit: 50,
            offset: 0,
            hasMore: false,
          },
        }),
      })

      const result = await credentialsAPI.queryCredentials({
        subject: 'did:web:alice.com',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials?subject=did:web:alice.com'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockCredentialList)
    })

    it('should handle query parameters correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [mockCredentialList[0]],
          meta: {
            total: 1,
            limit: 10,
            offset: 0,
            hasMore: false,
          },
        }),
      })

      const result = await credentialsAPI.queryCredentials({
        subject: 'did:web:alice.com',
        issuer: 'did:web:university.edu',
        type: 'UniversityDegree',
        status: 'verified',
        limit: 10,
        offset: 0,
      })

      const expectedUrl = expect.stringContaining(
        '/credentials?subject=did:web:alice.com&issuer=did:web:university.edu&type=UniversityDegree&status=verified&limit=10&offset=0'
      )
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      expect(result).toEqual([mockCredentialList[0]])
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        credentialsAPI.queryCredentials({ subject: 'did:web:alice.com' })
      ).rejects.toThrow('Network error')
    })
  })

  describe('getCredential', () => {
    it('should fetch a single credential by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCredentialSummary }),
      })

      const result = await credentialsAPI.getCredential('cred-123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials/cred-123'),
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result).toEqual(mockCredentialSummary)
    })

    it('should handle credential not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(credentialsAPI.getCredential('nonexistent-cred')).rejects.toThrow()
    })
  })

  describe('verifyCredential', () => {
    it('should verify a credential successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockVerificationResult }),
      })

      const result = await credentialsAPI.verifyCredential({
        credential: 'cred-123',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials/verify'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ credential: 'cred-123' }),
        })
      )
      expect(result).toEqual(mockVerificationResult)
    })

    it('should handle verification with options', async () => {
      const verificationOptions = {
        credential: 'cred-123',
        challenge: 'test-challenge',
        domain: 'example.com',
        verifyRevocation: true,
        verifyIssuer: true,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockVerificationResult }),
      })

      const result = await credentialsAPI.verifyCredential(verificationOptions)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials/verify'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(verificationOptions),
        })
      )
      expect(result).toEqual(mockVerificationResult)
    })
  })

  describe('issueCredential', () => {
    const mockCredentialRequest = {
      type: ['UniversityDegree'],
      subject: 'did:web:alice.com',
      issuer: 'did:web:university.edu',
      credentialSubject: {
        id: 'did:web:alice.com',
        name: 'Alice Johnson',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
      },
      issuanceDate: '2024-01-01T00:00:00Z',
      expirationDate: '2027-01-01T00:00:00Z',
    }

    it('should issue a credential successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCredentialSummary }),
      })

      const result = await credentialsAPI.issueCredential(mockCredentialRequest)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials/issue'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockCredentialRequest),
        })
      )
      expect(result).toEqual(mockCredentialSummary)
    })
  })

  describe('revokeCredential', () => {
    const mockRevocationRequest = {
      credentialId: 'cred-123',
      issuerDid: 'did:web:university.edu',
      reason: 'Credential expired',
    }

    it('should revoke a credential successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const result = await credentialsAPI.revokeCredential('cred-123', mockRevocationRequest)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials/cred-123/revoke'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockRevocationRequest),
        })
      )
      expect(result).toBeUndefined()
    })
  })

  describe('getRevocationStatus', () => {
    const mockRevocationStatus = {
      revoked: false,
      revocationDate: null,
      reason: null,
    }

    it('should get revocation status successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockRevocationStatus }),
      })

      const result = await credentialsAPI.getRevocationStatus('cred-123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials/cred-123/revocation'),
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result).toEqual(mockRevocationStatus)
    })
  })

  describe('createPresentation', () => {
    const mockPresentationRequest = {
      credentials: ['cred-123', 'cred-456'],
      holder: 'did:web:alice.com',
      challenge: 'presentation-challenge',
      domain: 'verifier.example.com',
    }

    const mockPresentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: 'did:web:alice.com',
      verifiableCredential: [mockCredentialSummary],
      proof: {
        type: 'Ed25519Signature2020',
        created: '2024-01-15T10:00:00Z',
        verificationMethod: 'did:web:alice.com#key-1',
        proofPurpose: 'authentication',
        challenge: 'presentation-challenge',
        domain: 'verifier.example.com',
      },
    }

    it('should create a presentation successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPresentation }),
      })

      const result = await credentialsAPI.createPresentation(
        mockCredentialList.slice(0, 2),
        'did:web:alice.com',
        'presentation-challenge',
        'verifier.example.com'
      )

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/presentations'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"holder":"did:web:alice.com"'),
        })
      )
      expect(result).toEqual(mockPresentation)
    })
  })

  describe('getCredentialsByIssuer', () => {
    it('should fetch credentials by issuer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockCredentialList.filter(c => c.issuerDid === 'did:web:university.edu'),
          meta: {
            total: 1,
            limit: 50,
            offset: 0,
            hasMore: false,
          },
        }),
      })

      const result = await credentialsAPI.getCredentialsByIssuer('did:web:university.edu')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials?issuer=did:web:university.edu'),
        expect.any(Object)
      )
      expect(result).toHaveLength(1)
      expect(result[0].issuerDid).toBe('did:web:university.edu')
    })
  })

  describe('getCredentialsBySubject', () => {
    it('should fetch credentials by subject', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockCredentialList,
          meta: {
            total: 3,
            limit: 50,
            offset: 0,
            hasMore: false,
          },
        }),
      })

      const result = await credentialsAPI.getCredentialsBySubject('did:web:alice.com')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials?subject=did:web:alice.com'),
        expect.any(Object)
      )
      expect(result).toEqual(mockCredentialList)
    })
  })
})
