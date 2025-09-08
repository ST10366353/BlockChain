import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Activity,
  Database,
  Globe,
  Lock,
  Key,
  Users,
} from "lucide-react";

export default function AuditTrail() {
  const [timeRange, setTimeRange] = useState("24h");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const auditEvents = [
    {
      id: "1",
      timestamp: "2024-01-15T14:30:00Z",
      event: "Credential Verification",
      category: "verification",
      user: "john.doe@company.com",
      resource: "University Degree",
      action: "verified",
      ip: "192.168.1.100",
      userAgent: "Chrome/120.0.0.0",
      status: "success",
      details: "Credential successfully verified on blockchain"
    },
    {
      id: "2",
      timestamp: "2024-01-15T14:25:00Z",
      event: "Bulk Operation",
      category: "bulk",
      user: "admin@company.com",
      resource: "Employee Credentials",
      action: "processed",
      ip: "192.168.1.100",
      userAgent: "Chrome/120.0.0.0",
      status: "success",
      details: "Bulk verification completed for 25 employee credentials"
    },
    {
      id: "3",
      timestamp: "2024-01-15T14:20:00Z",
      event: "Authentication Failed",
      category: "security",
      user: "unknown",
      resource: "Login System",
      action: "failed_login",
      ip: "203.0.113.1",
      userAgent: "Unknown",
      status: "warning",
      details: "Multiple failed login attempts detected"
    },
    {
      id: "4",
      timestamp: "2024-01-15T14:15:00Z",
      event: "Credential Shared",
      category: "sharing",
      user: "sarah.smith@company.com",
      resource: "Professional License",
      action: "shared",
      ip: "192.168.1.105",
      userAgent: "Safari/17.0",
      status: "success",
      details: "Credential shared with TechCorp Inc. for employment verification"
    },
    {
      id: "5",
      timestamp: "2024-01-15T14:10:00Z",
      event: "System Health Check",
      category: "system",
      user: "system@company.com",
      resource: "Database",
      action: "health_check",
      ip: "localhost",
      userAgent: "System",
      status: "success",
      details: "Database connection healthy, response time: 45ms"
    },
    {
      id: "6",
      timestamp: "2024-01-15T14:05:00Z",
      event: "User Access Granted",
      category: "access",
      user: "admin@company.com",
      resource: "User Management",
      action: "access_granted",
      ip: "192.168.1.100",
      userAgent: "Chrome/120.0.0.0",
      status: "success",
      details: "Admin access granted to new user account"
    },
    {
      id: "7",
      timestamp: "2024-01-15T14:00:00Z",
      event: "Compliance Check",
      category: "compliance",
      user: "system@company.com",
      resource: "GDPR Compliance",
      action: "check_passed",
      ip: "localhost",
      userAgent: "System",
      status: "success",
      details: "GDPR compliance check passed for all active credentials"
    },
    {
      id: "8",
      timestamp: "2024-01-15T13:55:00Z",
      event: "Credential Created",
      category: "creation",
      user: "mike.johnson@company.com",
      resource: "New Employee Credential",
      action: "created",
      ip: "192.168.1.120",
      userAgent: "Firefox/121.0",
      status: "success",
      details: "New employee credential created and stored securely"
    }
  ];

  const categories = [
    { id: "all", label: "All Events", icon: Activity, count: auditEvents.length },
    { id: "verification", label: "Verification", icon: CheckCircle, count: auditEvents.filter(e => e.category === "verification").length },
    { id: "security", label: "Security", icon: Shield, count: auditEvents.filter(e => e.category === "security").length },
    { id: "sharing", label: "Sharing", icon: Globe, count: auditEvents.filter(e => e.category === "sharing").length },
    { id: "creation", label: "Creation", icon: FileText, count: auditEvents.filter(e => e.category === "creation").length },
    { id: "bulk", label: "Bulk Operations", icon: Database, count: auditEvents.filter(e => e.category === "bulk").length },
    { id: "system", label: "System", icon: Users, count: auditEvents.filter(e => e.category === "system").length },
    { id: "compliance", label: "Compliance", icon: Lock, count: auditEvents.filter(e => e.category === "compliance").length },
    { id: "access", label: "Access", icon: Key, count: auditEvents.filter(e => e.category === "access").length }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = event.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.resource.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const exportAuditLog = () => {
    // In real app, this would generate and download a CSV/JSON file
    console.log("Exporting audit log...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
              <p className="text-gray-600">
                Comprehensive system activity log and compliance monitoring
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>

              <Button variant="outline" onClick={exportAuditLog}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search audit events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  selectedCategory === category.id ? "bg-indigo-200 text-indigo-800" : "bg-gray-100 text-gray-600"
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Audit Events */}
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      event.status === "success" ? "bg-green-100" :
                      event.status === "warning" ? "bg-yellow-100" : "bg-red-100"
                    }`}>
                      {getStatusIcon(event.status)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{event.event}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          {event.category}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">{event.details}</p>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">User:</span>
                          <span className="font-medium">{event.user}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Resource:</span>
                          <span className="font-medium">{event.resource}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">IP:</span>
                          <span className="font-medium">{event.ip}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>

                {/* Additional Details (Collapsible) */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Action:</span>
                      <span className="font-medium ml-2">{event.action}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">User Agent:</span>
                      <span className="font-medium ml-2">{event.userAgent}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audit events found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or time range to see more events.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Compliance Summary */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">GDPR</span>
                  <span className="text-sm font-medium text-green-600">Compliant</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">CCPA</span>
                  <span className="text-sm font-medium text-green-600">Compliant</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SOX</span>
                  <span className="text-sm font-medium text-yellow-600">Review Needed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Events Today</span>
                  <span className="text-sm font-medium">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Security Alerts</span>
                  <span className="text-sm font-medium text-red-600">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response</span>
                  <span className="text-sm font-medium">1.2s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-purple-600" />
                Data Integrity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Backups</span>
                  <span className="text-sm font-medium text-green-600">✓ Daily</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Encryption</span>
                  <span className="text-sm font-medium text-green-600">AES-256</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Retention</span>
                  <span className="text-sm font-medium">7 years</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Audit Data</h3>
              <p className="text-gray-600">
                Download audit logs for compliance reporting and analysis
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                CSV Export
              </Button>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                PDF Report
              </Button>
              <Button variant="outline">
                <Database className="w-4 h-4 mr-2" />
                JSON Export
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
