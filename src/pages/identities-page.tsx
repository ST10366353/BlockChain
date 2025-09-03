"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/page-layout"
import { Plus, Globe, Key, Shield, Copy, Share2, Trash2, Eye, CheckCircle, Clock, AlertTriangle, Loader2, RefreshCw, ExternalLink } from "lucide-react"
import { didAPI, auditAPI } from "@/services"
import type { DIDResolutionResult, DIDRegistryEntry, DIDEvent } from "@/services"

interface Identity {
  id: string
  did: string
  method: "web" | "key" | "ion"
  type: "primary" | "secondary"
  domain?: string
  status: "verified" | "pending" | "error"
  lastUsed: string
  usageCount: number
  description: string
  // API-driven fields
  registryEntry?: DIDRegistryEntry
  resolutionResult?: DIDResolutionResult
  isResolvable?: boolean
}

interface AppState {
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

export default function IdentitiesPage() {
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<"web" | "key" | "ion">("key")
  const [domain, setDomain] = useState("")
  const [createError, setCreateError] = useState("")

  // API state
  const [appState, setAppState] = useState<AppState>({
    isLoading: false,
    error: null,
    lastUpdated: null
  })

  // DID details modal state
  const [selectedDIDDetails, setSelectedDIDDetails] = useState<{
    did: string
    resolutionResult?: DIDResolutionResult
    registryEntry?: DIDRegistryEntry
    events?: DIDEvent[]
    isLoading: boolean
    error?: string
  } | null>(null)

  const initialIdentities: Identity[] = [
    {
      id: "1",
      did: "did:web:alice.com",
      method: "web",
      type: "primary",
      domain: "alice.com",
      status: "verified",
      lastUsed: "2 hours ago",
      usageCount: 47,
      description: "Primary professional identity",
    },
    {
      id: "2",
      did: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
      method: "key",
      type: "secondary",
      status: "verified",
      lastUsed: "1 day ago",
      usageCount: 12,
      description: "Anonymous identity for privacy",
    },
    {
      id: "3",
      did: "did:ion:EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9Nfk38w5w",
      method: "ion",
      type: "secondary",
      status: "pending",
      lastUsed: "Never",
      usageCount: 0,
      description: "ION identity (pending verification)",
    },
  ]

  const [identities, setIdentities] = useState<Identity[]>(initialIdentities)

  const user = {
    name: "Alice Johnson",
    primaryDID: "did:web:alice.com",
    anonymousDID: "did:key:z6Mk...",
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "web":
        return <Globe className="w-5 h-5 text-blue-600" />
      case "key":
        return <Key className="w-5 h-5 text-gray-600" />
      case "ion":
        return <Shield className="w-5 h-5 text-purple-600" />
      default:
        return <Key className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  // Load identities from API on component mount
  useEffect(() => {
    loadIdentities()
  }, [])

  // Load identities and check their status
  const loadIdentities = async () => {
    setAppState({ isLoading: true, error: null, lastUpdated: null })

    try {
      // In a real implementation, you would fetch identities from the backend
      // For now, we'll simulate loading and checking DID resolvability
      const updatedIdentities = await Promise.all(
        initialIdentities.map(async (identity) => {
          try {
            const isResolvable = await didAPI.isDIDResolvable(identity.did)
            let registryEntry: DIDRegistryEntry | undefined

            if (isResolvable) {
              try {
                registryEntry = await didAPI.getDIDRegistryEntry(identity.did)
              } catch (error) {
                // Registry entry might not exist, that's okay
              }
            }

            return {
              ...identity,
              status: isResolvable ? "verified" : "error" as Identity['status'],
              isResolvable,
              registryEntry
            }
          } catch (error) {
            return {
              ...identity,
              status: "error" as const,
              isResolvable: false
            }
          }
        })
      )

      setIdentities(updatedIdentities)
      setAppState({
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      })
    } catch (error) {
      setAppState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load identities',
        lastUpdated: null
      })
    }
  }

  // Create new identity using DID API
  const handleCreateIdentity = async () => {
    if (selectedMethod === "web" && !domain.trim()) {
      setCreateError("Domain is required for did:web")
      return
    }

    setAppState(prev => ({ ...prev, isLoading: true }))
    setCreateError("")

    try {
      // Generate DID based on method
      let did: string
      let didDocument: any

      if (selectedMethod === "key") {
        // For did:key, we generate a new key pair (simplified)
        did = "did:key:z6Mk" + Math.random().toString(36).slice(2, 8)
        didDocument = {
          '@context': ['https://www.w3.org/ns/did/v1'],
          id: did,
          verificationMethod: [{
            id: `${did}#key-1`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: 'z6Mk' + Math.random().toString(36).slice(2, 8)
          }]
        }
      } else if (selectedMethod === "web") {
        did = `did:web:${domain}`
        didDocument = {
          '@context': ['https://www.w3.org/ns/did/v1'],
          id: did,
          verificationMethod: [{
            id: `${did}#key-1`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: 'z6Mk' + Math.random().toString(36).slice(2, 8)
          }]
        }
      } else {
        // did:ion
        did = "did:ion:Ei" + Math.random().toString(36).slice(2, 10)
        didDocument = {
          '@context': ['https://www.w3.org/ns/did/v1'],
          id: did,
          verificationMethod: [{
            id: `${did}#key-1`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: 'z6Mk' + Math.random().toString(36).slice(2, 8)
          }]
        }
      }

      // Register DID with backend
      const registrationResult = await didAPI.registerDID({
        did,
        document: didDocument,
        method: selectedMethod
      })

      // Create identity entry
      const id = (identities.length + 1).toString()
      const newItem: Identity = {
        id,
        did,
        method: selectedMethod,
        type: "secondary",
        domain: selectedMethod === "web" ? domain : undefined,
        status: "verified",
        lastUsed: "Never",
        usageCount: 0,
        description: selectedMethod === "key" ? "Anonymous identity" : "New identity",
        isResolvable: true,
        registryEntry: {
          did,
          method: selectedMethod,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            description: selectedMethod === "key" ? "Anonymous identity" : "New identity"
          }
        }
      }

      setIdentities((prev) => [newItem, ...prev])
      setShowCreateModal(false)
      setDomain("")
      setCreateError("")
      setAppState(prev => ({ ...prev, isLoading: false }))

    } catch (error) {
      console.error('Failed to create identity:', error)
      setCreateError(error instanceof Error ? error.message : 'Failed to create identity')
      setAppState(prev => ({ ...prev, isLoading: false }))
    }
  }

  // View DID details
  const handleViewDetails = async (identity: Identity) => {
    setSelectedDIDDetails({
      did: identity.did,
      isLoading: true
    })

    try {
      // Load DID resolution result, registry entry, and events in parallel
      const [resolutionResult, registryEntry, events] = await Promise.all([
        didAPI.resolveDID(identity.did).catch(() => undefined),
        didAPI.getDIDRegistryEntry(identity.did).catch(() => undefined),
        didAPI.getDIDEvents(identity.did, 10).catch(() => [])
      ])

      setSelectedDIDDetails({
        did: identity.did,
        resolutionResult,
        registryEntry,
        events,
        isLoading: false
      })

      setShowDetailsModal(identity.id)
    } catch (error) {
      setSelectedDIDDetails({
        did: identity.did,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load DID details'
      })
      setShowDetailsModal(identity.id)
    }
  }

  // Refresh identity status
  const handleRefreshIdentity = async (identity: Identity) => {
    try {
      const isResolvable = await didAPI.isDIDResolvable(identity.did)
      let registryEntry: DIDRegistryEntry | undefined

      if (isResolvable) {
        try {
          registryEntry = await didAPI.getDIDRegistryEntry(identity.did)
        } catch (error) {
          // Registry entry might not exist
        }
      }

      setIdentities(prev => prev.map(item =>
        item.id === identity.id
          ? {
              ...item,
              status: isResolvable ? "verified" : "error",
              isResolvable,
              registryEntry
            }
          : item
      ))
    } catch (error) {
      console.error('Failed to refresh identity:', error)
    }
  }

  // Delete identity
  const handleDeleteIdentity = async (identity: Identity) => {
    if (!confirm(`Are you sure you want to delete the identity ${identity.did}?`)) {
      return
    }

    try {
      await didAPI.deleteDID(identity.did)
      setIdentities(prev => prev.filter(item => item.id !== identity.id))
    } catch (error) {
      console.error('Failed to delete identity:', error)
      alert('Failed to delete identity. Please try again.')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <DashboardLayout user={user} notifications={3} title="Identity Management">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <span className="mr-3">🆔</span>
            Identity Management
          </h1>
          {appState.lastUpdated && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Last updated: {new Date(appState.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
            <button
              onClick={loadIdentities}
              disabled={appState.isLoading}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
              title="Refresh identities"
            >
              <RefreshCw className={`w-5 h-5 ${appState.isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={appState.isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Identity
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

        <div className="grid gap-4">
          {identities.map((identity) => (
            <div key={identity.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                    {getMethodIcon(identity.method)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg truncate">{identity.did}</h3>
                      {identity.type === "primary" && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Primary</span>
                      )}
                      <div className="flex items-center">
                        {getStatusIcon(identity.status)}
                        <span className="ml-1 text-sm capitalize">{identity.status}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3">{identity.description}</p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>Method: {identity.method.toUpperCase()}</span>
                      <span>Last used: {identity.lastUsed}</span>
                      <span>Usage: {identity.usageCount} times</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => copyToClipboard(identity.did)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Copy DID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewDetails(identity)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRefreshIdentity(identity)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Refresh Status"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded" title="Share">
                    <Share2 className="w-4 h-4" />
                  </button>
                  {identity.type !== "primary" && (
                    <button
                      onClick={() => handleDeleteIdentity(identity)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DID Details Modal */}
        {showDetailsModal && selectedDIDDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">DID Details</h3>
                <button
                  onClick={() => setShowDetailsModal(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {selectedDIDDetails.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
                  <span>Loading DID details...</span>
                </div>
              ) : selectedDIDDetails.error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-700">{selectedDIDDetails.error}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* DID Header */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{selectedDIDDetails.did}</h4>
                        <p className="text-sm text-gray-600">
                          Method: {didAPI.extractDIDMethod(selectedDIDDetails.did)}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedDIDDetails.did)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Copy DID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* DID Document */}
                    {selectedDIDDetails.resolutionResult && (
                      <div>
                        <h5 className="font-medium mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          DID Document
                        </h5>
                        <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                          <pre className="text-xs text-gray-800">
                            {JSON.stringify(selectedDIDDetails.resolutionResult.didDocument, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Registry Information */}
                    {selectedDIDDetails.registryEntry && (
                      <div>
                        <h5 className="font-medium mb-3 flex items-center">
                          <Shield className="w-4 h-4 text-blue-600 mr-2" />
                          Registry Information
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              selectedDIDDetails.registryEntry.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedDIDDetails.registryEntry.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span>{new Date(selectedDIDDetails.registryEntry.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Updated:</span>
                            <span>{new Date(selectedDIDDetails.registryEntry.updatedAt).toLocaleString()}</span>
                          </div>
                          {selectedDIDDetails.registryEntry.metadata?.description && (
                            <div>
                              <span className="text-gray-600">Description:</span>
                              <p className="mt-1">{selectedDIDDetails.registryEntry.metadata.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DID Events */}
                  {selectedDIDDetails.events && selectedDIDDetails.events.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-3 flex items-center">
                        <Clock className="w-4 h-4 text-gray-600 mr-2" />
                        Recent Events
                      </h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedDIDDetails.events.map((event, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium capitalize">{event.operation}</span>
                              <span className="text-sm text-gray-600 ml-2">
                                by {event.actor}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolution Metadata */}
                  {selectedDIDDetails.resolutionResult?.didResolutionMetadata && (
                    <div>
                      <h5 className="font-medium mb-3">Resolution Metadata</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Content Type:</span>
                          <p>{selectedDIDDetails.resolutionResult.didResolutionMetadata.contentType}</p>
                        </div>
                        {selectedDIDDetails.resolutionResult.didResolutionMetadata.retrieved && (
                          <div>
                            <span className="text-gray-600">Retrieved:</span>
                            <p>{new Date(selectedDIDDetails.resolutionResult.didResolutionMetadata.retrieved).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Identity Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Create New Identity</h3>
                {appState.isLoading && (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">DID Method</label>
                  <div className="space-y-2">
                    {[
                      { value: "key", label: "did:key", desc: "Self-sovereign, no external dependencies" },
                      { value: "web", label: "did:web", desc: "Web-based, requires domain control" },
                      { value: "ion", label: "did:ion", desc: "Bitcoin-anchored, decentralized network" },
                    ].map((method) => (
                      <label key={method.value} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="method"
                          value={method.value}
                          checked={selectedMethod === method.value}
                          onChange={(e) => setSelectedMethod(e.target.value as "web" | "key" | "ion")}
                          className="mt-1"
                          disabled={appState.isLoading}
                        />
                        <div>
                          <div className="font-medium">{method.label}</div>
                          <div className="text-sm text-gray-600">{method.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedMethod === "web" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Domain</label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="example.com"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={appState.isLoading}
                    />
                  </div>
                )}

                {createError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <p className="text-sm text-red-700">{createError}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    disabled={appState.isLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateIdentity}
                    disabled={appState.isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {appState.isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Create Identity
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </DashboardLayout>
  )
}
