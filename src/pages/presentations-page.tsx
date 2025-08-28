"use client"

import { useState } from "react"
import Header from "@/src/components/layout/header"
import { Plus, Eye, Share2, Clock, CheckCircle, AlertTriangle, Calendar, User } from "lucide-react"

interface Presentation {
  id: string
  name: string
  recipient: string
  credentialsShared: string[]
  createdAt: string
  expiresAt?: string
  status: "active" | "expired" | "revoked"
  sharedFields: string[]
}

export default function PresentationsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([])
  const [recipient, setRecipient] = useState("")
  const [expirationHours, setExpirationHours] = useState(24)
  const [createError, setCreateError] = useState("")

  const user = {
    name: "Alice Johnson",
    primaryDID: "did:web:alice.com",
    anonymousDID: "did:key:z6Mk...",
  }

  const initialPresentations: Presentation[] = [
    {
      id: "1",
      name: "Job Application - TechCorp",
      recipient: "TechCorp HR Department",
      credentialsShared: ["Bachelor's Degree", "Professional Certificate"],
      createdAt: "2024-01-20",
      expiresAt: "2024-01-27",
      status: "active",
      sharedFields: ["Name", "Degree", "Skills", "Certification Level"],
    },
    {
      id: "2",
      name: "Age Verification - Online Service",
      recipient: "SecureService.com",
      credentialsShared: ["ID Document"],
      createdAt: "2024-01-18",
      expiresAt: "2024-01-18",
      status: "expired",
      sharedFields: ["Age Verification (18+)"],
    },
    {
      id: "3",
      name: "Health Pass - Conference",
      recipient: "Tech Conference 2024",
      credentialsShared: ["Health Certificate"],
      createdAt: "2024-01-15",
      status: "revoked",
      sharedFields: ["Vaccination Status", "Certificate Date"],
    },
  ]

  const [presentations, setPresentations] = useState<Presentation[]>(initialPresentations)

  const availableCredentials = [
    { id: "1", name: "Bachelor's Degree", issuer: "University of Cape Town" },
    { id: "2", name: "Professional Certificate", issuer: "Tech Institute" },
    { id: "3", name: "ID Document", issuer: "Government Agency" },
    { id: "4", name: "Driver's License", issuer: "Department of Transport" },
    { id: "5", name: "Health Certificate", issuer: "City Health Department" },
  ]

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

  const handleCreatePresentation = () => {
    if (!recipient.trim()) {
      setCreateError("Recipient is required")
      return
    }
    if (selectedCredentials.length === 0) {
      setCreateError("Select at least one credential")
      return
    }
    const id = (presentations.length + 1).toString()
    const now = new Date()
    const expiresAt = expirationHours > 0 ? new Date(now.getTime() + expirationHours * 3600 * 1000) : undefined
    const name = `Presentation for ${recipient}`
    const newItem: Presentation = {
      id,
      name,
      recipient,
      credentialsShared: selectedCredentials.map((id) => {
        const found = availableCredentials.find((c) => c.id === id)
        return found ? found.name : id
      }),
      createdAt: now.toISOString().slice(0, 10),
      expiresAt: expiresAt ? expiresAt.toISOString().slice(0, 10) : undefined,
      status: "active",
      sharedFields: ["Selective fields"],
    }
    setPresentations((prev) => [newItem, ...prev])
    setShowCreateModal(false)
    setSelectedCredentials([])
    setRecipient("")
    setExpirationHours(24)
    setCreateError("")
  }

  const handleRevoke = (id: string) => {
    setPresentations((prev) => prev.map((p) => (p.id === id ? { ...p, status: "revoked" } : p)))
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} notifications={3} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <span className="mr-3">📋</span>
            Presentations
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Presentation
          </button>
        </div>

        <div className="grid gap-4">
          {presentations.map((presentation) => (
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
                    Created: {presentation.createdAt}
                    {presentation.expiresAt && ` • Expires: ${presentation.expiresAt}`}
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
                {presentation.status === "active" && (
                  <>
                    <button onClick={() => {
                      const link = buildShareLink(presentation.id)
                      navigator.clipboard.writeText(link)
                    }} className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share Link
                    </button>
                    <button onClick={() => handleRevoke(presentation.id)} className="flex items-center px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors">
                      Revoke
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create Presentation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">Create Presentation</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Recipient/Verifier</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Company name or verifier DID"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Credentials to Share</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {availableCredentials.map((credential) => (
                      <label key={credential.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCredentials.includes(credential.id)}
                          onChange={() => toggleCredentialSelection(credential.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium">{credential.name}</div>
                          <div className="text-sm text-gray-600">{credential.issuer}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Expiration</label>
                  <select
                    value={expirationHours}
                    onChange={(e) => setExpirationHours(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>1 hour</option>
                    <option value={24}>24 hours</option>
                    <option value={168}>1 week</option>
                    <option value={720}>1 month</option>
                    <option value={0}>No expiration</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Privacy Controls</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                      <span>Use selective disclosure (share only necessary fields)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span>Generate zero-knowledge proof for age verification</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span>Use anonymous identity (did:key)</span>
                    </label>
                  </div>
                </div>

                {createError && <div className="text-sm text-red-600">{createError}</div>}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePresentation}
                    disabled={selectedCredentials.length === 0 || !recipient}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Presentation
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
