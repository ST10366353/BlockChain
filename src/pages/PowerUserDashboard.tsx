import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Code,
  Database,
  Globe,
  Shield,
  Settings,
  Terminal,
  Webhook,
  Key,
  Activity,
  Server,
  BarChart3,
  FileText,
  Download,
  GitBranch,
  TestTube,
  Bug,
  Plug
} from "lucide-react";

export default function PowerUserDashboard() {
  const [activeSection, setActiveSection] = useState("overview");

  const systemMetrics = [
    { name: "API Response Time", value: "45ms", status: "excellent", icon: Server },
    { name: "Blockchain Sync", value: "2.1s", status: "good", icon: Database },
    { name: "DID Resolution", value: "120ms", status: "warning", icon: Globe },
    { name: "Encryption Ops", value: "98.5%", status: "excellent", icon: Shield }
  ];

  const apiEndpoints = [
    { method: "GET", path: "/api/credentials", status: "active", calls: 1250 },
    { method: "POST", path: "/api/credentials", status: "active", calls: 89 },
    { method: "GET", path: "/api/verifications", status: "active", calls: 567 },
    { method: "POST", path: "/api/bulk-verify", status: "active", calls: 34 }
  ];

  const integrations = [
    { name: "GitHub", status: "connected", lastSync: "2 hours ago" },
    { name: "Slack", status: "connected", lastSync: "30 minutes ago" },
    { name: "Jira", status: "connected", lastSync: "1 hour ago" },
    { name: "Jenkins", status: "error", lastSync: "6 hours ago" }
  ];

  const recentLogs = [
    { level: "info", message: "Credential verification completed", timestamp: "14:30:22", source: "verification-service" },
    { level: "warn", message: "Rate limit approaching", timestamp: "14:28:15", source: "api-gateway" },
    { level: "error", message: "Blockchain connection timeout", timestamp: "14:25:03", source: "blockchain-service" },
    { level: "info", message: "New credential schema deployed", timestamp: "14:22:47", source: "schema-registry" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-100";
      case "good":
        return "text-blue-600 bg-blue-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "active":
        return "text-green-600 bg-green-100";
      case "connected":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600";
      case "warn":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Health */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <metric.icon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Terminal className="w-5 h-5 mr-2" />
            API Endpoints
          </CardTitle>
          <CardDescription>Real-time API endpoint monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    endpoint.method === "GET" ? "bg-blue-100 text-blue-800" :
                    endpoint.method === "POST" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(endpoint.status)}`}>
                    {endpoint.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {endpoint.calls} calls
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.map((log, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className={`text-xs font-medium ${getLogLevelColor(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{log.message}</p>
                    <p className="text-xs text-gray-500">{log.timestamp} • {log.source}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plug className="w-5 h-5 mr-2" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {integrations.map((integration, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {integration.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{integration.name}</p>
                      <p className="text-sm text-gray-600">Last sync: {integration.lastSync}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDeveloperTools = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Code className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">API Explorer</h3>
            <p className="text-sm text-gray-600 mb-4">Interactive API documentation and testing</p>
            <Button variant="outline">Launch Explorer</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Database className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Schema Editor</h3>
            <p className="text-sm text-gray-600 mb-4">Create and modify credential schemas</p>
            <Button variant="outline">Open Editor</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Webhook className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Webhook Tester</h3>
            <p className="text-sm text-gray-600 mb-4">Test and debug webhook integrations</p>
            <Button variant="outline">Test Webhooks</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <TestTube className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Load Testing</h3>
            <p className="text-sm text-gray-600 mb-4">Performance testing and benchmarking</p>
            <Button variant="outline">Run Tests</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <GitBranch className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Version Control</h3>
            <p className="text-sm text-gray-600 mb-4">Schema versioning and rollback</p>
            <Button variant="outline">View History</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Bug className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Debug Console</h3>
            <p className="text-sm text-gray-600 mb-4">Advanced debugging and logging</p>
            <Button variant="outline">Open Console</Button>
          </CardContent>
        </Card>
      </div>

      {/* Code Snippets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Quick Code Snippets
          </CardTitle>
          <CardDescription>Common code patterns and API examples</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Create Credential</h4>
              <pre className="text-xs text-gray-600 overflow-x-auto">
{`const credential = {
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential"],
  "issuer": "did:example:issuer",
  "credentialSubject": { "id": "did:example:subject" }
}`}
              </pre>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">API Authentication</h4>
              <pre className="text-xs text-gray-600 overflow-x-auto">
{`const headers = {
  'Authorization': 'Bearer ' + accessToken,
  'Content-Type': 'application/json'
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              API Keys
            </CardTitle>
            <CardDescription>Manage API keys and access tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Production API Key</span>
                <span className="text-xs text-green-600">Active</span>
              </div>
              <code className="text-xs text-gray-600 break-all">sk_prod_123456789abcdef123456789abcdef</code>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">Regenerate</Button>
              <Button size="sm" variant="outline">Create New</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Advanced Configuration
            </CardTitle>
            <CardDescription>System-level configuration options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable Debug Mode</span>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Advanced Logging</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Performance Monitoring</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
            </div>
            <Button className="w-full">Save Configuration</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Data Export
          </CardTitle>
          <CardDescription>Export system data for analysis or backup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
              <Database className="w-6 h-6" />
              <span>System Logs</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-y-2">
              <BarChart3 className="w-6 h-6" />
              <span>Metrics Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
              <FileText className="w-6 h-6" />
              <span>API Usage</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const sections = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "developer", label: "Developer Tools", icon: Code },
    { id: "advanced", label: "Advanced Settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Power User Dashboard</h1>
              <p className="text-gray-600">
                Advanced tools and system monitoring for developers and technical professionals
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                System Config
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeSection === section.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeSection === "overview" && renderOverview()}
        {activeSection === "developer" && renderDeveloperTools()}
        {activeSection === "advanced" && renderAdvancedSettings()}

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Zap className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Power User Mode</h3>
              <p className="text-blue-800 mb-3">
                You have access to advanced system features, developer tools, and comprehensive monitoring capabilities.
                Use these features responsibly and ensure proper security measures are in place.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">API Access</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">System Monitoring</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Developer Tools</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Advanced Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
