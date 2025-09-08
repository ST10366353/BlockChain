import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  Eye,
  Share2,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Target,
  Award,
  RefreshCw
} from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");
  // const [isEnterprise] = useState(true); // This could be determined from user context

  const metrics = [
    {
      title: "Total Credentials",
      value: "1,247",
      change: "+12%",
      trend: "up",
      icon: Shield,
      color: "text-blue-600"
    },
    {
      title: "Active Users",
      value: "892",
      change: "+8%",
      trend: "up",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Verification Requests",
      value: "3,456",
      change: "+23%",
      trend: "up",
      icon: Eye,
      color: "text-purple-600"
    },
    {
      title: "Shares This Month",
      value: "1,089",
      change: "-5%",
      trend: "down",
      icon: Share2,
      color: "text-orange-600"
    }
  ];

  const chartData = {
    credentialTypes: [
      { name: "Education", value: 35, color: "#3B82F6" },
      { name: "Employment", value: 28, color: "#10B981" },
      { name: "License", value: 20, color: "#8B5CF6" },
      { name: "Certification", value: 12, color: "#F59E0B" },
      { name: "Other", value: 5, color: "#EF4444" }
    ],
    monthlyActivity: [
      { month: "Jan", credentials: 120, verifications: 89, shares: 45 },
      { month: "Feb", credentials: 135, verifications: 102, shares: 52 },
      { month: "Mar", credentials: 148, verifications: 118, shares: 61 },
      { month: "Apr", credentials: 162, verifications: 134, shares: 58 },
      { month: "May", credentials: 178, verifications: 145, shares: 67 },
      { month: "Jun", credentials: 195, verifications: 158, shares: 74 }
    ]
  };

  const topIssuers = [
    { name: "Stanford University", credentials: 245, verifications: 189 },
    { name: "TechCorp Inc.", credentials: 198, verifications: 156 },
    { name: "State Board", credentials: 167, verifications: 134 },
    { name: "Global Bank", credentials: 145, verifications: 112 },
    { name: "Medical Council", credentials: 123, verifications: 98 }
  ];

  const recentActivity = [
    { action: "Bulk verification completed", count: 45, time: "2 hours ago" },
    { action: "New credentials added", count: 23, time: "4 hours ago" },
    { action: "High-volume sharing detected", count: 156, time: "6 hours ago" },
    { action: "Compliance check passed", count: 100, time: "8 hours ago" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">
                Comprehensive insights into credential usage and system performance
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>

              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      {metric.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm ${
                        metric.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {metric.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center`}>
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Monthly Activity
                    </CardTitle>
                    <CardDescription>
                      Credential creation, verifications, and shares over time
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Credentials</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Verifications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Shares</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Interactive chart would be rendered here</p>
                    <p className="text-sm text-gray-500">Using Chart.js or D3.js in production</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credential Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Credential Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of credential types in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.credentialTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">{type.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${type.value}%`,
                              backgroundColor: type.color
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{type.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Issuers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Top Issuers
                </CardTitle>
                <CardDescription>
                  Organizations with the most active credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topIssuers.map((issuer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{issuer.name}</p>
                          <p className="text-sm text-gray-600">
                            {issuer.credentials} credentials • {issuer.verifications} verifications
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {((issuer.verifications / issuer.credentials) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">verification rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="text-sm font-medium text-green-600">120ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium text-green-600">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="text-sm font-medium text-red-600">0.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Throughput</span>
                    <span className="text-sm font-medium text-blue-600">1.2K req/min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {activity.count} items • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Goals & Targets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Goals & Targets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Monthly Verifications</span>
                      <span className="text-sm text-gray-900">1,200 / 1,500</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">User Satisfaction</span>
                      <span className="text-sm text-gray-900">4.8 / 5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Compliance Score</span>
                      <span className="text-sm text-gray-900">94.2 / 95.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
