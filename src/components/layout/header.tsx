"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Shield, Bell, Settings, Menu, X, CheckCircle, RefreshCw, Trash2 } from "lucide-react"
import { useNotifications } from "@/src/contexts/notifications-context"
import { ThemeToggle } from "@/src/contexts/theme-context"
import { SessionStatusIndicator } from "@/src/components/session-status"
import type { NotificationData } from "@/src/services"

interface HeaderProps {
  user?: {
    name: string
    primaryDID: string
    anonymousDID?: string
  }
  notifications?: number
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  // Use notification context
  const {
    state: { notifications, unreadCount, connectionStatus },
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  } = useNotifications()

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold">DID Wallet</span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/dashboard") ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/identities"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/identities") ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Identities
              </Link>
              <Link
                href="/credentials"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/credentials") ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Credentials
              </Link>
              <Link
                href="/presentations"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/presentations") ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Presentations
              </Link>
              <Link
                href="/connections"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/connections") ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Connections
              </Link>
              <Link
                href="/notifications"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/notifications") ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Notifications
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                aria-label="Open notifications"
                onClick={() => setNotifOpen((v) => !v)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 relative"
              >
                <Bell className="w-6 h-6" />
                {/* Connection status indicator */}
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
              </button>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Notifications</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                        connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {connectionStatus === 'connected' ? 'Live' :
                         connectionStatus === 'connecting' ? 'Connecting...' :
                         'Offline'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={refresh}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Refresh notifications"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">You're all caught up!</p>
                        <p className="text-xs mt-1">No new notifications</p>
                      </div>
                    ) : (
                      <>
                        {notifications.slice(0, 10).map((notification) => (
                          <div key={notification.id} className={`px-4 py-3 text-sm border-b last:border-b-0 ${notification.read ? "bg-white" : "bg-blue-50"}`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                notification.priority === 'urgent' ? 'bg-red-500' :
                                notification.priority === 'high' ? 'bg-orange-500' :
                                notification.priority === 'medium' ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{notification.title}</div>
                                    <div className="text-gray-700 text-sm mt-1">{notification.message}</div>
                                    <div className="text-xs text-gray-500 mt-2">
                                      {new Date(notification.timestamp).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 ml-2">
                                    {!notification.read && (
                                      <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="p-1 text-blue-600 hover:text-blue-800 text-xs"
                                        title="Mark as read"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteNotification(notification.id)}
                                      className="p-1 text-red-600 hover:text-red-800 text-xs"
                                      title="Delete notification"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                {notification.actionUrl && notification.actionLabel && (
                                  <div className="mt-2">
                                    <Link
                                      href={notification.actionUrl}
                                      onClick={() => setNotifOpen(false)}
                                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                                    >
                                      {notification.actionLabel}
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {notifications.length > 10 && (
                          <div className="px-4 py-2 text-center border-t">
                            <Link
                              href="/notifications"
                              onClick={() => setNotifOpen(false)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              View all {notifications.length} notifications
                            </Link>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <div className="px-4 py-3 border-t bg-gray-50">
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read ({unreadCount})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {user && (
              <Link href="/profile" className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium">Welcome back, {user.name}</span>
              </Link>
            )}

            <SessionStatusIndicator />

            <ThemeToggle size="sm" className="hidden md:inline-flex" />

            <Link href="/settings" className="p-2 text-gray-600 hover:text-gray-900 hidden md:inline-flex">
              <Settings className="w-5 h-5" />
            </Link>

            <button
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t mt-2">
            <nav className="flex flex-col space-y-1 pt-3">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/dashboard") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/identities"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/identities") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Identities
              </Link>
              <Link
                href="/credentials"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/credentials") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Credentials
              </Link>
              <Link
                href="/presentations"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/presentations") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Presentations
              </Link>
              <Link
                href="/connections"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/connections") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Connections
              </Link>
              <Link
                href="/notifications"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/notifications") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Notifications
              </Link>
              <div className="px-3 py-2">
                <ThemeToggle size="sm" showLabel={true} />
              </div>
              <Link
                href="/settings"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/settings") ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Settings
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
