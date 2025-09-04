"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wallet, Shield, Users, Activity, Bell, Plus, Eye, Send, Download, Upload } from "lucide-react"

import type { UserProfile, VerifiableCredential, HandshakeRequest, NotificationData } from "../src/shared/types"

export default function BlockchainDashboard() {
  const [activeTab, setActiveTab] = useState("wallet")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([])
  const [handshakeRequests, setHandshakeRequests] = useState<HandshakeRequest[]>([])
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  useEffect(() => {
    // Initialize mock user profile
    setUserProfile({
      id: "user-123",
      did: "did:example:123456789abcdefghi",
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "/diverse-user-avatars.png",
      type: "consumer",
      preferences: {
        theme: "light",
        language: "en",
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: false,
          security: true,
          credentialUpdates: true,
          handshakeRequests: true,
        },
        privacy: {
          profileVisibility: "connections",
          credentialSharing: "selective",
          dataRetention: 365,
          analyticsOptOut: false,
          anonymousIdentity: false,
        },
        security: {
          autoLock: 15,
          biometricEnabled: true,
          twoFactorEnabled: true,
          sessionTimeout: 60,
          loginAlerts: true,
        },
        display: {
          dateFormat: "MM/DD/YYYY",
          timeFormat: "12h",
          currency: "USD",
          itemsPerPage: 10,
        },
      },
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-20T14:30:00Z",
      lastLogin: "2024-01-20T14:30:00Z",
      isActive: true,
    })

    // Initialize mock credentials
    setCredentials([
      {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        id: "cred-1",
        type: ["VerifiableCredential", "IdentityCredential"],
        issuer: {
          id: "did:example:issuer123",
          name: "Government ID Authority",
          image: "/generic-government-seal.png",
        },
        issuanceDate: "2024-01-15T10:00:00Z",
        expirationDate: "2025-01-15T10:00:00Z",
        credentialSubject: {
          id: "did:example:123456789abcdefghi",
          name: "John Doe",
          dateOfBirth: "1990-05-15",
          nationality: "US",
        },
      },
      {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        id: "cred-2",
        type: ["VerifiableCredential", "EducationCredential"],
        issuer: {
          id: "did:example:university456",
          name: "Tech University",
          image: "/generic-university-logo.png",
        },
        issuanceDate: "2023-06-01T10:00:00Z",
        credentialSubject: {
          id: "did:example:123456789abcdefghi",
          degree: "Bachelor of Science",
          major: "Computer Science",
          graduationDate: "2023-05-30",
        },
      },
    ])

    // Initialize mock handshake requests
    setHandshakeRequests([
      {
        id: "req-1",
        requesterDID: "did:example:verifier789",
        requesterName: "TechCorp HR",
        requestedFields: ["name", "degree", "graduationDate"],
        purpose: "Employment verification",
        expiresAt: "2024-02-01T10:00:00Z",
        status: "pending",
        createdAt: "2024-01-20T09:00:00Z",
        updatedAt: "2024-01-20T09:00:00Z",
      },
    ])

    // Initialize mock notifications
    setNotifications([
      {
        id: "notif-1",
        type: "handshake.request",
        priority: "high",
        title: "New Credential Request",
        message: "TechCorp HR is requesting access to your education credentials",
        timestamp: "2024-01-20T09:00:00Z",
        read: false,
        actionUrl: "/handshake/req-1",
        actionLabel: "Review Request",
      },
      {
        id: "notif-2",
        type: "credential.issued",
        priority: "medium",
        title: "New Credential Issued",
        message: "Your identity credential has been successfully issued",
        timestamp: "2024-01-15T10:00:00Z",
        read: true,
      },
    ])
  }, [])

  const handleApproveHandshake = (requestId: string) => {
    setHandshakeRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "approved" as const, updatedAt: new Date().toISOString() } : req,
      ),
    )
  }

  const handleRejectHandshake = (requestId: string) => {
    setHandshakeRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "rejected" as const, updatedAt: new Date().toISOString() } : req,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">DID Wallet</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {notifications.filter((n) => !n.read).length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {notifications.filter((n) => !n.read).length}
                  </Badge>
                )}
              </Button>
              <Avatar>
                <AvatarImage src={userProfile?.avatar || "/placeholder.svg"} />
                <AvatarFallback>{userProfile?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 mb-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Credentials</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{credentials.length}</div>
                <p className="text-xs text-muted-foreground">Active credentials</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {handshakeRequests.filter((r) => r.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95%</div>
                <p className="text-xs text-muted-foreground">Verification rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>DID Identity</CardTitle>
                  <CardDescription>Your decentralized identifier and profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={userProfile?.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg">{userProfile?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{userProfile?.name}</h3>
                      <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                      <Badge variant="secondary">{userProfile?.type}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">DID</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">{userProfile?.did}</code>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Credential
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Send className="h-4 w-4 mr-2" />
                      Share Credentials
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Export Wallet
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Credentials
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && <div className="h-2 w-2 bg-primary rounded-full mt-2" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Credentials</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Credential
              </Button>
            </div>

            <div className="grid gap-4">
              {credentials.map((credential) => (
                <Card key={credential.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={credential.issuer.image || "/placeholder.svg"} />
                          <AvatarFallback>{credential.issuer.name?.charAt(0) || "I"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {credential.type.find((t) => t !== "VerifiableCredential")}
                          </CardTitle>
                          <CardDescription>Issued by {credential.issuer.name}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Issued</label>
                        <p className="text-sm">{new Date(credential.issuanceDate).toLocaleDateString()}</p>
                      </div>
                      {credential.expirationDate && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Expires</label>
                          <p className="text-sm">{new Date(credential.expirationDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <h2 className="text-2xl font-bold">Handshake Requests</h2>

            <div className="grid gap-4">
              {handshakeRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{request.requesterName}</CardTitle>
                        <CardDescription>{request.purpose}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          request.status === "pending"
                            ? "default"
                            : request.status === "approved"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Requested Fields</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {request.requestedFields.map((field) => (
                          <Badge key={field} variant="outline">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-muted-foreground">Requester DID</label>
                        <p className="font-mono text-xs break-all">{request.requesterDID}</p>
                      </div>
                      <div>
                        <label className="font-medium text-muted-foreground">Expires</label>
                        <p>{new Date(request.expiresAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button onClick={() => handleApproveHandshake(request.id)} size="sm">
                          Approve
                        </Button>
                        <Button variant="outline" onClick={() => handleRejectHandshake(request.id)} size="sm">
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Preferences</CardTitle>
                  <CardDescription>Manage your security and privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Auto Lock</label>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.preferences.security.autoLock} minutes
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Two-Factor Auth</label>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.preferences.security.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Biometric Auth</label>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.preferences.security.biometricEnabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Login Alerts</label>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.preferences.security.loginAlerts ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control how your data is shared and used</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Profile Visibility</label>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.preferences.privacy.profileVisibility}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Credential Sharing</label>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.preferences.privacy.credentialSharing}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Data Retention</label>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.preferences.privacy.dataRetention} days
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Anonymous Identity</label>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.preferences.privacy.anonymousIdentity ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
