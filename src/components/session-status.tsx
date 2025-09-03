"use client"

import { useState, useEffect } from 'react'

import { useSession, useSessionMonitor } from '@/contexts/session-context'
import { useToast } from '@/hooks/use-toast'
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  LogOut,
  User,
  Wifi
} from 'lucide-react'

interface SessionStatusProps {
  showDetails?: boolean
  compact?: boolean
}

export function SessionStatus({ showDetails = false, compact = false }: SessionStatusProps) {
  const { session, logout, extendSession } = useSession()
  const { timeUntilExpiry, timeUntilRefresh, isSessionExpired, refreshTokens } = useSessionMonitor()
  const { toastWarning, toastInfo } = useToast()

  const [showWarning, setShowWarning] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Show warning when session is about to expire
  useEffect(() => {
    if (session.isAuthenticated && timeUntilExpiry > 0) {
      const minutesUntilExpiry = Math.floor(timeUntilExpiry / (60 * 1000))

      if (minutesUntilExpiry <= 10 && !showWarning) {
        setShowWarning(true)
        toastWarning(
          "Session Expiring Soon",
          `Your session will expire in ${minutesUntilExpiry} minute${minutesUntilExpiry !== 1 ? 's' : ''}.`
        )
      } else if (minutesUntilExpiry > 10 && showWarning) {
        setShowWarning(false)
      }
    }
  }, [timeUntilExpiry, session.isAuthenticated, showWarning, toastWarning])

  // Auto-logout when session is expired
  useEffect(() => {
    if (isSessionExpired && session.isAuthenticated) {
      logout()
    }
  }, [isSessionExpired, session.isAuthenticated, logout])

  const handleRefreshTokens = async () => {
    setIsRefreshing(true)
    try {
      const success = await refreshTokens()
      if (success) {
        toastInfo("Session Extended", "Your session has been extended successfully.")
        setShowWarning(false)
      }
    } catch (error) {
      console.error('Failed to refresh tokens:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExtendSession = () => {
    extendSession()
    toastInfo("Session Extended", "Your session has been extended.")
    setShowWarning(false)
  }

  const formatTimeRemaining = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (60 * 1000))
    const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000)

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  // Don't render anything if not authenticated or still loading
  if (!session.isAuthenticated || session.isLoading) {
    return null
  }

  if (compact) {
    // Compact version for header
    const statusColor = showWarning ? 'text-yellow-500' : 'text-green-500'
    const StatusIcon = showWarning ? AlertTriangle : CheckCircle

    return (
      <div className={`flex items-center space-x-1 text-sm ${statusColor}`}>
        <StatusIcon className="w-4 h-4" />
        {!showWarning && <span>Active</span>}
        {showWarning && (
          <span className="text-xs">
            {formatTimeRemaining(timeUntilExpiry)}
          </span>
        )}
      </div>
    )
  }

  // Full status component
  const getStatusInfo = () => {
    if (showWarning) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        text: "Session Expiring",
        description: `Expires in ${formatTimeRemaining(timeUntilExpiry)}`,
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        borderColor: "border-yellow-200 dark:border-yellow-800",
        actions: [
          {
            label: "Refresh",
            icon: <RefreshCw className="w-4 h-4" />,
            onClick: handleRefreshTokens,
            disabled: isRefreshing,
            variant: "primary" as const
          },
          {
            label: "Extend",
            icon: <Clock className="w-4 h-4" />,
            onClick: handleExtendSession,
            variant: "secondary" as const
          }
        ]
      }
    }

    return {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "Session Active",
      description: `Expires in ${formatTimeRemaining(timeUntilExpiry)}`,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      actions: []
    }
  }

  const statusInfo = getStatusInfo()

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
        {statusInfo.icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{statusInfo.text}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{statusInfo.description}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border p-4 ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {statusInfo.icon}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {statusInfo.text}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {statusInfo.description}
            </p>

            {session.user && (
              <div className="flex items-center space-x-2 mt-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {session.user.name}
                </span>
                {session.user.primaryDID && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {session.user.primaryDID.substring(0, 12)}...
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {statusInfo.actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`
                inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${action.variant === 'primary'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {action.icon}
              <span className="ml-1">{action.label}</span>
            </button>
          ))}

          <button
            onClick={logout}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-1">Logout</span>
          </button>
        </div>
      </div>

      {/* Activity and connection status */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Last activity: {new Date(session.lastActivity).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Auto-refresh: {timeUntilRefresh > 0 ? formatTimeRemaining(timeUntilRefresh) : 'Soon'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Connected</span>
        </div>
      </div>
    </div>
  )
}

// Session status indicator for header
export function SessionStatusIndicator() {
  return <SessionStatus compact={true} />
}

// Session warning banner
export function SessionWarningBanner() {
  const { session } = useSession()
  const { timeUntilExpiry } = useSessionMonitor()
  const { extendSession } = useSession()

  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(false)
  }, [timeUntilExpiry])

  if (
    dismissed ||
    !session.isAuthenticated ||
    timeUntilExpiry > 10 * 60 * 1000 || // Show only if less than 10 minutes
    timeUntilExpiry <= 0
  ) {
    return null
  }

  const minutesUntilExpiry = Math.floor(timeUntilExpiry / (60 * 1000))

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Session expires in {minutesUntilExpiry} minute{minutesUntilExpiry !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Your session will automatically log you out. Extend it to continue working.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={extendSession}
            className="px-3 py-1.5 text-sm font-medium text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/40 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 rounded-md transition-colors"
          >
            Extend Session
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
