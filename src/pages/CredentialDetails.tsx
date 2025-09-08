import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Eye,
  Share2,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Calendar,
  Building,
  Globe,
  FileText,
  QrCode,
  Copy,
  Activity,
  User,
  Hash
} from "lucide-react";

export default function CredentialDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock credential data - in real app this would come from API
  const credential = {
    id: id || "1",
    title: "University Degree",
    issuer: "Stanford University",
    type: "Education",
    status: "verified",
    issueDate: "2023-05-15",
    expiryDate: "2025-05-15",
    description: "Bachelor of Science in Computer Science",
    credentialId: "did:example:123456789abcdef",
    issuerDid: "did:web:stanford.edu",
    schema: "https://example.com/schemas/degree/v1.0",
    proof: {
      type: "Ed25519Signature2020",
      created: "2023-05-15T10:30:00Z",
      verificationMethod: "did:example:123456789abcdef#key-1",
      signatureValue: "eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0..."
    },
    claims: {
      degree: "Bachelor of Science",
      field: "Computer Science",
      graduationDate: "2023-05-15",
      gpa: "3.8",
      honors: "Magna Cum Laude"
    },
    tags: ["education", "degree", "certification"],
    lastVerified: "2024-01-15T14:30:00Z",
    verificationCount: 47,
    sharingHistory: [
      { recipient: "TechCorp Inc.", date: "2024-01-10", purpose: "Employment verification" },
      { recipient: "Bank of America", date: "2024-01-08", purpose: "Loan application" },
      { recipient: "Government Agency", date: "2024-01-05", purpose: "Background check" }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "expired":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In real app, show toast notification
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Credential Header */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl">
                🎓
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{credential.title}</h2>
                  {getStatusIcon(credential.status)}
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(credential.status)}`}>
                    {credential.status}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>{credential.issuer}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Issued: {credential.issueDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Expires: {credential.expiryDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Eye className="w-4 h-4 mr-2" />
                View Full Credential
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline">
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>

            {/* Credential Claims */}
            <Card>
              <CardHeader>
                <CardTitle>Credential Claims</CardTitle>
                <CardDescription>Verified information contained in this credential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(credential.claims).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Verification Status
                </CardTitle>
                <CardDescription>Blockchain verification and trust indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Verified on Blockchain</p>
                        <p className="text-sm text-green-600">Last verified: {credential.lastVerified}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">{credential.verificationCount} verifications</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Hash className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Credential ID</span>
                      </div>
                      <p className="text-xs text-blue-600 font-mono break-all">{credential.credentialId}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(credential.credentialId)}
                        className="mt-2 h-6 text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Issuer DID</span>
                      </div>
                      <p className="text-xs text-purple-600 font-mono break-all">{credential.issuerDid}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(credential.issuerDid)}
                        className="mt-2 h-6 text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "json":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Raw Credential Data
              </CardTitle>
              <CardDescription>Complete verifiable credential in JSON format</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify({
                  "@context": ["https://www.w3.org/2018/credentials/v1"],
                  "type": ["VerifiableCredential", "UniversityDegree"],
                  "issuer": credential.issuerDid,
                  "issuanceDate": credential.issueDate,
                  "expirationDate": credential.expiryDate,
                  "credentialSubject": {
                    "id": credential.credentialId,
                    ...credential.claims
                  },
                  "proof": credential.proof
                }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        );

      case "sharing":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  Sharing History
                </CardTitle>
                <CardDescription>Recent credential sharing activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {credential.sharingHistory.map((share, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{share.recipient}</p>
                          <p className="text-sm text-gray-600">{share.purpose}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{share.date}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Shared
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Share This Credential</CardTitle>
                <CardDescription>Generate shareable links or QR codes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                    <Globe className="w-6 h-6" />
                    <span>Generate Link</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                    <QrCode className="w-6 h-6" />
                    <span>Create QR Code</span>
                  </Button>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Privacy Notice</h4>
                      <p className="text-sm text-yellow-700">
                        Sharing this credential will allow the recipient to verify the information
                        contained within. You can set expiration times and revoke access at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "activity":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Activity Timeline
              </CardTitle>
              <CardDescription>Complete history of credential activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Timeline items would go here */}
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Credential Verified</p>
                    <p className="text-sm text-gray-600">Blockchain verification completed successfully</p>
                    <p className="text-xs text-gray-500 mt-1">{credential.lastVerified}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Credential Issued</p>
                    <p className="text-sm text-gray-600">Originally issued by {credential.issuer}</p>
                    <p className="text-xs text-gray-500 mt-1">{credential.issueDate}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Credential Created</p>
                    <p className="text-sm text-gray-600">Added to your IdentityVault</p>
                    <p className="text-xs text-gray-500 mt-1">{credential.issueDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Credential Details</h1>
                <p className="text-gray-600">ID: {credential.id}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: "overview", label: "Overview" },
              { id: "json", label: "Raw Data" },
              { id: "sharing", label: "Sharing" },
              { id: "activity", label: "Activity" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
