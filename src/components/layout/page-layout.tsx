"use client"

import { ReactNode } from 'react'
import { APIErrorBoundary, FormErrorBoundary } from '@/components/error-boundary'
import Header from './header'

interface PageLayoutProps {
  children: ReactNode
  user?: {
    name: string
    primaryDID: string
    anonymousDID?: string
  }
  notifications?: number
  title?: string
  showHeader?: boolean
}

export function PageLayout({
  children,
  user,
  notifications = 0,
  title,
  showHeader = true
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showHeader && <Header user={user} notifications={notifications} />}

      <main className="container mx-auto px-4 py-8">
        {title && (
          <h1 className="text-3xl font-bold mb-8">{title}</h1>
        )}

        {/* Wrap main content with API error boundary */}
        <APIErrorBoundary>
          {children}
        </APIErrorBoundary>
      </main>
    </div>
  )
}

// Specialized layout for forms
export function FormPageLayout({
  children,
  user,
  notifications = 0,
  title,
  showHeader = true
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showHeader && <Header user={user} notifications={notifications} />}

      <main className="container mx-auto px-4 py-8">
        {title && (
          <h1 className="text-3xl font-bold mb-8">{title}</h1>
        )}

        {/* Wrap form content with form error boundary */}
        <FormErrorBoundary>
          {children}
        </FormErrorBoundary>
      </main>
    </div>
  )
}

// Layout for dashboard/overview pages
export function DashboardLayout({
  children,
  user,
  notifications = 0,
  title,
  showHeader = true
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showHeader && <Header user={user} notifications={notifications} />}

      <main className="container mx-auto px-4 py-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your decentralized identity and credentials
            </p>
          </div>
        )}

        {/* Wrap dashboard content with API error boundary */}
        <APIErrorBoundary>
          {children}
        </APIErrorBoundary>
      </main>
    </div>
  )
}

// Layout for modals and overlays
export function ModalLayout({
  children,
  isOpen,
  onClose,
  title
}: {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  title?: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <FormErrorBoundary>
            {children}
          </FormErrorBoundary>
        </div>
      </div>
    </div>
  )
}
