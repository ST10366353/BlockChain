"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield,
  Key,
  CheckCircle,
  Clock,
  RefreshCw,
  Plus,
  Eye,
  Settings,
  Bell,
  ScanLine,
  FileText,
  Users,
  BarChart3,
  Share2
} from 'lucide-react';

import { useUserType, useApp } from '../../shared/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Badge } from '../../shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../shared/components/ui/avatar';

import { credentialsAPI, handshakeService } from '../../services';
import { VerifiableCredential, HandshakeRequest, NotificationData } from '../../shared/types';

interface DashboardStats {
  totalCredentials: number;
  pendingRequests: number;
  verifiedCredentials: number;
  recentActivity: number;
}

export default function ConsumerDashboard() {
  const { profile } = useUserType();
  const { setLoading } = useApp();
  const { toastSuccess, toastError } = useToast();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    totalCredentials: 0,
    pendingRequests: 0,
    verifiedCredentials: 0,
    recentActivity: 0
  });

  const [recentCredentials, setRecentCredentials] = useState<VerifiableCredential[]>([]);
  const [pendingRequests, setPendingRequests] = useState<HandshakeRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loadDashboardData = useCallback(async () => {
    setLoading({ isLoading: true, message: 'Loading your dashboard...' });

    try {
      // Load data in parallel
      const [
        credentialsResponse,
        requestsResponse,
        notificationsResponse
      ] = await Promise.allSettled([
        credentialsAPI.queryCredentials({ limit: 10 }),
        handshakeService.getPendingRequests(),
        // notificationsAPI.getNotifications({ limit: 5 }) // Assuming this exists
        Promise.resolve([]) // Placeholder for notifications
      ]);

      // Process credentials
      const credentials = credentialsResponse.status === 'fulfilled'
        ? credentialsResponse.value
        : [];

      // Process pending requests
      const requests = requestsResponse.status === 'fulfilled'
        ? requestsResponse.value
        : [];

      // Process notifications
      const notifications = notificationsResponse.status === 'fulfilled'
        ? notificationsResponse.value
        : [];

      // Calculate stats
      const verifiedCredentials = credentials.filter(cred =>
        cred.proof && cred.proof.length > 0
      ).length;

      setStats({
        totalCredentials: credentials.length,
        pendingRequests: requests.length,
        verifiedCredentials,
        recentActivity: notifications.length
      });

      setRecentCredentials(credentials.slice(0, 6));
      setPendingRequests(requests);
      setNotifications(notifications);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toastError('Dashboard Error', 'Failed to load dashboard data');
    } finally {
      setLoading({ isLoading: false });
    }
  }, [setLoading, toastError]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
    toastSuccess('Dashboard Updated', 'Your dashboard has been refreshed');
  };

  const quickActions = [
    {
      icon: Plus,
      title: 'Add Credential',
      description: 'Import a new credential',
      href: '/consumer/credentials/add',
      color: 'bg-blue-500'
    },
    {
      icon: ScanLine,
      title: 'Scan QR Code',
      description: 'Quick verification',
      href: '/consumer/scan',
      color: 'bg-green-500'
    },
    {
      icon: Eye,
      title: 'View Requests',
      description: 'Manage verification requests',
      href: '/consumer/requests',
      color: 'bg-purple-500'
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Manage your preferences',
      href: '/consumer/settings',
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
                <Shield className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">DID Wallet</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Consumer
              </Badge>
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
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Button>

              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar} alt={profile?.name} />
                <AvatarFallback>
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
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
            Welcome back, {profile?.name || 'User'}!
          </h1>
          <p className="text-gray-600">
            Manage your digital identity and credentials securely
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credentials</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCredentials}</div>
              <p className="text-xs text-muted-foreground">
                {stats.verifiedCredentials} verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting your response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentActivity}</div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DID Status</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Verified</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {profile?.did ? `${profile.did.slice(0, 20)}...` : 'No DID set'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 hover:border-blue-300"
              onClick={() => router.push('/credentials')}
            >
              <CardContent className="p-4 text-center">
                <Plus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Request Credential</h3>
                <p className="text-sm text-gray-600">Get a new digital credential</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 hover:border-green-300"
              onClick={() => router.push('/presentations')}
            >
              <CardContent className="p-4 text-center">
                <Share2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Share Credentials</h3>
                <p className="text-sm text-gray-600">Create and share presentations</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 hover:border-purple-300"
              onClick={() => router.push('/connections')}
            >
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Manage Connections</h3>
                <p className="text-sm text-gray-600">Connect with trusted issuers</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 hover:border-orange-300"
              onClick={() => router.push('/settings')}
            >
              <CardContent className="p-4 text-center">
                <Settings className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Settings</h3>
                <p className="text-sm text-gray-600">Configure your preferences</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Credentials */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Credentials</span>
                  <Link href="/consumer/credentials">
                    <Button variant="ghost" size="sm">
                      View All →
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentCredentials.length > 0 ? (
                  <div className="space-y-4">
                    {recentCredentials.map((credential, index) => (
                      <div key={credential.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {credential.type?.join(', ') || 'Credential'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Issued by {credential.issuer?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {credential.proof ? (
                            <Badge variant="secondary" className="text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No credentials yet</p>
                    <Link href="/consumer/credentials/add">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Credential
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending Requests & Quick Actions */}
          <div className="space-y-6">
            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pending Requests</span>
                  <Link href="/consumer/requests">
                    <Button variant="ghost" size="sm">
                      View All →
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {pendingRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{request.requesterName}</p>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{request.purpose}</p>
                        <p className="text-xs text-gray-500">
                          {request.requestedFields.length} fields requested
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No pending requests</p>
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
          </div>
        </div>
      </main>
    </div>
  );
}
