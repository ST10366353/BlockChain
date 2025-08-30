// Mock API client for testing
export const apiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  healthCheck: jest.fn().mockResolvedValue({
    data: { status: 'ok', timestamp: new Date().toISOString() },
  }),
}

// Mock responses
export const mockApiResponses = {
  health: {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  },
  credentials: {
    data: [
      {
        id: 'cred-123',
        type: ['UniversityDegree'],
        issuerDid: 'did:web:university.edu',
        subjectDid: 'did:web:alice.com',
        status: 'verified',
        issuedAt: '2024-01-01T00:00:00Z',
      },
    ],
    meta: {
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false,
    },
  },
  didResolution: {
    didDocument: {
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
    },
    didResolutionMetadata: {
      contentType: 'application/did+json',
      retrieved: new Date().toISOString(),
    },
  },
}
