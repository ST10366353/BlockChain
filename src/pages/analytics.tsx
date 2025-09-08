import { useState, useEffect } from "react";
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
  RefreshCw,
  Calendar,
  Mail,
  Award,
  Target,
  Clock
} from "lucide-react";
import { useAppStore } from "@/stores";
import { useToast } from "@/components/ui/toast";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [isRealTime, setIsRealTime] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "json">("pdf");

  const { success, error: showError } = useToast();
  const { addNotification } = useAppStore();

  // Real-time updates effect
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      // Simulate real-time data updates
      setLastUpdated(new Date());
      addNotification({
        type: 'info',
        title: 'Analytics Updated',
        message: 'Real-time data has been refreshed'
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isRealTime, addNotification]);

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

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call for fresh data
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastUpdated(new Date());
      success('Analytics data refreshed successfully!');
    } catch (err) {
      showError('Failed to refresh analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);

      // Simulate export generation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create mock export data
      const exportData = {
        metrics,
        chartData,
        topIssuers,
        recentActivity,
        exportedAt: new Date().toISOString(),
        timeRange,
        filters: { dateRange: customDateRange }
      };

      let blob: Blob;
      let filename: string;

      switch (exportFormat) {
        case 'json':
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          filename = `analytics_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'csv':
          const csvContent = generateCSV();
          blob = new Blob([csvContent], { type: 'text/csv' });
          filename = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'pdf':
          // In a real implementation, you'd use a PDF library like jsPDF
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/pdf' });
          filename = `analytics_${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      success(`Analytics data exported as ${exportFormat.toUpperCase()} successfully!`);
    } catch (err) {
      showError('Failed to export analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCSV = () => {
    const headers = ['Metric', 'Value', 'Change', 'Trend'];
    const rows = [
      headers.join(','),
      ...metrics.map(m => `${m.title},${m.value},${m.change},${m.trend}`)
    ];
    return rows.join('\n');
  };

  const handleScheduleReport = () => {
    success('Weekly report scheduled! You will receive it every Monday at 9 AM.');
    addNotification({
      type: 'success',
      title: 'Report Scheduled',
      message: 'Weekly analytics report has been scheduled'
    });
  };

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
              {/* Time Range Selector */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Custom Date Range */}
              {timeRange === "custom" && (
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              )}

              {/* Real-time Toggle */}
              <div className="flex items-center space-x-2">
                <Activity className={`w-4 h-4 ${isRealTime ? 'text-green-600' : 'text-gray-400'}`} />
                <button
                  onClick={() => setIsRealTime(!isRealTime)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isRealTime
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isRealTime ? 'Real-time ON' : 'Real-time OFF'}
                </button>
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              {/* Export Format Selector */}
              <div className="flex items-center space-x-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as typeof exportFormat)}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={isLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Schedule Report */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleScheduleReport}
              >
                <Mail className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Last updated: {lastUpdated.toLocaleString()}
                {isRealTime && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    <Activity className="w-3 h-3 mr-1" />
                    Live
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Auto-refresh: {isRealTime ? '30s' : 'Manual'}</span>
                <span>Format: {exportFormat.toUpperCase()}</span>
                <span>Range: {timeRange}</span>
              </div>
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
