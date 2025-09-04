"use client"
import type { AppProps } from "next/app"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import "../globals.css"

// Import API interceptor to handle undefined endpoints
import "@/services/api-interceptor"

// Legacy providers (keeping for backward compatibility)
import { NotificationProvider } from "@/contexts/notifications-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { SessionProvider } from "@/contexts/session-context"

// New dual-purpose providers
import { UserTypeProvider } from "@/shared/hooks/useUserType"
import { AppProvider } from "@/shared/contexts/AppContext"

// Components
import { ErrorBoundary, PageErrorBoundaryWrapper } from "@/components/error-boundary"
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner"
import { PerformanceMonitor } from "@/components/performance-monitor"

// Analytics and Testing Components
import { AnalyticsProvider } from "@/contexts/AnalyticsContext"
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget"
import { PerformanceMonitor as NewPerformanceMonitor } from "@/components/performance/PerformanceMonitor"
import { UserTestingToolkit } from "@/components/user-testing/UserTestingToolkit"

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(true)
  const [userId, setUserId] = useState<string>("anonymous-user")

  useEffect(() => {
    // Initialize app with proper error handling and cleanup
    let isMounted = true

    const initializeApp = async () => {
      try {
        // Get user ID from localStorage or generate a cryptographically secure one
        let storedUserId = "anonymous-user"

        if (typeof window !== "undefined") {
          storedUserId = localStorage.getItem("user_id")
          if (!storedUserId) {
            // Generate cryptographically secure user ID
            if (window.crypto?.getRandomValues) {
              const array = new Uint8Array(16)
              window.crypto.getRandomValues(array)
              storedUserId = "user_" + Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
            } else {
              storedUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
            }
            localStorage.setItem("user_id", storedUserId)
          }
        }

        if (isMounted) {
          setUserId(storedUserId)
          setIsInitializing(false)
        }
      } catch (error) {
        console.error("App initialization error:", error)
        if (isMounted) {
          setUserId("anonymous-user")
          setIsInitializing(false)
        }
      }
    }

    initializeApp()

    return () => {
      isMounted = false
    }
  }, [])

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Initializing your experience..." />
      </div>
    )
  }

  return (
    <ErrorBoundary
      name="App"
      onError={(error, errorInfo) => {
        // Log to error reporting service in production
        console.error("App Error:", error, errorInfo)
      }}
    >
      {/* Analytics Provider - must be at the top level */}
      <AnalyticsProvider
        userId={userId}
        enableTracking={process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development"}
        enableABTesting={true}
        enableUserTesting={process.env.NODE_ENV === "development"}
      >
        {/* Legacy Providers - keeping for backward compatibility */}
        <SessionProvider>
          <ThemeProvider defaultTheme="system" enableSystemTheme={true}>
            <NotificationProvider userId={userId || "anonymous-user"}>
              {/* UserTypeProvider must come first for proper initialization */}
              <UserTypeProvider>
                <AppProvider
                  config={{
                    environment: process.env.NODE_ENV === "production" ? "production" : "development",
                    version: "1.0.0",
                    api: {
                      baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
                      timeout: 30000,
                      retryAttempts: 3,
                    },
                    blockchain: {
                      network: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK || "mainnet",
                      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "",
                      chainId: (() => {
                        const chainIdStr = process.env.NEXT_PUBLIC_CHAIN_ID || "1"
                        const parsed = Number.parseInt(chainIdStr, 10)
                        return isNaN(parsed) ? 1 : parsed
                      })(),
                    },
                    features: {
                      handshake: true,
                      selectiveDisclosure: true,
                      zeroKnowledgeProofs: false,
                      biometricAuth: true,
                      enterprisePortal: true,
                      consumerMobileApp: true,
                      aiRiskAssessment: false,
                      multiTenant: true,
                      auditLogging: true,
                      complianceReporting: true,
                    },
                    limits: {
                      maxFileSize: 10 * 1024 * 1024, // 10MB
                      maxCredentials: 1000,
                      maxRequestsPerMinute: 100,
                    },
                  }}
                >
                  <PageErrorBoundaryWrapper>
                    <Component {...pageProps} />

                    {/* Analytics and Testing Components */}
                    <FeedbackWidget page={router.pathname} category="ux" position="bottom-right" trigger="button" />

                    {/* Performance Monitor - only in development */}
                    {process.env.NODE_ENV === "development" && (
                      <>
                        <PerformanceMonitor showDetailedMetrics={true} />
                        <NewPerformanceMonitor
                          page={router.pathname}
                          showDetailedMetrics={false}
                          enableRealTimeTracking={true}
                        />
                      </>
                    )}

                    {/* User Testing Toolkit - only in development */}
                    {process.env.NODE_ENV === "development" && (
                      <UserTestingToolkit
                        tasks={[
                          {
                            id: "onboarding_flow",
                            title: "Complete Onboarding",
                            description: "Go through the onboarding process and create your DID",
                            completed: false,
                          },
                          {
                            id: "request_credential",
                            title: "Request First Credential",
                            description: "Request your first digital credential from a trusted issuer",
                            completed: false,
                          },
                          {
                            id: "create_presentation",
                            title: "Create Presentation",
                            description: "Create and share a verifiable presentation",
                            completed: false,
                          },
                          {
                            id: "manage_connections",
                            title: "Manage Connections",
                            description: "Add and manage trusted issuer connections",
                            completed: false,
                          },
                        ]}
                        enableRecording={true}
                        showFeedbackPrompts={true}
                        onTaskComplete={(taskId, timeSpent) => {
                          console.log(`Task ${taskId} completed in ${timeSpent}ms`)
                        }}
                        onSessionComplete={(results) => {
                          console.log("User testing session completed:", results)
                        }}
                      />
                    )}
                  </PageErrorBoundaryWrapper>
                </AppProvider>
              </UserTypeProvider>
            </NotificationProvider>
          </ThemeProvider>
        </SessionProvider>
      </AnalyticsProvider>
    </ErrorBoundary>
  )
}

export default function App(props: AppProps) {
  return <AppContent {...props} />
}
