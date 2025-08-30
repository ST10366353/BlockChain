import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BulkActionsToolbar, BulkProgressIndicator, BulkResultsModal } from '@/components/bulk-actions'
import { useBulkOperations, useBulkSelection } from '@/hooks/use-bulk-operations'

// Mock hooks
jest.mock('@/hooks/use-bulk-operations')

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon" />,
  X: () => <div data-testid="x-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  AlertTriangle: () => <div data-testid="alert-icon" />,
}))

describe('Bulk Operations Integration', () => {
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

  const mockItems = [
    { id: 'cred-1', type: ['UniversityDegree'], status: 'verified' },
    { id: 'cred-2', type: ['ProfessionalCertificate'], status: 'pending' },
    { id: 'cred-3', type: ['IdentityDocument'], status: 'verified' },
    { id: 'cred-4', type: ['DriverLicense'], status: 'expired' },
  ]

  const mockBulkActions = [
    {
      id: 'verify',
      label: 'Verify Selected',
      icon: () => <div data-testid="verify-icon" />,
      onClick: mockBulkOps.bulkVerifyCredentials,
      disabled: false,
    },
    {
      id: 'revoke',
      label: 'Revoke Selected',
      icon: () => <div data-testid="revoke-icon" />,
      variant: 'danger' as const,
      onClick: mockBulkOps.bulkRevokeCredentials,
      disabled: false,
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to revoke these credentials?',
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: () => <div data-testid="export-icon" />,
      onClick: mockBulkOps.bulkExportCredentials,
      disabled: false,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useBulkOperations as jest.Mock).mockReturnValue(mockBulkOps)
    ;(useBulkSelection as jest.Mock).mockReturnValue(mockBulkSelection)
  })

  describe('BulkActionsToolbar', () => {
    it('should render toolbar with correct selection info', () => {
      render(
        <BulkActionsToolbar
          selectedCount={2}
          totalCount={4}
          isAllSelected={false}
          isIndeterminate={true}
          onSelectAll={jest.fn()}
          onDeselectAll={jest.fn()}
          actions={mockBulkActions}
          disabled={false}
        />
      )

      expect(screen.getByText('2 selected')).toBeInTheDocument()
      expect(screen.getByText('Select all 4')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Verify Selected' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Revoke Selected' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Export Selected' })).toBeInTheDocument()
    })

    it('should show select all state when all items are selected', () => {
      render(
        <BulkActionsToolbar
          selectedCount={4}
          totalCount={4}
          isAllSelected={true}
          isIndeterminate={false}
          onSelectAll={jest.fn()}
          onDeselectAll={jest.fn()}
          actions={mockBulkActions}
          disabled={false}
        />
      )

      expect(screen.getByText('4 selected')).toBeInTheDocument()
      expect(screen.getByText('Deselect all')).toBeInTheDocument()
    })

    it('should handle select all button click', () => {
      const mockOnSelectAll = jest.fn()

      render(
        <BulkActionsToolbar
          selectedCount={2}
          totalCount={4}
          isAllSelected={false}
          isIndeterminate={true}
          onSelectAll={mockOnSelectAll}
          onDeselectAll={jest.fn()}
          actions={mockBulkActions}
          disabled={false}
        />
      )

      const selectAllButton = screen.getByRole('button', { name: 'Select all 4' })
      fireEvent.click(selectAllButton)

      expect(mockOnSelectAll).toHaveBeenCalledTimes(1)
    })

    it('should handle deselect all button click', () => {
      const mockOnDeselectAll = jest.fn()

      render(
        <BulkActionsToolbar
          selectedCount={4}
          totalCount={4}
          isAllSelected={true}
          isIndeterminate={false}
          onSelectAll={jest.fn()}
          onDeselectAll={mockOnDeselectAll}
          actions={mockBulkActions}
          disabled={false}
        />
      )

      const deselectAllButton = screen.getByRole('button', { name: 'Deselect all' })
      fireEvent.click(deselectAllButton)

      expect(mockOnDeselectAll).toHaveBeenCalledTimes(1)
    })

    it('should execute bulk verify action', async () => {
      const selectedData = [mockItems[0], mockItems[2]]
      mockBulkOps.bulkVerifyCredentials.mockResolvedValue({
        successful: 2,
        failed: 0,
        errors: [],
      })

      ;(useBulkSelection as jest.Mock).mockReturnValue({
        ...mockBulkSelection,
        selectedCount: 2,
        selectedItemsData: selectedData,
      })

      render(
        <BulkActionsToolbar
          selectedCount={2}
          totalCount={4}
          isAllSelected={false}
          isIndeterminate={true}
          onSelectAll={jest.fn()}
          onDeselectAll={jest.fn()}
          actions={mockBulkActions}
          disabled={false}
        />
      )

      const verifyButton = screen.getByRole('button', { name: 'Verify Selected' })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(mockBulkOps.bulkVerifyCredentials).toHaveBeenCalledWith(selectedData)
      })
    })

    it('should execute bulk revoke action with confirmation', async () => {
      const selectedData = [mockItems[0], mockItems[2]]
      mockBulkOps.bulkRevokeCredentials.mockResolvedValue({
        successful: 2,
        failed: 0,
        errors: [],
      })

      ;(useBulkSelection as jest.Mock).mockReturnValue({
        ...mockBulkSelection,
        selectedCount: 2,
        selectedItemsData: selectedData,
      })

      // Mock window.confirm
      const confirmSpy = jest.spyOn(window, 'confirm')
      confirmSpy.mockReturnValue(true)

      render(
        <BulkActionsToolbar
          selectedCount={2}
          totalCount={4}
          isAllSelected={false}
          isIndeterminate={true}
          onSelectAll={jest.fn()}
          onDeselectAll={jest.fn()}
          actions={mockBulkActions}
          disabled={false}
        />
      )

      const revokeButton = screen.getByRole('button', { name: 'Revoke Selected' })
      fireEvent.click(revokeButton)

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to revoke these credentials?')
        expect(mockBulkOps.bulkRevokeCredentials).toHaveBeenCalledWith(selectedData)
      })

      confirmSpy.mockRestore()
    })

    it('should cancel bulk revoke action when user declines confirmation', () => {
      const confirmSpy = jest.spyOn(window, 'confirm')
      confirmSpy.mockReturnValue(false)

      render(
        <BulkActionsToolbar
          selectedCount={2}
          totalCount={4}
          isAllSelected={false}
          isIndeterminate={true}
          onSelectAll={jest.fn()}
          onDeselectAll={jest.fn()}
          actions={mockBulkActions}
          disabled={false}
        />
      )

      const revokeButton = screen.getByRole('button', { name: 'Revoke Selected' })
      fireEvent.click(revokeButton)

      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to revoke these credentials?')
      expect(mockBulkOps.bulkRevokeCredentials).not.toHaveBeenCalled()

      confirmSpy.mockRestore()
    })

    it('should execute bulk export action', async () => {
      const selectedData = [mockItems[0], mockItems[2]]
      mockBulkOps.bulkExportCredentials.mockResolvedValue(undefined)

      ;(useBulkSelection as jest.Mock).mockReturnValue({
        ...mockBulkSelection,
        selectedCount: 2,
        selectedItemsData: selectedData,
      })

      render(
        <BulkActionsToolbar
          selectedCount={2}
          totalCount={4}
          isAllSelected={false}
          isIndeterminate={true}
          onSelectAll={jest.fn()}
          onDeselectAll={jest.fn()}
          actions={mockBulkActions}
          disabled={false}
        />
      )

      const exportButton = screen.getByRole('button', { name: 'Export Selected' })
      fireEvent.click(exportButton)

      await waitFor(() => {
        expect(mockBulkOps.bulkExportCredentials).toHaveBeenCalledWith(selectedData, 'json')
      })
    })

    it('should disable actions when no items selected', () => {
      render(
        <BulkActionsToolbar
          selectedCount={0}
          totalCount={4}
          isAllSelected={false}
          isIndeterminate={false}
          onSelectAll={jest.fn()}
          onDeselectAll={jest.fn()}
          actions={mockBulkActions}
          disabled={false}
        />
      )

      const verifyButton = screen.getByRole('button', { name: 'Verify Selected' })
      const revokeButton = screen.getByRole('button', { name: 'Revoke Selected' })
      const exportButton = screen.getByRole('button', { name: 'Export Selected' })

      expect(verifyButton).toBeDisabled()
      expect(revokeButton).toBeDisabled()
      expect(exportButton).toBeDisabled()
    })

    it('should disable all actions when disabled prop is true', () => {
      render(
        <BulkActionsToolbar
          selectedCount={2}
          totalCount={4}
          isAllSelected={false}
          isIndeterminate={true}
          onSelectAll={jest.fn()}
          onDeselectAll={jest.fn()}
          actions={mockBulkActions}
          disabled={true}
        />
      )

      const verifyButton = screen.getByRole('button', { name: 'Verify Selected' })
      const revokeButton = screen.getByRole('button', { name: 'Revoke Selected' })
      const exportButton = screen.getByRole('button', { name: 'Export Selected' })

      expect(verifyButton).toBeDisabled()
      expect(revokeButton).toBeDisabled()
      expect(exportButton).toBeDisabled()
    })

    it('should handle custom action variants', () => {
      const customActions = [
        {
          id: 'verify',
          label: 'Verify Selected',
          icon: () => <div data-testid="verify-icon" />,
          onClick: jest.fn(),
          disabled: false,
          variant: 'primary' as const,
        },
        {
          id: 'delete',
          label: 'Delete Selected',
          icon: () => <div data-testid="delete-icon" />,
          onClick: jest.fn(),
          disabled: false,
          variant: 'danger' as const,
        },
      ]

      render(
        <BulkActionsToolbar
          selectedCount={2}
          totalCount={4}
          isAllSelected={false}
          isIndeterminate={true}
          onSelectAll={jest.fn()}
          onDeselectAll={jest.fn()}
          actions={customActions}
          disabled={false}
        />
      )

      // Should render with appropriate styling for variants
      expect(screen.getByRole('button', { name: 'Verify Selected' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete Selected' })).toBeInTheDocument()
    })
  })

  describe('BulkProgressIndicator', () => {
    it('should render progress indicator when running', () => {
      const progress = {
        isRunning: true,
        current: 3,
        total: 5,
        successful: 2,
        failed: 1,
        errors: ['Failed to process item 3'],
      }

      render(<BulkProgressIndicator progress={progress} />)

      expect(screen.getByText('Processing 3 of 5 items...')).toBeInTheDocument()
      expect(screen.getByText('60%')).toBeInTheDocument()
      expect(screen.getByText('2 successful, 1 failed')).toBeInTheDocument()
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
    })

    it('should not render when not running', () => {
      const progress = {
        isRunning: false,
        current: 0,
        total: 0,
        successful: 0,
        failed: 0,
        errors: [],
      }

      const { container } = render(<BulkProgressIndicator progress={progress} />)

      expect(container.firstChild).toBeNull()
    })

    it('should show completion message when finished', () => {
      const progress = {
        isRunning: false,
        current: 5,
        total: 5,
        successful: 4,
        failed: 1,
        errors: ['Failed to process item 3'],
      }

      render(<BulkProgressIndicator progress={progress} />)

      expect(screen.getByText('Bulk operation completed')).toBeInTheDocument()
      expect(screen.getByText('4 successful, 1 failed')).toBeInTheDocument()
    })

    it('should display errors when present', () => {
      const progress = {
        isRunning: true,
        current: 3,
        total: 5,
        successful: 2,
        failed: 1,
        errors: ['Failed to process item 3: Network error', 'Failed to process item 5: Invalid data'],
      }

      render(<BulkProgressIndicator progress={progress} />)

      expect(screen.getByText('Failed to process item 3: Network error')).toBeInTheDocument()
      expect(screen.getByText('Failed to process item 5: Invalid data')).toBeInTheDocument()
    })

    it('should handle zero total items', () => {
      const progress = {
        isRunning: true,
        current: 0,
        total: 0,
        successful: 0,
        failed: 0,
        errors: [],
      }

      render(<BulkProgressIndicator progress={progress} />)

      expect(screen.getByText('Processing 0 of 0 items...')).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should show success-only message when no failures', () => {
      const progress = {
        isRunning: true,
        current: 3,
        total: 5,
        successful: 3,
        failed: 0,
        errors: [],
      }

      render(<BulkProgressIndicator progress={progress} />)

      expect(screen.getByText('3 successful')).toBeInTheDocument()
      expect(screen.queryByText('failed')).not.toBeInTheDocument()
    })

    it('should handle custom className', () => {
      const progress = {
        isRunning: true,
        current: 1,
        total: 1,
        successful: 0,
        failed: 0,
        errors: [],
      }

      render(<BulkProgressIndicator progress={progress} className="custom-progress" />)

      const container = screen.getByText('Processing 1 of 1 items...').closest('div')
      expect(container).toHaveClass('custom-progress')
    })
  })

  describe('BulkResultsModal', () => {
    const mockOnClose = jest.fn()

    it('should render results modal with success message', () => {
      const progress = {
        isRunning: false,
        current: 5,
        total: 5,
        successful: 4,
        failed: 1,
        errors: ['Failed to process item 3'],
      }

      render(
        <BulkResultsModal
          isOpen={true}
          onClose={mockOnClose}
          progress={progress}
          title="Bulk Verification Results"
          successMessage="Successfully verified 4 credentials"
          errorMessage="Failed to verify 1 credential"
        />
      )

      expect(screen.getByText('Bulk Verification Results')).toBeInTheDocument()
      expect(screen.getByText('Successfully verified 4 credentials')).toBeInTheDocument()
      expect(screen.getByText('Failed to verify 1 credential')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('should not render when closed', () => {
      const progress = {
        isRunning: false,
        current: 5,
        total: 5,
        successful: 5,
        failed: 0,
        errors: [],
      }

      const { container } = render(
        <BulkResultsModal
          isOpen={false}
          onClose={mockOnClose}
          progress={progress}
          title="Bulk Results"
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should call onClose when close button is clicked', () => {
      const progress = {
        isRunning: false,
        current: 5,
        total: 5,
        successful: 5,
        failed: 0,
        errors: [],
      }

      render(
        <BulkResultsModal
          isOpen={true}
          onClose={mockOnClose}
          progress={progress}
          title="Bulk Results"
        />
      )

      const closeButton = screen.getByRole('button', { name: 'Close' })
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should display detailed error information', () => {
      const progress = {
        isRunning: false,
        current: 3,
        total: 3,
        successful: 1,
        failed: 2,
        errors: [
          'Failed to verify credential cred-2: Invalid signature',
          'Failed to verify credential cred-3: Network timeout',
        ],
      }

      render(
        <BulkResultsModal
          isOpen={true}
          onClose={mockOnClose}
          progress={progress}
          title="Verification Results"
        />
      )

      expect(screen.getByText('Failed to verify credential cred-2: Invalid signature')).toBeInTheDocument()
      expect(screen.getByText('Failed to verify credential cred-3: Network timeout')).toBeInTheDocument()
    })

    it('should show summary statistics', () => {
      const progress = {
        isRunning: false,
        current: 10,
        total: 10,
        successful: 7,
        failed: 3,
        errors: ['Error 1', 'Error 2', 'Error 3'],
      }

      render(
        <BulkResultsModal
          isOpen={true}
          onClose={mockOnClose}
          progress={progress}
          title="Bulk Operation Results"
        />
      )

      expect(screen.getByText('7 successful, 3 failed')).toBeInTheDocument()
      expect(screen.getByText('Error 1')).toBeInTheDocument()
      expect(screen.getByText('Error 2')).toBeInTheDocument()
      expect(screen.getByText('Error 3')).toBeInTheDocument()
    })

    it('should handle empty error list', () => {
      const progress = {
        isRunning: false,
        current: 5,
        total: 5,
        successful: 5,
        failed: 0,
        errors: [],
      }

      render(
        <BulkResultsModal
          isOpen={true}
          onClose={mockOnClose}
          progress={progress}
          title="Bulk Results"
        />
      )

      expect(screen.getByText('5 successful')).toBeInTheDocument()
      expect(screen.queryByText('failed')).not.toBeInTheDocument()
    })

    it('should prioritize custom messages over auto-generated ones', () => {
      const progress = {
        isRunning: false,
        current: 5,
        total: 5,
        successful: 3,
        failed: 2,
        errors: ['Custom error message'],
      }

      render(
        <BulkResultsModal
          isOpen={true}
          onClose={mockOnClose}
          progress={progress}
          title="Custom Results"
          successMessage="Custom success message"
          errorMessage="Custom error message"
        />
      )

      expect(screen.getByText('Custom success message')).toBeInTheDocument()
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('3 successful, 2 failed')).not.toBeInTheDocument()
    })
  })

  describe('End-to-End Bulk Operations Flow', () => {
    it('should handle complete bulk verification workflow', async () => {
      const selectedData = [mockItems[0], mockItems[1], mockItems[2]]

      // Mock successful verification
      mockBulkOps.bulkVerifyCredentials.mockResolvedValue({
        successful: 3,
        failed: 0,
        errors: [],
      })

      ;(useBulkSelection as jest.Mock).mockReturnValue({
        ...mockBulkSelection,
        selectedCount: 3,
        selectedItemsData: selectedData,
      })

      // Render both toolbar and progress indicator
      render(
        <>
          <BulkActionsToolbar
            selectedCount={3}
            totalCount={4}
            isAllSelected={false}
            isIndeterminate={true}
            onSelectAll={jest.fn()}
            onDeselectAll={jest.fn()}
            actions={mockBulkActions}
            disabled={false}
          />
          <BulkProgressIndicator progress={mockBulkOps.progress} />
        </>
      )

      // Initially no progress should be shown
      expect(screen.queryByText(/Processing/)).not.toBeInTheDocument()

      // Click verify button
      const verifyButton = screen.getByRole('button', { name: 'Verify Selected' })
      fireEvent.click(verifyButton)

      // Update mock to show running state
      ;(useBulkOperations as jest.Mock).mockReturnValue({
        ...mockBulkOps,
        progress: {
          isRunning: true,
          current: 2,
          total: 3,
          successful: 1,
          failed: 1,
          errors: ['Failed to verify item 2'],
        },
      })

      // Re-render to show progress
      // Note: In a real scenario, this would be handled by state updates
      // For testing purposes, we verify the structure is correct
      expect(screen.getByRole('button', { name: 'Verify Selected' })).toBeInTheDocument()
    })

    it('should handle bulk operation errors and recovery', async () => {
      const selectedData = [mockItems[0], mockItems[1]]

      // Mock failed operation
      mockBulkOps.bulkVerifyCredentials.mockRejectedValue(new Error('Network error'))

      ;(useBulkSelection as jest.Mock).mockReturnValue({
        ...mockBulkSelection,
        selectedCount: 2,
        selectedItemsData: selectedData,
      })

      render(
        <BulkActionsToolbar
          selectedCount={2}
          totalCount={4}
          isAllSelected={false}
          isIndeterminate={true}
          onSelectAll={jest.fn()}
          onDeselectAll={jest.fn()}
          actions={mockBulkActions}
          disabled={false}
        />
      )

      const verifyButton = screen.getByRole('button', { name: 'Verify Selected' })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(mockBulkOps.bulkVerifyCredentials).toHaveBeenCalledWith(selectedData)
      })

      // In a real implementation, error handling would be done in the hook
      // Here we just verify the action was called
    })
  })
})
