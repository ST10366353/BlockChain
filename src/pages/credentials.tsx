import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Plus,
  Eye,
  Share2,
  Download,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  Grid3X3,
  List,
  Upload,
  FileText
} from "lucide-react";

interface CredentialsProps {
  isEnterprise?: boolean;
}

export default function Credentials({ isEnterprise = false }: CredentialsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("date");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const credentials = [
    {
      id: "1",
      title: "University Degree",
      issuer: "Stanford University",
      type: "Education",
      status: "verified",
      issueDate: "2023-05-15",
      expiryDate: "2025-05-15",
      thumbnail: "🎓",
      description: "Bachelor of Science in Computer Science",
      tags: ["education", "degree", "certification"]
    },
    {
      id: "2",
      title: "Professional License",
      issuer: "State Board",
      type: "License",
      status: "verified",
      issueDate: "2023-03-20",
      expiryDate: "2024-03-20",
      thumbnail: "📋",
      description: "Software Engineering Professional License",
      tags: ["license", "professional", "certification"]
    },
    {
      id: "3",
      title: "Employee ID",
      issuer: "Tech Corp",
      type: "Employment",
      status: "pending",
      issueDate: "2024-01-01",
      expiryDate: "2025-01-01",
      thumbnail: "👔",
      description: "Employee identification and access credentials",
      tags: ["employment", "id", "access"]
    },
    {
      id: "4",
      title: "Medical License",
      issuer: "Medical Board",
      type: "License",
      status: "expired",
      issueDate: "2022-06-10",
      expiryDate: "2024-01-10",
      thumbnail: "⚕️",
      description: "Medical practitioner license",
      tags: ["medical", "license", "healthcare"]
    }
  ];

  const filteredCredentials = credentials.filter(cred => {
    const matchesSearch = cred.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cred.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cred.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || cred.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "expired":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEnterprise ? "Enterprise Credentials" : "My Credentials"}
              </h1>
              <p className="text-gray-600">
                {isEnterprise
                  ? "Manage organizational and employee credentials"
                  : "Manage your digital credentials securely"
                }
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search credentials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                />
              </div>

              {/* View Toggle */}
              <div className="flex border border-gray-200 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-indigo-100 text-indigo-600" : "text-gray-400"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-indigo-100 text-indigo-600" : "text-gray-400"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="issuer">Sort by Issuer</option>
                <option value="status">Sort by Status</option>
              </select>

              {/* Add Button */}
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Credential
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filter:</span>
          </div>
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1 rounded-full text-sm ${
              filterStatus === "all"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({credentials.length})
          </button>
          <button
            onClick={() => setFilterStatus("verified")}
            className={`px-3 py-1 rounded-full text-sm ${
              filterStatus === "verified"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Verified ({credentials.filter(c => c.status === "verified").length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1 rounded-full text-sm ${
              filterStatus === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pending ({credentials.filter(c => c.status === "pending").length})
          </button>
          <button
            onClick={() => setFilterStatus("expired")}
            className={`px-3 py-1 rounded-full text-sm ${
              filterStatus === "expired"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Expired ({credentials.filter(c => c.status === "expired").length})
          </button>
        </div>

        {/* Enterprise Features */}
        {isEnterprise && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Credentials</p>
                    <p className="text-2xl font-bold text-gray-900">{credentials.length}</p>
                  </div>
                  <Shield className="w-8 h-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Verified Today</p>
                    <p className="text-2xl font-bold text-green-600">12</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">3</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Expiring Soon</p>
                    <p className="text-2xl font-bold text-red-600">1</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Credentials Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCredentials.map((credential) => (
              <Card key={credential.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
                      {credential.thumbnail}
                    </div>
                    {getStatusIcon(credential.status)}
                  </div>
                  <CardTitle className="text-lg">{credential.title}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    {credential.issuer}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{credential.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(credential.status)}`}>
                      {credential.status}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {credential.issueDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCredentials.map((credential) => (
              <Card key={credential.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
                        {credential.thumbnail}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{credential.title}</h3>
                        <p className="text-sm text-gray-600">{credential.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {credential.issuer}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {credential.issueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(credential.status)}`}>
                        {credential.status}
                      </span>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredCredentials.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first digital credential."}
            </p>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Credential
            </Button>
          </div>
        )}

        {/* Enterprise Bulk Actions */}
        {isEnterprise && filteredCredentials.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">Bulk Actions</h4>
                <p className="text-sm text-blue-700">Select multiple credentials for batch operations</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Import
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
