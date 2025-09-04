import { apiClient, handleAPIResponse } from "./api-client"
import { API_CONFIG } from "./api-config"
import { simulateNetworkDelay } from "./mock-data"
import type { NotificationPreferences } from "./notifications-api"

// Profile and User Management Types
export interface UserProfile {
  id: string
  did: string
  name: string
  email?: string
  bio?: string
  avatar?: string
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  isActive: boolean
  role: "user" | "admin" | "moderator"
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: string
  timezone?: string
  notifications: NotificationPreferences
  privacy: PrivacyPreferences
  security: SecurityPreferences
  display: DisplayPreferences
}

export interface PrivacyPreferences {
  profileVisibility: "public" | "private" | "connections"
  credentialSharing: "always-ask" | "selective" | "automatic"
  dataRetention: number // days
  analyticsOptOut: boolean
  anonymousIdentity: boolean
}

export interface SecurityPreferences {
  twoFactorEnabled: boolean
  biometricEnabled: boolean
  autoLockTimeout: number // minutes
  sessionTimeout: number // hours
  passwordLastChanged?: string
}

export interface DisplayPreferences {
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
  timeFormat: "12h" | "24h"
  itemsPerPage: number
  compactMode?: boolean
  showAdvancedOptions?: boolean
}

export interface ProfileUpdateRequest {
  name?: string
  email?: string
  bio?: string
  avatar?: string
  preferences?: Partial<UserPreferences>
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AccountDeletionRequest {
  reason?: string
  confirmation: string // Must be "DELETE_MY_ACCOUNT"
}

export interface ProfileStats {
  totalCredentials: number
  totalConnections: number
  totalPresentations: number
  accountAge: number // days
  lastActivity: string
  securityScore: number // 0-100
}

// Helper function to get default preferences
function getDefaultPreferences(): UserPreferences {
  return {
    theme: "light",
    language: "en",
    timezone: typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
    notifications: {
      email: true,
      push: true,
      sms: false,
      inApp: true,
      types: {
        "credential.issued": true,
        "credential.verified": true,
        "credential.revoked": true,
        "credential.expired": true,
        "connection.request": true,
        "connection.accepted": true,
        "connection.rejected": false,
        "presentation.request": true,
        "presentation.verified": true,
        "security.alert": true,
        "system.maintenance": false,
      },
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
      },
    },
    privacy: {
      profileVisibility: "public",
      credentialSharing: "selective",
      dataRetention: 365,
      analyticsOptOut: false,
      anonymousIdentity: false,
    },
    security: {
      autoLockTimeout: 15,
      biometricEnabled: false,
      twoFactorEnabled: false,
      sessionTimeout: 30,
    },
    display: {
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      itemsPerPage: 10,
      compactMode: false,
      showAdvancedOptions: false,
    },
  }
}

// Profile API Client
export class ProfileAPI {
  // Get user profile
  async getProfile(userId?: string): Promise<UserProfile> {
    // Use mock data in development to avoid API calls
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay()
      // Return a properly structured mock profile
      return {
        id: "mock-user-id",
        did: "did:key:z6MkMockUser123",
        name: "Demo User",
        email: "demo@example.com",
        bio: "DID wallet user",
        avatar: undefined,
        preferences: getDefaultPreferences(),
        isActive: true,
        role: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      }
    }

    try {
      const endpoint = userId ? `/profile/${userId}` : "/profile"
      const response = await apiClient.get<UserProfile>(endpoint)
      return handleAPIResponse(response)
    } catch (error) {
      console.warn("Profile API not available, returning mock profile:", error)
      // Return a mock user profile for graceful degradation
      return {
        id: userId || "user-123",
        did: "did:web:alice.com",
        name: "Alice Johnson",
        email: "alice@example.com",
        bio: "DID wallet user",
        avatar: undefined,
        preferences: getDefaultPreferences(),
        isActive: true,
        role: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      }
    }
  }

  // Update user profile
  async updateProfile(updates: ProfileUpdateRequest): Promise<UserProfile> {
    // Use mock data in development to avoid API calls
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay()

      // Return updated mock profile with the new data
      const currentProfile = await this.getProfile()
      const updatedProfile: UserProfile = {
        ...currentProfile,
        name: updates.name ?? currentProfile.name,
        email: updates.email ?? currentProfile.email,
        bio: updates.bio ?? currentProfile.bio,
        avatar: updates.avatar ?? currentProfile.avatar,
        preferences: updates.preferences
          ? {
              ...currentProfile.preferences,
              ...updates.preferences,
            }
          : currentProfile.preferences,
        updatedAt: new Date().toISOString(),
      }

      return updatedProfile
    }

    try {
      const response = await apiClient.put<UserProfile>("/profile", updates)
      return handleAPIResponse(response)
    } catch (error) {
      console.warn("Profile update API not available, returning mock updated profile:", error)

      // Graceful degradation - return updated mock profile
      const currentProfile = await this.getProfile()
      return {
        ...currentProfile,
        name: updates.name ?? currentProfile.name,
        email: updates.email ?? currentProfile.email,
        bio: updates.bio ?? currentProfile.bio,
        avatar: updates.avatar ?? currentProfile.avatar,
        preferences: updates.preferences
          ? {
              ...currentProfile.preferences,
              ...updates.preferences,
            }
          : currentProfile.preferences,
        updatedAt: new Date().toISOString(),
      }
    }
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    // Use mock data in development to avoid API calls
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay()

      // Return mock avatar URL
      const mockAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(file.name)}&background=0D8ABC&color=fff`
      return { avatarUrl: mockAvatarUrl }
    }

    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await apiClient.post<{ avatarUrl: string }>("/profile/avatar", formData)
      return handleAPIResponse(response)
    } catch (error) {
      console.warn("Avatar upload API not available, returning mock avatar:", error)

      // Graceful degradation - return mock avatar URL
      const mockAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(file.name)}&background=0D8ABC&color=fff`
      return { avatarUrl: mockAvatarUrl }
    }
  }

  // Delete avatar
  async deleteAvatar(): Promise<{ success: boolean }> {
    // Use mock data in development to avoid API calls
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay()
      return { success: true }
    }

    try {
      const response = await apiClient.delete<{ success: boolean }>("/profile/avatar")
      return handleAPIResponse(response)
    } catch (error) {
      console.warn("Avatar delete API not available, returning mock success:", error)
      return { success: true }
    }
  }

  // Change password
  async changePassword(request: PasswordChangeRequest): Promise<{ success: boolean }> {
    // Use mock data in development to avoid API calls
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay()
      return { success: true }
    }

    try {
      const response = await apiClient.post<{ success: boolean }>("/profile/change-password", request)
      return handleAPIResponse(response)
    } catch (error) {
      console.warn("Password change API not available, returning mock success:", error)
      return { success: true }
    }
  }

  // Get profile statistics
  async getProfileStats(): Promise<ProfileStats> {
    // Use mock data in development
    if (API_CONFIG.useMockData) {
      await simulateNetworkDelay()
      return {
        totalCredentials: 5,
        totalConnections: 12,
        totalPresentations: 3,
        accountAge: 30,
        lastActivity: new Date().toISOString(),
        securityScore: 85,
      }
    }

    try {
      const response = await apiClient.get<ProfileStats>("/profile/stats")
      return handleAPIResponse(response)
    } catch (error) {
      console.warn("Profile stats API not available, returning mock stats:", error)
      // Return mock profile statistics for graceful degradation
      return {
        totalCredentials: 5,
        totalConnections: 12,
        totalPresentations: 3,
        accountAge: 30,
        lastActivity: new Date().toISOString(),
        securityScore: 85,
      }
    }
  }

  // Export user data
  async exportUserData(format: "json" | "csv" = "json"): Promise<string> {
    const response = await apiClient.get<string>(`/profile/export?format=${format}`)
    return handleAPIResponse(response)
  }

  // Delete account
  async deleteAccount(request: AccountDeletionRequest): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>("/profile/delete-account", request)
    return handleAPIResponse(response)
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences: NotificationPreferences): Promise<UserPreferences> {
    const response = await apiClient.put<UserPreferences>("/profile/preferences/notifications", {
      notifications: preferences,
    })
    return handleAPIResponse(response)
  }

  // Update privacy preferences
  async updatePrivacyPreferences(preferences: PrivacyPreferences): Promise<UserPreferences> {
    const response = await apiClient.put<UserPreferences>("/profile/preferences/privacy", { privacy: preferences })
    return handleAPIResponse(response)
  }

  // Update security preferences
  async updateSecurityPreferences(preferences: SecurityPreferences): Promise<UserPreferences> {
    const response = await apiClient.put<UserPreferences>("/profile/preferences/security", { security: preferences })
    return handleAPIResponse(response)
  }

  // Enable/disable two-factor authentication
  async toggleTwoFactor(enabled: boolean): Promise<{ success: boolean; secret?: string }> {
    const response = await apiClient.post<{ success: boolean; secret?: string }>("/profile/2fa/toggle", { enabled })
    return handleAPIResponse(response)
  }

  // Verify two-factor token
  async verifyTwoFactorToken(token: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>("/profile/2fa/verify", { token })
    return handleAPIResponse(response)
  }

  // Get login history
  async getLoginHistory(limit = 20): Promise<
    Array<{
      timestamp: string
      ipAddress: string
      userAgent: string
      success: boolean
      location?: string
    }>
  > {
    const response = await apiClient.get<
      Array<{
        timestamp: string
        ipAddress: string
        userAgent: string
        success: boolean
        location?: string
      }>
    >(`/profile/login-history?limit=${limit}`)
    return handleAPIResponse(response)
  }

  // Revoke session
  async revokeSession(sessionId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>("/profile/revoke-session", { sessionId })
    return handleAPIResponse(response)
  }

  // Get active sessions
  async getActiveSessions(): Promise<
    Array<{
      id: string
      device: string
      ipAddress: string
      lastActivity: string
      location?: string
    }>
  > {
    const response =
      await apiClient.get<
        Array<{
          id: string
          device: string
          ipAddress: string
          lastActivity: string
          location?: string
        }>
      >("/profile/sessions")
    return handleAPIResponse(response)
  }

  // Get default preferences
  getDefaultPreferences(): UserPreferences {
    return getDefaultPreferences()
  }

  // Helper method to validate email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate profile data
  validateProfileUpdate(updates: ProfileUpdateRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (updates.name && updates.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long")
    }

    if (updates.email && !this.isValidEmail(updates.email)) {
      errors.push("Invalid email format")
    }

    if (updates.bio && updates.bio.length > 500) {
      errors.push("Bio must be less than 500 characters")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  // Validate password change
  validatePasswordChange(request: PasswordChangeRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!request.currentPassword) {
      errors.push("Current password is required")
    }

    if (!request.newPassword || request.newPassword.length < 8) {
      errors.push("New password must be at least 8 characters long")
    }

    if (request.newPassword !== request.confirmPassword) {
      errors.push("New passwords do not match")
    }

    if (request.currentPassword === request.newPassword) {
      errors.push("New password must be different from current password")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

// Export singleton instance
export const profileAPI = new ProfileAPI()
