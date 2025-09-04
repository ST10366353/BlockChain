"use client"

import React, { createContext, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// Session and token types
export interface User {
  id: string
  name: string
  email?: string
  primaryDID?: string
  anonymousDID?: string
  roles?: string[]
  preferences?: UserPreferences
}
 
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  language: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresAt: number
  refreshExpiresAt: number
}

export interface SessionState {
  user: User | null
  tokens: TokenPair | null
  isAuthenticated: boolean
  isLoading: boolean
  lastActivity: number
  sessionExpiry: number
}

export interface SessionContextType {
  // State
  session: SessionState

  // Actions
  login: (user: User, tokens: TokenPair) => Promise<void>
  logout: () => Promise<void>
  refreshTokens: () => Promise<boolean>
  updateUser: (user: Partial<User>) => void
  updateActivity: () => void
  extendSession: () => void

  // Utilities
  isTokenExpired: (token: string) => boolean
  isSessionExpired: () => boolean
  getTimeUntilExpiry: () => number
  getTimeUntilRefresh: () => number
}

// Storage keys
const SESSION_STORAGE_KEY = 'did-wallet-session'
const USER_STORAGE_KEY = 'did-wallet-user'
const TOKENS_STORAGE_KEY = 'did-wallet-tokens'

// Session configuration
const SESSION_CONFIG = {
  // Token refresh before expiry (5 minutes)
  REFRESH_THRESHOLD: 5 * 60 * 1000,
  // Session timeout warning (10 minutes before expiry)
  WARNING_THRESHOLD: 10 * 60 * 1000,
  // Session expiry (2 hours)
  SESSION_EXPIRY: 2 * 60 * 60 * 1000,
  // Activity timeout (30 minutes of inactivity)
  ACTIVITY_TIMEOUT: 30 * 60 * 1000,
  // Token refresh interval (check every minute)
  REFRESH_CHECK_INTERVAL: 60 * 1000,
  // Activity check interval (check every 5 minutes)
  ACTIVITY_CHECK_INTERVAL: 5 * 60 * 1000
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

// Secure storage utilities
const secureStorage = {
  set: (key: string, value: unknown): void => {
    if (typeof window === 'undefined') return

    try {
      const encrypted = btoa(JSON.stringify(value))
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error('Failed to store session data:', error)
      // Fallback to regular storage
      localStorage.setItem(key, JSON.stringify(value))
    }
  },

  get: (key: string): unknown => {
    if (typeof window === 'undefined') return null

    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null

      return JSON.parse(atob(encrypted))
    } catch (error) {
      console.error('Failed to retrieve session data:', error)
      // Try fallback
      try {
        const fallback = localStorage.getItem(key)
        return fallback ? JSON.parse(fallback) : null
      } catch (error) {
        console.warn('Failed to retrieve fallback session data:', error);
        return null;
      }
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },

  clear: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(SESSION_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(TOKENS_STORAGE_KEY)
  }
}

// Token validation utilities
const tokenUtils = {
  decodeToken: (token: string): any => {
    try {
      const payload = token.split('.')[1]
      return JSON.parse(atob(payload))
    } catch (error) {
      console.warn('Failed to decode token:', error);
      return null;
    }
  },

  isTokenExpired: (token: string): boolean => {
    const decoded = tokenUtils.decodeToken(token) as any
    if (!decoded || !decoded.exp) return true

    return decoded.exp * 1000 < Date.now()
  },

  getTokenExpiry: (token: string): number => {
    const decoded = tokenUtils.decodeToken(token) as any
    return decoded?.exp ? decoded.exp * 1000 : 0
  }
}

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const router = useRouter()
  const [session, setSession] = React.useState<SessionState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    lastActivity: Date.now(),
    sessionExpiry: 0
  })

  // Refresh tokens
  const refreshTokens = React.useCallback(async (): Promise<boolean> => {
    if (!session.tokens?.refreshToken) return false

    try {
      // In a real implementation, this would call your API to refresh tokens
      // For now, we'll simulate a refresh
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.tokens.refreshToken}`
        }
      })

      if (response.ok) {
        const newTokens = await response.json()

        const updatedTokens: TokenPair = {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken || session.tokens.refreshToken,
          tokenType: newTokens.tokenType || 'Bearer',
          expiresAt: tokenUtils.getTokenExpiry(newTokens.accessToken),
          refreshExpiresAt: newTokens.refreshToken
            ? tokenUtils.getTokenExpiry(newTokens.refreshToken)
            : session.tokens.refreshExpiresAt
        }

        setSession(prev => ({
          ...prev,
          tokens: updatedTokens
        }))

        // Update stored tokens
        secureStorage.set(TOKENS_STORAGE_KEY, updatedTokens)

        return true
      } else {
        console.error('Token refresh failed:', response.status)
        return false
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }, [session.tokens])

  // Session monitoring and auto-refresh
  React.useEffect(() => {
    if (!session.isAuthenticated || !session.tokens) return

    const checkSession = async () => {
      const now = Date.now()

      // Check for activity timeout
      if (now - session.lastActivity > SESSION_CONFIG.ACTIVITY_TIMEOUT) {
        console.log('Session expired due to inactivity')
        await (async () => {
          secureStorage.clear()
          setSession({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            lastActivity: 0,
            sessionExpiry: 0
          })
          router.push('/login')
        })()
        return
      }

      // Check if session is expired
      if (now > session.sessionExpiry) {
        console.log('Session expired')
        await (async () => {
          secureStorage.clear()
          setSession({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            lastActivity: 0,
            sessionExpiry: 0
          })
          router.push('/login')
        })()
        return
      }

      // Check if tokens need refresh
      if (session.tokens) {
        const timeUntilExpiry = session.tokens.expiresAt - now
        const timeUntilRefresh = session.tokens.refreshExpiresAt - now

        // Warn user about upcoming expiry
        if (timeUntilExpiry < SESSION_CONFIG.WARNING_THRESHOLD && timeUntilExpiry > 0) {
          // Could show a warning toast here
          console.log('Session will expire soon')
        }

        // Auto-refresh tokens if needed
        if (timeUntilExpiry < SESSION_CONFIG.REFRESH_THRESHOLD && timeUntilRefresh > SESSION_CONFIG.REFRESH_THRESHOLD) {
          console.log('Auto-refreshing tokens')
          await refreshTokens()
        }

        // Check if refresh token is expired
        if (timeUntilRefresh < SESSION_CONFIG.REFRESH_THRESHOLD) {
          console.log('Refresh token expired, logging out')
          await (async () => {
            secureStorage.clear()
            setSession({
              user: null,
              tokens: null,
              isAuthenticated: false,
              isLoading: false,
              lastActivity: 0,
              sessionExpiry: 0
            })
            router.push('/login')
          })()
          return
        }
      }
    }

    // Set up periodic checks
    const activityCheck = setInterval(checkSession, SESSION_CONFIG.ACTIVITY_CHECK_INTERVAL)
    const refreshCheck = setInterval(checkSession, SESSION_CONFIG.REFRESH_CHECK_INTERVAL)

    // Initial check
    checkSession()

    return () => {
      clearInterval(activityCheck)
      clearInterval(refreshCheck)
    }
  }, [session.isAuthenticated, session.tokens, session.lastActivity, session.sessionExpiry, refreshTokens])

  // Login function
  const login = React.useCallback(async (user: User, tokens: TokenPair) => {
    try {
      const sessionExpiry = Date.now() + SESSION_CONFIG.SESSION_EXPIRY

      const newSession: SessionState = {
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        lastActivity: Date.now(),
        sessionExpiry
      }

      setSession(newSession)

      // Store in secure storage
      secureStorage.set(USER_STORAGE_KEY, user)
      secureStorage.set(TOKENS_STORAGE_KEY, tokens)
      secureStorage.set(SESSION_STORAGE_KEY, {
        lastActivity: newSession.lastActivity,
        sessionExpiry: newSession.sessionExpiry
      })

      // Navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }, [router])

  // Update user data
  const updateUser = React.useCallback((userData: Partial<User>) => {
    if (!session.user) return

    const updatedUser = { ...session.user, ...userData }

    setSession(prev => ({
      ...prev,
      user: updatedUser
    }))

    // Update stored user data
    secureStorage.set(USER_STORAGE_KEY, updatedUser)
  }, [session.user])

  // Update activity timestamp
  const updateActivity = React.useCallback(() => {
    const now = Date.now()

    setSession(prev => ({
      ...prev,
      lastActivity: now
    }))

    // Update stored activity
    const prevSession = secureStorage.get(SESSION_STORAGE_KEY)
    secureStorage.set(SESSION_STORAGE_KEY, {
      ...(typeof prevSession === 'object' && prevSession ? prevSession as Record<string, unknown> : {}),
      lastActivity: now
    })
  }, [])

  // Extend session
  const extendSession = React.useCallback(() => {
    const newExpiry = Date.now() + SESSION_CONFIG.SESSION_EXPIRY

    setSession(prev => ({
      ...prev,
      sessionExpiry: newExpiry
    }))

    // Update stored session
    const prev = secureStorage.get(SESSION_STORAGE_KEY)
    secureStorage.set(SESSION_STORAGE_KEY, {
      ...(typeof prev === 'object' && prev ? prev as Record<string, unknown> : {}),
      sessionExpiry: newExpiry
    })
  }, [])

  // Logout function
  const handleLogout = React.useCallback(async () => {
    try {
      // Clear all session data
      secureStorage.clear()

      setSession({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        lastActivity: 0,
        sessionExpiry: 0
      })

      // Navigate to login
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [router])

  // Initialize session from storage
  React.useEffect(() => {
    const initializeSession = () => {
      try {
        const storedUser = secureStorage.get(USER_STORAGE_KEY) as User | null
        const storedTokens = secureStorage.get(TOKENS_STORAGE_KEY) as TokenPair | null
        const storedSession = secureStorage.get(SESSION_STORAGE_KEY) as Partial<SessionState> | null

        if (storedUser && storedTokens && storedTokens.accessToken) {
          // Validate tokens
          if (!tokenUtils.isTokenExpired(storedTokens.accessToken)) {
            const sessionExpiry = storedSession?.sessionExpiry || Date.now() + SESSION_CONFIG.SESSION_EXPIRY

            setSession({
              user: storedUser,
              tokens: storedTokens,
              isAuthenticated: true,
              isLoading: false,
              lastActivity: storedSession?.lastActivity || Date.now(),
              sessionExpiry
            })
          } else {
            // Tokens expired, clear session
            handleLogout()
          }
        } else {
          setSession(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('Failed to initialize session:', error)
        setSession(prev => ({ ...prev, isLoading: false }))
      }
    }

    initializeSession()
  }, [handleLogout])

  // Activity tracking
  React.useEffect(() => {
    const updateActivity = () => {
      setSession(prev => ({
        ...prev,
        lastActivity: Date.now()
      }))
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity)
      })
    }
  }, [])

  // Utility functions
  const isTokenExpired = React.useCallback((token: string): boolean => {
    return tokenUtils.isTokenExpired(token)
  }, [])

  const isSessionExpired = React.useCallback((): boolean => {
    return Date.now() > session.sessionExpiry
  }, [session.sessionExpiry])

  const getTimeUntilExpiry = React.useCallback((): number => {
    if (!session.tokens) return 0
    return Math.max(0, session.tokens.expiresAt - Date.now())
  }, [session.tokens])

  const getTimeUntilRefresh = React.useCallback((): number => {
    if (!session.tokens) return 0
    return Math.max(0, session.tokens.refreshExpiresAt - Date.now())
  }, [session.tokens])

  const contextValue: SessionContextType = {
    session,
    login,
    logout: handleLogout,
    refreshTokens,
    updateUser,
    updateActivity,
    extendSession,
    isTokenExpired,
    isSessionExpired,
    getTimeUntilExpiry,
    getTimeUntilRefresh
  }

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}

// Hook to use session context
export function useSession(): SessionContextType {
  const context = React.useContext(SessionContext)

  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }

  return context
}

// Hook for authentication status
export function useAuth(): {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, tokens: TokenPair) => Promise<void>
  logout: () => Promise<void>
} {
  const { session, login, logout } = useSession()

  return {
    user: session.user,
    isAuthenticated: session.isAuthenticated,
    isLoading: session.isLoading,
    login,
    logout
  }
}

// Hook for session monitoring
export function useSessionMonitor(): {
  timeUntilExpiry: number
  timeUntilRefresh: number
  isSessionExpired: boolean
  extendSession: () => void
  refreshTokens: () => Promise<boolean>
} {
  const {
    getTimeUntilExpiry,
    getTimeUntilRefresh,
    isSessionExpired,
    extendSession,
    refreshTokens
  } = useSession()

  return {
    timeUntilExpiry: getTimeUntilExpiry(),
    timeUntilRefresh: getTimeUntilRefresh(),
    isSessionExpired: isSessionExpired(),
    extendSession,
    refreshTokens
  }
}
