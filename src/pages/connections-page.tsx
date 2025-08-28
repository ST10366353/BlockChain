"use client"

import { useState } from "react"
import Header from "@/src/components/layout/header"
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
} from "lucide-react"

interface Connection {
  id: string
  name: string
  did: string
  type: "issuer" | "verifier" | "both"
  trustLevel: "high" | "medium" | "low"
  status: "active" | "pending" | "blocked"
  connectedAt: string
  lastInteraction: string
  credentialsIssued?: number
  verificationsRequested?: number
  description: string
  website?: string
  permissions: string[]
}

export default function ConnectionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterTrust, setFilterTrust] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showConnectionDetails, setShowConnectionDetails] = useState<string | null>(null)
  const [newConnectionUrl, setNewConnectionUrl] = useState("")
  const [formError, setFormError] = useState<string>("")

  const user = {
    name: "Alice Johnson",
    primaryDID: "did:web:alice.com",
    anonymousDID: "did:key:z6Mk...",
  }

  const initialConnections: Connection[] = [
    {
      id: "1",
      name: "University of Cape Town",
      did: "did:web:uct.ac.za",
      type: "issuer",
      trustLevel: "high",
      status: "active",
      connectedAt: "2023-09-15",
      lastInteraction: "2024-01-15",
      credentialsIssued: 3,
      description: "Leading university in South Africa, trusted educational institution",
      website: "https://uct.ac.za",
      permissions: ["issue_credentials", "verify_identity", "access_academic_records"],
    },
    {
      id: "2",
      name: "JobPortal.com",
      did: "did:web:jobportal.com",
      type: "verifier",
      trustLevel: "medium",
      status: "active",
      connectedAt: "2024-01-10",
      lastInteraction: "2024-01-20",
      verificationsRequested: 5,
      description: "Professional job matching platform",
      website: "https://jobportal.com",
      permissions: ["verify_credentials", "access_professional_info"],
    },
    {
      id: "3",
      name: "Tech Institute",
      did: "did:web:techinstitute.org",
      type: "issuer",
      trustLevel: "high",
      status: "active",
      connectedAt: "2024-03-01",
      lastInteraction: "2024-03-22",
      credentialsIssued: 1,
      description: "Professional certification and training provider",
      website: "https://techinstitute.org",
      permissions: ["issue_credentials", "verify_skills"],
    },
    {
      id: "4",
      name: "Government Agency",
      did: "did:web:gov.za",
      type: "issuer",
      trustLevel: "high",
      status: "active",
      connectedAt: "2023-12-01",
      lastInteraction: "2023-12-01",
      credentialsIssued: 2,
      description: "Official government identity and document issuer",
      website: "https://gov.za",
      permissions: ["issue_identity_documents", "verify_citizenship"],
    },
    {
      id: "5",
      name: "FinanceApp",
      did: "did:web:financeapp.com",
      type: "verifier",
      trustLevel: "medium",
      status: "pending",
      connectedAt: "2024-01-25",
      lastInteraction: "Never",
      verificationsRequested: 0,
      description: "Financial services application requesting identity verification",
      website: "https://financeapp.com",
      permissions: ["verify_identity", "access_age_verification"],
    },
    {
      id: "6",
      name: "SuspiciousService",
      did: "did:web:suspicious.example",
      type: "verifier",
      trustLevel: "low",
      status: "blocked",
      connectedAt: "2024-01-22",
      lastInteraction: "2024-01-22",
      verificationsRequested: 1,
      description: "Service with questionable data practices",
      permissions: [],
    },
  ]

  const [connections, setConnections] = useState<Connection[]>(initialConnections)

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

  const filteredConnections = connections.filter((connection) => {
    const matchesSearch =
      connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.did.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || connection.type === filterType
    const matchesTrust = filterTrust === "all" || connection.trustLevel === filterTrust

    return matchesSearch && matchesType && matchesTrust
  })

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

  const handleAddConnection = () => {
    if (!isValidDidOrUrl(newConnectionUrl)) {
      setFormError("Enter a valid URL or DID (e.g., did:web:example.com)")
      return
    }
    const id = (connections.length + 1).toString()
    const nameFromUrl = () => {
      try {
        const u = new URL(newConnectionUrl)
        return u.hostname.replace(/^www\./, "")
      } catch {
        return newConnectionUrl.split(":").pop() || "New Service"
      }
    }
    const newConn: Connection = {
      id,
      name: nameFromUrl(),
      did: newConnectionUrl.startsWith("did:") ? newConnectionUrl : `did:web:${nameFromUrl()}`,
      type: "verifier",
      trustLevel: "medium",
      status: "pending",
      connectedAt: new Date().toISOString().slice(0, 10),
      lastInteraction: "Never",
      description: "Pending connection awaiting approval",
      website: newConnectionUrl.startsWith("http") ? newConnectionUrl : undefined,
      permissions: [],
    }
    setConnections((prev) => [newConn, ...prev])
    setShowAddModal(false)
    setNewConnectionUrl("")
    setFormError("")
  }

  const updateConnection = (id: string, updates: Partial<Connection>) => {
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const handleAccept = (id: string) => updateConnection(id, { status: "active", trustLevel: "medium" })
  const handleReject = (id: string) => setConnections((prev) => prev.filter((c) => c.id !== id))
  const handleBlock = (id: string) => updateConnection(id, { status: "blocked" })
  const handleUnblock = (id: string) => updateConnection(id, { status: "active" })

  const selectedConnection = connections.find((c) => c.id === showConnectionDetails)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} notifications={3} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <span className="mr-3">🔗</span>
            Connections
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Scan QR Code
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg flex items-center hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Connection
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="issuer">Issuers</option>
              <option value="verifier">Verifiers</option>
              <option value="both">Both</option>
            </select>

            <select
              value={filterTrust}
              onChange={(e) => setFilterTrust(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Trust Levels</option>
              <option value="high">High Trust</option>
              <option value="medium">Medium Trust</option>
              <option value="low">Low Trust</option>
            </select>
          </div>
        </div>

        {/* Connection Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{connections.filter((c) => c.type === "issuer").length}</p>
                <p className="text-sm text-gray-600">Trusted Issuers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{connections.filter((c) => c.type === "verifier").length}</p>
                <p className="text-sm text-gray-600">Verifiers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{connections.filter((c) => c.trustLevel === "high").length}</p>
                <p className="text-sm text-gray-600">High Trust</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{connections.filter((c) => c.status === "pending").length}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Connections List */}
        <div className="grid gap-4">
          {filteredConnections.map((connection) => (
            <div key={connection.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                    {getTypeIcon(connection.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{connection.name}</h3>
                      {connection.website && (
                        <a
                          href={connection.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3">{connection.description}</p>

                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`status-badge ${getTrustColor(connection.trustLevel)}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {connection.trustLevel} trust
                      </div>
                      <div className={`status-badge ${getStatusColor(connection.status)}`}>
                        {getStatusIcon(connection.status)}
                        <span className="ml-1 capitalize">{connection.status}</span>
                      </div>
                      <span className="text-sm text-gray-500 capitalize">{connection.type}</span>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>Connected: {connection.connectedAt}</span>
                      <span>Last interaction: {connection.lastInteraction}</span>
                      {connection.credentialsIssued && <span>Issued: {connection.credentialsIssued} credentials</span>}
                      {connection.verificationsRequested && (
                        <span>Verified: {connection.verificationsRequested} times</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setShowConnectionDetails(connection.id)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded" title="Settings">
                    <Settings className="w-4 h-4" />
                  </button>
                  {connection.status === "blocked" && (
                    <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded" title="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Add New Connection</h3>

              <div className="space-y-4">
                <button className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <QrCode className="w-6 h-6 mr-2 text-gray-600" />
                  Scan QR Code from Service
                </button>

                <div className="text-center text-gray-500">or</div>

                <div>
                  <label className="block text-sm font-medium mb-2">Service URL or DID</label>
                  <input
                    type="text"
                    value={newConnectionUrl}
                    onChange={(e) => setNewConnectionUrl(e.target.value)}
                    placeholder="https://service.example.com or did:web:service.com"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formError && <p className="text-sm text-red-600 mt-2">{formError}</p>}
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Connection will be reviewed</h4>
                  <p className="text-sm text-blue-800">
                    New connections start with medium trust level and can be adjusted after verification.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddConnection}
                    disabled={!newConnectionUrl}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Connection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connection Details Modal */}
        {showConnectionDetails && selectedConnection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Connection Details</h3>
                <button onClick={() => setShowConnectionDetails(null)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  {getTypeIcon(selectedConnection.type)}
                  <div>
                    <h4 className="font-semibold text-lg">{selectedConnection.name}</h4>
                    <p className="text-gray-600">{selectedConnection.did}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className={`status-badge ${getTrustColor(selectedConnection.trustLevel)}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {selectedConnection.trustLevel} trust
                      </div>
                      <div className={`status-badge ${getStatusColor(selectedConnection.status)}`}>
                        {getStatusIcon(selectedConnection.status)}
                        <span className="ml-1 capitalize">{selectedConnection.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-3">Connection Info</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span> {selectedConnection.type}
                      </div>
                      <div>
                        <span className="text-gray-600">Connected:</span> {selectedConnection.connectedAt}
                      </div>
                      <div>
                        <span className="text-gray-600">Last interaction:</span> {selectedConnection.lastInteraction}
                      </div>
                      {selectedConnection.website && (
                        <div>
                          <span className="text-gray-600">Website:</span>{" "}
                          <a
                            href={selectedConnection.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {selectedConnection.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-3">Activity</h5>
                    <div className="space-y-2 text-sm">
                      {selectedConnection.credentialsIssued && (
                        <div>
                          <span className="text-gray-600">Credentials issued:</span>{" "}
                          {selectedConnection.credentialsIssued}
                        </div>
                      )}
                      {selectedConnection.verificationsRequested && (
                        <div>
                          <span className="text-gray-600">Verifications requested:</span>{" "}
                          {selectedConnection.verificationsRequested}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-3">Permissions</h5>
                  <div className="space-y-2">
                    {selectedConnection.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">
                          {permission.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  {selectedConnection.status === "pending" && (
                    <>
                      <button onClick={() => handleAccept(selectedConnection.id)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Accept Connection
                      </button>
                      <button onClick={() => { handleReject(selectedConnection.id); setShowConnectionDetails(null) }} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Reject Connection
                      </button>
                    </>
                  )}
                  {selectedConnection.status === "active" && (
                    <>
                      <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Manage Permissions
                      </button>
                      <button onClick={() => handleBlock(selectedConnection.id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Block Connection
                      </button>
                    </>
                  )}
                  {selectedConnection.status === "blocked" && (
                    <button onClick={() => handleUnblock(selectedConnection.id)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Unblock Connection
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
