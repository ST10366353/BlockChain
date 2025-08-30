import type { CredentialSummary, VerificationResult } from '@/src/services'

export const mockCredentialSummary: CredentialSummary = {
  id: 'cred-123',
  type: ['UniversityDegree'],
  issuerDid: 'did:web:university.edu',
  subjectDid: 'did:web:alice.com',
  status: 'verified',
  issuedAt: '2024-01-01T00:00:00Z',
  expiresAt: '2027-01-01T00:00:00Z',
}

export const mockCredentialList: CredentialSummary[] = [
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
    status: 'verified',
    issuedAt: '2024-02-01T00:00:00Z',
    expiresAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'cred-789',
    type: ['IdentityDocument'],
    issuerDid: 'did:web:gov.example',
    subjectDid: 'did:web:alice.com',
    status: 'expired',
    issuedAt: '2023-01-01T00:00:00Z',
    expiresAt: '2024-01-01T00:00:00Z',
  },
]

export const mockVerificationResult: VerificationResult = {
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
      message: 'Issuer DID is trusted',
    },
    {
      type: 'expiration',
      verified: true,
      message: 'Credential has not expired',
    },
  ],
  timestamp: '2024-01-15T10:00:00Z',
}

export const mockFailedVerificationResult: VerificationResult = {
  verified: false,
  checks: [
    {
      type: 'signature',
      verified: false,
      message: 'Credential signature verification failed',
      error: 'Invalid signature',
    },
    {
      type: 'issuer',
      verified: true,
      message: 'Issuer DID is trusted',
    },
  ],
  timestamp: '2024-01-15T10:00:00Z',
}
