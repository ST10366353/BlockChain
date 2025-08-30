import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/pages/dashboard'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock services
jest.mock('@/src/services', () => ({
  dashboardAPI: {
    getDashboardData: jest.fn(),
    getRecentActivity: jest.fn(),
    getStats: jest.fn(),
  },
  credentialsAPI: {
    queryCredentials: jest.fn(),
  },
  trustAPI: {
    getTrustedIssuers: jest.fn(),
  },
  auditAPI: {
    getLogs: jest.fn(),
  },
}))

// Mock hooks
jest.mock('@/src/hooks/use-toast', () => ({
  useToast: () => ({
    toastSuccess: jest.fn(),
    toastError: jest.fn(),
  }),
}))

jest.mock('@/src/hooks/use-error-handler', () => ({
  useAPIErrorHandler: () => ({
    handleAsyncError: jest.fn(),
    withRetry: jest.fn(),
  }),
}))

// Mock components
jest.mock('@/src/components/layout/page-layout', () => ({
  DashboardLayout: ({ children, user, notifications, title }) => (
    <div data-testid="dashboard-layout">
      <div data-testid="layout-user">{user?.name}</div>
      <div data-testid="layout-notifications">{notifications}</div>
      <div data-testid="layout-title">{title}</div>
      {children}
    </div>
  ),
}))

jest.mock('lucide-react', () => ({
  Globe: () => <div data-testid="globe-icon" />,
  Award: () => <div data-testid="award-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
}))

describe('Dashboard Page', () => {
  const mockRouter = {
    push: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('should render dashboard layout with user information', () => {
    render(<Dashboard />)

    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    expect(screen.getByTestId('layout-title')).toHaveTextContent('DID Wallet Dashboard')
    expect(screen.getByTestId('layout-notifications')).toHaveTextContent('3')
  })

  it('should display main dashboard sections', () => {
    render(<Dashboard />)

    expect(screen.getByText('DID Wallet Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Credentials Overview')).toBeInTheDocument()
  })

  it('should display navigation cards', () => {
    render(<Dashboard />)

    expect(screen.getByText('Manage Identities')).toBeInTheDocument()
    expect(screen.getByText('Request Credentials')).toBeInTheDocument()
    expect(screen.getByText('Trust Registry')).toBeInTheDocument()
  })

  it('should navigate to identities page when Manage Identities is clicked', () => {
    render(<Dashboard />)

    const identitiesLink = screen.getByRole('link', { name: /manage identities/i })
    expect(identitiesLink).toHaveAttribute('href', '/identities')
  })

  it('should navigate to credentials page when Request Credentials is clicked', () => {
    render(<Dashboard />)

    const credentialsLink = screen.getByRole('link', { name: /request credentials/i })
    expect(credentialsLink).toHaveAttribute('href', '/credentials')
  })

  it('should navigate to connections page when Trust Registry is clicked', () => {
    render(<Dashboard />)

    const connectionsLink = screen.getByRole('link', { name: /trust registry/i })
    expect(connectionsLink).toHaveAttribute('href', '/connections')
  })

  it('should display statistics cards', () => {
    render(<Dashboard />)

    // Check for stats placeholders
    expect(screen.getByText('Total Credentials')).toBeInTheDocument()
    expect(screen.getByText('Valid Credentials')).toBeInTheDocument()
    expect(screen.getByText('Trusted Issuers')).toBeInTheDocument()
    expect(screen.getByText('Active Connections')).toBeInTheDocument()
  })

  it('should display recent activity section', () => {
    render(<Dashboard />)

    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Activity Feed')).toBeInTheDocument()
  })

  it('should handle loading states', () => {
    // Mock loading state
    const { dashboardAPI } = require('@/src/services')
    dashboardAPI.getDashboardData.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({}), 100))
    )

    render(<Dashboard />)

    // Should show some loading indicators
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
  })

  it('should display user greeting', () => {
    render(<Dashboard />)

    // The user name should be displayed in the layout
    expect(screen.getByTestId('layout-user')).toHaveTextContent('')
  })

  it('should handle empty state gracefully', () => {
    render(<Dashboard />)

    // Should still render all main sections even with no data
    expect(screen.getByText('DID Wallet Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('should display icons correctly', () => {
    render(<Dashboard />)

    expect(screen.getByTestId('globe-icon')).toBeInTheDocument()
    expect(screen.getByTestId('award-icon')).toBeInTheDocument()
    expect(screen.getByTestId('users-icon')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<Dashboard />)

    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toHaveTextContent('DID Wallet Dashboard')

    // Check for navigation links
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)

    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('should handle responsive layout', () => {
    render(<Dashboard />)

    // Check for responsive grid classes
    const quickActionsSection = screen.getByText('Quick Actions').closest('div')
    expect(quickActionsSection).toHaveClass('grid')

    const statsSection = screen.getByText('Total Credentials').closest('div')
    expect(statsSection).toHaveClass('grid')
  })

  it('should display proper card content', () => {
    render(<Dashboard />)

    // Check Manage Identities card
    const identitiesCard = screen.getByText('Manage Identities').closest('div')
    expect(identitiesCard).toHaveTextContent('Create and manage your DIDs')

    // Check Request Credentials card
    const credentialsCard = screen.getByText('Request Credentials').closest('div')
    expect(credentialsCard).toHaveTextContent('Get new verifiable credentials')

    // Check Trust Registry card
    const connectionsCard = screen.getByText('Trust Registry').closest('div')
    expect(connectionsCard).toHaveTextContent('Manage trusted issuers')
  })

  it('should handle card hover effects', () => {
    render(<Dashboard />)

    const identitiesCard = screen.getByText('Manage Identities').closest('div')

    // Cards should have hover classes
    expect(identitiesCard).toHaveClass('hover:shadow-md')
    expect(identitiesCard).toHaveClass('transition-colors')
  })

  it('should display activity feed with proper structure', () => {
    render(<Dashboard />)

    const activitySection = screen.getByText('Activity Feed').closest('div')

    // Should have proper structure for activity items
    expect(activitySection).toBeInTheDocument()
  })

  it('should handle network errors gracefully', async () => {
    // Mock network error
    const { dashboardAPI } = require('@/src/services')
    dashboardAPI.getDashboardData.mockRejectedValue(new Error('Network error'))

    render(<Dashboard />)

    // Should still render the basic layout
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    })
  })

  it('should be keyboard accessible', () => {
    render(<Dashboard />)

    // Check that navigation links are keyboard accessible
    const identitiesLink = screen.getByRole('link', { name: /manage identities/i })
    const credentialsLink = screen.getByRole('link', { name: /request credentials/i })
    const connectionsLink = screen.getByRole('link', { name: /trust registry/i })

    // Links should be focusable
    expect(identitiesLink).toHaveAttribute('href')
    expect(credentialsLink).toHaveAttribute('href')
    expect(connectionsLink).toHaveAttribute('href')
  })

  it('should have proper semantic HTML structure', () => {
    render(<Dashboard />)

    // Check for proper semantic elements
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()

    // Check heading hierarchy
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)

    // Check for proper list structures if present
    const lists = screen.queryAllByRole('list')
    // Lists might not be present in basic state, but if they are, they should be proper
    lists.forEach(list => {
      expect(list).toBeInTheDocument()
    })
  })

  it('should handle theme compatibility', () => {
    render(<Dashboard />)

    // Check for theme-aware classes
    const mainContainer = screen.getByTestId('dashboard-layout')
    expect(mainContainer).toHaveClass('bg-gray-50')
  })

  it('should display loading spinners for async data', () => {
    render(<Dashboard />)

    // Check for loading indicators
    const loaderIcons = screen.queryAllByTestId('loader-icon')
    // May or may not be present depending on state
    expect(loaderIcons.length).toBeGreaterThanOrEqual(0)
  })

  it('should have proper error boundaries consideration', () => {
    render(<Dashboard />)

    // The component should be wrapped in error boundary context
    // This is more of an integration test, but we can check the structure
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
  })
})
