"use client"

import React from "react"
import Link from "next/link"
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
  BarChart3,
} from "lucide-react"

import { useUserType, useApp, useToast } from "../../shared/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/components/ui/card"
import { Button } from "../../shared/components/ui/button"
import { Badge } from "../../shared/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../shared/components/ui/avatar"
import { CredentialGrid } from "../../shared/components/CredentialCard"
import { HandshakeRequestModal } from "../../handshake/components/HandshakeRequestModal"
import { CredentialDetailsModal } from "../../shared/components/CredentialDetailsModal"
import { ShareCredentialModal } from "../../shared/components/ShareCredentialModal"

import { credentialsAPI, handshakeService } from "../../services"
import type { VerifiableCredential, HandshakeRequest } from "../../shared/types"

interface DashboardStats {
  totalCredentials: number
  pendingRequests: number
  verifiedCredentials: number
  recentActivity: number
}

export default function ConsumerDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userType: _userType, profile } = useUserType()
  const { setLoading } = useApp()
  const { toastSuccess, toastError } = useToast()

  const [stats, setStats] = React.useState<DashboardStats>({
    totalCredentials: 0,
    pendingRequests: 0,
    verifiedCredentials: 0,
    recentActivity: 0,
  })
  const [selectedCredential, setSelectedCredential] = React.useState<VerifiableCredential | null>(null)
  const [showCredentialDetails, setShowCredentialDetails] = React.useState(false)
  const [showShareModal, setShowShareModal] = React.useState(false)

  const [recentCredentials, setRecentCredentials] = React.useState<VerifiableCredential[]>([])
  const [pendingRequests, setPendingRequests] = React.useState<HandshakeRequest[]>([])
  const [selectedRequest, setSelectedRequest] = React.useState<HandshakeRequest | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [notifications, setNotifications] = React.useState<any[]>([])

  React.useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading({ isLoading: true, message: "Loading your dashboard..." })

    try {
      // Load data in parallel
      const [credentialsResponse, requestsResponse, notificationsResponse] = await Promise.allSettled([
        credentialsAPI.queryCredentials({ limit: 10 }),
        handshakeService.getPendingRequests(),
        // notificationsAPI.getNotifications({ limit: 5 }) // Assuming this exists
        Promise.resolve([]), // Placeholder for notifications
      ])

      // Process credentials
      const credentials = credentialsResponse.status === "fulfilled" ? credentialsResponse.value : []

      // Process pending requests
      const requests = requestsResponse.status === "fulfilled" ? requestsResponse.value : []

      // Process notifications
      const notifications = notificationsResponse.status === "fulfilled" ? notificationsResponse.value : []

      // Calculate stats
      const verifiedCredentials = credentials.filter((cred) => cred.proof && cred.proof.length > 0).length

      setStats({
        totalCredentials: credentials.length,
        pendingRequests: requests.length,
        verifiedCredentials,
        recentActivity: notifications.length,
      })

      setRecentCredentials(credentials.slice(0, 6))
      setPendingRequests(requests)
      setNotifications(notifications)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      toastError("Dashboard Error", "Failed to load dashboard data")
    } finally {
      setLoading({ isLoading: false })
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadDashboardData()
    setIsRefreshing(false)
    toastSuccess("Dashboard Updated", "Your dashboard has been refreshed")
  }

  const handleViewCredential = (credential: VerifiableCredential) => {
    setSelectedCredential(credential)
    setShowCredentialDetails(true)
  }

  const handleShareCredential = (credential: VerifiableCredential) => {
    setSelectedCredential(credential)
    setShowShareModal(true)
  }

  const handleDownloadCredential = async (credential: VerifiableCredential) => {
    let downloadUrl = ""
    let downloadElement: HTMLAnchorElement | null = null

    try {
      const credentialData = {
        ...credential,
        downloadedAt: new Date().toISOString(),
        downloadedBy: profile?.did || "anonymous",
      }

      const blob = new Blob([JSON.stringify(credentialData, null, 2)], {
        type: "application/json",
      })

      downloadUrl = URL.createObjectURL(blob)
      downloadElement = document.createElement("a")
      downloadElement.href = downloadUrl
      downloadElement.download = `credential-${credential.id || "unnamed"}.json`

      // Ensure element is added to DOM before clicking
      document.body.appendChild(downloadElement)
      downloadElement.click()

      toastSuccess("Download Complete", "Credential downloaded successfully")
    } catch (error) {
      console.error("Failed to download credential:", error)
      toastError("Download Failed", "Unable to download credential")
    } finally {
      // Always clean up resources, even if an error occurs
      if (downloadElement && downloadElement.parentNode) {
        document.body.removeChild(downloadElement)
      }
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl)
      }
    }
  }

  const handleRespondToRequest = async (approvedFields: string[], rejectedFields: string[]) => {
    if (!selectedRequest) return

    try {
      await handshakeService.respondToHandshakeRequest({
        requestId: selectedRequest.id,
        approvedFields,
        rejectedFields,
      })

      toastSuccess("Response Sent", "Your response has been sent successfully")

      // Refresh data
      await loadDashboardData()
    } catch (error) {
      console.error("Failed to respond to request:", error)
      toastError("Response Failed", "Failed to send response")
    }
  }

  const quickActions = [
    {
      icon: Plus,
      title: "Add Credential",
      description: "Import a new credential",
      href: "/consumer/credentials/add",
      color: "bg-blue-500",
    },
    {
      icon: ScanLine,
      title: "Scan QR Code",
      description: "Quick verification",
      href: "/consumer/scan",
      color: "bg-green-500",
    },
    {
      icon: Eye,
      title: "View Requests",
      description: "Manage verification requests",
      href: "/consumer/requests",
      color: "bg-purple-500",
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Manage your preferences",
      href: "/consumer/settings",
      color: "bg-gray-500",
    },
  ]

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
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
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
                <AvatarImage src={profile?.avatar || "/placeholder.svg"} alt={profile?.name} />
                <AvatarFallback>{profile?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile?.name || "User"}!</h1>
          <p className="text-gray-600">Manage your digital identity and credentials securely</p>
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
              <p className="text-xs text-muted-foreground">{stats.verifiedCredentials} verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting your response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentActivity}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
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
                {profile?.did ? `${profile.did.slice(0, 20)}...` : "No DID set"}
              </p>
            </CardContent>
          </Card>
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
                <CredentialGrid
                  credentials={recentCredentials}
                  userType="consumer"
                  onView={handleViewCredential}
                  onShare={handleShareCredential}
                  onDownload={handleDownloadCredential}
                  compact={true}
                  emptyMessage="No credentials yet"
                />
                {recentCredentials.length === 0 && (
                  <div className="text-center mt-4">
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
                      <div
                        key={request.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{request.requesterName}</p>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{request.purpose}</p>
                        <p className="text-xs text-gray-500">{request.requestedFields.length} fields requested</p>
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

        {/* Handshake Request Modal */}
        <HandshakeRequestModal
          request={selectedRequest}
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onRespond={handleRespondToRequest}
        />

        {/* Credential Details Modal */}
        {showCredentialDetails && selectedCredential && (
          <CredentialDetailsModal
            credential={selectedCredential}
            isOpen={showCredentialDetails}
            onClose={() => {
              setShowCredentialDetails(false)
              setSelectedCredential(null)
            }}
          />
        )}

        {/* Share Credential Modal */}
        {showShareModal && selectedCredential && (
          <ShareCredentialModal
            credential={selectedCredential}
            isOpen={showShareModal}
            onClose={() => {
              setShowShareModal(false)
              setSelectedCredential(null)
            }}
          />
        )}
      </main>
    </div>
  )
}
