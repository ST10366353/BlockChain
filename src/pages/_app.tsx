import type { AppProps } from "next/app"
import "@/src/globals.css"
import { NotificationProvider } from "@/src/contexts/notifications-context"
import { ThemeProvider } from "@/src/contexts/theme-context"
import { SessionProvider } from "@/src/contexts/session-context"
import { ErrorBoundary, PageErrorBoundaryWrapper } from "@/src/components/error-boundary"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary
      name="App"
      onError={(error, errorInfo) => {
        // Log to error reporting service in production
        console.error('App Error:', error, errorInfo)
      }}
    >
      <SessionProvider>
        <ThemeProvider defaultTheme="system" enableSystemTheme={true}>
          <NotificationProvider userId="user-123"> {/* Replace with actual user ID */}
            <PageErrorBoundaryWrapper>
              <Component {...pageProps} />
            </PageErrorBoundaryWrapper>
          </NotificationProvider>
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}


