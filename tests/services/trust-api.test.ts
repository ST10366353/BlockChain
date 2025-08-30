import { trustAPI } from '@/src/services'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Trust API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('getTrustedIssuers', () => {
    const mockTrustedIssuers = [
      {
        did: 'did:web:university.edu',
        status: 'trusted',
        tags: ['educational', 'verified'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        metadata: {
          name: 'University of Example',
          description: 'Official university credential issuer',
          website: 'https://university.edu',
          jurisdiction: 'US-CA',
          contact: 'credentials@university.edu',
        },
        evidenceUri: 'https://university.edu/verification',
        verifiedAt: '2024-01-01T00:00:00Z',
        verifiedBy: 'did:web:accreditation.org',
      },
      {
        did: 'did:web:company.com',
        status: 'trusted',
        tags: ['corporate', 'verified'],
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        metadata: {
          name: 'Example Company',
          description: 'Corporate credential issuer',
          website: 'https://company.com',
          jurisdiction: 'US-NY',
          contact: 'hr@company.com',
        },
        evidenceUri: 'https://company.com/verification',
        verifiedAt: '2024-01-02T00:00:00Z',
        verifiedBy: 'did:web:registry.org',
      },
    ]

    it('should fetch trusted issuers successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockTrustedIssuers }),
      })

      const result = await trustAPI.getTrustedIssuers()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/trust/issuers'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockTrustedIssuers)
    })

    it('should handle query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockTrustedIssuers[0]] }),
      })

      const result = await trustAPI.getTrustedIssuers({
        status: 'trusted',
        tags: ['educational'],
        jurisdiction: 'US-CA',
        limit: 10,
        offset: 0,
      })

      const expectedUrl = expect.stringContaining(
        '/trust/issuers?status=trusted&tags=educational&jurisdiction=US-CA&limit=10&offset=0'
      )
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      expect(result).toEqual([mockTrustedIssuers[0]])
    })

    it('should filter by status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockTrustedIssuers.filter(issuer => issuer.status === 'trusted')
        }),
      })

      const result = await trustAPI.getTrustedIssuers({ status: 'trusted' })

      expect(result.every(issuer => issuer.status === 'trusted')).toBe(true)
    })

    it('should filter by tags', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockTrustedIssuers.filter(issuer => issuer.tags.includes('educational'))
        }),
      })

      const result = await trustAPI.getTrustedIssuers({ tags: ['educational'] })

      expect(result.every(issuer => issuer.tags.includes('educational'))).toBe(true)
    })

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })

      const result = await trustAPI.getTrustedIssuers()

      expect(result).toEqual([])
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(trustAPI.getTrustedIssuers()).rejects.toThrow('Network error')
    })
  })

  describe('getTrustedIssuer', () => {
    const mockIssuer = {
      did: 'did:web:university.edu',
      status: 'trusted',
      tags: ['educational', 'verified'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      metadata: {
        name: 'University of Example',
        description: 'Official university credential issuer',
        website: 'https://university.edu',
        jurisdiction: 'US-CA',
        contact: 'credentials@university.edu',
      },
      evidenceUri: 'https://university.edu/verification',
      verifiedAt: '2024-01-01T00:00:00Z',
      verifiedBy: 'did:web:accreditation.org',
    }

    it('should fetch a single trusted issuer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockIssuer }),
      })

      const result = await trustAPI.getTrustedIssuer('did:web:university.edu')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/trust/issuers/did:web:university.edu'),
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result).toEqual(mockIssuer)
    })

    it('should handle issuer not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(
        trustAPI.getTrustedIssuer('did:web:nonexistent.edu')
      ).rejects.toThrow()
    })
  })

  describe('addTrustedIssuer', () => {
    const mockNewIssuer = {
      did: 'did:web:newissuer.com',
      tags: ['new', 'pending'],
      metadata: {
        name: 'New Issuer',
        description: 'New credential issuer',
        website: 'https://newissuer.com',
        jurisdiction: 'US-TX',
        contact: 'admin@newissuer.com',
      },
    }

    const mockCreatedIssuer = {
      ...mockNewIssuer,
      status: 'pending',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      evidenceUri: undefined,
      verifiedAt: undefined,
      verifiedBy: undefined,
    }

    it('should add a new trusted issuer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCreatedIssuer }),
      })

      const result = await trustAPI.addTrustedIssuer(mockNewIssuer)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/trust/issuers'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(mockNewIssuer),
        })
      )
      expect(result).toEqual(mockCreatedIssuer)
    })

    it('should handle validation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid DID format' }),
      })

      await expect(trustAPI.addTrustedIssuer(mockNewIssuer)).rejects.toThrow()
    })

    it('should handle duplicate issuer errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        json: async () => ({ error: 'Issuer already exists' }),
      })

      await expect(trustAPI.addTrustedIssuer(mockNewIssuer)).rejects.toThrow()
    })
  })

  describe('updateTrustedIssuer', () => {
    const mockUpdateData = {
      status: 'suspended',
      metadata: {
        name: 'Updated University',
        description: 'Updated description',
      },
    }

    const mockUpdatedIssuer = {
      did: 'did:web:university.edu',
      status: 'suspended',
      tags: ['educational', 'verified'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      metadata: {
        name: 'Updated University',
        description: 'Updated description',
        website: 'https://university.edu',
        jurisdiction: 'US-CA',
        contact: 'credentials@university.edu',
      },
    }

    it('should update a trusted issuer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUpdatedIssuer }),
      })

      const result = await trustAPI.updateTrustedIssuer(
        'did:web:university.edu',
        mockUpdateData
      )

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/trust/issuers/did:web:university.edu'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(mockUpdateData),
        })
      )
      expect(result).toEqual(mockUpdatedIssuer)
      expect(result.status).toBe('suspended')
      expect(result.metadata.name).toBe('Updated University')
    })

    it('should handle update of non-existent issuer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(
        trustAPI.updateTrustedIssuer('did:web:nonexistent.edu', mockUpdateData)
      ).rejects.toThrow()
    })
  })

  describe('removeTrustedIssuer', () => {
    it('should remove a trusted issuer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const result = await trustAPI.removeTrustedIssuer('did:web:university.edu')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/trust/issuers/did:web:university.edu'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
      expect(result).toBeUndefined()
    })

    it('should handle removal of non-existent issuer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(
        trustAPI.removeTrustedIssuer('did:web:nonexistent.edu')
      ).rejects.toThrow()
    })
  })

  describe('isIssuerTrusted', () => {
    it('should return true for trusted issuer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ trusted: true }),
      })

      const result = await trustAPI.isIssuerTrusted('did:web:university.edu')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/trust/issuers/did:web:university.edu/trusted'),
        expect.any(Object)
      )
      expect(result).toBe(true)
    })

    it('should return false for untrusted issuer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ trusted: false }),
      })

      const result = await trustAPI.isIssuerTrusted('did:web:untrusted.com')

      expect(result).toBe(false)
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      const result = await trustAPI.isIssuerTrusted('did:web:university.edu')

      expect(result).toBe(false)
    })
  })

  describe('getIssuerVerificationStatus', () => {
    const mockVerificationStatus = {
      verified: true,
      verificationDate: '2024-01-01T00:00:00Z',
      verifiedBy: 'did:web:accreditation.org',
      evidence: 'https://accreditation.org/verification/university',
      expiresAt: '2025-01-01T00:00:00Z',
    }

    it('should get issuer verification status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockVerificationStatus }),
      })

      const result = await trustAPI.getIssuerVerificationStatus('did:web:university.edu')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/trust/issuers/did:web:university.edu/verification'),
        expect.any(Object)
      )
      expect(result).toEqual(mockVerificationStatus)
    })

    it('should handle unverified issuer', async () => {
      const unverifiedStatus = {
        verified: false,
        verificationDate: null,
        verifiedBy: null,
        evidence: null,
        expiresAt: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: unverifiedStatus }),
      })

      const result = await trustAPI.getIssuerVerificationStatus('did:web:unverified.com')

      expect(result.verified).toBe(false)
    })
  })

  describe('getTrustPolicies', () => {
    const mockTrustPolicies = [
      {
        id: 'policy-1',
        name: 'Educational Institutions',
        description: 'Trust policy for educational credential issuers',
        criteria: {
          jurisdiction: ['US-CA', 'US-NY'],
          tags: ['educational'],
          minimumEvidence: 2,
        },
        requiredEvidence: ['accreditation', 'domain-verification'],
        automaticApproval: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'policy-2',
        name: 'Corporate Issuers',
        description: 'Trust policy for corporate credential issuers',
        criteria: {
          jurisdiction: ['US-DE', 'US-NY'],
          tags: ['corporate'],
          minimumEvidence: 1,
        },
        requiredEvidence: ['business-registration'],
        automaticApproval: false,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ]

    it('should fetch trust policies', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockTrustPolicies }),
      })

      const result = await trustAPI.getTrustPolicies()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/trust/policies'),
        expect.any(Object)
      )
      expect(result).toEqual(mockTrustPolicies)
    })

    it('should handle empty policies list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })

      const result = await trustAPI.getTrustPolicies()

      expect(result).toEqual([])
    })
  })

  describe('searchIssuers', () => {
    const mockSearchResults = [
      {
        did: 'did:web:university.edu',
        status: 'trusted',
        metadata: {
          name: 'University of Example',
          description: 'Educational institution',
        },
        relevanceScore: 0.95,
      },
      {
        did: 'did:web:college.edu',
        status: 'trusted',
        metadata: {
          name: 'College of Example',
          description: 'Another educational institution',
        },
        relevanceScore: 0.87,
      },
    ]

    it('should search issuers by name', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockSearchResults }),
      })

      const result = await trustAPI.searchIssuers({
        query: 'university',
        limit: 10,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/trust/issuers/search?query=university&limit=10'),
        expect.any(Object)
      )
      expect(result).toEqual(mockSearchResults)
    })

    it('should search with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockSearchResults[0]] }),
      })

      const result = await trustAPI.searchIssuers({
        query: 'university',
        filters: {
          status: 'trusted',
          jurisdiction: 'US-CA',
          tags: ['educational'],
        },
        limit: 5,
      })

      const expectedUrl = expect.stringContaining(
        '/trust/issuers/search?query=university&status=trusted&jurisdiction=US-CA&tags=educational&limit=5'
      )
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      expect(result).toEqual([mockSearchResults[0]])
    })
  })
})
