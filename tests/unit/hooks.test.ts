import { renderHook, act } from '@testing-library/react'
import { useState, useEffect } from 'react'
import { useToast } from '../../src/shared/hooks/use-toast'
import { useAPIErrorHandler } from '../../src/hooks/use-error-handler'
import { useBulkOperations, useBulkSelection } from '../../src/hooks/use-bulk-operations'

// Mock dependencies
jest.mock('../../src/shared/hooks/use-toast')
jest.mock('../../src/hooks/use-error-handler')
jest.mock('../../src/hooks/use-bulk-operations')

const mockToast = {
  toastSuccess: jest.fn(),
  toastError: jest.fn(),
}

const mockAPIErrorHandler = {
  handleAsyncError: jest.fn(),
  withRetry: jest.fn((fn) => fn()),
}

describe('Custom Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToast as jest.Mock).mockReturnValue(mockToast)
    ;(useAPIErrorHandler as jest.Mock).mockReturnValue(mockAPIErrorHandler)
  })

  describe('useToast', () => {
    it('should provide toast functions', () => {
      const { result } = renderHook(() => useToast())

      expect(result.current).toHaveProperty('toastSuccess')
      expect(result.current).toHaveProperty('toastError')
      expect(typeof result.current.toastSuccess).toBe('function')
      expect(typeof result.current.toastError).toBe('function')
    })

    it('should call toastSuccess with correct parameters', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toastSuccess('Success Title', 'Success message')
      })

      expect(mockToast.toastSuccess).toHaveBeenCalledWith('Success Title', 'Success message')
    })

    it('should call toastError with correct parameters', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toastError('Error Title', 'Error message')
      })

      expect(mockToast.toastError).toHaveBeenCalledWith('Error Title', 'Error message')
    })
  })

  describe('useAPIErrorHandler', () => {
    it('should provide error handling functions', () => {
      const { result } = renderHook(() => useAPIErrorHandler())

      expect(result.current).toHaveProperty('handleAsyncError')
      expect(result.current).toHaveProperty('withRetry')
      expect(typeof result.current.handleAsyncError).toBe('function')
      expect(typeof result.current.withRetry).toBe('function')
    })

    it('should handle async errors', async () => {
      const { result } = renderHook(() => useAPIErrorHandler())

      const mockAsyncFunction = jest.fn().mockRejectedValue(new Error('API Error'))

      await act(async () => {
        await result.current.handleAsyncError(
          () => mockAsyncFunction(),
          'Test Operation'
        )
      })

      expect(mockAPIErrorHandler.handleAsyncError).toHaveBeenCalled()
    })

    it('should retry operations with withRetry', async () => {
      const { result } = renderHook(() => useAPIErrorHandler())

      const mockAsyncFunction = jest.fn().mockResolvedValue('success')

      const resultValue = await act(async () => {
        return result.current.withRetry(
          () => mockAsyncFunction(),
          2,
          100,
          'Test Operation'
        )
      })

      expect(resultValue).toBe('success')
      expect(mockAPIErrorHandler.withRetry).toHaveBeenCalled()
    })
  })

  describe('useBulkSelection', () => {
    const mockItems = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: '3', name: 'Item 3' },
    ]

    it('should initialize with correct state', () => {
      const mockBulkSelectionHook = {
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

      ;(useBulkSelection as jest.Mock).mockReturnValue(mockBulkSelectionHook)

      const { result } = renderHook(() => useBulkSelection(mockItems))

      expect(result.current.selectedCount).toBe(0)
      expect(result.current.isAllSelected).toBe(false)
      expect(result.current.isIndeterminate).toBe(false)
    })

    it('should handle select all', () => {
      const mockBulkSelectionHook = {
        selectedItems: ['1', '2', '3'],
        selectedCount: 3,
        isAllSelected: true,
        isIndeterminate: false,
        selectAll: jest.fn(),
        deselectAll: jest.fn(),
        toggleSelection: jest.fn(),
        isSelected: jest.fn(),
        selectedItemsData: mockItems,
      }

      ;(useBulkSelection as jest.Mock).mockReturnValue(mockBulkSelectionHook)

      const { result } = renderHook(() => useBulkSelection(mockItems))

      act(() => {
        result.current.selectAll()
      })

      expect(result.current.selectedCount).toBe(3)
      expect(result.current.isAllSelected).toBe(true)
      expect(mockBulkSelectionHook.selectAll).toHaveBeenCalled()
    })

    it('should handle deselect all', () => {
      const mockBulkSelectionHook = {
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

      ;(useBulkSelection as jest.Mock).mockReturnValue(mockBulkSelectionHook)

      const { result } = renderHook(() => useBulkSelection(mockItems))

      act(() => {
        result.current.deselectAll()
      })

      expect(result.current.selectedCount).toBe(0)
      expect(result.current.isAllSelected).toBe(false)
      expect(mockBulkSelectionHook.deselectAll).toHaveBeenCalled()
    })

    it('should handle toggle selection', () => {
      const mockBulkSelectionHook = {
        selectedItems: ['1'],
        selectedCount: 1,
        isAllSelected: false,
        isIndeterminate: true,
        selectAll: jest.fn(),
        deselectAll: jest.fn(),
        toggleSelection: jest.fn(),
        isSelected: jest.fn().mockReturnValue(false),
        selectedItemsData: [mockItems[0]],
      }

      ;(useBulkSelection as jest.Mock).mockReturnValue(mockBulkSelectionHook)

      const { result } = renderHook(() => useBulkSelection(mockItems))

      act(() => {
        result.current.toggleSelection('2')
      })

      expect(mockBulkSelectionHook.toggleSelection).toHaveBeenCalledWith('2')
    })

    it('should check if item is selected', () => {
      const mockBulkSelectionHook = {
        selectedItems: ['1', '3'],
        selectedCount: 2,
        isAllSelected: false,
        isIndeterminate: true,
        selectAll: jest.fn(),
        deselectAll: jest.fn(),
        toggleSelection: jest.fn(),
        isSelected: jest.fn().mockImplementation((id) => ['1', '3'].includes(id)),
        selectedItemsData: [mockItems[0], mockItems[2]],
      }

      ;(useBulkSelection as jest.Mock).mockReturnValue(mockBulkSelectionHook)

      const { result } = renderHook(() => useBulkSelection(mockItems))

      expect(result.current.isSelected('1')).toBe(true)
      expect(result.current.isSelected('2')).toBe(false)
      expect(result.current.isSelected('3')).toBe(true)
    })
  })

  describe('useBulkOperations', () => {
    it('should provide bulk operation functions', () => {
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

      ;(useBulkOperations as jest.Mock).mockReturnValue(mockBulkOps)

      const { result } = renderHook(() => useBulkOperations())

      expect(result.current).toHaveProperty('bulkVerifyCredentials')
      expect(result.current).toHaveProperty('bulkRevokeCredentials')
      expect(result.current).toHaveProperty('bulkExportCredentials')
      expect(result.current).toHaveProperty('progress')
      expect(result.current).toHaveProperty('resetProgress')
    })

    it('should handle bulk verify credentials', async () => {
      const mockBulkOps = {
        bulkVerifyCredentials: jest.fn().mockResolvedValue({
          successful: 2,
          failed: 0,
          errors: [],
        }),
        bulkRevokeCredentials: jest.fn(),
        bulkExportCredentials: jest.fn(),
        progress: {
          isRunning: true,
          current: 2,
          total: 2,
          successful: 2,
          failed: 0,
          errors: [],
        },
        resetProgress: jest.fn(),
      }

      ;(useBulkOperations as jest.Mock).mockReturnValue(mockBulkOps)

      const { result } = renderHook(() => useBulkOperations())

      const credentials = [
        { id: 'cred-1', type: ['Test'] },
        { id: 'cred-2', type: ['Test'] },
      ]

      await act(async () => {
        await result.current.bulkVerifyCredentials(credentials)
      })

      expect(mockBulkOps.bulkVerifyCredentials).toHaveBeenCalledWith(credentials)
      expect(result.current.progress.successful).toBe(2)
      expect(result.current.progress.failed).toBe(0)
    })

    it('should handle bulk revoke credentials', async () => {
      const mockBulkOps = {
        bulkVerifyCredentials: jest.fn(),
        bulkRevokeCredentials: jest.fn().mockResolvedValue({
          successful: 1,
          failed: 1,
          errors: ['Failed to revoke cred-2'],
        }),
        bulkExportCredentials: jest.fn(),
        progress: {
          isRunning: true,
          current: 2,
          total: 2,
          successful: 1,
          failed: 1,
          errors: ['Failed to revoke cred-2'],
        },
        resetProgress: jest.fn(),
      }

      ;(useBulkOperations as jest.Mock).mockReturnValue(mockBulkOps)

      const { result } = renderHook(() => useBulkOperations())

      const credentials = [
        { id: 'cred-1', type: ['Test'] },
        { id: 'cred-2', type: ['Test'] },
      ]

      await act(async () => {
        await result.current.bulkRevokeCredentials(credentials)
      })

      expect(mockBulkOps.bulkRevokeCredentials).toHaveBeenCalledWith(credentials)
      expect(result.current.progress.successful).toBe(1)
      expect(result.current.progress.failed).toBe(1)
    })

    it('should handle bulk export credentials', async () => {
      const mockBulkOps = {
        bulkVerifyCredentials: jest.fn(),
        bulkRevokeCredentials: jest.fn(),
        bulkExportCredentials: jest.fn().mockResolvedValue(undefined),
        progress: {
          isRunning: true,
          current: 3,
          total: 3,
          successful: 3,
          failed: 0,
          errors: [],
        },
        resetProgress: jest.fn(),
      }

      ;(useBulkOperations as jest.Mock).mockReturnValue(mockBulkOps)

      const { result } = renderHook(() => useBulkOperations())

      const credentials = [
        { id: 'cred-1', type: ['Test'] },
        { id: 'cred-2', type: ['Test'] },
        { id: 'cred-3', type: ['Test'] },
      ]

      await act(async () => {
        await result.current.bulkExportCredentials(credentials, 'json')
      })

      expect(mockBulkOps.bulkExportCredentials).toHaveBeenCalledWith(credentials, 'json')
      expect(result.current.progress.successful).toBe(3)
    })

    it('should reset progress', () => {
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

      ;(useBulkOperations as jest.Mock).mockReturnValue(mockBulkOps)

      const { result } = renderHook(() => useBulkOperations())

      act(() => {
        result.current.resetProgress()
      })

      expect(mockBulkOps.resetProgress).toHaveBeenCalled()
    })
  })
})



