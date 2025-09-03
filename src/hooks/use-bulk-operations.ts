"use client"

import { useState, useCallback, useMemo, useRef } from 'react'
import { useToast } from './use-toast'
import { useAPIErrorHandler } from './use-error-handler'
import { CredentialSummary, TrustedIssuer } from '@/services'

export interface BulkOperationResult<T = unknown> {
  success: boolean
  item: T
  error?: string
  data?: unknown
}

export interface BulkOperationProgress {
  total: number
  completed: number
  successful: number
  failed: number
  currentItem?: string
  isRunning: boolean
  results: BulkOperationResult[]
}

export interface BulkOperationOptions {
  maxConcurrent?: number
  continueOnError?: boolean
  showProgress?: boolean
  onProgress?: (progress: BulkOperationProgress) => void
  onItemComplete?: (result: BulkOperationResult) => void
}

export function useBulkOperations() {
  const { toastSuccess, toastError } = useToast()
  const { handleAsyncError } = useAPIErrorHandler()

  const [progress, setProgress] = useState<BulkOperationProgress>({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    isRunning: false,
    results: []
  })

  const progressRef = useRef(progress)

  // Keep ref in sync with state
  progressRef.current = progress

  const updateProgress = useCallback((updates: Partial<BulkOperationProgress>) => {
    setProgress(prev => {
      const newProgress = { ...prev, ...updates }
      progressRef.current = newProgress
      return newProgress
    })
  }, [])

  const resetProgress = useCallback(() => {
    setProgress({
      total: 0,
      completed: 0,
      successful: 0,
      failed: 0,
      isRunning: false,
      results: []
    })
  }, [])

  // Bulk credential verification
  const bulkVerifyCredentials = useCallback(async (
    credentials: CredentialSummary[],
    options: BulkOperationOptions = {}
  ): Promise<BulkOperationResult<CredentialSummary>[]> => {
    const {
      maxConcurrent = 3,
      continueOnError = true,
      showProgress = true,
      onProgress,
      onItemComplete
    } = options

    if (credentials.length === 0) return []

    updateProgress({
      total: credentials.length,
      completed: 0,
      successful: 0,
      failed: 0,
      isRunning: true,
      results: []
    })

    const results: BulkOperationResult<CredentialSummary>[] = []
    const chunks = []

    // Split into chunks for concurrent processing
    for (let i = 0; i < credentials.length; i += maxConcurrent) {
      chunks.push(credentials.slice(i, i + maxConcurrent))
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (credential) => {
        updateProgress({ currentItem: credential.id })

        const result = await handleAsyncError(async () => {
          // Simulate API call - in real app, this would call credentialsAPI.verifyCredential
          const verificationResult = {
            verified: Math.random() > 0.1, // 90% success rate for demo
            timestamp: new Date().toISOString(),
            errors: []
          }

          return {
            success: verificationResult.verified,
            item: credential,
            data: verificationResult
          }
        }, `Verify ${credential.id}`)

        const operationResult: BulkOperationResult<CredentialSummary> = {
          success: result !== null,
          item: credential,
          data: result?.data,
          error: result === null ? 'Verification failed' : undefined
        }

        results.push(operationResult)
        onItemComplete?.(operationResult)

        updateProgress({
          completed: progress.completed + 1,
          successful: progress.successful + (operationResult.success ? 1 : 0),
          failed: progress.failed + (operationResult.success ? 0 : 1),
          results: [...progress.results, operationResult]
        })

        return operationResult
      })

      await Promise.all(promises)

      if (!continueOnError && results.some(r => !r.success)) {
        break
      }
    }

    updateProgress({ isRunning: false, currentItem: undefined })

    const successfulCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length

    if (showProgress) {
      if (successfulCount > 0) {
        toastSuccess(
          'Bulk Verification Complete',
          `Successfully verified ${successfulCount} credential${successfulCount !== 1 ? 's' : ''}`
        )
      }

      if (failedCount > 0) {
        toastError(
          'Some Verifications Failed',
          `Failed to verify ${failedCount} credential${failedCount !== 1 ? 's' : ''}`
        )
      }
    }

    onProgress?.(progress)
    return results
  }, [handleAsyncError, updateProgress, toastSuccess, toastError, progress])

  // Bulk credential revocation
  const bulkRevokeCredentials = useCallback(async (
    credentials: CredentialSummary[],
    options: BulkOperationOptions = {}
  ): Promise<BulkOperationResult<CredentialSummary>[]> => {
    const {
      continueOnError = true,
      showProgress = true,
      onProgress,
      onItemComplete
    } = options

    if (credentials.length === 0) return []

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to revoke ${credentials.length} credential${credentials.length !== 1 ? 's' : ''}? This action cannot be undone.`
    )

    if (!confirmed) return []

    updateProgress({
      total: credentials.length,
      completed: 0,
      successful: 0,
      failed: 0,
      isRunning: true,
      results: []
    })

    const results: BulkOperationResult<CredentialSummary>[] = []

    for (const credential of credentials) {
      updateProgress({ currentItem: credential.id })

      const result = await handleAsyncError(async () => {
        // Simulate API call - in real app, this would call credentialsAPI.revokeCredential
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate delay

        return {
          success: true,
          item: credential,
          data: { revokedAt: new Date().toISOString() }
        }
      }, `Revoke ${credential.id}`)

      const operationResult: BulkOperationResult<CredentialSummary> = {
        success: result !== null,
        item: credential,
        data: result?.data,
        error: result === null ? 'Revocation failed' : undefined
      }

      results.push(operationResult)
      onItemComplete?.(operationResult)

      updateProgress({
        completed: progress.completed + 1,
        successful: progress.successful + (operationResult.success ? 1 : 0),
        failed: progress.failed + (operationResult.success ? 0 : 1),
        results: [...progress.results, operationResult]
      })

      if (!continueOnError && !operationResult.success) {
        break
      }
    }

    updateProgress({ isRunning: false, currentItem: undefined })

    const successfulCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length

    if (showProgress) {
      if (successfulCount > 0) {
        toastSuccess(
          'Bulk Revocation Complete',
          `Successfully revoked ${successfulCount} credential${successfulCount !== 1 ? 's' : ''}`
        )
      }

      if (failedCount > 0) {
        toastError(
          'Some Revocations Failed',
          `Failed to revoke ${failedCount} credential${failedCount !== 1 ? 's' : ''}`
        )
      }
    }

    onProgress?.(progress)
    return results
  }, [handleAsyncError, updateProgress, toastSuccess, toastError, progress])

  // Bulk connection trust/untrust
  const bulkUpdateConnections = useCallback(async (
    connections: TrustedIssuer[],
    newStatus: 'trusted' | 'suspended' | 'revoked',
    options: BulkOperationOptions = {}
  ): Promise<BulkOperationResult<TrustedIssuer>[]> => {
    const {
      continueOnError = true,
      showProgress = true,
      onProgress,
      onItemComplete
    } = options

    if (connections.length === 0) return []

    updateProgress({
      total: connections.length,
      completed: 0,
      successful: 0,
      failed: 0,
      isRunning: true,
      results: []
    })

    const results: BulkOperationResult<TrustedIssuer>[] = []

    for (const connection of connections) {
      updateProgress({ currentItem: connection.did })

      const result = await handleAsyncError(async () => {
        // Simulate API call - in real app, this would call trustAPI.updateTrustedIssuer
        await new Promise(resolve => setTimeout(resolve, 300)) // Simulate delay

        return {
          success: true,
          item: connection,
          data: {
            status: newStatus,
            updatedAt: new Date().toISOString()
          }
        }
      }, `Update ${connection.did}`)

      const operationResult: BulkOperationResult<TrustedIssuer> = {
        success: result !== null,
        item: connection,
        data: result?.data,
        error: result === null ? 'Update failed' : undefined
      }

      results.push(operationResult)
      onItemComplete?.(operationResult)

      updateProgress({
        completed: progress.completed + 1,
        successful: progress.successful + (operationResult.success ? 1 : 0),
        failed: progress.failed + (operationResult.success ? 0 : 1),
        results: [...progress.results, operationResult]
      })

      if (!continueOnError && !operationResult.success) {
        break
      }
    }

    updateProgress({ isRunning: false, currentItem: undefined })

    const successfulCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length

    if (showProgress) {
      const actionText = newStatus === 'trusted' ? 'trusted' :
                        newStatus === 'suspended' ? 'suspended' : 'revoked'

      if (successfulCount > 0) {
        toastSuccess(
          'Bulk Update Complete',
          `Successfully ${actionText} ${successfulCount} connection${successfulCount !== 1 ? 's' : ''}`
        )
      }

      if (failedCount > 0) {
        toastError(
          'Some Updates Failed',
          `Failed to update ${failedCount} connection${failedCount !== 1 ? 's' : ''}`
        )
      }
    }

    onProgress?.(progress)
    return results
  }, [handleAsyncError, updateProgress, toastSuccess, toastError, progress])

  // Bulk export credentials
  const bulkExportCredentials = useCallback(async (
    credentials: CredentialSummary[],
    format: 'json' | 'csv' = 'json'
  ): Promise<void> => {
    if (credentials.length === 0) return

    const result = await handleAsyncError(async () => {
      const exportData = credentials.map(cred => ({
        id: cred.id,
        type: cred.type,
        issuer: cred.issuerDid,
        subject: cred.subjectDid,
        status: cred.status,
        issuedAt: cred.issuedAt,
        expiresAt: cred.expiresAt
      }))

      let content: string
      let mimeType: string
      let filename: string

      if (format === 'json') {
        content = JSON.stringify(exportData, null, 2)
        mimeType = 'application/json'
        filename = `credentials_export_${new Date().toISOString().split('T')[0]}.json`
      } else {
        // CSV format
        const headers = ['ID', 'Type', 'Issuer', 'Subject', 'Status', 'Issued At', 'Expires At']
        const csvContent = [
          headers.join(','),
          ...exportData.map(item => [
            item.id,
            Array.isArray(item.type) ? item.type.join(';') : item.type,
            item.issuer,
            item.subject,
            item.status,
            item.issuedAt || '',
            item.expiresAt || ''
          ].map(field => `"${field}"`).join(','))
        ].join('\n')

        content = csvContent
        mimeType = 'text/csv'
        filename = `credentials_export_${new Date().toISOString().split('T')[0]}.csv`
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      toastSuccess(
        'Export Complete',
        `Successfully exported ${credentials.length} credential${credentials.length !== 1 ? 's' : ''} as ${format.toUpperCase()}`
      )
    }, 'Bulk Export')

    if (!result) {
      toastError('Export Failed', 'Unable to export credentials. Please try again.')
    }
  }, [handleAsyncError, toastSuccess, toastError])

  return {
    progress,
    resetProgress,
    bulkVerifyCredentials,
    bulkRevokeCredentials,
    bulkUpdateConnections,
    bulkExportCredentials
  }
}

// Hook for managing bulk selection
export function useBulkSelection<T extends { id: string }>(items: T[] = []) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())


  const isSelected = useCallback((id: string) => selectedItems.has(id), [selectedItems])

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    const allIds = new Set(items.map(item => item.id))
    setSelectedItems(allIds)
    setSelectAllMode(true)
  }, [items])

  const deselectAll = useCallback(() => {
    setSelectedItems(new Set())
    setSelectAllMode(false)
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.size === items.length) {
      deselectAll()
    } else {
      selectAll()
    }
  }, [selectedItems.size, items.length, selectAll, deselectAll])

  const selectedCount = selectedItems.size
  const isAllSelected = selectedItems.size === items.length && items.length > 0
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < items.length

  const selectedItemsData = useMemo(() => {
    return items.filter(item => selectedItems.has(item.id))
  }, [items, selectedItems])

  return {
    selectedItems,
    selectedCount,
    selectedItemsData,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,
    isAllSelected,
    isIndeterminate
  }
}
