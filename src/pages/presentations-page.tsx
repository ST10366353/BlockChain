"use client"

import { useState, useEffect } from "react"
import Header from "@/components/layout/header"
import { Plus, Eye, Share2, Clock, CheckCircle, AlertTriangle, Calendar, User, RefreshCw, Loader2, Trash2, FileText, Award } from "lucide-react"
import { presentationsAPI, credentialsAPI } from "@/services"
import { useToast } from "@/hooks/use-toast"
import type { VerifiablePresentation, PresentationTemplate, CredentialSummary } from "@/services"

interface Presentation extends VerifiablePresentation {
  id: string
  name: string
  recipient: string
  credentialsShared: string[]
  createdAt: string
  expiresAt?: string
  status: "valid" | "expired" | "revoked" | "pending"
  sharedFields: string[]
  isLoading?: boolean
}

interface PresentationsState {
  presentations: Presentation[]
  availableCredentials: CredentialSummary[]
  templates: PresentationTemplate[]
  isLoading: boolean
  error: string | null
}

export default function PresentationsPage() {
  const { toastSuccess, toastError } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([])
  const [recipient, setRecipient] = useState("")
  const [expirationHours, setExpirationHours] = useState(24)
  const [createError, setCreateError] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PresentationTemplate | null>(null)

  const [state, setState] = useState<PresentationsState>({
    presentations: [],
    availableCredentials: [],
    templates: [],
    isLoading: true,
    error: null
  })

  const user = {
    name: "Alice Johnson",
    primaryDID: "did:web:alice.com",
    anonymousDID: "did:key:z6Mk...",
  }

  // Load presentations data on mount
  useEffect(() => {
    loadPresentationsData()
  }, [])

  const loadPresentationsData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const [credentialsResult, templatesResult] = await Promise.allSettled([
        loadAvailableCredentials(),
        loadTemplates()
      ])

      const availableCredentials = credentialsResult.status === 'fulfilled' ? credentialsResult.value : []
      const templates = templatesResult.status === 'fulfilled' ? templatesResult.value : []

      setState({
        presentations: [], // Will be loaded from API when available
        availableCredentials,
        templates,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Failed to load presentations data:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }))
      toastError("Loading Failed", "Unable to load presentations data")
    }
  }

  const loadAvailableCredentials = async (): Promise<CredentialSummary[]> => {
    try {
      const credentials = await credentialsAPI.queryCredentials({
        subject: user.primaryDID,
        limit: 50
      })
      return credentials
    } catch (error) {
      console.warn('Failed to load credentials:', error)
      return []
    }
  }

  const loadTemplates = async (): Promise<PresentationTemplate[]> => {
    try {
      // Use the templates from the API
      return presentationsAPI.getPresentationTemplates()
    } catch (error) {
      console.warn('Failed to load templates:', error)
      return []
    }
  }

  const handleTemplateSelect = (template: PresentationTemplate) => {
    setSelectedTemplate(template)
    // Auto-select credentials that match the template requirements
    const matchingCredentials = state.availableCredentials
      .filter(cred => {
        const typeString = Array.isArray(cred.type) ? cred.type.join(' ') : cred.type
        return template.requiredCredentials.some(req =>
          typeString.toLowerCase().includes(req.toLowerCase())
        )
      })
      .map(cred => cred.id)

    setSelectedCredentials(matchingCredentials)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "revoked":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-3 h-3" />
      case "expired":
        return <Clock className="w-3 h-3" />
      case "revoked":
        return <AlertTriangle className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const handleCreatePresentation = async () => {
    if (!recipient.trim()) {
      setCreateError("Recipient is required")
      return
    }
    if (selectedCredentials.length === 0) {
      setCreateError("Select at least one credential")
      return
    }

    setIsCreating(true)
    setCreateError("")

    try {
      // Get full credential data for selected credentials
      const selectedCredentialData = state.availableCredentials.filter(cred =>
        selectedCredentials.includes(cred.id)
      )

      if (selectedCredentialData.length === 0) {
        throw new Error("No valid credentials selected")
      }

      // Create presentation using the API
      const challenge = `challenge-${Date.now()}`
      const domain = window.location.hostname

      // Create presentation with selective disclosure if template is selected
      let presentation: VerifiablePresentation

      // Convert CredentialSummary to basic VerifiableCredential format for API
      const credentialPayloads = selectedCredentialData.map(cred => ({
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: Array.isArray(cred.type) ? cred.type : [cred.type],
        issuer: cred.issuerDid || 'Unknown',
        credentialSubject: {
          id: cred.subjectDid || user.primaryDID
        },
        issuanceDate: cred.issuedAt,
        expirationDate: cred.expiresAt
      }))

      if (selectedTemplate) {
        // Create selective presentation based on template fields
        const fieldMapping: Record<string, string[]> = {}
        selectedCredentialData.forEach((cred, index) => {
          fieldMapping[index] = selectedTemplate.fields
        })

        presentation = presentationsAPI.createSelectivePresentation(
          credentialPayloads,
          user.primaryDID,
          fieldMapping,
          challenge,
          domain
        )
      } else {
        // Create regular presentation
        presentation = presentationsAPI.createPresentation(
          credentialPayloads,
          user.primaryDID,
          challenge,
          domain
        )
      }

      // Verify the presentation was created correctly
      const verification = await presentationsAPI.verifyPresentation({
        presentation: presentation,
        challenge,
        domain
      })

      if (!verification.valid) {
        throw new Error("Presentation verification failed")
      }

      // Create presentation entry (in real app, this would be saved to backend)
      const now = new Date()
      const expiresAt = expirationHours > 0 ? new Date(now.getTime() + expirationHours * 3600 * 1000) : undefined
      const name = selectedTemplate ? `${selectedTemplate.name} - ${recipient}` : `Presentation for ${recipient}`

      const newPresentation: Presentation = {
        ...presentation,
        id: `pres-${Date.now()}`,
        name,
        recipient,
        credentialsShared: selectedCredentialData.map(cred =>
          Array.isArray(cred.type) ? cred.type.join(', ') : cred.type
        ),
        createdAt: now.toISOString(),
        expiresAt: expiresAt?.toISOString(),
        status: "valid",
        sharedFields: selectedTemplate ? selectedTemplate.fields : ["All fields"],
        isLoading: false
      }

      // Add to local state
      setState(prev => ({
        ...prev,
        presentations: [newPresentation, ...prev.presentations]
      }))

      // Close modal and reset form
      setShowCreateModal(false)
      setSelectedCredentials([])
      setRecipient("")
      setExpirationHours(24)
      setSelectedTemplate(null)
      setCreateError("")

      toastSuccess("Presentation Created", `Successfully created presentation for ${recipient}`)

    } catch (error) {
      console.error('Failed to create presentation:', error)
      setCreateError(error instanceof Error ? error.message : "Failed to create presentation")
      toastError("Creation Failed", "Unable to create presentation. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleRevoke = (id: string) => {
    setState(prev => ({
      ...prev,
      presentations: prev.presentations.map(p =>
        p.id === id ? { ...p, status: "revoked" } : p
      )
    }))
    toastSuccess("Presentation Revoked", "The presentation has been revoked")
  }

  const buildShareLink = (id: string) => {
    const url = new URL(window.location.href)
    url.pathname = "/presentations"
    url.searchParams.set("id", id)
    return url.toString()
  }

  const toggleCredentialSelection = (credentialId: string) => {
    setSelectedCredentials((prev) =>
      prev.includes(credentialId) ? prev.filter((id) => id !== credentialId) : [...prev, credentialId],
    )
  }

  const getCredentialDisplayName = (credential: CredentialSummary) => {
    return Array.isArray(credential.type) ? credential.type.join(', ') : credential.type
  }

  const getCredentialIssuerName = (credential: CredentialSummary) => {
    return credential.issuerDid || 'Unknown Issuer'
  }

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} notifications={3} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
              <span>Loading presentations...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} notifications={3} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Presentations</h3>
              <p className="text-gray-600 mb-4">{state.error}</p>
              <button
                onClick={loadPresentationsData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} notifications={3} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <FileText className="mr-3 w-8 h-8 text-blue-600" />
              Verifiable Presentations
            </h1>
            <p className="text-gray-600 mt-1">Create and manage credential presentations</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadPresentationsData}
              disabled={state.isLoading}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Refresh presentations"
            >
              <RefreshCw className={`w-5 h-5 ${state.isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={state.availableCredentials.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Presentation
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{state.presentations.length}</p>
                <p className="text-sm text-gray-600">Total Presentations</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {state.presentations.filter(p => p.status === 'valid').length}
                </p>
                <p className="text-sm text-gray-600">Active Presentations</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{state.availableCredentials.length}</p>
                <p className="text-sm text-gray-600">Available Credentials</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {state.presentations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-16 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Presentations Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {state.availableCredentials.length === 0
                  ? "You need credentials before you can create presentations. Request some credentials first to get started."
                  : "Create your first verifiable presentation to share your credentials selectively with others."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {state.availableCredentials.length === 0 ? (
                  <>
                    <button
                      onClick={() => router.push('/credentials')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Request Credentials
                    </button>
                    <button
                      onClick={() => router.push('/connections')}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Find Issuers
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Presentation
                  </button>
                )}
              </div>
              {state.availableCredentials.length > 0 && (
                <div className="mt-8 text-sm text-gray-500">
                  <p className="mb-2">💡 <strong>How presentations work:</strong></p>
                  <ul className="text-left max-w-sm mx-auto space-y-1">
                    <li>• Select which credentials to share</li>
                    <li>• Choose what information to reveal</li>
                    <li>• Generate secure, verifiable presentations</li>
                    <li>• Share via QR codes or secure links</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            state.presentations.map((presentation) => (
              <div key={presentation.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{presentation.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <User className="w-4 h-4 mr-1" />
                      Shared with: {presentation.recipient}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created: {new Date(presentation.createdAt).toLocaleDateString()}
                      {presentation.expiresAt && ` • Expires: ${new Date(presentation.expiresAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className={`status-badge ${getStatusColor(presentation.status)}`}>
                    {getStatusIcon(presentation.status)}
                    <span className="ml-1 capitalize">{presentation.status}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">Credentials Shared:</h4>
                  <div className="flex flex-wrap gap-2">
                    {presentation.credentialsShared.map((credential, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {credential}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">Fields Shared:</h4>
                  <div className="flex flex-wrap gap-2">
                    {presentation.sharedFields.map((field, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                  {presentation.status === "valid" && (
                    <>
                      <button
                        onClick={() => {
                          const link = buildShareLink(presentation.id)
                          navigator.clipboard.writeText(link)
                          toastSuccess("Link Copied", "Presentation share link copied to clipboard")
                        }}
                        className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share Link
                      </button>
                      <button
                        onClick={() => handleRevoke(presentation.id)}
                        className="flex items-center px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Revoke
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Presentation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Create Verifiable Presentation</h3>
                {isCreating && (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                )}
              </div>

              <div className="space-y-6">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">Choose a Template (Optional)</label>
                  <div className="grid md:grid-cols-3 gap-3">
                    {state.templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`p-4 border rounded-lg text-left hover:shadow-md transition-all ${
                          selectedTemplate?.id === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.requiredCredentials.map((cred, index) => (
                            <span key={index} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                              {cred}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                  {selectedTemplate && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Template selected: <strong>{selectedTemplate.name}</strong> -
                        Credentials will be auto-selected based on requirements.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Recipient/Verifier</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="Company name or verifier DID"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isCreating}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Expiration</label>
                    <select
                      value={expirationHours}
                      onChange={(e) => setExpirationHours(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isCreating}
                    >
                      <option value={1}>1 hour</option>
                      <option value={24}>24 hours</option>
                      <option value={168}>1 week</option>
                      <option value={720}>1 month</option>
                      <option value={0}>No expiration</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Credentials to Share</label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {state.availableCredentials.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No credentials available</p>
                        <p className="text-sm">You need credentials to create presentations</p>
                      </div>
                    ) : (
                      state.availableCredentials.map((credential) => (
                        <label key={credential.id} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCredentials.includes(credential.id)}
                            onChange={() => toggleCredentialSelection(credential.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={isCreating}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{getCredentialDisplayName(credential)}</div>
                            <div className="text-xs text-gray-600">Issuer: {getCredentialIssuerName(credential)}</div>
                            {credential.status && (
                              <div className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                                credential.status === 'valid'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {credential.status}
                              </div>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {selectedCredentials.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Selected Credentials ({selectedCredentials.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCredentials.map((credId) => {
                        const credential = state.availableCredentials.find(c => c.id === credId)
                        return credential ? (
                          <span key={credId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {getCredentialDisplayName(credential)}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-3">Privacy & Security</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300"
                          disabled={isCreating}
                        />
                        <span>Use selective disclosure</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          disabled={isCreating}
                        />
                        <span>Generate zero-knowledge proof</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          disabled={isCreating}
                        />
                        <span>Use anonymous identity</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300"
                          disabled={isCreating}
                        />
                        <span>Enable presentation verification</span>
                      </label>
                    </div>
                  </div>
                </div>

                {createError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <p className="text-sm text-red-700">{createError}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setSelectedTemplate(null)
                      setSelectedCredentials([])
                      setRecipient("")
                      setExpirationHours(24)
                      setCreateError("")
                    }}
                    disabled={isCreating}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePresentation}
                    disabled={isCreating || selectedCredentials.length === 0 || !recipient}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Create Presentation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
