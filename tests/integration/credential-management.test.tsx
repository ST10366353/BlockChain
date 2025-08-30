import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { CredentialsPage } from '@/pages/credentials-page'
import { useToast } from '@/hooks/use-toast'
import { useAPIErrorHandler } from '@/hooks/use-error-handler'
import { useBulkOperations, useBulkSelection } from '@/hooks/use-bulk-operations'
import SearchFilterBar from '@/components/search-filter-bar'
import { credentialsAPI } from '@/services'

// Mock all dependencies
jest.mock('@/hooks/use-toast')
jest.mock('@/hooks/use-error-handler')
jest.mock('@/hooks/use-bulk-operations')
jest.mock('@/components/search-filter-bar')
jest.mock('@/services')

const mockToast = {
  toastSuccess: jest.fn(),
  toastError: jest.fn(),
}

const mockAPIErrorHandler = {
  handleAsyncError: jest.fn(),
  withRetry: jest.fn(),
}

const mockBulkOps = {
  bulkVerifyCredentials: jest.fn(),
  bulkRevokeCredentials: jest.fn(),
  bulkExportCredentials: jest.fn(),
  progress: {
    isRunning: false,
    current: 0,
    total: 0,
    successful: 0,
    failed: 0,
    errors: [],
  },
  resetProgress: jest.fn(),
}

const mockBulkSelection = {
  selectedItems: [],
  selectedCount: 0,
  isAllSelected: false,
  isIndeterminate: false,
  selectAll: jest.fn(),
  deselectAll: jest.fn(),
  toggleSelection: jest.fn(),
  isSelected: jest.fn(),
  selectedItemsData: [],
}

describe('Credential Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mocks
    ;(useToast as jest.Mock).mockReturnValue(mockToast)
    ;(useAPIErrorHandler as jest.Mock).mockReturnValue(mockAPIErrorHandler)
    ;(useBulkOperations as jest.Mock).mockReturnValue(mockBulkOps)
    ;(useBulkSelection as jest.Mock).mockReturnValue(mockBulkSelection)
    ;(SearchFilterBar as jest.Mock).mockImplementation(() => <div data-testid="search-filter-bar" />)

    // Mock API calls
    ;(credentialsAPI.queryCredentials as jest.Mock).mockResolvedValue([])
    ;(credentialsAPI.getCredentialsBySubject as jest.Mock).mockResolvedValue([])
  })

  it('should load credentials on component mount', async () => {
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

    ;(credentialsAPI.queryCredentials as jest.Mock).mockResolvedValue(mockCredentials)

    render(<CredentialsPage />)

    await waitFor(() => {
      expect(credentialsAPI.queryCredentials).toHaveBeenCalledWith({
        subject: 'did:web:alice.com',
      })
    })
  })

  it('should handle credential verification flow', async () => {
    const mockCredential = {
      id: 'cred-123',
      type: ['UniversityDegree'],
      issuerDid: 'did:web:university.edu',
      subjectDid: 'did:web:alice.com',
      status: 'pending',
      issuedAt: '2024-01-01T00:00:00Z',
      isLoading: false,
    }

    const mockVerificationResult = {
      verified: true,
      checks: [
        { type: 'signature', verified: true, message: 'Valid signature' },
        { type: 'issuer', verified: true, message: 'Trusted issuer' },
      ],
    }

    ;(credentialsAPI.queryCredentials as jest.Mock).mockResolvedValue([mockCredential])
    ;(credentialsAPI.verifyCredential as jest.Mock).mockResolvedValue(mockVerificationResult)

    render(<CredentialsPage />)

    await waitFor(() => {
      expect(screen.getByText('UniversityDegree')).toBeInTheDocument()
    })

    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /verify/i })
    fireEvent.click(verifyButton)

    await waitFor(() => {
      expect(credentialsAPI.verifyCredential).toHaveBeenCalledWith({
        credential: 'cred-123',
      })
      expect(mockToast.toastSuccess).toHaveBeenCalledWith(
        'Verification Successful',
        'Credential is valid and verified'
      )
    })
  })

  it('should handle credential revocation flow', async () => {
    const mockCredential = {
      id: 'cred-123',
      type: ['UniversityDegree'],
      issuerDid: 'did:web:university.edu',
      subjectDid: 'did:web:alice.com',
      status: 'verified',
      issuedAt: '2024-01-01T00:00:00Z',
      isLoading: false,
    }

    ;(credentialsAPI.queryCredentials as jest.Mock).mockResolvedValue([mockCredential])
    ;(credentialsAPI.revokeCredential as jest.Mock).mockResolvedValue(undefined)

    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm')
    confirmSpy.mockReturnValue(true)

    render(<CredentialsPage />)

    await waitFor(() => {
      expect(screen.getByText('UniversityDegree')).toBeInTheDocument()
    })

    // Click revoke button
    const revokeButton = screen.getByRole('button', { name: /revoke/i })
    fireEvent.click(revokeButton)

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to revoke this credential? This action cannot be undone.'
      )
      expect(credentialsAPI.revokeCredential).toHaveBeenCalledWith(
        'cred-123',
        expect.objectContaining({
          issuerDid: 'did:web:alice.com',
          reason: 'User requested revocation',
        })
      )
      expect(mockToast.toastSuccess).toHaveBeenCalledWith(
        'Credential Revoked',
        'The credential has been successfully revoked'
      )
    })

    confirmSpy.mockRestore()
  })

  it('should handle bulk operations correctly', async () => {
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

    ;(credentialsAPI.queryCredentials as jest.Mock).mockResolvedValue(mockCredentials)
    ;(useBulkSelection as jest.Mock).mockReturnValue({
      ...mockBulkSelection,
      selectedCount: 2,
      selectedItems: ['cred-123', 'cred-456'],
      selectedItemsData: mockCredentials,
    })

    render(<CredentialsPage />)

    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument()
    })

    // Click bulk verify button
    const bulkVerifyButton = screen.getByRole('button', { name: /verify selected/i })
    fireEvent.click(bulkVerifyButton)

    await waitFor(() => {
      expect(mockBulkOps.bulkVerifyCredentials).toHaveBeenCalledWith(mockCredentials)
    })
  })

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Failed to load credentials'
    ;(credentialsAPI.queryCredentials as jest.Mock).mockRejectedValue(new Error(errorMessage))

    render(<CredentialsPage />)

    await waitFor(() => {
      expect(mockAPIErrorHandler.handleAsyncError).toHaveBeenCalled()
    })
  })

  it('should show loading states correctly', async () => {
    // Mock slow API response
    ;(credentialsAPI.queryCredentials as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    )

    render(<CredentialsPage />)

    // Should show loading state initially
    expect(screen.getByText('Loading credentials...')).toBeInTheDocument()

    // Should resolve after API call
    await waitFor(() => {
      expect(screen.queryByText('Loading credentials...')).not.toBeInTheDocument()
    })
  })

  it('should handle search and filtering', async () => {
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

    ;(credentialsAPI.queryCredentials as jest.Mock).mockResolvedValue(mockCredentials)

    const mockOnSearchChange = jest.fn()
    ;(SearchFilterBar as jest.Mock).mockImplementation((props) => (
      <div data-testid="search-filter-bar">
        <button
          data-testid="search-trigger"
          onClick={() => props.onSearchChange({ items: mockCredentials })}
        >
          Search
        </button>
      </div>
    ))

    render(<CredentialsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('search-filter-bar')).toBeInTheDocument()
    })

    // Trigger search
    const searchButton = screen.getByTestId('search-trigger')
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalled()
    })
  })

  it('should handle credential details modal', async () => {
    const mockCredential = {
      id: 'cred-123',
      type: ['UniversityDegree'],
      issuerDid: 'did:web:university.edu',
      subjectDid: 'did:web:alice.com',
      status: 'verified',
      issuedAt: '2024-01-01T00:00:00Z',
    }

    const mockVerificationResult = {
      verified: true,
      checks: [
        { type: 'signature', verified: true, message: 'Valid signature' },
      ],
    }

    ;(credentialsAPI.queryCredentials as jest.Mock).mockResolvedValue([mockCredential])
    ;(credentialsAPI.verifyCredential as jest.Mock).mockResolvedValue(mockVerificationResult)
    ;(credentialsAPI.getRevocationStatus as jest.Mock).mockResolvedValue({
      revoked: false,
      revocationDate: null,
      reason: null,
    })

    render(<CredentialsPage />)

    await waitFor(() => {
      expect(screen.getByText('UniversityDegree')).toBeInTheDocument()
    })

    // Click view details button
    const viewButton = screen.getByRole('button', { name: /view details/i })
    fireEvent.click(viewButton)

    // Should show modal
    await waitFor(() => {
      expect(screen.getByText('Credential Details')).toBeInTheDocument()
    })
  })

  it('should handle credential sharing', async () => {
    const mockCredential = {
      id: 'cred-123',
      type: ['UniversityDegree'],
      issuerDid: 'did:web:university.edu',
      subjectDid: 'did:web:alice.com',
      status: 'verified',
      issuedAt: '2024-01-01T00:00:00Z',
    }

    ;(credentialsAPI.queryCredentials as jest.Mock).mockResolvedValue([mockCredential])
    ;(credentialsAPI.createPresentation as jest.Mock).mockResolvedValue({
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: 'did:web:alice.com',
      verifiableCredential: [mockCredential],
    })

    render(<CredentialsPage />)

    await waitFor(() => {
      expect(screen.getByText('UniversityDegree')).toBeInTheDocument()
    })

    // Click share button
    const shareButton = screen.getByRole('button', { name: /share/i })
    fireEvent.click(shareButton)

    await waitFor(() => {
      expect(credentialsAPI.createPresentation).toHaveBeenCalledWith(
        [mockCredential],
        'did:web:alice.com',
        expect.any(String),
        expect.any(String)
      )
      expect(mockToast.toastSuccess).toHaveBeenCalledWith(
        'Presentation Copied',
        'Credential presentation has been copied to clipboard'
      )
    })
  })
})
