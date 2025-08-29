"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Theme types
export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Theme storage key
const THEME_STORAGE_KEY = 'did-wallet-theme'

// Get system theme preference
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Get stored theme preference
const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system'

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error)
  }

  return 'system'
}

// Store theme preference
const storeTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch (error) {
    console.warn('Failed to store theme to localStorage:', error)
  }
}

// Resolve theme to actual light/dark value
const resolveTheme = (theme: Theme): ResolvedTheme => {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

// Apply theme to document
const applyTheme = (resolvedTheme: ResolvedTheme): void => {
  if (typeof window === 'undefined') return

  const root = document.documentElement

  // Remove existing theme classes
  root.classList.remove('light', 'dark')

  // Add new theme class
  root.classList.add(resolvedTheme)

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#1f2937' : '#ffffff')
  }
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  enableSystemTheme?: boolean
  disableTransitions?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystemTheme = true,
  disableTransitions = false
}: ThemeProviderProps) {
  // Initialize theme state
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = getStoredTheme()
    const initialTheme = enableSystemTheme ? storedTheme : (storedTheme === 'system' ? 'light' : storedTheme)

    setThemeState(initialTheme)
    setMounted(true)
  }, [enableSystemTheme])

  // Update resolved theme when theme changes
  useEffect(() => {
    const newResolvedTheme = resolveTheme(theme)
    setResolvedTheme(newResolvedTheme)
  }, [theme])

  // Apply theme when resolved theme changes
  useEffect(() => {
    if (!mounted) return

    applyTheme(resolvedTheme)

    // Disable transitions during theme change if requested
    if (disableTransitions) {
      document.documentElement.style.setProperty('--transition-duration', '0ms')
      setTimeout(() => {
        document.documentElement.style.removeProperty('--transition-duration')
      }, 100)
    }
  }, [resolvedTheme, mounted, disableTransitions])

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (theme !== 'system' || !enableSystemTheme) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      const newResolvedTheme = getSystemTheme()
      setResolvedTheme(newResolvedTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, enableSystemTheme])

  // Set theme function
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    storeTheme(newTheme)
  }

  // Toggle between light and dark (ignoring system)
  const toggleTheme = () => {
    const currentResolved = resolveTheme(theme)
    const newTheme: Theme = currentResolved === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Context value
  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to use theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

// Hook for theme-aware components
export function useThemeAware() {
  const { resolvedTheme } = useTheme()

  return {
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    theme: resolvedTheme
  }
}

// Theme toggle component
export function ThemeToggle({
  className = '',
  size = 'md',
  showLabel = false
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}) {
  let themeData: ThemeContextType | null = null
  let isDark = false

  try {
    themeData = useTheme()
    isDark = useThemeAware().isDark
  } catch (error) {
    // Fallback for SSR or when ThemeProvider is not available
    isDark = false
  }

  if (!themeData) {
    // Return a disabled button during SSR or when theme context is not available
    return (
      <button
        disabled
        className={`
          ${size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'}
          rounded-lg border border-gray-300
          bg-gray-100
          flex items-center justify-center
          opacity-50
          cursor-not-allowed
          ${className}
        `}
        title="Theme toggle unavailable"
        aria-label="Theme toggle unavailable"
      >
        <svg
          className="w-5 h-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
        </svg>
        {showLabel && (
          <span className="ml-2 text-sm font-medium text-gray-400">
            Theme
          </span>
        )}
      </button>
    )
  }

  const { theme, resolvedTheme, toggleTheme } = themeData

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        rounded-lg border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800
        hover:bg-gray-50 dark:hover:bg-gray-700
        transition-colors duration-200
        flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        ${className}
      `}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        // Sun icon for light mode
        <svg
          className="w-5 h-5 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg
          className="w-5 h-5 text-gray-700"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}

      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  )
}

// Theme selector component with system option
export function ThemeSelector({
  className = '',
  showSystemOption = true
}: {
  className?: string
  showSystemOption?: boolean
}) {
  let themeData: ThemeContextType | null = null

  try {
    themeData = useTheme()
  } catch (error) {
    // Fallback for SSR or when ThemeProvider is not available
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm text-gray-500">Theme selector unavailable</span>
      </div>
    )
  }

  if (!themeData) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm text-gray-500">Theme selector unavailable</span>
      </div>
    )
  }

  const { theme, setTheme } = themeData

  const themeOptions = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    ...(showSystemOption ? [{ value: 'system', label: 'System', icon: '💻' }] : [])
  ] as const

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Theme
      </label>
      <div className="grid grid-cols-3 gap-2">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value as Theme)}
            className={`
              p-3 rounded-lg border transition-all duration-200
              flex flex-col items-center space-y-1
              ${theme === option.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
          >
            <span className="text-lg">{option.icon}</span>
            <span className="text-xs font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
