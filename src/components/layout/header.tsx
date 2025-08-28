"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Shield, Bell, Settings, Menu, X, CheckCircle } from "lucide-react"

interface HeaderProps {
  user?: {
    name: string
    primaryDID: string
    anonymousDID: string
  }
  notifications?: number
}

export default function Header({ user, notifications = 0 }: HeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifItems, setNotifItems] = useState<{ id: string; text: string; time: string; read: boolean }[]>([
    { id: "n1", text: "University issued Degree Certificate", time: "2h", read: false },
    { id: "n2", text: "New sign-in from Chrome", time: "1d", read: false },
    { id: "n3", text: "Connection request from FinanceApp", time: "3d", read: true },
  ])

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
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                aria-label="Open notifications"
                onClick={() => setNotifOpen((v) => !v)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <Bell className="w-6 h-6" />
              </button>
              {notifItems.some((n) => !n.read) && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {notifItems.filter((n) => !n.read).length}
                </span>
              )}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
                  <div className="flex items-center justify-between px-3 py-2 border-b">
                    <span className="text-sm font-medium">Notifications</span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifItems.length === 0 && (
                      <div className="p-4 text-sm text-gray-500">You're all caught up.</div>
                    )}
                    {notifItems.map((n) => (
                      <div key={n.id} className={`px-3 py-2 text-sm flex items-start gap-2 ${n.read ? "bg-white" : "bg-blue-50"}`}>
                        <CheckCircle className={`w-4 h-4 mt-0.5 ${n.read ? "text-gray-400" : "text-blue-600"}`} />
                        <div className="flex-1">
                          <div className="text-gray-800">{n.text}</div>
                          <div className="text-xs text-gray-500">{n.time} ago</div>
                        </div>
                        {!n.read && (
                          <button
                            onClick={() => setNotifItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {notifItems.some((n) => !n.read) && (
                    <div className="px-3 py-2 border-t">
                      <button
                        onClick={() => setNotifItems((prev) => prev.map((n) => ({ ...n, read: true })))}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark all as read
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
