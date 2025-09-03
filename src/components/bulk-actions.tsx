"use client"

import { useState } from 'react'
import { CheckSquare, Square, MoreHorizontal, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { BulkOperationProgress } from '@/hooks/use-bulk-operations'

interface BulkActionsToolbarProps {
  selectedCount: number
  totalCount: number
  isAllSelected: boolean
  isIndeterminate: boolean
  onSelectAll: () => void
  onDeselectAll: () => void
  actions: BulkAction[]
  disabled?: boolean
}

export interface BulkAction {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'primary' | 'secondary' | 'danger'
  onClick: () => void
  disabled?: boolean
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onDeselectAll,
  actions,
  disabled = false
}: BulkActionsToolbarProps) {
  const [showActions, setShowActions] = useState(false)

  const handleActionClick = (action: BulkAction) => {
    if (action.disabled) return

    if (action.requiresConfirmation && action.confirmationMessage) {
      if (!window.confirm(action.confirmationMessage)) {
        return
      }
    }

    action.onClick()
    setShowActions(false)
  }



  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Selection Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={isAllSelected ? onDeselectAll : onSelectAll}
          disabled={disabled}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50"
        >
          {isAllSelected ? (
            <CheckSquare className="w-5 h-5" />
          ) : isIndeterminate ? (
            <div className="w-5 h-5 border-2 border-gray-400 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-sm" />
            </div>
          ) : (
            <Square className="w-5 h-5" />
          )}
          <span>
            {selectedCount === 0
              ? `Select all (${totalCount})`
              : selectedCount === totalCount
                ? `Deselect all (${totalCount})`
                : `${selectedCount} of ${totalCount} selected`
            }
          </span>
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedCount} selected
          </span>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              disabled={disabled}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
            >
              <span>Actions</span>
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                <div className="py-1">
                  {actions.map((action) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action)}
                        disabled={action.disabled}
                        className={`
                          w-full flex items-center space-x-2 px-3 py-2 text-sm text-left
                          hover:bg-gray-100 dark:hover:bg-gray-700
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${action.disabled ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100'}
                        `}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        <span>{action.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface BulkProgressIndicatorProps {
  progress: BulkOperationProgress
  onCancel?: () => void
  className?: string
}

export function BulkProgressIndicator({
  progress,
  onCancel,
  className = ''
}: BulkProgressIndicatorProps) {
  const percentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Processing {progress.completed} of {progress.total}
            </span>
          </div>

          {progress.currentItem && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
              Current: {progress.currentItem}
            </span>
          )}
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status Summary */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-600 dark:text-gray-400">
              {progress.successful} successful
            </span>
          </div>

          {progress.failed > 0 && (
            <div className="flex items-center space-x-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-gray-600 dark:text-gray-400">
                {progress.failed} failed
              </span>
            </div>
          )}
        </div>

        <span className="text-gray-500 dark:text-gray-400">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}

interface BulkResultsModalProps {
  isOpen: boolean
  onClose: () => void
  progress: BulkOperationProgress
  title: string
  successMessage?: string
  errorMessage?: string
}

export function BulkResultsModal({
  isOpen,
  onClose,
  progress,
  title,
  successMessage,
  errorMessage
}: BulkResultsModalProps) {
  if (!isOpen) return null

  const successfulResults = progress.results.filter(r => r.success)
  const failedResults = progress.results.filter(r => !r.success)

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Summary */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progress.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{progress.successful}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{progress.failed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
              </div>
            </div>

            {successMessage && progress.successful > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    {successMessage}
                  </span>
                </div>
              </div>
            )}

            {errorMessage && progress.failed > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-800 dark:text-red-200">
                    {errorMessage}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Results Details */}
          {failedResults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                Failed Items
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {failedResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <div>
                        <div className="text-sm font-medium text-red-800 dark:text-red-200">
                          {(result.item as any).id || 'Unknown Item'}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400">
                          {result.error || 'Operation failed'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {successfulResults.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                Successful Items
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {successfulResults.slice(0, 10).map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-200">
                          {(result.item as any).id || 'Unknown Item'}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Operation completed successfully
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {successfulResults.length > 10 && (
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-2">
                    And {successfulResults.length - 10} more successful items...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
