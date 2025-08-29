"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/src/components/layout/page-layout"
import { useToast } from "@/src/hooks/use-toast"
import { useAPIErrorHandler } from "@/src/hooks/use-error-handler"
import { useBulkOperations, useBulkSelection } from "@/src/hooks/use-bulk-operations"
import { BulkActionsToolbar, BulkProgressIndicator, BulkResultsModal } from "@/src/components/bulk-actions"
import SearchFilterBar from "@/src/components/search-filter-bar"
import {
  Plus,
  Search,
  Grid,
  List,
  Eye,
  Share2,
  CheckCircle,
  Clock,
  AlertTriangle,
  QrCode,
  Download,
  Calendar,
  Loader2,
  RefreshCw,
  Shield,
  Ban,
  ExternalLink,
} from "lucide-react"
import { credentialsAPI, trustAPI, auditAPI } from "@/src/services"
import type {
  CredentialSummary,
  VerificationResult,
  RevocationStatus,
  TrustedIssuer,
  AuditLogEntry
} from "@/src/services"
import QRCodeScanner, { type QRScanResult } from "@/src/components/qr-code-scanner"
import QRCodeGenerator, { useQRCodeGenerator, createCredentialQR } from "@/src/components/qr-code-generator"

// Enhanced Credential interface that works with API
interface Credential extends CredentialSummary {
  icon: string
  description: string
  fields: Record<string, any>
  // API-specific fields
  verificationResult?: VerificationResult
  revocationStatus?: RevocationStatus
  auditLogs?: AuditLogEntry[]
  isLoading?: boolean
  // Keep old properties for backward compatibility
  recipient?: string
  issued?: string
  expires?: string
  issuer?: string
  usageCount?: number
}

interface AppState {
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

interface CredentialDetailsModal {
  isOpen: boolean
  credential: Credential | null
  isLoading: boolean
  verificationResult?: VerificationResult
  revocationStatus?: RevocationStatus
  auditLogs?: AuditLogEntry[]
  error?: string
}

export default function CredentialsPage() {
  const { toastSuccess, toastError } = useToast()
  const { handleAsyncError, withRetry } = useAPIErrorHandler()

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchResults, setSearchResults] = useState<any>(null)
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>([])
  const [showBulkResults, setShowBulkResults] = useState(false)

  // Bulk operations
  const bulkOps = useBulkOperations()
  const bulkSelection = useBulkSelection(filteredCredentials)

  // API state management
  const [appState, setAppState] = useState<AppState>({
    isLoading: false,
    error: null,
    lastUpdated: null
  })

  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [credentialDetailsModal, setCredentialDetailsModal] = useState<CredentialDetailsModal>({
    isOpen: false,
    credential: null,
    isLoading: false
  })

  // QR Code functionality
  const [showQRScanner, setShowQRScanner] = useState(false)
  const qrGenerator = useQRCodeGenerator()

  // Request modal state
  const [requestIssuerUrl, setRequestIssuerUrl] = useState("")
  const [requestType, setRequestType] = useState("")
  const [requestError, setRequestError] = useState("")
  const [requestLoading, setRequestLoading] = useState(false)

  // Available issuers from trust registry
  const [trustedIssuers, setTrustedIssuers] = useState<TrustedIssuer[]>([])
  const [issuersLoading, setIssuersLoading] = useState(false)

  const user = {
    name: "Alice Johnson",
    primaryDID: "did:web:alice.com",
    anonymousDID: "did:key:z6Mk...",
  }

  // Mock initial data (will be replaced with API data)
  const [credentials, setCredentials] = useState<Credential[]>([])

  // Load credentials from API on component mount
  useEffect(() => {
    loadCredentials()
    loadTrustedIssuers()
  }, [])

  // Load credentials from the API
  const loadCredentials = async (params: any = {}) => {
    setAppState({ isLoading: true, error: null, lastUpdated: null })

    const result = await handleAsyncError(async () => {
      const apiCredentials = await credentialsAPI.queryCredentials({
        subject: user.primaryDID,
        ...params
      })

      // Transform API credentials to our interface
      const transformedCredentials: Credential[] = apiCredentials.map(apiCred => ({
        ...apiCred,
        icon: getCredentialIcon(apiCred.type),
        description: getCredentialDescription(apiCred.type),
        fields: {}, // Will be populated when viewing details
        isLoading: false
      }))

      setCredentials(transformedCredentials)
      setFilteredCredentials(transformedCredentials) // Initially show all credentials
      setAppState({
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      })

      return transformedCredentials
    }, 'Load Credentials')

    if (!result) {
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load credentials'
      }))
    }
  }

  // Handle search results from SearchFilterBar
  const handleSearchResults = (results: any) => {
    setSearchResults(results)
    setFilteredCredentials(results.items || credentials)
  }

  // Bulk action handlers
  const handleBulkVerify = async () => {
    if (bulkSelection.selectedCount === 0) return

    const results = await bulkOps.bulkVerifyCredentials(bulkSelection.selectedItemsData)
    setShowBulkResults(true)
  }

  const handleBulkRevoke = async () => {
    if (bulkSelection.selectedCount === 0) return

    const results = await bulkOps.bulkRevokeCredentials(bulkSelection.selectedItemsData)
    setShowBulkResults(true)
  }

  const handleBulkExport = async () => {
    if (bulkSelection.selectedCount === 0) return

    await bulkOps.bulkExportCredentials(bulkSelection.selectedItemsData, 'json')
    bulkSelection.deselectAll()
  }

  // Bulk actions configuration
  const bulkActions = [
    {
      id: 'verify',
      label: 'Verify Selected',
      icon: Shield,
      onClick: handleBulkVerify,
      disabled: bulkSelection.selectedCount === 0
    },
    {
      id: 'revoke',
      label: 'Revoke Selected',
      icon: Ban,
      variant: 'danger' as const,
      onClick: handleBulkRevoke,
      disabled: bulkSelection.selectedCount === 0,
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to revoke ${bulkSelection.selectedCount} credential${bulkSelection.selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: Download,
      onClick: handleBulkExport,
      disabled: bulkSelection.selectedCount === 0
    }
  ]

  // Load trusted issuers for the request modal
  const loadTrustedIssuers = async () => {
    setIssuersLoading(true)
    try {
      const issuers = await trustAPI.getTrustedIssuers({ status: 'trusted' })
      setTrustedIssuers(issuers)
    } catch (error) {
      console.error('Failed to load trusted issuers:', error)
    } finally {
      setIssuersLoading(false)
    }
  }

  // Get credential icon based on type
  const getCredentialIcon = (type: string[]): string => {
    const typeString = type.join(' ').toLowerCase()
    if (typeString.includes('degree') || typeString.includes('education')) return "🎓"
    if (typeString.includes('certificate') || typeString.includes('professional')) return "📜"
    if (typeString.includes('id') || typeString.includes('identity')) return "🆔"
    if (typeString.includes('license') || typeString.includes('driver')) return "🚗"
    if (typeString.includes('health') || typeString.includes('medical')) return "🏥"
    return "📄"
  }

  // Get credential description
  const getCredentialDescription = (type: string[]): string => {
    const typeString = type.join(' ')
    return `${typeString} Credential`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "expiring":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-3 h-3" />
      case "expiring":
        return <Clock className="w-3 h-3" />
      case "expired":
        return <AlertTriangle className="w-3 h-3" />
      case "pending":
        return <Clock className="w-3 h-3" />
      default:
        return <CheckCircle className="w-3 h-3" />
    }
  }



  const uniqueIssuers = Array.from(new Set(credentials.map((c) => c.issuerDid || c.issuer || '')))

  const CredentialCard = ({ credential }: { credential: Credential }) => (
    <div className="credential-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {/* Bulk selection checkbox */}
          <input
            type="checkbox"
            checked={bulkSelection.isSelected(credential.id)}
            onChange={() => bulkSelection.toggleSelection(credential.id)}
            className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-2xl mr-3">{credential.icon}</span>
          <div>
            <h3 className="font-semibold text-lg">
              {Array.isArray(credential.type) ? credential.type.join(', ') : credential.type}
            </h3>
            <p className="text-gray-600">{credential.issuerDid || credential.issuer}</p>
          </div>
        </div>
        <div className={`status-badge ${getStatusColor(credential.status)}`}>
          {getStatusIcon(credential.status)}
          <span className="ml-1 capitalize">{credential.status}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">{credential.description}</p>
        <p className="text-sm text-gray-600 flex items-center">
          <span className="mr-3">👤 {credential.subjectDid || credential.recipient}</span>
        </p>
        <p className="text-sm text-gray-600 flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          Issued: {credential.issuedAt ? new Date(credential.issuedAt).toLocaleDateString() : credential.issued}
        </p>
        {credential.expiresAt && (
          <p className="text-sm text-gray-600 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Expires: {new Date(credential.expiresAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleViewCredentialDetails(credential)}
          className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </button>
        <button
          onClick={() => handleShareCredential(credential)}
          className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </button>
        <button
          onClick={() => handleGenerateCredentialQR(credential)}
          className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          title="Generate QR Code"
        >
          <QrCode className="w-4 h-4 mr-1" />
          QR
        </button>
        <button
          onClick={() => handleVerifyCredential(credential)}
          disabled={credential.isLoading}
          className="flex items-center px-3 py-1 text-sm border border-green-300 text-green-700 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          {credential.isLoading ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Shield className="w-4 h-4 mr-1" />
          )}
          Verify
        </button>
        <button
          onClick={() => downloadJson(`${credential.type.join('-')}.json`, credential)}
          className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4 mr-1" />
          Export
        </button>
        {credential.status !== "expired" && (
          <button
            onClick={() => handleRevokeCredential(credential.id)}
            className="flex items-center px-3 py-1 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors"
          >
            <Ban className="w-4 h-4 mr-1" />
            Revoke
          </button>
        )}
      </div>
    </div>
  )

  const CredentialListItem = ({ credential }: { credential: Credential }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        {/* Bulk selection checkbox */}
        <input
          type="checkbox"
          checked={bulkSelection.isSelected(credential.id)}
          onChange={() => bulkSelection.toggleSelection(credential.id)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-2xl">{credential.icon}</span>
        <div>
          <h3 className="font-semibold">
            {Array.isArray(credential.type) ? credential.type.join(', ') : credential.type}
          </h3>
          <p className="text-sm text-gray-600">{credential.issuerDid || credential.issuer}</p>
          <p className="text-xs text-gray-500">
            Issued: {credential.issuedAt ? new Date(credential.issuedAt).toLocaleDateString() : credential.issued}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className={`status-badge ${getStatusColor(credential.status)}`}>
          {getStatusIcon(credential.status)}
          <span className="ml-1 capitalize">{credential.status}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewCredentialDetails(credential)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleShareCredential(credential)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleVerifyCredential(credential)}
            disabled={credential.isLoading}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded disabled:opacity-50"
            title="Verify"
          >
            {credential.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )

  // View credential details with API calls
  const handleViewCredentialDetails = async (credential: Credential) => {
    setCredentialDetailsModal({
      isOpen: true,
      credential,
      isLoading: true
    })

    try {
      // Load additional credential data in parallel
      const [verificationResult, revocationStatus, auditLogs] = await Promise.all([
        credentialsAPI.verifyCredential({ credential: credential.id }).catch(() => undefined),
        credentialsAPI.getRevocationStatus(credential.id).catch(() => undefined),
        auditAPI.getLogsForAction('vc.verify', 10).catch(() => [])
      ])

      setCredentialDetailsModal(prev => ({
        ...prev,
        isLoading: false,
        verificationResult,
        revocationStatus,
        auditLogs
      }))
    } catch (error) {
      setCredentialDetailsModal(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load credential details'
      }))
    }
  }

  // Request new credential
  const handleRequestCredential = async () => {
    if (!requestIssuerUrl.trim()) {
      setRequestError("Issuer URL is required")
      return
    }

    if (!requestType) {
      setRequestError("Credential type is required")
      return
    }

    setRequestLoading(true)
    setRequestError("")

    try {
      // Validate issuer URL
      new URL(requestIssuerUrl)

      // Check if issuer is trusted
      const issuerDID = `did:web:${new URL(requestIssuerUrl).hostname}`
      const isTrusted = await trustAPI.isIssuerTrusted(issuerDID)

      if (!isTrusted) {
        setRequestError("Issuer is not in the trusted registry")
        return
      }

      // Create pending credential entry
      const id = (credentials.length + 1).toString()
      const newCredential: Credential = {
        id,
        type: [requestType],
        issuerDid: issuerDID,
        subjectDid: user.primaryDID,
        status: "pending",
        issuedAt: new Date().toISOString(),
        icon: getCredentialIcon([requestType]),
        description: `Requested ${requestType} credential`,
        fields: {},
        isLoading: false
      }

      setCredentials(prev => [newCredential, ...prev])

      // Close modal and reset form
      setShowRequestModal(false)
      setRequestIssuerUrl("")
      setRequestType("")
      setRequestError("")

      // Log the credential request
      await auditAPI.getLogsForAction('vc.request', 1)

    } catch (error) {
      if (error instanceof TypeError) {
        setRequestError("Invalid issuer URL format")
      } else {
        setRequestError(error instanceof Error ? error.message : "Failed to request credential")
      }
    } finally {
      setRequestLoading(false)
    }
  }

  // Verify credential
  const handleVerifyCredential = async (credential: Credential) => {
    setCredentials(prev => prev.map(c =>
      c.id === credential.id ? { ...c, isLoading: true } : c
    ))

    const result = await withRetry(async () => {
      const verificationResult = await credentialsAPI.verifyCredential({
        credential: credential.id
      })

      setCredentials(prev => prev.map(c =>
        c.id === credential.id ? {
          ...c,
          status: verificationResult.verified ? "valid" : "error" as any,
          verificationResult,
          isLoading: false
        } : c
      ))

      if (verificationResult.verified) {
        toastSuccess("Verification Successful", "Credential is valid and verified")
      } else {
        toastError("Verification Failed", "Credential verification failed")
      }

      return verificationResult
    }, 2, 500, 'Credential Verification')

    if (!result) {
      setCredentials(prev => prev.map(c =>
        c.id === credential.id ? { ...c, isLoading: false, status: "error" as any } : c
      ))
    }

    return result
  }

  // Revoke credential
  const handleRevokeCredential = async (credentialId: string) => {
    if (!confirm("Are you sure you want to revoke this credential? This action cannot be undone.")) {
      return
    }

    const result = await handleAsyncError(async () => {
      await credentialsAPI.revokeCredential(credentialId, {
        issuerDid: user.primaryDID,
        reason: "User requested revocation"
      })

      // Update local state
      setCredentials(prev => prev.map(c =>
        c.id === credentialId ? { ...c, status: "expired" } : c
      ))

      toastSuccess("Credential Revoked", "The credential has been successfully revoked")
    }, 'Credential Revocation')

    if (!result) {
      toastError("Revocation Failed", "Unable to revoke the credential. Please try again.")
    }
  }

  // Share credential
  const handleShareCredential = async (credential: Credential) => {
    const result = await handleAsyncError(async () => {
      // Create verifiable presentation
      const presentation = await credentialsAPI.createPresentation(
        [credential.id],
        user.primaryDID
      )

      // Copy to clipboard
      await navigator.clipboard.writeText(JSON.stringify(presentation, null, 2))
      toastSuccess("Presentation Copied", "Credential presentation has been copied to clipboard")
    }, 'Credential Sharing')

    if (!result) {
      toastError("Sharing Failed", "Unable to create credential presentation. Please try again.")
    }
  }

  const downloadJson = (filename: string, data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // QR Code handlers
  const handleQRScan = async (result: QRScanResult) => {
    setShowQRScanner(false)

    try {
      if (result.type === 'credential') {
        // Handle credential sharing via QR
        toastSuccess("Credential Received", "Credential data has been received via QR code")
        // In a real implementation, you would process the credential data
        console.log('Credential QR scanned:', result.data)
      } else if (result.type === 'connection') {
        // Handle connection request via QR
        toastSuccess("Connection Request", "Connection request received via QR code")
        // In a real implementation, you would process the connection
        console.log('Connection QR scanned:', result.data)
      } else {
        toastError("Unsupported QR Code", `QR code type '${result.type}' is not supported for credentials`)
      }
    } catch (error) {
      toastError("QR Code Processing Failed", "Unable to process the scanned QR code")
    }
  }

  const handleGenerateCredentialQR = (credential: Credential) => {
    const qrData = createCredentialQR(
      credential.id,
      `${credential.type.join(', ')} Credential`,
      `Share ${credential.type.join(', ')} credential from ${credential.issuerDid || credential.issuer}`
    )
    qrGenerator.generateQRCode(qrData)
  }

  return (
    <DashboardLayout
      user={user}
      notifications={3}
      title="Credentials"
    >
        <div className="flex items-center justify-between mb-8">
          <div>
            {appState.lastUpdated && (
              <p className="text-sm text-gray-600 mt-1">
                Last updated: {new Date(appState.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => loadCredentials()}
              disabled={appState.isLoading}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Refresh credentials"
            >
              <RefreshCw className={`w-5 h-5 ${appState.isLoading ? 'animate-spin' : ''}`} />
            </button>
          <button
            onClick={() => setShowRequestModal(true)}
              disabled={appState.isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Request Credential
          </button>
        </div>
        </div>

        {appState.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">{appState.error}</p>
            </div>
          </div>
        )}

        {appState.isLoading && credentials.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
            <span>Loading credentials...</span>
          </div>
        )}

        {/* Advanced Search and Filter Bar */}
        <SearchFilterBar
          data={credentials}
          onSearchChange={handleSearchResults}
          searchOptions={{
            fields: ['type', 'issuerDid', 'subjectDid', 'status', 'description'],
            placeholder: "Search credentials by type, issuer, or status...",
            showAdvancedFilters: true
          }}
          filterConfig={{
            status: {
              label: "Status",
              type: "select",
              options: [
                { key: 'status', label: 'Verified', value: 'verified' },
                { key: 'status', label: 'Expiring Soon', value: 'expiring' },
                { key: 'status', label: 'Expired', value: 'expired' },
                { key: 'status', label: 'Pending', value: 'pending' },
                { key: 'status', label: 'Valid', value: 'valid' }
              ]
            },
            issuerDid: {
              label: "Issuer",
              type: "select",
              options: uniqueIssuers.map(issuer => ({
                key: 'issuerDid',
                label: issuer || 'Unknown Issuer',
                value: issuer
              }))
            },
            type: {
              label: "Credential Type",
              type: "multiselect",
              options: [
                { key: 'type', label: '🎓 Degree Certificate', value: 'UniversityDegree' },
                { key: 'type', label: '📜 Professional Certificate', value: 'ProfessionalCertificate' },
                { key: 'type', label: '🆔 Identity Document', value: 'IdentityDocument' },
                { key: 'type', label: '🚗 Driver License', value: 'DriverLicense' },
                { key: 'type', label: '🏥 Health Certificate', value: 'HealthCertificate' }
              ]
            },
            dateRange: {
              label: "Issue Date Range",
              type: "date"
            }
          }}
          sortOptions={{
            issuedAt: "Issue Date (Newest)",
            expiresAt: "Expiration Date",
            status: "Status",
            issuerDid: "Issuer"
          }}
          className="mb-6"
        />

        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={bulkSelection.selectedCount}
          totalCount={filteredCredentials.length}
          isAllSelected={bulkSelection.isAllSelected}
          isIndeterminate={bulkSelection.isIndeterminate}
          onSelectAll={bulkSelection.selectAll}
          onDeselectAll={bulkSelection.deselectAll}
          actions={bulkActions}
          disabled={appState.isLoading}
        />

        {/* Bulk Progress Indicator */}
        {bulkOps.progress.isRunning && (
          <BulkProgressIndicator
            progress={bulkOps.progress}
            className="mb-6"
          />
        )}

        {/* View Mode Toggle */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Credentials Display */}
        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCredentials.map((credential) => (
              <CredentialCard key={credential.id} credential={credential} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCredentials.map((credential) => (
              <CredentialListItem key={credential.id} credential={credential} />
            ))}
          </div>
        )}

        {filteredCredentials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No credentials found matching your criteria.</p>
          </div>
        )}

        {/* Request Credential Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Request Credential</h3>
                {issuersLoading && (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                )}
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <QrCode className="w-6 h-6 mr-2 text-gray-600" />
                  Scan QR Code from Issuer
                </button>

                <div className="text-center text-gray-500">or</div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trusted Issuer</label>
                  <select
                    value={requestIssuerUrl}
                    onChange={(e) => setRequestIssuerUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={issuersLoading}
                  >
                    <option value="">Select a trusted issuer</option>
                    {trustedIssuers.map((issuer) => (
                      <option key={issuer.did} value={issuer.did}>
                        {issuer.metadata?.name || issuer.did} {issuer.metadata?.jurisdiction && `(${issuer.metadata.jurisdiction})`}
                      </option>
                    ))}
                  </select>
                  {issuersLoading && (
                    <p className="text-xs text-gray-500 mt-1">Loading trusted issuers...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Credential Type</label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={issuersLoading}
                  >
                    <option value="">Select credential type</option>
                    <option value="UniversityDegree">Educational Certificate</option>
                    <option value="ProfessionalCertificate">Professional Certificate</option>
                    <option value="IdentityDocument">Identity Document</option>
                    <option value="DriverLicense">License</option>
                    <option value="HealthCertificate">Health Certificate</option>
                  </select>
                </div>

                {requestError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <p className="text-sm text-red-700">{requestError}</p>
                    </div>
                  </div>
                )}

                {trustedIssuers.length === 0 && !issuersLoading && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      No trusted issuers available. You can still request credentials by entering an issuer URL manually.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    disabled={requestLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestCredential}
                    disabled={requestLoading || !requestIssuerUrl || !requestType}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {requestLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credential Details Modal */}
        {credentialDetailsModal.isOpen && credentialDetailsModal.credential && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Credential Details</h3>
                <button
                  onClick={() => setCredentialDetailsModal({ isOpen: false, credential: null, isLoading: false })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {credentialDetailsModal.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
                  <span>Loading credential details...</span>
                </div>
              ) : credentialDetailsModal.error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-700">{credentialDetailsModal.error}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Credential Header */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">{credentialDetailsModal.credential.icon}</span>
                  <div>
                          <h4 className="font-semibold text-lg">{credentialDetailsModal.credential.type.join(', ')}</h4>
                          <p className="text-gray-600">{credentialDetailsModal.credential.issuerDid}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className={`status-badge ${getStatusColor(credentialDetailsModal.credential.status)}`}>
                              {getStatusIcon(credentialDetailsModal.credential.status)}
                              <span className="ml-1 capitalize">{credentialDetailsModal.credential.status}</span>
                            </div>
                            {credentialDetailsModal.verificationResult && (
                              <div className={`status-badge ${credentialDetailsModal.verificationResult.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {credentialDetailsModal.verificationResult.verified ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3" />
                                )}
                                <span className="ml-1">
                                  {credentialDetailsModal.verificationResult.verified ? 'Verified' : 'Verification Failed'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => credentialDetailsModal.credential && downloadJson(`${Array.isArray(credentialDetailsModal.credential.type) ? credentialDetailsModal.credential.type.join('-') : credentialDetailsModal.credential.type}.json`, credentialDetailsModal.credential)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                        title="Export credential"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                  </div>
                </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                  <div>
                      <h5 className="font-medium mb-3 flex items-center">
                        <Calendar className="w-4 h-4 text-gray-600 mr-2" />
                        Basic Information
                      </h5>
                    <div className="space-y-2 text-sm">
                      <div>
                          <span className="text-gray-600">Subject DID:</span>
                          <p className="font-mono text-xs break-all">{credentialDetailsModal.credential.subjectDid}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Issuer DID:</span>
                          <p className="font-mono text-xs break-all">{credentialDetailsModal.credential.issuerDid}</p>
                      </div>
                      <div>
                          <span className="text-gray-600">Issued:</span>
                          <p>{new Date(credentialDetailsModal.credential.issuedAt).toLocaleString()}</p>
                        </div>
                        {credentialDetailsModal.credential.expiresAt && (
                          <div>
                            <span className="text-gray-600">Expires:</span>
                            <p>{new Date(credentialDetailsModal.credential.expiresAt).toLocaleString()}</p>
                      </div>
                        )}
                        <div>
                          <span className="text-gray-600">Usage Count:</span>
                          <p>{credentialDetailsModal.credential.usageCount || 0} times</p>
                        </div>
                      </div>
                    </div>

                    {/* Verification & Revocation Status */}
                    <div>
                      <h5 className="font-medium mb-3 flex items-center">
                        <Shield className="w-4 h-4 text-blue-600 mr-2" />
                        Status Information
                      </h5>
                      <div className="space-y-2 text-sm">
                        {credentialDetailsModal.verificationResult && (
                          <div>
                            <span className="text-gray-600">Verification:</span>
                            <p className={credentialDetailsModal.verificationResult.verified ? 'text-green-700' : 'text-red-700'}>
                              {credentialDetailsModal.verificationResult.verified ? '✓ Valid' : '✗ Invalid'}
                            </p>
                            {credentialDetailsModal.verificationResult.errors && (
                              <ul className="list-disc list-inside text-xs text-red-600 mt-1">
                                {credentialDetailsModal.verificationResult.errors.map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}

                        {credentialDetailsModal.revocationStatus && (
                          <div>
                            <span className="text-gray-600">Revocation:</span>
                            <p className={credentialDetailsModal.revocationStatus.revoked ? 'text-red-700' : 'text-green-700'}>
                              {credentialDetailsModal.revocationStatus.revoked ? '✗ Revoked' : '✓ Active'}
                            </p>
                            {credentialDetailsModal.revocationStatus.revoked && credentialDetailsModal.revocationStatus.reason && (
                              <p className="text-xs text-red-600 mt-1">
                                Reason: {credentialDetailsModal.revocationStatus.reason}
                              </p>
                            )}
                        </div>
                      )}
                      </div>
                    </div>
                  </div>

                  {/* Credential Fields */}
                  {credentialDetailsModal.credential.fields && Object.keys(credentialDetailsModal.credential.fields).length > 0 && (
                    <div>
                      <h5 className="font-medium mb-3">Credential Data</h5>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                          {JSON.stringify(credentialDetailsModal.credential.fields, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Audit Logs */}
                  {credentialDetailsModal.auditLogs && credentialDetailsModal.auditLogs.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-3 flex items-center">
                        <Clock className="w-4 h-4 text-gray-600 mr-2" />
                        Recent Activity
                      </h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {credentialDetailsModal.auditLogs.slice(0, 5).map((log, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                              <span className="font-medium capitalize">{log.action}</span>
                              <span className="text-sm text-gray-600 ml-2">
                                {log.success ? '✓ Success' : '✗ Failed'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => handleShareCredential(credentialDetailsModal.credential!)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Credential
                  </button>
                    <button
                      onClick={() => handleVerifyCredential(credentialDetailsModal.credential!)}
                      disabled={credentialDetailsModal.credential.isLoading}
                      className="flex-1 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      {credentialDetailsModal.credential.isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Shield className="w-4 h-4 mr-2" />
                      )}
                      Re-verify
                    </button>
                    {credentialDetailsModal.credential.status !== "expired" && (
                      <button
                        onClick={() => handleRevokeCredential(credentialDetailsModal.credential!.id)}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Revoke
                  </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR Code Scanner */}
        <QRCodeScanner
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScan}
          title="Scan Credential QR Code"
          description="Point your camera at a credential QR code to receive it"
          expectedTypes={['credential', 'connection']}
        />

        {/* QR Code Generator */}
        <QRCodeGenerator
          isOpen={qrGenerator.isOpen}
          onClose={qrGenerator.closeQRCode}
          data={qrGenerator.qrData!}
        />

        {/* Bulk Results Modal */}
        <BulkResultsModal
          isOpen={showBulkResults}
          onClose={() => {
            setShowBulkResults(false)
            bulkOps.resetProgress()
            bulkSelection.deselectAll()
          }}
          progress={bulkOps.progress}
          title="Bulk Operation Results"
          successMessage={
            bulkOps.progress.successful > 0
              ? `Successfully processed ${bulkOps.progress.successful} credential${bulkOps.progress.successful !== 1 ? 's' : ''}`
              : undefined
          }
          errorMessage={
            bulkOps.progress.failed > 0
              ? `Failed to process ${bulkOps.progress.failed} credential${bulkOps.progress.failed !== 1 ? 's' : ''}`
              : undefined
          }
        />
    </DashboardLayout>
  )
}
