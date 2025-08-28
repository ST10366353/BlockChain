"use client"

import { useState } from "react"
import Header from "@/src/components/layout/header"
import { Plus, Globe, Key, Shield, Copy, Share2, Trash2, Eye, CheckCircle, Clock, AlertTriangle } from "lucide-react"

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
}

export default function IdentitiesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<"web" | "key" | "ion">("key")
  const [domain, setDomain] = useState("")
  const [createError, setCreateError] = useState("")

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

  const handleCreateIdentity = () => {
    if (selectedMethod === "web" && !domain.trim()) {
      setCreateError("Domain is required for did:web")
      return
    }
    const id = (identities.length + 1).toString()
    const did =
      selectedMethod === "key"
        ? "did:key:z6Mk" + Math.random().toString(36).slice(2, 8)
        : selectedMethod === "ion"
        ? "did:ion:Ei" + Math.random().toString(36).slice(2, 10)
        : `did:web:${domain}`

    const newItem: Identity = {
      id,
      did,
      method: selectedMethod,
      type: "secondary",
      domain: selectedMethod === "web" ? domain : undefined,
      status: "pending",
      lastUsed: "Never",
      usageCount: 0,
      description: selectedMethod === "key" ? "Anonymous identity" : "New identity",
    }
    setIdentities((prev) => [newItem, ...prev])
    setShowCreateModal(false)
    setDomain("")
    setCreateError("")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} notifications={3} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <span className="mr-3">🆔</span>
            Identity Management
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Identity
          </button>
        </div>

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
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="Copy DID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded" title="Share">
                    <Share2 className="w-4 h-4" />
                  </button>
                  {identity.type !== "primary" && (
                    <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Identity Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Create New Identity</h3>

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
                    />
                  </div>
                )}

                {createError && <div className="text-sm text-red-600">{createError}</div>}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateIdentity}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Identity
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
