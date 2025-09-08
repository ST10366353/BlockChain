import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Plus,
  Eye,
  Download,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Activity,
  Clock,
  Database,
  Server,
  TrendingUp,
  FileText,
  Settings,
  UserCheck,
  Building2
} from "lucide-react";

export default function EnterpriseDashboard() {
  const systemHealth = [
    { name: "API Status", status: "healthy", value: "99.9%", icon: Server },
    { name: "Database", status: "healthy", value: "100%", icon: Database },
    { name: "DID Resolver", status: "warning", value: "95.2%", icon: Shield },
    { name: "Storage", status: "healthy", value: "98.7%", icon: Database },
  ];

  const recentActivity = [
    { action: "Bulk verification completed", user: "john.doe@company.com", time: "2 minutes ago", status: "success" },
    { action: "New credential added", user: "sarah.smith@company.com", time: "15 minutes ago", status: "success" },
    { action: "Compliance check failed", user: "system@company.com", time: "1 hour ago", status: "warning" },
    { action: "User access granted", user: "admin@company.com", time: "2 hours ago", status: "info" },
  ];

  const pendingVerifications = [
    { id: "1", type: "Employee ID", requester: "Tech Corp", urgency: "high", deadline: "2025-01-15" },
    { id: "2", type: "Certification", requester: "Global Bank", urgency: "medium", deadline: "2025-01-20" },
    { id: "3", type: "License", requester: "Healthcare Inc", urgency: "low", deadline: "2025-01-25" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Enterprise IdentityVault</span>
                <p className="text-xs text-gray-500">Secure credential management platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search credentials..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-80"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* System Health Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Enterprise Dashboard</h1>
              <p className="text-gray-600">Monitor system health and manage organizational credentials</p>
            </div>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </div>

          {/* System Health Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {systemHealth.map((service, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                      <service.icon className="w-4 h-4 mr-2" />
                      {service.name}
                    </CardTitle>
                    <div className={`w-2 h-2 rounded-full ${
                      service.status === 'healthy' ? 'bg-green-500' :
                      service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{service.value}</div>
                  <p className="text-xs text-gray-600 mt-1">Uptime</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Compliance Score */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Compliance Dashboard
                </CardTitle>
                <CardDescription>Real-time compliance monitoring and reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold text-green-600">94.2%</div>
                    <p className="text-sm text-gray-600">Overall Compliance Score</p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">12</div>
                      <p className="text-xs text-gray-600">GDPR</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">8</div>
                      <p className="text-xs text-gray-600">CCPA</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">3</div>
                      <p className="text-xs text-gray-600">SOX</p>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '94.2%' }}></div>
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
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bulk Operations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Credential Management</CardTitle>
                    <CardDescription>Bulk operations and credential overview</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Bulk Import
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">1,247</div>
                    <p className="text-sm text-gray-600">Active Credentials</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">23</div>
                    <p className="text-sm text-gray-600">Pending Review</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">98.5%</div>
                    <p className="text-sm text-gray-600">Verification Rate</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Sample Credentials */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Employee ID Verification</h3>
                        <p className="text-sm text-gray-600">Bulk verification • 45 employees</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Verified
                          </span>
                          <span className="text-xs text-gray-500">Completed 2h ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Verifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
                  Pending Verifications
                </CardTitle>
                <CardDescription>Requests awaiting approval</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingVerifications.map((verification) => (
                  <div key={verification.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{verification.type}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        verification.urgency === 'high' ? 'bg-red-100 text-red-800' :
                        verification.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {verification.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">From: {verification.requester}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" className="text-xs h-7">Approve</Button>
                      <Button variant="outline" size="sm" className="text-xs h-7">Review</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Credential
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Bulk Verification
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
