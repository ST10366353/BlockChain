"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/src/components/layout/page-layout"
import { useToast } from "@/src/hooks/use-toast"
import { useAPIErrorHandler } from "@/src/hooks/use-error-handler"
import SearchFilterBar from "@/src/components/search-filter-bar"
import {
  QrCode,
  Plus,
  Search,
  Award,
  Eye,
  Settings,
  Shield,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX,
  Copy,
  Share2,
} from "lucide-react"
import { trustAPI, auditAPI } from "@/src/services"
import type { TrustedIssuer, AuditLogEntry } from "@/src/services"
import QRCodeScanner, { type QRScanResult } from "@/src/components/qr-code-scanner"
import QRCodeGenerator, { useQRCodeGenerator, createConnectionQR } from "@/src/components/qr-code-generator"

// Enhanced Connection interface that works with TrustedIssuer
interface Connection extends Omit<TrustedIssuer, 'status'> {
  // Override status to match UI expectations
  status: 'active' | 'pending' | 'blocked'
  // Additional fields for UI
  lastInteraction?: string
  credentialsIssued?: number
  verificationsRequested?: number
  permissions?: string[]
  // Audit logs for this connection
  auditLogs?: AuditLogEntry[]
  isLoading?: boolean
}

interface AppState {
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

interface ConnectionDetailsModal {
  isOpen: boolean
  connection: Connection | null
  auditLogs?: AuditLogEntry[]
  isLoading: boolean
  error?: string
}

export default function ConnectionsPage() {
  const { toastSuccess, toastError } = useToast()
  const { handleAsyncError, withRetry } = useAPIErrorHandler()
  const [searchResults, setSearchResults] = useState<any>(null)
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([])

  // API state management
  const [appState, setAppState] = useState<AppState>({
    isLoading: false,
    error: null,
    lastUpdated: null
  })

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [connectionDetailsModal, setConnectionDetailsModal] = useState<ConnectionDetailsModal>({
    isOpen: false,
    connection: null,
    isLoading: false
  })

  // QR Code functionality
  const [showQRScanner, setShowQRScanner] = useState(false)
  const qrGenerator = useQRCodeGenerator()

  // Add connection form state
  const [newConnectionUrl, setNewConnectionUrl] = useState("")
  const [newConnectionName, setNewConnectionName] = useState("")
  const [newConnectionDescription, setNewConnectionDescription] = useState("")
  const [formError, setFormError] = useState<string>("")
  const [formLoading, setFormLoading] = useState(false)

  // Remove unused variables
  const [showConnectionDetails, setShowConnectionDetails] = useState<string | null>(null)

  const user = {
    name: "Alice Johnson",
    primaryDID: "did:web:alice.com",
    anonymousDID: "did:key:z6Mk...",
  }

  // Connections from trust registry API
  const [connections, setConnections] = useState<Connection[]>([])

  // Load connections from API on component mount
  useEffect(() => {
    loadConnections()
  }, [])

  // Load trusted issuers from the API
  const loadConnections = async (params: any = {}) => {
    setAppState({ isLoading: true, error: null, lastUpdated: null })

    const result = await handleAsyncError(async () => {
      const trustedIssuers = await trustAPI.getTrustedIssuers({
        status: params.status || undefined,
        limit: 100,
        offset: 0
      })

      // Transform trusted issuers to connections format
      const transformedConnections: Connection[] = trustedIssuers.map((issuer, index) => ({
        ...issuer,
        // Map status from API to UI status
        status: (issuer.status === 'trusted' ? 'active' :
                issuer.status === 'suspended' ? 'pending' :
                issuer.status === 'revoked' ? 'blocked' : 'active') as Connection['status'],
        // Add UI-specific fields
        lastInteraction: new Date(issuer.updatedAt).toLocaleDateString(),
        credentialsIssued: Math.floor(Math.random() * 10), // Mock data for demo
        verificationsRequested: Math.floor(Math.random() * 20), // Mock data for demo
        permissions: issuer.tags.map(tag => `access_${tag}`),
        isLoading: false
      }))

      setConnections(transformedConnections)
      setFilteredConnections(transformedConnections) // Initially show all connections
      setAppState({
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      })

      return transformedConnections
    }, 'Load Connections')

    if (!result) {
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load connections'
      }))
    }
  }

  // Handle search results from SearchFilterBar
  const handleSearchResults = (results: any) => {
    setSearchResults(results)
    setFilteredConnections(results.items || connections)
  }

  // View connection details with audit logs
  const handleViewConnectionDetails = async (connection: Connection) => {
    setConnectionDetailsModal({
      isOpen: true,
      connection,
      isLoading: true
    })

    try {
      // Load audit logs for this connection
      const auditLogs = await auditAPI.getLogsForAction('trust.registry', 20)

      setConnectionDetailsModal(prev => ({
        ...prev,
        auditLogs,
        isLoading: false
      }))
    } catch (error) {
      setConnectionDetailsModal(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load connection details'
      }))
    }
  }

  // Add new trusted issuer
  const handleAddConnection = async () => {
    if (!newConnectionUrl.trim()) {
      setFormError("DID or URL is required")
      return
    }

    if (!newConnectionName.trim()) {
      setFormError("Connection name is required")
      return
    }

    setFormLoading(true)
    setFormError("")

    try {
      // Validate DID format or URL
      let did: string
      if (newConnectionUrl.startsWith('did:')) {
        did = newConnectionUrl
      } else {
        // Convert URL to DID format
        const url = new URL(newConnectionUrl)
        did = `did:web:${url.hostname}`
      }

      // Create new trusted issuer
      const result = await trustAPI.addTrustedIssuer({
        did,
        tags: ['user-added'],
        metadata: {
          name: newConnectionName,
          description: newConnectionDescription || 'User-added trusted issuer',
          website: newConnectionUrl.startsWith('http') ? newConnectionUrl : undefined,
        }
      })

      // Add to local state with default values
      const newConnection: Connection = {
        did: result.did,
        status: 'pending' as Connection['status'],
        tags: ['user-added'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          name: newConnectionName,
          description: newConnectionDescription || 'User-added trusted issuer',
          website: newConnectionUrl.startsWith('http') ? newConnectionUrl : undefined,
        },
        evidenceUri: undefined,
        verifiedAt: undefined,
        verifiedBy: undefined,
        lastInteraction: 'Never',
        credentialsIssued: 0,
        verificationsRequested: 0,
        permissions: ['access_user-added'],
        isLoading: false
      }

      setConnections(prev => [newConnection, ...prev])

      // Close modal and reset form
      setShowAddModal(false)
      setNewConnectionUrl("")
      setNewConnectionName("")
      setNewConnectionDescription("")
      setFormError("")

    } catch (error) {
      console.error('Failed to add connection:', error)
      setFormError(error instanceof Error ? error.message : 'Failed to add connection')
    } finally {
      setFormLoading(false)
    }
  }

  // Update connection status
  const handleUpdateConnectionStatus = async (connection: Connection, newStatus: 'trusted' | 'suspended' | 'revoked') => {
    setConnections(prev => prev.map(c =>
      c.did === connection.did ? { ...c, isLoading: true } : c
    ))

    const result = await handleAsyncError(async () => {
      await trustAPI.updateTrustedIssuer(connection.did, {
        status: newStatus,
        metadata: connection.metadata
      })

      // Update local state
      setConnections(prev => prev.map(c =>
        c.did === connection.did ? {
          ...c,
          status: (newStatus === 'trusted' ? 'active' :
                  newStatus === 'suspended' ? 'pending' :
                  'blocked') as Connection['status'],
          isLoading: false
        } : c
      ))

      toastSuccess("Status Updated", `Connection status updated to ${newStatus}`)
    }, 'Update Connection Status')

    if (!result) {
      setConnections(prev => prev.map(c =>
        c.did === connection.did ? { ...c, isLoading: false } : c
      ))
      toastError("Update Failed", "Unable to update connection status. Please try again.")
    }
  }

  // Remove connection
  const handleRemoveConnection = async (connection: Connection) => {
    if (!confirm(`Are you sure you want to remove ${connection.metadata?.name || connection.did}?`)) {
      return
    }

    const result = await handleAsyncError(async () => {
      // Note: The API might not have a delete endpoint, so we'll just update status to revoked
      await trustAPI.updateTrustedIssuer(connection.did, {
        status: 'revoked',
        metadata: connection.metadata
      })

      // Remove from local state or mark as blocked
      setConnections(prev => prev.filter(c => c.did !== connection.did))

      toastSuccess("Connection Removed", "The connection has been successfully removed")
    }, 'Remove Connection')

    if (!result) {
      toastError("Removal Failed", "Unable to remove connection. Please try again.")
    }
  }

  const getTrustColor = (trustLevel: string) => {
    switch (trustLevel) {
      case "high":
        return "trust-high"
      case "medium":
        return "trust-medium"
      case "low":
        return "trust-low"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "blocked":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-3 h-3" />
      case "pending":
        return <Clock className="w-3 h-3" />
      case "blocked":
        return <AlertTriangle className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "issuer":
        return <Award className="w-6 h-6 text-green-600" />
      case "verifier":
        return <Eye className="w-6 h-6 text-blue-600" />
      case "both":
        return <Users className="w-6 h-6 text-purple-600" />
      default:
        return <Users className="w-6 h-6 text-gray-600" />
    }
  }



  const isValidDidOrUrl = (value: string) => {
    const didPattern = /^did:[a-z0-9]+:.+/i
    try {
      // URL
      // eslint-disable-next-line no-new
      new URL(value)
      return true
    } catch (_) {
      // not a URL, try DID
      return didPattern.test(value)
    }
  }



  // Utility function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // QR Code handlers
  const handleQRScan = async (result: QRScanResult) => {
    setShowQRScanner(false)

    try {
      if (result.type === 'connection') {
        // Handle connection request via QR
        toastSuccess("Connection Request", "Connection request received via QR code")
        // In a real implementation, you would process the connection request
        console.log('Connection QR scanned:', result.data)

        // Extract connection data
        const { did, name } = result.data

        // Create new connection entry
        const newConnection: Connection = {
          did,
          status: 'pending',
          tags: ['qr-scanned'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            name: name || 'QR Connection',
            description: 'Connection established via QR code',
          },
          evidenceUri: undefined,
          verifiedAt: undefined,
          verifiedBy: undefined,
          lastInteraction: new Date().toLocaleDateString(),
        }

        setConnections(prev => [newConnection, ...prev])

      } else if (result.type === 'credential') {
        // Handle credential sharing via QR
        toastSuccess("Credential Received", "Credential received via QR code")
        console.log('Credential QR scanned:', result.data)
      } else {
        toastError("Unsupported QR Code", `QR code type '${result.type}' is not supported for connections`)
      }
    } catch (error) {
      toastError("QR Code Processing Failed", "Unable to process the scanned QR code")
    }
  }

  const handleGenerateConnectionQR = (connection: Connection) => {
    const qrData = createConnectionQR(
      connection.did,
      connection.metadata?.name || 'Connection',
      connection.metadata?.description || 'Share connection via QR code'
    )
    qrGenerator.generateQRCode(qrData)
  }

  return (
    <DashboardLayout
      user={user}
      notifications={3}
      title="Trust Registry"
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
              onClick={() => loadConnections()}
              disabled={appState.isLoading}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Refresh connections"
            >
              <RefreshCw className={`w-5 h-5 ${appState.isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={appState.isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Scan QR Code
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={appState.isLoading}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg flex items-center hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Trusted Issuer
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

        {/* Advanced Search and Filter Bar */}
        <SearchFilterBar
          data={connections}
          onSearchChange={handleSearchResults}
          searchOptions={{
            fields: ['did', 'metadata.name', 'metadata.description', 'status', 'tags'],
            placeholder: "Search connections by name, DID, or tags...",
            showAdvancedFilters: true
          }}
          filterConfig={{
            status: {
              label: "Status",
              type: "select",
              options: [
                { key: 'status', label: 'Active', value: 'active' },
                { key: 'status', label: 'Pending', value: 'pending' },
                { key: 'status', label: 'Blocked', value: 'blocked' }
              ]
            },
            tags: {
              label: "Tags",
              type: "multiselect",
              options: [
                { key: 'tags', label: 'User Added', value: 'user-added' },
                { key: 'tags', label: 'Verified', value: 'verified' },
                { key: 'tags', label: 'Trusted', value: 'trusted' },
                { key: 'tags', label: 'Official', value: 'official' }
              ]
            },
            createdAt: {
              label: "Added Date Range",
              type: "date"
            }
          }}
          sortOptions={{
            createdAt: "Date Added (Newest)",
            updatedAt: "Last Updated",
            metadata: "Name (A-Z)",
            status: "Status"
          }}
          className="mb-6"
        />

        {/* Connection Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{filteredConnections.filter((c) => c.status === "active").length}</p>
                <p className="text-sm text-gray-600">Active Issuers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{filteredConnections.length}</p>
                <p className="text-sm text-gray-600">Total Connections</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{connections.filter((c) => c.status === "active").length}</p>
                <p className="text-sm text-gray-600">Trusted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{filteredConnections.filter((c) => c.status === "pending").length}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Connections List */}
        <div className="grid gap-4">
          {filteredConnections.map((connection) => (
            <div key={connection.did} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{connection.metadata?.name || connection.did}</h3>
                      {connection.metadata?.website && (
                        <a
                          href={connection.metadata.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3">{connection.metadata?.description || 'Trusted issuer'}</p>

                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`status-badge ${getStatusColor(connection.status)}`}>
                        {getStatusIcon(connection.status)}
                        <span className="ml-1 capitalize">{connection.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {connection.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>Added: {new Date(connection.createdAt).toLocaleDateString()}</span>
                      <span>Last updated: {connection.lastInteraction}</span>
                      {connection.credentialsIssued && <span>Issued: {connection.credentialsIssued} credentials</span>}
                      {connection.verificationsRequested && (
                        <span>Verified: {connection.verificationsRequested} times</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => copyToClipboard(connection.did)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="Copy DID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewConnectionDetails(connection)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {connection.status === "active" && (
                    <button
                      onClick={() => handleUpdateConnectionStatus(connection, 'suspended')}
                      disabled={connection.isLoading}
                      className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded disabled:opacity-50"
                      title="Suspend"
                    >
                      {connection.isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserX className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  {connection.status === "pending" && (
                    <button
                      onClick={() => handleUpdateConnectionStatus(connection, 'trusted')}
                      disabled={connection.isLoading}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded disabled:opacity-50"
                      title="Trust"
                    >
                      {connection.isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleGenerateConnectionQR(connection)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="Generate QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded" title="Share">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveConnection(connection)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredConnections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No connections found matching your criteria.</p>
          </div>
        )}

        {/* Add Connection Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Add Trusted Issuer</h3>
                {formLoading && (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                )}
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  disabled={formLoading}
                >
                  <QrCode className="w-6 h-6 mr-2 text-gray-600" />
                  Scan QR Code from Issuer
                </button>

                <div className="text-center text-gray-500">or</div>

                <div>
                  <label className="block text-sm font-medium mb-2">Issuer Name</label>
                  <input
                    type="text"
                    value={newConnectionName}
                    onChange={(e) => setNewConnectionName(e.target.value)}
                    placeholder="e.g., My University"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">DID or Service URL</label>
                  <input
                    type="text"
                    value={newConnectionUrl}
                    onChange={(e) => setNewConnectionUrl(e.target.value)}
                    placeholder="did:web:example.com or https://service.example.com"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a DID or URL to add as a trusted issuer
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                  <textarea
                    value={newConnectionDescription}
                    onChange={(e) => setNewConnectionDescription(e.target.value)}
                    placeholder="Brief description of this issuer..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formLoading}
                  />
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <p className="text-sm text-red-700">{formError}</p>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Trust Registry</h4>
                  <p className="text-sm text-blue-800">
                    New issuers start with "pending" status and will be reviewed before being marked as trusted.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    disabled={formLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddConnection}
                    disabled={formLoading || !newConnectionUrl || !newConnectionName}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {formLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Add Trusted Issuer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connection Details Modal */}
        {connectionDetailsModal.isOpen && connectionDetailsModal.connection && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Issuer Details</h3>
                <button
                  onClick={() => setConnectionDetailsModal({ isOpen: false, connection: null, isLoading: false })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {connectionDetailsModal.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
                  <span>Loading issuer details...</span>
                </div>
              ) : connectionDetailsModal.error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-700">{connectionDetailsModal.error}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Issuer Header */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-lg">{connectionDetailsModal.connection.metadata?.name || connectionDetailsModal.connection.did}</h4>
                          <p className="text-gray-600">{connectionDetailsModal.connection.did}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className={`status-badge ${getStatusColor(connectionDetailsModal.connection.status)}`}>
                              <CheckCircle className="w-3 h-3" />
                              <span className="ml-1 capitalize">{connectionDetailsModal.connection.status}</span>
                            </div>
                            <div className={`status-badge ${getTrustColor(connectionDetailsModal.connection.status === 'active' ? 'high' : 'medium')}`}>
                              <Shield className="w-3 h-3 mr-1" />
                              <span>Trusted</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(connectionDetailsModal.connection!.did)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                        title="Copy DID"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div>
                      <h5 className="font-medium mb-3 flex items-center">
                        <Shield className="w-4 h-4 text-blue-600 mr-2" />
                        Issuer Information
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <p>{connectionDetailsModal.connection.metadata?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">DID:</span>
                          <p className="font-mono text-xs break-all">{connectionDetailsModal.connection.did}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Website:</span>
                          <p>
                            {connectionDetailsModal.connection.metadata?.website ? (
                              <a
                                href={connectionDetailsModal.connection.metadata.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {connectionDetailsModal.connection.metadata.website}
                              </a>
                            ) : (
                              'N/A'
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Jurisdiction:</span>
                          <p>{connectionDetailsModal.connection.metadata?.jurisdiction || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Contact:</span>
                          <p>{connectionDetailsModal.connection.metadata?.contact || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {connectionDetailsModal.connection.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Information */}
                    <div>
                      <h5 className="font-medium mb-3 flex items-center">
                        <Clock className="w-4 h-4 text-gray-600 mr-2" />
                        Status Information
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <p className={`font-medium ${
                            connectionDetailsModal.connection.status === 'active' ? 'text-green-700' :
                            connectionDetailsModal.connection.status === 'pending' ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            {connectionDetailsModal.connection.status === 'active' ? '✓ Active (Trusted)' :
                             connectionDetailsModal.connection.status === 'pending' ? '⏳ Pending Review' :
                             '✗ Blocked (Revoked)'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Created:</span>
                          <p>{new Date(connectionDetailsModal.connection.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Updated:</span>
                          <p>{new Date(connectionDetailsModal.connection.updatedAt).toLocaleString()}</p>
                        </div>
                        {connectionDetailsModal.connection.verifiedAt && (
                          <div>
                            <span className="text-gray-600">Verified:</span>
                            <p>{new Date(connectionDetailsModal.connection.verifiedAt).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {connectionDetailsModal.connection.metadata?.description && (
                    <div>
                      <h5 className="font-medium mb-3">Description</h5>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-800">
                          {connectionDetailsModal.connection.metadata.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Audit Logs */}
                  {connectionDetailsModal.auditLogs && connectionDetailsModal.auditLogs.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-3 flex items-center">
                        <Clock className="w-4 h-4 text-gray-600 mr-2" />
                        Recent Activity
                      </h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {connectionDetailsModal.auditLogs.slice(0, 5).map((log, index) => (
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
                    {connectionDetailsModal.connection.status === 'active' && (
                      <button
                        onClick={() => handleUpdateConnectionStatus(connectionDetailsModal.connection!, 'suspended')}
                        disabled={connectionDetailsModal.connection.isLoading}
                        className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors flex items-center disabled:opacity-50"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Suspend
                      </button>
                    )}
                    {connectionDetailsModal.connection.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateConnectionStatus(connectionDetailsModal.connection!, 'trusted')}
                        disabled={connectionDetailsModal.connection.isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Trust Issuer
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveConnection(connectionDetailsModal.connection!)}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </button>
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
          title="Scan Connection QR Code"
          description="Point your camera at a connection QR code to establish a connection"
          expectedTypes={['connection', 'credential']}
        />

        {/* QR Code Generator */}
        <QRCodeGenerator
          isOpen={qrGenerator.isOpen}
          onClose={qrGenerator.closeQRCode}
          data={qrGenerator.qrData!}
        />
    </DashboardLayout>
  )
}
