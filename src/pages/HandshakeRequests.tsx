import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Shield,
  Building,
  User,
  Calendar,
  Filter,
  Search,
  QrCode,
  Globe,
  Check,
  X,
  MoreVertical,
  Download,
  Share2
} from "lucide-react";

interface HandshakeRequestsProps {
  isEnterprise?: boolean;
}

interface HandshakeRequest {
  id: string;
  requester: string;
  requesterType: "organization" | "individual";
  credential: string;
  fields: string[];
  purpose: string;
  urgency: "high" | "medium" | "low";
  requestedAt: string;
  expiresAt: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

export default function HandshakeRequests({ isEnterprise = false }: HandshakeRequestsProps) {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  const requests = {
    pending: [
      {
        id: "1",
        requester: "TechCorp Inc.",
        requesterType: "organization" as const,
        credential: "University Degree",
        fields: ["degree", "graduationDate", "gpa"],
        purpose: "Employment verification for software engineer position",
        urgency: "high" as const,
        requestedAt: "2024-01-15T10:30:00Z",
        expiresAt: "2024-01-22T10:30:00Z",
        status: "pending" as const
      },
      {
        id: "2",
        requester: "Bank of America",
        requesterType: "organization" as const,
        credential: "Employment Verification",
        fields: ["employer", "position", "salary"],
        purpose: "Loan application verification",
        urgency: "medium" as const,
        requestedAt: "2024-01-14T14:20:00Z",
        expiresAt: "2024-01-21T14:20:00Z",
        status: "pending" as const
      },
      {
        id: "3",
        requester: "John Smith",
        requesterType: "individual" as const,
        credential: "Professional License",
        fields: ["licenseNumber", "issuingAuthority", "expiryDate"],
        purpose: "Project collaboration verification",
        urgency: "low" as const,
        requestedAt: "2024-01-13T09:15:00Z",
        expiresAt: "2024-01-20T09:15:00Z",
        status: "pending" as const
      }
    ],
    approved: [
      {
        id: "4",
        requester: "Global Tech Solutions",
        requesterType: "organization" as const,
        credential: "University Degree",
        fields: ["degree", "field", "graduationDate"],
        purpose: "Background check for senior developer role",
        urgency: "medium" as const,
        requestedAt: "2024-01-10T16:45:00Z",
        expiresAt: "2024-01-17T16:45:00Z",
        status: "approved" as const
      }
    ],
    rejected: [
      {
        id: "5",
        requester: "Data Analytics Corp",
        requesterType: "organization" as const,
        credential: "Employment History",
        fields: ["all"],
        purpose: "Full background verification",
        urgency: "low" as const,
        requestedAt: "2024-01-12T11:20:00Z",
        expiresAt: "2024-01-19T11:20:00Z",
        status: "rejected" as const,
        rejectionReason: "Request too broad - requested all fields"
      }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApprove = (requestId: string) => {
    // In real app, this would call API to approve request
    console.log(`Approving request ${requestId}`);
  };

  const handleReject = (requestId: string) => {
    // In real app, this would call API to reject request
    console.log(`Rejecting request ${requestId}`);
  };

  const handleBulkApprove = () => {
    selectedRequests.forEach(id => handleApprove(id));
    setSelectedRequests([]);
  };

  const handleBulkReject = () => {
    selectedRequests.forEach(id => handleReject(id));
    setSelectedRequests([]);
  };

  const renderRequestCard = (request: HandshakeRequest) => (
    <Card key={request.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            {activeTab === "pending" && (
              <input
                type="checkbox"
                checked={selectedRequests.includes(request.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRequests([...selectedRequests, request.id]);
                  } else {
                    setSelectedRequests(selectedRequests.filter(id => id !== request.id));
                  }
                }}
                className="mt-1"
              />
            )}
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              request.requesterType === "organization"
                ? "bg-gradient-to-r from-blue-500 to-cyan-600"
                : "bg-gradient-to-r from-green-500 to-emerald-600"
            }`}>
              {request.requesterType === "organization" ? (
                <Building className="w-6 h-6 text-white" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-gray-900">{request.requester}</h3>
                {request.urgency && (
                  <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency} priority
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{request.purpose}</p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Credential: {request.credential}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>Fields requested: {request.fields.join(", ")}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {getStatusIcon(request.status)}
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {request.status === "pending" && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Expires: {new Date(request.expiresAt).toLocaleDateString()}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReject(request.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => handleApprove(request.id)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        )}

        {request.status === "rejected" && request.rejectionReason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Rejected</p>
                <p className="text-sm text-red-700">{request.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const currentRequests = requests[activeTab as keyof typeof requests] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEnterprise ? "Enterprise Verifications" : "Handshake Requests"}
              </h1>
              <p className="text-gray-600">
                {isEnterprise
                  ? "Manage credential verification requests across your organization"
                  : "Manage requests to verify your credentials"
                }
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                />
              </div>

              {isEnterprise && (
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        {isEnterprise && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-600">{requests.pending.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approved Today</p>
                    <p className="text-2xl font-bold text-green-600">{requests.approved.length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{requests.rejected.length}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Response Rate</p>
                    <p className="text-2xl font-bold text-blue-600">94.2%</p>
                  </div>
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: "pending", label: "Pending", count: requests.pending.length },
              { id: "approved", label: "Approved", count: requests.approved.length },
              { id: "rejected", label: "Rejected", count: requests.rejected.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bulk Actions */}
        {activeTab === "pending" && selectedRequests.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">
                  {selectedRequests.length} request{selectedRequests.length > 1 ? "s" : ""} selected
                </p>
                <p className="text-sm text-blue-700">Choose an action for the selected requests</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleBulkReject}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject All
                </Button>
                <Button
                  onClick={handleBulkApprove}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {currentRequests.length > 0 ? (
            currentRequests.map(renderRequestCard)
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} requests
                </h3>
                <p className="text-gray-600">
                  {activeTab === "pending"
                    ? "All caught up! No pending requests at the moment."
                    : activeTab === "approved"
                    ? "No approved requests in the selected time period."
                    : "No rejected requests in the selected time period."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enterprise Features */}
        {isEnterprise && (
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bulk Operations</h3>
                <p className="text-gray-600">Process multiple verification requests at once</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline">
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Codes
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Templates
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Auto-Approval Rules</h4>
                <p className="text-sm text-gray-600 mb-3">Set up rules for automatic request approval</p>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Response Templates</h4>
                <p className="text-sm text-gray-600 mb-3">Create standardized response messages</p>
                <Button size="sm" variant="outline">Manage</Button>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Analytics Dashboard</h4>
                <p className="text-sm text-gray-600 mb-3">View detailed request analytics</p>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
