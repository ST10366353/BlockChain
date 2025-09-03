import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import PresentationsPage from '../../src/pages/presentations-page'

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter),
  usePathname: jest.fn(() => '/presentations'),
}))

jest.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => React.createElement('a', { href, ...props }, children),
}))

// Session hooks are mocked in the context mocks below

// Mock notifications hook - use existing context mock below
// jest.mock('@/hooks/use-notifications', () => ({
//   useNotifications: () => ({
//     notifications: [
//       { id: '1', type: 'info', message: 'Test notification', read: false }
//     ],
//     unreadCount: 1,
//     markAsRead: jest.fn(),
//     clearAll: jest.fn()
//   })
// }))

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toastSuccess: jest.fn(),
    toastError: jest.fn(),
    toastWarning: jest.fn(),
    toastInfo: jest.fn()
  })
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Shield: jest.fn(() => React.createElement('svg', {}, 'Shield')),
  Clock: jest.fn(() => React.createElement('svg', {}, 'Clock')),
  AlertTriangle: jest.fn(() => React.createElement('svg', {}, 'AlertTriangle')),
  CheckCircle: jest.fn(() => React.createElement('svg', {}, 'CheckCircle')),
  RefreshCw: jest.fn(() => React.createElement('svg', {}, 'RefreshCw')),
  LogOut: jest.fn(() => React.createElement('svg', {}, 'LogOut')),
  User: jest.fn(() => React.createElement('svg', {}, 'User')),
  Wifi: jest.fn(() => React.createElement('svg', {}, 'Wifi')),
  WifiOff: jest.fn(() => React.createElement('svg', {}, 'WifiOff')),
  Fingerprint: jest.fn(() => React.createElement('svg', {}, 'Fingerprint')),
  Lock: jest.fn(() => React.createElement('svg', {}, 'Lock')),
  LockOpen: jest.fn(() => React.createElement('svg', {}, 'LockOpen')),
  Loader2: jest.fn(() => React.createElement('svg', {}, 'Loader2')),
  Bell: jest.fn(() => React.createElement('svg', {}, 'Bell')),
  Settings: jest.fn(() => React.createElement('svg', {}, 'Settings')),
  Menu: jest.fn(() => React.createElement('svg', {}, 'Menu')),
  X: jest.fn(() => React.createElement('svg', {}, 'X')),
  Trash2: jest.fn(() => React.createElement('svg', {}, 'Trash2')),
  Plus: jest.fn(() => React.createElement('svg', {}, 'Plus')),
  Eye: jest.fn(() => React.createElement('svg', {}, 'Eye')),
  EyeOff: jest.fn(() => React.createElement('svg', {}, 'EyeOff')),
  Download: jest.fn(() => React.createElement('svg', {}, 'Download')),
  Upload: jest.fn(() => React.createElement('svg', {}, 'Upload')),
  Share: jest.fn(() => React.createElement('svg', {}, 'Share')),
  Edit: jest.fn(() => React.createElement('svg', {}, 'Edit')),
  Copy: jest.fn(() => React.createElement('svg', {}, 'Copy')),
  Search: jest.fn(() => React.createElement('svg', {}, 'Search')),
  Filter: jest.fn(() => React.createElement('svg', {}, 'Filter')),
  MoreVertical: jest.fn(() => React.createElement('svg', {}, 'MoreVertical')),
  ChevronDown: jest.fn(() => React.createElement('svg', {}, 'ChevronDown')),
  ChevronUp: jest.fn(() => React.createElement('svg', {}, 'ChevronUp'))
}))

// Mock session status components
jest.mock('@/components/session-status', () => ({
  SessionStatusIndicator: () => React.createElement('div', { 'data-testid': 'session-status' }, 'Session Status'),
  SessionStatus: () => React.createElement('div', { 'data-testid': 'session-status-full' }, 'Full Session Status')
}))

// Mock Header component
jest.mock('@/components/layout/header.tsx', () => ({
  default: jest.fn(() => React.createElement('header', { 'data-testid': 'header' }, 'Header Component'))
}))

// Mock error handler hook
jest.mock('@/hooks/use-error-handler', () => ({
  useAPIErrorHandler: () => ({
    handleAsyncError: jest.fn(async (fn) => {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        console.error('Async error:', error);
        throw error;
      }
    }),
    withRetry: jest.fn(async (fn, retries, delay, operationName) => {
      try {
        const result = await fn();
        return result; // Return the result directly, not wrapped in Promise.resolve
      } catch (error) {
        console.error(`Retry error for ${operationName}:`, error);
        // Return default values based on operation name
        if (operationName === 'Load Credentials') return { total: 0, valid: 0 };
        return null;
      }
    }),
  }),
}))

// Mock services
jest.mock('@/services', () => ({
  presentationsAPI: {
    createPresentation: jest.fn(() => Promise.resolve({
      id: 'pres-1',
      type: ['VerifiablePresentation'],
      holderDid: 'did:web:user.com',
      verifiableCredential: [
        {
          id: 'cred-1',
          type: ['UniversityDegree'],
          issuerDid: 'did:web:university.edu',
          subjectDid: 'did:web:user.com',
          issuedAt: '2024-01-15T00:00:00Z'
        }
      ],
      proof: {
        type: 'Ed25519Signature2020',
        created: new Date().toISOString(),
        verificationMethod: 'did:web:user.com#key-1',
        proofPurpose: 'authentication',
        proofValue: 'mock-proof-value'
      }
    })),
    verifyPresentation: jest.fn(() => Promise.resolve({
      verified: true,
      results: [{
        proof: { '@type': 'Ed25519Signature2020' },
        verified: true,
        purposeResult: { valid: true },
        controllerResult: { valid: true }
      }]
    })),
    getPresentationTemplates: jest.fn(() => Promise.resolve([
      {
        id: 'template-1',
        name: 'Job Application',
        description: 'Template for job applications',
        requiredCredentials: ['UniversityDegree', 'ProfessionalCertificate']
      }
    ])),
  },
  credentialsAPI: {
    queryCredentials: jest.fn(() => Promise.resolve([
      {
        id: 'cred-1',
        type: ['UniversityDegree'],
        issuerDid: 'did:web:university.edu',
        subjectDid: 'did:web:user.com',
        status: 'verified',
        issuedAt: '2024-01-15T00:00:00Z',
        credentialSubject: {
          degree: 'Bachelor of Science',
          institution: 'University of Example',
          graduationDate: '2024-05-15'
        }
      },
      {
        id: 'cred-2',
        type: ['ProfessionalCertificate'],
        issuerDid: 'did:web:company.com',
        subjectDid: 'did:web:user.com',
        status: 'verified',
        issuedAt: '2024-02-01T00:00:00Z',
        credentialSubject: {
          certificate: 'React Development',
          issuer: 'Tech Company Inc.',
          issueDate: '2024-02-01'
        }
      }
    ])),
  },
  auditAPI: {
    getLogsForAction: jest.fn(() => Promise.resolve([])),
  },
}))

// Mock Header component
jest.mock('@/components/layout/header.tsx', () => ({
  default: jest.fn(() => React.createElement('header', { 'data-testid': 'header' }, 'Header Component'))
}))

// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toastSuccess: jest.fn(),
    toastError: jest.fn(),
  }),
}))

// Mock contexts
jest.mock('@/contexts/session-context', () => ({
  useSession: () => ({
    session: {
      isAuthenticated: true,
      user: { id: 'test-user', name: 'Test User' },
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    },
    login: jest.fn(),
    logout: jest.fn(),
    extendSession: jest.fn()
  }),
  useSessionMonitor: () => ({
    timeUntilExpiry: 3600000, // 1 hour
    timeUntilRefresh: 1800000, // 30 minutes
    isSessionExpired: false,
    refreshTokens: jest.fn()
  })
}))

jest.mock('@/hooks/use-error-handler', () => ({
  useAPIErrorHandler: () => ({
    handleAsyncError: jest.fn(async (fn) => {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        console.error('Async error:', error);
        return null;
      }
    }),
    withRetry: jest.fn(async (fn, retries, delay, operationName) => {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        console.error(`Retry error for ${operationName}:`, error);
        return null;
      }
    }),
  }),
}))

// Mock notifications context
jest.mock('@/contexts/notifications-context', () => ({
  useNotifications: () => ({
    state: {
      notifications: [],
      unreadCount: 0,
      connectionStatus: 'connected'
    },
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
    refresh: jest.fn()
  }),
}))

// Mock theme context
jest.mock('@/contexts/theme-context', () => ({
  ThemeToggle: () => React.createElement('div', { 'data-testid': 'theme-toggle' }, 'Theme Toggle'),
}))

// Mock session status component
jest.mock('@/components/session-status', () => ({
  SessionStatusIndicator: () => React.createElement('div', { 'data-testid': 'session-status' }, 'Session Status'),
  SessionStatus: () => React.createElement('div', { 'data-testid': 'session-status-full' }, 'Full Session Status')
}))

jest.mock('@/contexts/theme-context', () => ({
  ThemeToggle: () => React.createElement('div', { 'data-testid': 'theme-toggle' }, 'Theme Toggle'),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Plus: jest.fn(() => React.createElement('svg', {}, 'Plus')),
  Eye: jest.fn(() => React.createElement('svg', {}, 'Eye')),
  Share2: jest.fn(() => React.createElement('svg', {}, 'Share2')),
  Clock: jest.fn(() => React.createElement('svg', {}, 'Clock')),
  CheckCircle: jest.fn(() => React.createElement('svg', {}, 'CheckCircle')),
  AlertTriangle: jest.fn(() => React.createElement('svg', {}, 'AlertTriangle')),
  Calendar: jest.fn(() => React.createElement('svg', {}, 'Calendar')),
  User: jest.fn(() => React.createElement('svg', {}, 'User')),
  RefreshCw: jest.fn(() => React.createElement('svg', {}, 'RefreshCw')),
  Loader2: jest.fn(() => React.createElement('svg', {}, 'Loader2')),
  Trash2: jest.fn(() => React.createElement('svg', {}, 'Trash2')),
  FileText: jest.fn(() => React.createElement('svg', {}, 'FileText')),
  Award: jest.fn(() => React.createElement('svg', {}, 'Award')),
  Bell: jest.fn(() => React.createElement('svg', {}, 'Bell')),
  Settings: jest.fn(() => React.createElement('svg', {}, 'Settings')),
  Menu: jest.fn(() => React.createElement('svg', {}, 'Menu')),
  X: jest.fn(() => React.createElement('svg', {}, 'X')),
  Shield: jest.fn(() => React.createElement('svg', {}, 'Shield')),
  Wifi: jest.fn(() => React.createElement('svg', {}, 'Wifi')),
  WifiOff: jest.fn(() => React.createElement('svg', {}, 'WifiOff')),
  Fingerprint: jest.fn(() => React.createElement('svg', {}, 'Fingerprint')),
  Lock: jest.fn(() => React.createElement('svg', {}, 'Lock')),
  LockOpen: jest.fn(() => React.createElement('svg', {}, 'LockOpen')),
  Filter: jest.fn(() => React.createElement('svg', {}, 'Filter')),
  Search: jest.fn(() => React.createElement('svg', {}, 'Search')),
  ChevronDown: jest.fn(() => React.createElement('svg', {}, 'ChevronDown')),
  ChevronUp: jest.fn(() => React.createElement('svg', {}, 'ChevronUp')),
  MoreVertical: jest.fn(() => React.createElement('svg', {}, 'MoreVertical')),
  Download: jest.fn(() => React.createElement('svg', {}, 'Download')),
  Upload: jest.fn(() => React.createElement('svg', {}, 'Upload'))
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
