"use client"

import { useState } from "react"
import Header from "@/src/components/layout/header"
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
} from "lucide-react"

interface Credential {
  id: string
  type: string
  issuer: string
  recipient: string
  issued: string
  expires?: string
  status: "verified" | "expiring" | "expired" | "pending"
  icon: string
  description: string
  fields: Record<string, any>
}

export default function CredentialsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterIssuer, setFilterIssuer] = useState<string>("all")
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showCredentialDetails, setShowCredentialDetails] = useState<string | null>(null)
  const [requestIssuerUrl, setRequestIssuerUrl] = useState("")
  const [requestType, setRequestType] = useState("")
  const [requestError, setRequestError] = useState("")

  const user = {
    name: "Alice Johnson",
    primaryDID: "did:web:alice.com",
    anonymousDID: "did:key:z6Mk...",
  }

  const initialCredentials: Credential[] = [
    {
      id: "1",
      type: "Bachelor's Degree",
      issuer: "University of Cape Town",
      recipient: "Alice Johnson",
      issued: "Jan 15, 2024",
      expires: "Jan 15, 2029",
      status: "verified",
      icon: "🎓",
      description: "Bachelor of Science in Computer Science",
      fields: {
        degree: "Bachelor of Science",
        major: "Computer Science",
        gpa: "3.8",
        graduationDate: "December 2023",
      },
    },
    {
      id: "2",
      type: "Professional Certificate",
      issuer: "Tech Institute",
      recipient: "Alice Johnson",
      issued: "Mar 22, 2024",
      expires: "Mar 22, 2026",
      status: "verified",
      icon: "📜",
      description: "Advanced Web Development Certification",
      fields: {
        skills: ["React", "Node.js", "TypeScript"],
        level: "Advanced",
        score: "95%",
      },
    },
    {
      id: "3",
      type: "ID Document",
      issuer: "Government Agency",
      recipient: "Alice Johnson",
      issued: "Dec 01, 2023",
      expires: "Dec 01, 2024",
      status: "expiring",
      icon: "🆔",
      description: "National Identity Document",
      fields: {
        idNumber: "****-****-1234",
        nationality: "South African",
        dateOfBirth: "1995-06-15",
      },
    },
    {
      id: "4",
      type: "Driver's License",
      issuer: "Department of Transport",
      recipient: "Alice Johnson",
      issued: "Feb 10, 2024",
      expires: "Feb 10, 2029",
      status: "verified",
      icon: "🚗",
      description: "Class B Driver's License",
      fields: {
        class: "B",
        restrictions: "None",
        endorsements: ["Motorcycle"],
      },
    },
    {
      id: "5",
      type: "Health Certificate",
      issuer: "City Health Department",
      recipient: "Alice Johnson",
      issued: "Nov 05, 2023",
      expires: "Nov 05, 2024",
      status: "expiring",
      icon: "🏥",
      description: "COVID-19 Vaccination Certificate",
      fields: {
        vaccine: "Pfizer-BioNTech",
        doses: 3,
        lastDose: "September 2023",
      },
    },
  ]

  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials)

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

  const filteredCredentials = credentials.filter((credential) => {
    const matchesSearch =
      credential.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || credential.status === filterStatus
    const matchesIssuer = filterIssuer === "all" || credential.issuer === filterIssuer

    return matchesSearch && matchesStatus && matchesIssuer
  })

  const uniqueIssuers = Array.from(new Set(credentials.map((c) => c.issuer)))

  const CredentialCard = ({ credential }: { credential: Credential }) => (
    <div className="credential-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{credential.icon}</span>
          <div>
            <h3 className="font-semibold text-lg">{credential.type}</h3>
            <p className="text-gray-600">{credential.issuer}</p>
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
          <span className="mr-3">👤 {credential.recipient}</span>
        </p>
        <p className="text-sm text-gray-600 flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          Issued: {credential.issued}
        </p>
        {credential.expires && (
          <p className="text-sm text-gray-600 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Expires: {credential.expires}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowCredentialDetails(credential.id)}
          className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </button>
        <button className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </button>
        <button className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors" onClick={() => downloadJson(`${credential.type}.json`, credential)}>
          <Download className="w-4 h-4 mr-1" />
          Export
        </button>
      </div>
    </div>
  )

  const CredentialListItem = ({ credential }: { credential: Credential }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <span className="text-2xl">{credential.icon}</span>
        <div>
          <h3 className="font-semibold">{credential.type}</h3>
          <p className="text-sm text-gray-600">{credential.issuer}</p>
          <p className="text-xs text-gray-500">Issued: {credential.issued}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className={`status-badge ${getStatusColor(credential.status)}`}>
          {getStatusIcon(credential.status)}
          <span className="ml-1 capitalize">{credential.status}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCredentialDetails(credential.id)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  const selectedCredential = credentials.find((c) => c.id === showCredentialDetails)

  const downloadJson = (filename: string, data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} notifications={3} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <span className="mr-3">🎓</span>
            Credentials
          </h1>
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Request Credential
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search credentials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="expiring">Expiring</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={filterIssuer}
                onChange={(e) => setFilterIssuer(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Issuers</option>
                {uniqueIssuers.map((issuer) => (
                  <option key={issuer} value={issuer}>
                    {issuer}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Request Credential</h3>

              <div className="space-y-4">
                <button className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <QrCode className="w-6 h-6 mr-2 text-gray-600" />
                  Scan QR Code from Issuer
                </button>

                <div className="text-center text-gray-500">or</div>

                <div>
                  <label className="block text-sm font-medium mb-2">Issuer URL</label>
                  <input
                    type="url"
                    value={requestIssuerUrl}
                    onChange={(e) => setRequestIssuerUrl(e.target.value)}
                    placeholder="https://issuer.example.com"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Credential Type</label>
                  <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select credential type</option>
                    <option value="education">Educational Certificate</option>
                    <option value="professional">Professional Certificate</option>
                    <option value="identity">Identity Document</option>
                    <option value="license">License</option>
                    <option value="health">Health Certificate</option>
                  </select>
                </div>

                {requestError && <div className="text-sm text-red-600">{requestError}</div>}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      try {
                        new URL(requestIssuerUrl)
                      } catch {
                        setRequestError("Enter a valid issuer URL")
                        return
                      }
                      if (!requestType) {
                        setRequestError("Select a credential type")
                        return
                      }
                      const id = (credentials.length + 1).toString()
                      const newItem: Credential = {
                        id,
                        type: requestType,
                        issuer: new URL(requestIssuerUrl).hostname,
                        recipient: user.name,
                        issued: new Date().toLocaleDateString(),
                        status: "pending",
                        icon: "📝",
                        description: `Requested ${requestType} credential`,
                        fields: {},
                      }
                      setCredentials((prev) => [newItem, ...prev])
                      setShowRequestModal(false)
                      setRequestError("")
                      setRequestIssuerUrl("")
                      setRequestType("")
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credential Details Modal */}
        {showCredentialDetails && selectedCredential && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Credential Details</h3>
                <button onClick={() => setShowCredentialDetails(null)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <span className="text-3xl">{selectedCredential.icon}</span>
                  <div>
                    <h4 className="font-semibold text-lg">{selectedCredential.type}</h4>
                    <p className="text-gray-600">{selectedCredential.issuer}</p>
                    <div
                      className={`inline-flex items-center mt-2 status-badge ${getStatusColor(selectedCredential.status)}`}
                    >
                      {getStatusIcon(selectedCredential.status)}
                      <span className="ml-1 capitalize">{selectedCredential.status}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Basic Information</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Recipient:</span> {selectedCredential.recipient}
                      </div>
                      <div>
                        <span className="text-gray-600">Issued:</span> {selectedCredential.issued}
                      </div>
                      {selectedCredential.expires && (
                        <div>
                          <span className="text-gray-600">Expires:</span> {selectedCredential.expires}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Credential Fields</h5>
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedCredential.fields).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>{" "}
                          {Array.isArray(value) ? value.join(", ") : value}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Credential
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export
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
