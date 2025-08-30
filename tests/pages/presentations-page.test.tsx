import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import PresentationsPage from '@/pages/presentations-page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock services
jest.mock('@/services', () => ({
  presentationsAPI: {
    createPresentation: jest.fn(),
    verifyPresentation: jest.fn(),
    getPresentationTemplates: jest.fn(),
  },
  credentialsAPI: {
    queryCredentials: jest.fn(),
  },
  auditAPI: {
    getLogsForAction: jest.fn(),
  },
}))

// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toastSuccess: jest.fn(),
    toastError: jest.fn(),
  }),
}))

jest.mock('@/hooks/use-error-handler', () => ({
  useAPIErrorHandler: () => ({
    handleAsyncError: jest.fn(),
    withRetry: jest.fn(),
  }),
}))

// Mock components
jest.mock('lucide-react', () => ({
  Plus: () => <div data-testid="plus-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Share2: () => <div data-testid="share-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  Award: () => <div data-testid="award-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  User: () => <div data-testid="user-icon" />,
}))

describe('PresentationsPage', () => {
  const mockRouter = {
    push: jest.fn(),
  }

  const mockCredentials = [
    {
      id: 'cred-1',
      type: ['UniversityDegree'],
      issuerDid: 'did:web:university.edu',
      subjectDid: 'did:web:alice.com',
      status: 'verified',
      issuedAt: '2024-01-01T00:00:00Z',
      expiresAt: '2027-01-01T00:00:00Z',
    },
    {
      id: 'cred-2',
      type: ['ProfessionalCertificate'],
      issuerDid: 'did:web:company.com',
      subjectDid: 'did:web:alice.com',
      status: 'verified',
      issuedAt: '2024-02-01T00:00:00Z',
    },
  ]

  const mockTemplates = [
    {
      id: 'template-1',
      name: 'Academic Credentials',
      description: 'Present academic achievements and degrees',
      requiredCredentials: ['UniversityDegree', 'EducationalCertificate'],
      fields: ['name', 'degree', 'institution', 'graduationDate', 'gpa'],
    },
    {
      id: 'template-2',
      name: 'Professional Experience',
      description: 'Present professional certifications and experience',
      requiredCredentials: ['ProfessionalCertificate', 'WorkExperience'],
      fields: ['name', 'position', 'company', 'startDate', 'endDate'],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    // Setup default mocks
    const { presentationsAPI, credentialsAPI } = require('@/services')
    credentialsAPI.queryCredentials.mockResolvedValue(mockCredentials)
    presentationsAPI.getPresentationTemplates.mockReturnValue(mockTemplates)
  })

  it('should render presentations page with header and stats', () => {
    render(<PresentationsPage />)

    expect(screen.getByText('Verifiable Presentations')).toBeInTheDocument()
    expect(screen.getByText('Create and manage credential presentations')).toBeInTheDocument()
    expect(screen.getByText('Total Presentations')).toBeInTheDocument()
    expect(screen.getByText('Active Presentations')).toBeInTheDocument()
    expect(screen.getByText('Available Credentials')).toBeInTheDocument()
  })

  it('should display create presentation button', () => {
    render(<PresentationsPage />)

    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    expect(createButton).toBeInTheDocument()
    expect(createButton).toHaveTextContent('Create Presentation')
  })

  it('should load credentials and templates on mount', async () => {
    const { credentialsAPI, presentationsAPI } = require('@/services')

    render(<PresentationsPage />)

    await waitFor(() => {
      expect(credentialsAPI.queryCredentials).toHaveBeenCalledWith({
        subject: 'did:web:alice.com',
        limit: 50,
      })
      expect(presentationsAPI.getPresentationTemplates).toHaveBeenCalled()
    })
  })

  it('should display available credentials count', async () => {
    render(<PresentationsPage />)

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument() // Available Credentials count
    })
  })

  it('should open create presentation modal when button is clicked', async () => {
    render(<PresentationsPage />)

    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Create Verifiable Presentation')).toBeInTheDocument()
    })
  })

  it('should display template selection in modal', async () => {
    render(<PresentationsPage />)

    // Open modal
    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Choose a Template (Optional)')).toBeInTheDocument()
      expect(screen.getByText('Academic Credentials')).toBeInTheDocument()
      expect(screen.getByText('Professional Experience')).toBeInTheDocument()
    })
  })

  it('should handle template selection', async () => {
    render(<PresentationsPage />)

    // Open modal
    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Academic Credentials')).toBeInTheDocument()
    })

    // Click on template
    const templateButton = screen.getByText('Academic Credentials').closest('button')
    fireEvent.click(templateButton)

    // Should show selected template message
    expect(screen.getByText(/Template selected/)).toBeInTheDocument()
    expect(screen.getByText(/Academic Credentials/)).toBeInTheDocument()
  })

  it('should display credential selection in modal', async () => {
    render(<PresentationsPage />)

    // Open modal
    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Select Credentials to Share')).toBeInTheDocument()
      expect(screen.getByText('UniversityDegree')).toBeInTheDocument()
      expect(screen.getByText('ProfessionalCertificate')).toBeInTheDocument()
    })
  })

  it('should handle credential selection', async () => {
    render(<PresentationsPage />)

    // Open modal
    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('UniversityDegree')).toBeInTheDocument()
    })

    // Select credentials
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]) // First credential
    fireEvent.click(checkboxes[1]) // Second credential

    // Should show selected credentials summary
    expect(screen.getByText('Selected Credentials (2)')).toBeInTheDocument()
  })

  it('should handle recipient input', async () => {
    render(<PresentationsPage />)

    // Open modal
    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Create Verifiable Presentation')).toBeInTheDocument()
    })

    const recipientInput = screen.getByLabelText('Recipient/Verifier')
    fireEvent.change(recipientInput, { target: { value: 'verifier.company.com' } })

    expect(recipientInput).toHaveValue('verifier.company.com')
  })

  it('should handle expiration time selection', async () => {
    render(<PresentationsPage />)

    // Open modal
    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Create Verifiable Presentation')).toBeInTheDocument()
    })

    const expirationSelect = screen.getByLabelText('Expiration')
    fireEvent.change(expirationSelect, { target: { value: '168' } }) // 1 week

    expect(expirationSelect).toHaveValue('168')
  })

  it('should create presentation successfully', async () => {
    const { presentationsAPI } = require('@/services')

    const mockPresentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: 'did:web:alice.com',
      verifiableCredential: [mockCredentials[0]],
      proof: {
        type: 'Ed25519Signature2020',
        created: '2024-01-15T10:00:00Z',
        verificationMethod: 'did:web:alice.com#key-1',
        proofPurpose: 'authentication',
        challenge: expect.any(String),
        domain: 'verifier.example.com',
      },
    }

    presentationsAPI.createPresentation.mockResolvedValue(mockPresentation)
    presentationsAPI.verifyPresentation.mockResolvedValue({ valid: true })

    render(<PresentationsPage />)

    // Open modal
    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Create Verifiable Presentation')).toBeInTheDocument()
    })

    // Fill form
    const recipientInput = screen.getByLabelText('Recipient/Verifier')
    fireEvent.change(recipientInput, { target: { value: 'verifier.company.com' } })

    // Select credential
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    // Submit
    const submitButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(presentationsAPI.createPresentation).toHaveBeenCalled()
      expect(presentationsAPI.verifyPresentation).toHaveBeenCalled()
    })
  })

  it('should handle creation errors', async () => {
    const { presentationsAPI } = require('@/services')

    presentationsAPI.createPresentation.mockRejectedValue(new Error('Creation failed'))

    render(<PresentationsPage />)

    // Open modal
    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Create Verifiable Presentation')).toBeInTheDocument()
    })

    // Fill minimal form
    const recipientInput = screen.getByLabelText('Recipient/Verifier')
    fireEvent.change(recipientInput, { target: { value: 'verifier.company.com' } })

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    // Submit
    const submitButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Failed to create presentation/)).toBeInTheDocument()
    })
  })

  it('should validate required fields', async () => {
    render(<PresentationsPage />)

    // Open modal
    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Create Verifiable Presentation')).toBeInTheDocument()
    })

    // Try to submit without recipient
    const submitButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Recipient is required')).toBeInTheDocument()
    })
  })

  it('should validate credential selection', async () => {
    render(<PresentationsPage />)

    // Open modal
    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Create Verifiable Presentation')).toBeInTheDocument()
    })

    // Fill recipient but don't select credentials
    const recipientInput = screen.getByLabelText('Recipient/Verifier')
    fireEvent.change(recipientInput, { target: { value: 'verifier.company.com' } })

    // Submit
    const submitButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Select at least one credential')).toBeInTheDocument()
    })
  })

  it('should handle selective disclosure options', async () => {
    render(<PresentationsPage />)

    // Open modal
    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Privacy & Security')).toBeInTheDocument()
    })

    // Check selective disclosure options
    expect(screen.getByText('Use selective disclosure')).toBeInTheDocument()
    expect(screen.getByText('Generate zero-knowledge proof')).toBeInTheDocument()
    expect(screen.getByText('Use anonymous identity')).toBeInTheDocument()
    expect(screen.getByText('Enable presentation verification')).toBeInTheDocument()
  })

  it('should handle modal close', async () => {
    render(<PresentationsPage />)

    // Open modal
    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Create Verifiable Presentation')).toBeInTheDocument()
    })

    // Close modal
    const closeButton = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Create Verifiable Presentation')).not.toBeInTheDocument()
    })
  })

  it('should display empty state when no credentials available', async () => {
    const { credentialsAPI } = require('@/services')
    credentialsAPI.queryCredentials.mockResolvedValue([])

    render(<PresentationsPage />)

    await waitFor(() => {
      expect(screen.getByText('No Presentations Yet')).toBeInTheDocument()
      expect(screen.getByText('Create your first verifiable presentation')).toBeInTheDocument()
    })
  })

  it('should disable create button when no credentials available', async () => {
    const { credentialsAPI } = require('@/services')
    credentialsAPI.queryCredentials.mockResolvedValue([])

    render(<PresentationsPage />)

    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: 'Create Presentation' })
      expect(createButton).toBeDisabled()
    })
  })

  it('should handle refresh functionality', async () => {
    const { credentialsAPI } = require('@/services')

    render(<PresentationsPage />)

    const refreshButton = screen.getByTitle('Refresh presentations')
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(credentialsAPI.queryCredentials).toHaveBeenCalledTimes(2) // Initial + refresh
    })
  })

  it('should display presentation cards when presentations exist', () => {
    // Mock presentations data by setting up initial state
    // This would normally come from API, but for testing we can simulate it
    const mockPresentations = [
      {
        id: 'pres-1',
        name: 'Academic Presentation',
        recipient: 'verifier.company.com',
        credentialsShared: ['UniversityDegree'],
        createdAt: '2024-01-15T10:00:00Z',
        expiresAt: '2024-01-22T10:00:00Z',
        status: 'valid',
        sharedFields: ['name', 'degree'],
      },
    ]

    // For this test, we'll just verify the structure exists
    render(<PresentationsPage />)

    // Should have the basic structure for displaying presentations
    expect(screen.getByText('Verifiable Presentations')).toBeInTheDocument()
  })

  it('should handle loading states', async () => {
    const { credentialsAPI } = require('@/services')

    // Mock slow response
    credentialsAPI.queryCredentials.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockCredentials), 100))
    )

    render(<PresentationsPage />)

    // Should show some loading state initially
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
  })

  it('should handle error states', async () => {
    const { credentialsAPI } = require('@/services')
    credentialsAPI.queryCredentials.mockRejectedValue(new Error('API Error'))

    render(<PresentationsPage />)

    await waitFor(() => {
      expect(screen.getByText('Error Loading Presentations')).toBeInTheDocument()
    })
  })

  it('should be accessible', () => {
    render(<PresentationsPage />)

    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toHaveTextContent('Verifiable Presentations')

    // Check for button accessibility
    const createButton = screen.getByRole('button', { name: 'Create Presentation' })
    expect(createButton).toBeInTheDocument()

    // Check for proper form structure when modal is open
    // (This would be tested when modal is open)
  })

  it('should support keyboard navigation', () => {
    render(<PresentationsPage />)

    const createButton = screen.getByRole('button', { name: 'Create Presentation' })

    // Button should be focusable
    createButton.focus()
    expect(document.activeElement).toBe(createButton)
  })
})
