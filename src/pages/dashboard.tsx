"use client"

import Link from "next/link"
import { Globe, Key, CheckCircle, Lock, Award, Users, Bell, RefreshCw, AlertTriangle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { didAPI, auditAPI, credentialsAPI, trustAPI } from "@/services"
import { useToast } from "@/hooks/use-toast"
import { useAPIErrorHandler } from "@/hooks/use-error-handler"
import { DashboardLayout } from "@/components/layout/page-layout"
import type { DIDDocument, DIDResolutionResult, AuditLogEntry, CredentialSummary, TrustedIssuer } from "@/services"

interface DashboardData {
  user: {
    name: string
    primaryDID: string
    anonymousDID?: string
  }
  identities: Array<{
    did: string
    method: string
    status: string
    isPrimary: boolean
    document?: DIDDocument
  }>
  recentActivity: Array<{
    action: string
    time: string
    timestamp: string
  }>
  stats: {
    credentials: number
    connections: number
    validCredentials: number
    trustedIssuers: number
  }
}

export default function Dashboard() {
  const { toastError } = useToast()
  const { handleAsyncError, withRetry } = useAPIErrorHandler()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    user: {
      name: "Loading...",
      primaryDID: "Loading...",
      anonymousDID: "Loading..."
    },
    identities: [],
    recentActivity: [],
    stats: {
      credentials: 0,
      connections: 0,
      validCredentials: 0,
      trustedIssuers: 0
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    const result = await handleAsyncError(async () => {
      // Load data from multiple APIs in parallel with retry logic
      const [
        identitiesResult,
        credentialsResult,
        connectionsResult,
        auditLogsResult
      ] = await Promise.allSettled([
        withRetry(() => loadIdentities(), 2, 500, 'Load Identities'),
        withRetry(() => loadCredentialsStats(), 2, 500, 'Load Credentials'),
        withRetry(() => loadConnectionsStats(), 2, 500, 'Load Connections'),
        withRetry(() => loadRecentActivity(), 2, 500, 'Load Activity')
      ])

      // Build dashboard data
      const identities = identitiesResult.status === 'fulfilled' && identitiesResult.value ? identitiesResult.value : []
      const credentials = credentialsResult.status === 'fulfilled' && credentialsResult.value ? credentialsResult.value : { total: 0, valid: 0 }
      const connections = connectionsResult.status === 'fulfilled' && connectionsResult.value ? connectionsResult.value : { total: 0, trusted: 0 }
      const recentActivity = auditLogsResult.status === 'fulfilled' && auditLogsResult.value ? auditLogsResult.value : []

      // Determine primary and anonymous DIDs
      const primaryDID = identities.find(id => id.isPrimary)?.did || identities[0]?.did || "No DID found"
      const anonymousDID = identities.find(id => id.method === 'key')?.did || "No anonymous DID"

      setDashboardData({
        user: {
          name: "User", // In a real app, this would come from user profile
          primaryDID,
          anonymousDID
        },
        identities,
        recentActivity,
        stats: {
          credentials: credentials.total || 0,
          connections: connections.total || 0,
          validCredentials: credentials.valid || 0,
          trustedIssuers: connections.trusted || 0
        }
      })

      setIsLoading(false)
      setLastUpdated(new Date())

      return true
    }, 'Load Dashboard Data')

    if (!result) {
      setError('Failed to load dashboard data')
      setIsLoading(false)
      toastError("Dashboard Error", "Unable to load dashboard data. Please try again.")
    }
  }

  const loadIdentities = async () => {
    try {
      // In a real implementation, you would have an endpoint to get user's identities
      // For now, we'll simulate by checking if some common DIDs are resolvable
      const commonDIDs = [
        { did: "did:web:Lerato.com", isPrimary: true, method: "web" },
        { did: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK", isPrimary: false, method: "key" }
      ]

      const identities = []

      for (const didInfo of commonDIDs) {
        try {
          const resolution = await didAPI.resolveDID(didInfo.did)
          identities.push({
            did: didInfo.did,
            method: didInfo.method,
            status: resolution.didDocument ? "verified" : "error",
            isPrimary: didInfo.isPrimary,
            document: resolution.didDocument
          })
        } catch (error) {
          // DID not resolvable, still include it but mark as error
          identities.push({
            did: didInfo.did,
            method: didInfo.method,
            status: "error",
            isPrimary: didInfo.isPrimary
          })
        }
      }

      return identities
    } catch (error) {
      console.warn('Failed to load identities:', error)
      return []
    }
  }

  const loadCredentialsStats = async () => {
    try {
      // Get user's credentials (using a common subject DID)
      const credentials = await credentialsAPI.queryCredentials({
        subject: "did:web:Lerato.com",
        limit: 100
      })

      const validCredentials = credentials.filter(cred =>
        cred.status === 'valid'
      ).length

      return {
        total: credentials.length,
        valid: validCredentials
      }
    } catch (error) {
      console.warn('Failed to load credentials stats:', error)
      return { total: 0, valid: 0 }
    }
  }

  const loadConnectionsStats = async () => {
    try {
      const connections = await trustAPI.getTrustedIssuers({ limit: 100 })
      const trustedConnections = connections.filter(conn => conn.status === 'trusted').length

      return {
        total: connections.length,
        trusted: trustedConnections
      }
    } catch (error) {
      console.warn('Failed to load connections stats:', error)
      return { total: 0, trusted: 0 }
    }
  }

  const loadRecentActivity = async () => {
    try {
      const auditLogs = await auditAPI.getAuditLogs({
        limit: 10,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // Last 7 days
      })

      return auditLogs.map(log => ({
        action: formatAuditAction(log),
        time: formatTimeAgo(new Date(log.timestamp)),
        timestamp: log.timestamp
      }))
    } catch (error) {
      console.warn('Failed to load recent activity:', error)
      return [
        { action: "Welcome to your DID Wallet", time: "Just now", timestamp: new Date().toISOString() }
      ]
    }
  }

  const formatAuditAction = (log: AuditLogEntry): string => {
    const actionMap: Record<string, string> = {
      'vc.issue': 'Credential issued',
      'vc.verify': 'Credential verified',
      'vc.revoke': 'Credential revoked',
      'did.create': 'DID created',
      'did.update': 'DID updated',
      'did.resolve': 'DID resolved',
      'trust.add': 'Trusted issuer added',
      'trust.update': 'Trust relationship updated',
      'oidc.login': 'Logged in via OIDC',
      'user.login': 'User login'
    }

    const baseAction = actionMap[log.action] || `${log.action.replace('.', ' ').replace('_', ' ')}`

    // Add context if available
    if (log.target) {
      return `${baseAction} (${log.target})`
    }

    return baseAction
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

    return date.toLocaleDateString()
  }

  const getIdentityStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Lock className="w-4 h-4 text-blue-600" />
    }
  }

  const getIdentityStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-600"
      case "error":
        return "text-red-600"
      default:
        return "text-blue-600"
    }
  }

  const getIdentityIcon = (method: string) => {
    switch (method) {
      case "web":
        return <Globe className="w-5 h-5 text-blue-600" />
      case "key":
        return <Key className="w-5 h-5 text-gray-600" />
      default:
        return <Key className="w-5 h-5 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout user={dashboardData.user} notifications={3} title="Dashboard">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
            <span>Loading your dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout user={dashboardData.user} notifications={3} title="Dashboard">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Dashboard Error</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center mx-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      user={dashboardData.user}
      notifications={3}
      title="Dashboard"
    >
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <span className="mr-2">👤</span>
              Your Identity
            </h2>
            <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-gray-600" />
              <button
                onClick={loadDashboardData}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50"
                title="Refresh dashboard"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {dashboardData.identities.length > 0 ? (
              dashboardData.identities.slice(0, 2).map((identity, index) => (
                <div key={identity.did} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-2">
                    {getIdentityIcon(identity.method)}
                    <span className="font-medium ml-2 truncate">{identity.did}</span>
              </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {identity.isPrimary ? 'Primary Identity' : 'Anonymous Identity'}
                  </p>
                  <div className={`flex items-center text-sm ${getIdentityStatusColor(identity.status)}`}>
                    {getIdentityStatusIcon(identity.status)}
                    <span className="ml-1 capitalize">
                      {identity.status === 'verified' ? 'Verified' : identity.status}
                    </span>
              </div>
            </div>
              ))
            ) : (
              <>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-center text-gray-500">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No identities found</p>
                    <p className="text-sm">Create your first DID to get started</p>
                  </div>
              </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-center text-gray-500">
                    <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No anonymous identity</p>
                    <p className="text-sm">Generate a private DID for privacy</p>
              </div>
            </div>
              </>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <span className="mr-2">📄</span>
              Recent Activity
            </h3>
            <div className="space-y-2 text-sm">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => (
                <div
                    key={`${activity.timestamp}-${index}`}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <span>{activity.action}</span>
                  <span className="text-gray-500">{activity.time}</span>
                </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No recent activity</p>
                  <p className="text-sm">Your actions will appear here</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/credentials"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Award className="w-6 h-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Credentials</p>
                  <p className="text-sm text-gray-600">
                    {dashboardData.stats.credentials} total
                    {dashboardData.stats.validCredentials > 0 && (
                      <span className="text-green-600 ml-1">
                        ({dashboardData.stats.validCredentials} valid)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/connections"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Users className="w-6 h-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Connections</p>
                  <p className="text-sm text-gray-600">
                    {dashboardData.stats.connections} total
                    {dashboardData.stats.trustedIssuers > 0 && (
                      <span className="text-green-600 ml-1">
                        ({dashboardData.stats.trustedIssuers} trusted)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/identities"
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-colors"
          >
            <div className="flex items-center mb-2">
              <Globe className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium">Manage Identities</span>
            </div>
            <p className="text-sm text-gray-600">Create and manage your DIDs</p>
          </Link>

          <Link
            href="/credentials"
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-colors"
          >
            <div className="flex items-center mb-2">
              <Award className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium">Request Credentials</span>
            </div>
            <p className="text-sm text-gray-600">Get new verifiable credentials</p>
          </Link>

          <Link
            href="/connections"
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-colors"
          >
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium">Trust Registry</span>
            </div>
            <p className="text-sm text-gray-600">Manage trusted issuers</p>
          </Link>
        </div>
    </DashboardLayout>
  )
}
