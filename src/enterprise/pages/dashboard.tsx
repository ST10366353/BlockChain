"use client";

import React from 'react';
;;
import type { ReactElement, ReactNode } from 'react';

// JSX namespace declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
import Link from 'next/link';
import {
  Building,
  Users,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  Plus,
  Search,
  BarChart3
} from 'lucide-react';

import { useUserType, useApp } from '../../shared/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Badge } from '../../shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../shared/components/ui/avatar';

import { handshakeService, auditAPI, trustAPI } from '../../services';
import { HandshakeRequest, TrustRelationship } from '../../shared/types';

interface EnterpriseStats {
  totalCredentials: number;
  activeVerifications: number;
  trustedPartners: number;
  complianceScore: number;
  pendingRequests: number;
  systemHealth: number;
}

export default function EnterpriseDashboard() {
  const { profile } = useUserType();
  const { setLoading } = useApp();

  const [stats, setStats] = React.useState<EnterpriseStats>({
    totalCredentials: 0,
    activeVerifications: 0,
    trustedPartners: 0,
    complianceScore: 0,
    pendingRequests: 0,
    systemHealth: 100
  });

  const [recentActivity, setRecentActivity] = React.useState<Array<{id: string; type: string; timestamp: number; description: string}>>([]);
  const [pendingVerifications, setPendingVerifications] = React.useState<HandshakeRequest[]>([]);
  const [systemMetrics, setSystemMetrics] = React.useState<any>(null);

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const loadEnterpriseData = React.useCallback(async () => {
    setLoading({ isLoading: true, message: 'Loading enterprise dashboard...' });

    try {
      // Load data in parallel
      const [
        handshakesResult,
        trustResult,
        auditResult,
        metricsResult
      ] = await Promise.allSettled([
        handshakeService.getPendingRequests(),
        trustAPI.getTrustedIssuers(),
        auditAPI.getAuditLogs({ limit: 10 }),
        auditAPI.getSystemMetrics()
      ]);

      // Process handshakes
      const handshakes = handshakesResult.status === 'fulfilled'
        ? handshakesResult.value
        : [];

      // Process trusted partners
      const trustedPartners = trustResult.status === 'fulfilled'
        ? trustResult.value.filter((partner: TrustRelationship) => partner.status === 'active')
        : [];

      // Process audit logs
      const auditLogs = auditResult.status === 'fulfilled'
        ? auditResult.value
        : [];

      // Process system metrics
      const metrics = metricsResult.status === 'fulfilled'
        ? metricsResult.value
        : null;

      // Calculate stats
      const complianceScore = calculateComplianceScore(auditLogs);

      setStats({
        totalCredentials: 150, // Mock data - would come from API
        activeVerifications: handshakes.length,
        trustedPartners: trustedPartners.length,
        complianceScore,
        pendingRequests: handshakes.length,
        systemHealth: metrics?.uptime ? Math.min(100, metrics.uptime / 86400 * 100) : 95
      });

      setRecentActivity(auditLogs);
      setPendingVerifications(handshakes);
      setSystemMetrics(metrics);

    } catch (error) {
      console.error('Failed to load enterprise data:', error);
    } finally {
      setLoading({ isLoading: false });
    }
  }, [setLoading]);

  React.useEffect(() => {
    loadEnterpriseData();
  }, [loadEnterpriseData]);

  const calculateComplianceScore = (auditLogs: any[]): number => {
    if (!auditLogs.length) return 85; // Default score

    const violations = auditLogs.filter((log: any) => !log.success).length;
    const totalLogs = auditLogs.length;

    // Calculate score based on violations (lower violations = higher score)
    const violationRate = violations / totalLogs;
    return Math.max(0, Math.min(100, 100 - (violationRate * 50)));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEnterpriseData();
    setIsRefreshing(false);
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const quickActions = [
    {
      icon: Plus,
      title: 'New Verification',
      description: 'Request credential verification',
      href: '/enterprise/verification/new',
      color: 'bg-blue-500'
    },
    {
      icon: Search,
      title: 'Search Credentials',
      description: 'Find and verify credentials',
      href: '/enterprise/search',
      color: 'bg-green-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'View compliance reports',
      href: '/enterprise/analytics',
      color: 'bg-purple-500'
    },
    {
      icon: Settings,
      title: 'System Settings',
      description: 'Configure enterprise settings',
      href: '/enterprise/settings',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Enterprise Portal</span>
              </div>
              <div className="text-xs">
                <Badge variant="secondary">
                  Enterprise
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Activity className="w-4 h-4" />
              </Button>

              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar} alt={profile?.name} />
                <AvatarFallback>
                  {profile?.name?.charAt(0)?.toUpperCase() || 'E'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Enterprise Portal
          </h1>
          <p className="text-gray-600">
            Manage organizational identities, verify credentials, and ensure compliance
          </p>
        </div>

        {/* System Health Alert */}
        {stats.systemHealth < 95 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-yellow-800">System Health Alert</p>
                <p className="text-sm text-yellow-700">
                  System health is at {stats.systemHealth}%. Please review system metrics.
                </p>
              </div>
              <Link href="/enterprise/system">
                <Button variant="outline" size="sm" className="ml-auto">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credentials</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCredentials.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Managed by organization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Verifications</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeVerifications}</div>
              <p className="text-xs text-muted-foreground">
                Currently processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trusted Partners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trustedPartners}</div>
              <p className="text-xs text-muted-foreground">
                Verified organizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              {getComplianceIcon(stats.complianceScore)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getComplianceColor(stats.complianceScore)}`}>
                {stats.complianceScore}%
              </div>
              <p className="text-xs text-muted-foreground">
                Based on recent activity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Activity</span>
                  <Link href="/enterprise/audit">
                    <Button variant="ghost" size="sm">
                      View All →
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity: {id: string; type: string; timestamp: number; description: string; level?: string}, index: number) => (
                      <div key={activity.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            activity.level === 'error' ? 'bg-red-100' :
                            activity.level === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                          }`}>
                            {activity.level === 'error' ? (
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            ) : activity.level === 'warning' ? (
                              <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-gray-600">
                              {activity.resource} • {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          activity.level === 'error' ? 'destructive' :
                          activity.level === 'warning' ? 'secondary' : 'default'
                        }>
                          {activity.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No recent activity</p>
                    <p className="text-sm text-gray-500">
                      Activity logs will appear here as the system is used
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending Verifications & Quick Actions */}
          <div className="space-y-6">
            {/* Pending Verifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pending Verifications</span>
                  <Link href="/enterprise/verifications">
                    <Button variant="ghost" size="sm">
                      View All →
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingVerifications.length > 0 ? (
                  <div className="space-y-3">
                    {pendingVerifications.slice(0, 3).map((verification: HandshakeRequest) => (
                      <div key={verification.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{verification.requesterName}</p>
                          <div className="text-xs">
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                            Pending
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{verification.purpose}</p>
                        <p className="text-xs text-gray-500">
                          {verification.requestedFields.length} fields requested
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">All caught up!</p>
                    <p className="text-xs text-gray-500">No pending verifications</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mb-2`}>
                          <action.icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="font-medium text-sm mb-1">{action.title}</p>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Health</span>
                    <div className="text-green-700">
                      <Badge variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <div className="text-green-700">
                      <Badge variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">DID Resolver</span>
                    <div className="text-green-700">
                      <Badge variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// JSX namespace declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
import Link from 'next/link';
import {
  Building,
  Users,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  Plus,
  Search,
  BarChart3
} from 'lucide-react';

import { useUserType, useApp } from '../../shared/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Badge } from '../../shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../shared/components/ui/avatar';

import { handshakeService, auditAPI, trustAPI } from '../../services';
import { HandshakeRequest, TrustRelationship } from '../../shared/types';

interface EnterpriseStats {
  totalCredentials: number;
  activeVerifications: number;
  trustedPartners: number;
  complianceScore: number;
  pendingRequests: number;
  systemHealth: number;
}

export default function EnterpriseDashboard() {
  const { profile } = useUserType();
  const { setLoading } = useApp();

  const [stats, setStats] = React.useState<EnterpriseStats>({
    totalCredentials: 0,
    activeVerifications: 0,
    trustedPartners: 0,
    complianceScore: 0,
    pendingRequests: 0,
    systemHealth: 100
  });

  const [recentActivity, setRecentActivity] = React.useState<Array<{id: string; type: string; timestamp: number; description: string}>>([]);
  const [pendingVerifications, setPendingVerifications] = React.useState<HandshakeRequest[]>([]);
  const [systemMetrics, setSystemMetrics] = React.useState<any>(null);

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const loadEnterpriseData = React.useCallback(async () => {
    setLoading({ isLoading: true, message: 'Loading enterprise dashboard...' });

    try {
      // Load data in parallel
      const [
        handshakesResult,
        trustResult,
        auditResult,
        metricsResult
      ] = await Promise.allSettled([
        handshakeService.getPendingRequests(),
        trustAPI.getTrustedIssuers(),
        auditAPI.getAuditLogs({ limit: 10 }),
        auditAPI.getSystemMetrics()
      ]);

      // Process handshakes
      const handshakes = handshakesResult.status === 'fulfilled'
        ? handshakesResult.value
        : [];

      // Process trusted partners
      const trustedPartners = trustResult.status === 'fulfilled'
        ? trustResult.value.filter((partner: TrustRelationship) => partner.status === 'active')
        : [];

      // Process audit logs
      const auditLogs = auditResult.status === 'fulfilled'
        ? auditResult.value
        : [];

      // Process system metrics
      const metrics = metricsResult.status === 'fulfilled'
        ? metricsResult.value
        : null;

      // Calculate stats
      const complianceScore = calculateComplianceScore(auditLogs);

      setStats({
        totalCredentials: 150, // Mock data - would come from API
        activeVerifications: handshakes.length,
        trustedPartners: trustedPartners.length,
        complianceScore,
        pendingRequests: handshakes.length,
        systemHealth: metrics?.uptime ? Math.min(100, metrics.uptime / 86400 * 100) : 95
      });

      setRecentActivity(auditLogs);
      setPendingVerifications(handshakes);
      setSystemMetrics(metrics);

    } catch (error) {
      console.error('Failed to load enterprise data:', error);
    } finally {
      setLoading({ isLoading: false });
    }
  }, [setLoading]);

  React.useEffect(() => {
    loadEnterpriseData();
  }, [loadEnterpriseData]);

  const calculateComplianceScore = (auditLogs: any[]): number => {
    if (!auditLogs.length) return 85; // Default score

    const violations = auditLogs.filter((log: any) => !log.success).length;
    const totalLogs = auditLogs.length;

    // Calculate score based on violations (lower violations = higher score)
    const violationRate = violations / totalLogs;
    return Math.max(0, Math.min(100, 100 - (violationRate * 50)));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEnterpriseData();
    setIsRefreshing(false);
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const quickActions = [
    {
      icon: Plus,
      title: 'New Verification',
      description: 'Request credential verification',
      href: '/enterprise/verification/new',
      color: 'bg-blue-500'
    },
    {
      icon: Search,
      title: 'Search Credentials',
      description: 'Find and verify credentials',
      href: '/enterprise/search',
      color: 'bg-green-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'View compliance reports',
      href: '/enterprise/analytics',
      color: 'bg-purple-500'
    },
    {
      icon: Settings,
      title: 'System Settings',
      description: 'Configure enterprise settings',
      href: '/enterprise/settings',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Enterprise Portal</span>
              </div>
              <div className="text-xs">
                <Badge variant="secondary">
                  Enterprise
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Activity className="w-4 h-4" />
              </Button>

              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar} alt={profile?.name} />
                <AvatarFallback>
                  {profile?.name?.charAt(0)?.toUpperCase() || 'E'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Enterprise Portal
          </h1>
          <p className="text-gray-600">
            Manage organizational identities, verify credentials, and ensure compliance
          </p>
        </div>

        {/* System Health Alert */}
        {stats.systemHealth < 95 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-yellow-800">System Health Alert</p>
                <p className="text-sm text-yellow-700">
                  System health is at {stats.systemHealth}%. Please review system metrics.
                </p>
              </div>
              <Link href="/enterprise/system">
                <Button variant="outline" size="sm" className="ml-auto">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credentials</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCredentials.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Managed by organization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Verifications</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeVerifications}</div>
              <p className="text-xs text-muted-foreground">
                Currently processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trusted Partners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trustedPartners}</div>
              <p className="text-xs text-muted-foreground">
                Verified organizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              {getComplianceIcon(stats.complianceScore)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getComplianceColor(stats.complianceScore)}`}>
                {stats.complianceScore}%
              </div>
              <p className="text-xs text-muted-foreground">
                Based on recent activity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Activity</span>
                  <Link href="/enterprise/audit">
                    <Button variant="ghost" size="sm">
                      View All →
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity: {id: string; type: string; timestamp: number; description: string; level?: string}, index: number) => (
                      <div key={activity.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            activity.level === 'error' ? 'bg-red-100' :
                            activity.level === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                          }`}>
                            {activity.level === 'error' ? (
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            ) : activity.level === 'warning' ? (
                              <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-gray-600">
                              {activity.resource} • {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          activity.level === 'error' ? 'destructive' :
                          activity.level === 'warning' ? 'secondary' : 'default'
                        }>
                          {activity.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No recent activity</p>
                    <p className="text-sm text-gray-500">
                      Activity logs will appear here as the system is used
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending Verifications & Quick Actions */}
          <div className="space-y-6">
            {/* Pending Verifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pending Verifications</span>
                  <Link href="/enterprise/verifications">
                    <Button variant="ghost" size="sm">
                      View All →
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingVerifications.length > 0 ? (
                  <div className="space-y-3">
                    {pendingVerifications.slice(0, 3).map((verification: HandshakeRequest) => (
                      <div key={verification.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{verification.requesterName}</p>
                          <div className="text-xs">
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                            Pending
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{verification.purpose}</p>
                        <p className="text-xs text-gray-500">
                          {verification.requestedFields.length} fields requested
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">All caught up!</p>
                    <p className="text-xs text-gray-500">No pending verifications</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mb-2`}>
                          <action.icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="font-medium text-sm mb-1">{action.title}</p>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Health</span>
                    <div className="text-green-700">
                      <Badge variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <div className="text-green-700">
                      <Badge variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">DID Resolver</span>
                    <div className="text-green-700">
                      <Badge variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
