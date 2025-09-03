import { credentialsAPI } from '@/services'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Credentials API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('queryCredentials', () => {
    const mockCredentialsResponse = {
      data: [
        {
          id: 'cred-123',
          type: ['UniversityDegree'],
          issuerDid: 'did:web:university.edu',
          subjectDid: 'did:web:alice.com',
          status: 'verified',
          issuedAt: '2024-01-01T00:00:00Z',
          expiresAt: '2027-01-01T00:00:00Z',
        },
        {
          id: 'cred-456',
          type: ['ProfessionalCertificate'],
          issuerDid: 'did:web:company.com',
          subjectDid: 'did:web:alice.com',
          status: 'pending',
          issuedAt: '2024-02-01T00:00:00Z',
        },
      ],
      meta: {
        total: 2,
        limit: 50,
        offset: 0,
        hasMore: false,
      },
    }

    it('should query credentials with basic parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredentialsResponse,
      })

      const result = await credentialsAPI.queryCredentials({
        subject: 'did:web:alice.com',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('credentials?subject=did%3Aweb%3Aalice.com'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockCredentialsResponse)
    })

    it('should handle complex query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredentialsResponse,
      })

      const result = await credentialsAPI.queryCredentials({
        subject: 'did:web:alice.com',
        issuer: 'did:web:university.edu',
        type: 'UniversityDegree',
        status: 'verified',
        limit: 10,
        offset: 5,
        sortBy: 'issuedAt',
        sortOrder: 'desc',
      })

      const expectedUrl = expect.stringContaining(
        'credentials?subject=did%3Aweb%3Aalice.com&issuer=did%3Aweb%3Auniversity.edu&type=UniversityDegree&status=verified&limit=10&offset=5&sortBy=issuedAt&sortOrder=desc'
      )
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      expect(result).toEqual(mockCredentialsResponse)
    })

    it('should handle date range filtering', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredentialsResponse,
      })

      const result = await credentialsAPI.queryCredentials({
        subject: 'did:web:alice.com',
        issuedAfter: '2024-01-01T00:00:00Z',
        issuedBefore: '2024-12-31T23:59:59Z',
        expiresAfter: '2024-06-01T00:00:00Z',
        expiresBefore: '2027-01-01T00:00:00Z',
      })

      const expectedUrl = expect.stringContaining(
        'credentials?subject=did%3Aweb%3Aalice.com&issuedAfter=2024-01-01T00%3A00%3A00Z&issuedBefore=2024-12-31T23%3A59%3A59Z&expiresAfter=2024-06-01T00%3A00%3A00Z&expiresBefore=2027-01-01T00%3A00%3A00Z'
      )
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      expect(result).toEqual(mockCredentialsResponse)
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        credentialsAPI.queryCredentials({ subject: 'did:web:alice.com' })
      ).rejects.toThrow('Network error')
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid parameters' }),
      })

      await expect(
        credentialsAPI.queryCredentials({ subject: 'did:web:alice.com' })
      ).rejects.toThrow()
    })
  })

  describe('getCredential', () => {
    const mockCredential = {
      id: 'cred-123',
      type: ['UniversityDegree'],
      issuerDid: 'did:web:university.edu',
      subjectDid: 'did:web:alice.com',
      status: 'verified',
      issuedAt: '2024-01-01T00:00:00Z',
      expiresAt: '2027-01-01T00:00:00Z',
      credentialSubject: {
        id: 'did:web:alice.com',
        name: 'Alice Johnson',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        graduationDate: '2024-05-15',
      },
      proof: {
        type: 'Ed25519Signature2020',
        created: '2024-01-01T00:00:00Z',
        verificationMethod: 'did:web:university.edu#key-1',
        proofPurpose: 'assertionMethod',
        jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..signature',
      },
    }

    it('should fetch a single credential', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredential,
      })

      const result = await credentialsAPI.getCredential('cred-123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials/cred-123'),
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result).toEqual(mockCredential)
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
    const mockVerificationResult = {
      verified: true,
      checks: [
        {
          type: 'signature',
          verified: true,
          message: 'Credential signature is valid',
        },
        {
          type: 'issuer',
          verified: true,
          message: 'Issuer DID is trusted and resolvable',
        },
        {
          type: 'expiration',
          verified: true,
          message: 'Credential has not expired',
        },
        {
          type: 'revocation',
          verified: true,
          message: 'Credential has not been revoked',
        },
      ],
      timestamp: '2024-01-15T10:00:00Z',
      verifiedBy: 'did:web:verifier.example.com',
    }

    it('should verify a credential successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVerificationResult,
      })

      const result = await credentialsAPI.verifyCredential({
        credential: 'cred-123',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('credentials/verify'),
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
        challenge: 'test-challenge-123',
        domain: 'verifier.example.com',
        verifyRevocation: true,
        verifyIssuer: true,
        verifyExpiration: true,
        trustedIssuers: ['did:web:university.edu'],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVerificationResult,
      })

      const result = await credentialsAPI.verifyCredential(verificationOptions)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('credentials/verify'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(verificationOptions),
        })
      )
      expect(result).toEqual(mockVerificationResult)
    })

    it('should handle failed verification', async () => {
      const failedVerificationResult = {
        verified: false,
        checks: [
          {
            type: 'signature',
            verified: false,
            message: 'Credential signature verification failed',
            error: 'Invalid signature format',
          },
          {
            type: 'issuer',
            verified: true,
            message: 'Issuer DID is trusted',
          },
        ],
        timestamp: '2024-01-15T10:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => failedVerificationResult,
      })

      const result = await credentialsAPI.verifyCredential({
        credential: 'cred-123',
      })

      expect(result.verified).toBe(false)
      expect(result.checks[0].verified).toBe(false)
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
        graduationDate: '2024-05-15',
        gpa: '3.8',
      },
      issuanceDate: '2024-01-01T00:00:00Z',
      expirationDate: '2027-01-01T00:00:00Z',
    }

    const mockIssuedCredential = {
      id: 'cred-123',
      ...mockCredentialRequest,
      status: 'issued',
      proof: {
        type: 'Ed25519Signature2020',
        created: '2024-01-01T00:00:00Z',
        verificationMethod: 'did:web:university.edu#key-1',
        proofPurpose: 'assertionMethod',
        jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..signature',
      },
    }

    it('should issue a credential successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIssuedCredential,
      })

      const result = await credentialsAPI.issueCredential(mockCredentialRequest)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials/issue'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(mockCredentialRequest),
        })
      )
      expect(result).toEqual(mockIssuedCredential)
    })

    it('should handle issuance errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid credential format' }),
      })

      await expect(credentialsAPI.issueCredential(mockCredentialRequest)).rejects.toThrow()
    })
  })

  describe('revokeCredential', () => {
    const mockRevocationRequest = {
      issuerDid: 'did:web:university.edu',
      reason: 'Credential expired',
      revocationDate: '2024-01-01T00:00:00Z',
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
      expect(result).toEqual({ success: true })
    })

    it('should handle revocation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ error: 'Not authorized to revoke this credential' }),
      })

      await expect(
        credentialsAPI.revokeCredential('cred-123', mockRevocationRequest)
      ).rejects.toThrow()
    })
  })

  describe('getRevocationStatus', () => {
    const mockRevocationStatus = {
      revoked: false,
      revocationDate: null,
      reason: null,
      revokedBy: null,
    }

    const mockRevokedStatus = {
      revoked: true,
      revocationDate: '2024-01-01T00:00:00Z',
      reason: 'Credential compromised',
      revokedBy: 'did:web:university.edu',
    }

    it('should get active credential revocation status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRevocationStatus,
      })

      const result = await credentialsAPI.getRevocationStatus('cred-123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials/cred-123/revocation'),
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result.revoked).toBe(false)
    })

    it('should get revoked credential status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRevokedStatus,
      })

      const result = await credentialsAPI.getRevocationStatus('cred-456')

      expect(result.revoked).toBe(true)
      expect(result.reason).toBe('Credential compromised')
      expect(result.revokedBy).toBe('did:web:university.edu')
    })
  })

  describe('createPresentation', () => {
    const mockCredentials = [
      {
        id: 'cred-123',
        type: ['UniversityDegree'],
        issuerDid: 'did:web:university.edu',
        subjectDid: 'did:web:alice.com',
        issuedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'cred-456',
        type: ['ProfessionalCertificate'],
        issuerDid: 'did:web:company.com',
        subjectDid: 'did:web:alice.com',
        issuedAt: '2024-02-01T00:00:00Z',
      },
    ]

    const mockPresentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: 'did:web:alice.com',
      verifiableCredential: mockCredentials,
      proof: {
        type: 'Ed25519Signature2020',
        created: '2024-01-15T10:00:00Z',
        verificationMethod: 'did:web:alice.com#key-1',
        proofPurpose: 'authentication',
        challenge: 'presentation-challenge',
        domain: 'verifier.example.com',
        jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..signature',
      },
    }

    it('should create a presentation successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentation,
      })

      const result = await credentialsAPI.createPresentation(
        mockCredentials,
        'did:web:alice.com',
        'presentation-challenge',
        'verifier.example.com'
      )

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('presentations/verify'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"holderDid":"did:web:alice.com"'),
        })
      )
      expect(result).toEqual(mockPresentation)
    })

    it('should create presentation with selective disclosure', async () => {
      const selectivePresentation = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        holder: 'did:web:alice.com',
        verifiableCredential: [
          {
            ...mockCredentials[0],
            // Only include selected fields
            credentialSubject: { id: 'did:web:alice.com', degree: 'Bachelor of Science' },
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => selectivePresentation,
      })

      const result = await credentialsAPI.createPresentation(
        mockCredentials,
        'did:web:alice.com',
        'presentation-challenge',
        'verifier.example.com',
        { selectiveDisclosure: true, fields: ['degree'] }
      )

      expect(result.verifiableCredential[0].credentialSubject).toHaveProperty('degree')
      expect(result.verifiableCredential[0].credentialSubject).not.toHaveProperty('name')
    })
  })

  describe('getCredentialsByIssuer', () => {
    const mockCredentials = [
      {
        id: 'cred-123',
        type: ['UniversityDegree'],
        issuerDid: 'did:web:university.edu',
        subjectDid: 'did:web:alice.com',
        status: 'verified',
        issuedAt: '2024-01-01T00:00:00Z',
      },
    ]

    it('should fetch credentials by issuer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockCredentials,
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
        expect.stringContaining('credentials/issuer/did%3Aweb%3Auniversity.edu'),
        expect.any(Object)
      )
      expect(result).toEqual({
        data: mockCredentials,
        meta: { hasMore: false, limit: 50, offset: 0, total: mockCredentials.length }
      })
    })
  })

  describe('getCredentialsBySubject', () => {
    const mockCredentials = [
      {
        id: 'cred-123',
        type: ['UniversityDegree'],
        issuerDid: 'did:web:university.edu',
        subjectDid: 'did:web:alice.com',
        status: 'verified',
        issuedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'cred-456',
        type: ['ProfessionalCertificate'],
        issuerDid: 'did:web:company.com',
        subjectDid: 'did:web:alice.com',
        status: 'verified',
        issuedAt: '2024-02-01T00:00:00Z',
      },
    ]

    it('should fetch credentials by subject', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockCredentials,
          meta: {
            total: 2,
            limit: 50,
            offset: 0,
            hasMore: false,
          },
        }),
      })

      const result = await credentialsAPI.getCredentialsBySubject('did:web:alice.com')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('credentials/subject/did%3Aweb%3Aalice.com'),
        expect.any(Object)
      )
      expect(result).toEqual({
        data: mockCredentials,
        meta: { hasMore: false, limit: 50, offset: 0, total: mockCredentials.length }
      })
      expect(result.data).toHaveLength(2)
    })
  })

  describe('getCredentialTemplates', () => {
    const mockTemplates = [
      {
        id: 'template-degree',
        name: 'University Degree',
        description: 'Template for university degree credentials',
        type: ['UniversityDegree'],
        requiredFields: ['name', 'degree', 'field', 'graduationDate'],
        optionalFields: ['gpa', 'honors'],
        issuer: 'did:web:university.edu',
      },
      {
        id: 'template-certificate',
        name: 'Professional Certificate',
        description: 'Template for professional certificates',
        type: ['ProfessionalCertificate'],
        requiredFields: ['name', 'certificateType', 'issuer', 'issueDate'],
        optionalFields: ['expirationDate', 'skills'],
        issuer: 'did:web:certification.org',
      },
    ]

    it('should fetch credential templates', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemplates,
      })

      const result = await credentialsAPI.getCredentialTemplates()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/credentials/templates'),
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result).toEqual(mockTemplates)
      expect(result).toHaveLength(2)
    })

    it('should handle empty templates list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

      const result = await credentialsAPI.getCredentialTemplates()

      expect(result).toEqual([])
    })
  })
})
