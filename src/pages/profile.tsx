"use client"

import Header from "@/components/layout/header"
import { useState, useEffect, "use client"

import Header from "@/components/layout/header"
import { useState, useEffect } from "react"
import { profileAPI } from "@/services"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  FileText,
  Camera,
  Trash2,
  Save,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Shield,
  Bell,
  Eye,
  Settings,
  Download
} from "lucide-react"
import type { UserProfile, ProfileUpdateRequest, ProfileStats } from "@/services"

export default function ProfilePage() {
  const { toastSuccess, toastError } = useToast()
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [stats, setStats] = React.useState<ProfileStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<'profile' | 'security' | 'preferences' | 'stats'>('profile')

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    bio: ''
  })
  const [hasChanges, setHasChanges] = React.useState(false)

  // Load profile data on mount
  React.useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [profileData, statsData] = await Promise.allSettled([
        profileAPI.getProfile(),
        profileAPI.getProfileStats()
      ])

      if (profileData.status === 'fulfilled') {
        setProfile(profileData.value)
        setFormData({
          name: profileData.value.name,
          email: profileData.value.email || '',
          bio: profileData.value.bio || ''
        })
      }

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value)
      }

      if (profileData.status === 'rejected' && statsData.status === 'rejected') {
        throw new Error('Failed to load profile data')
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to load profile')
      toastError("Loading Failed", "Unable to load profile data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)

    try {
      // Validate input
      const validation = profileAPI.validateProfileUpdate({
        name: formData.name,
        email: formData.email,
        bio: formData.bio
      })

      if (!validation.valid) {
        toastError("Validation Error", validation.errors.join(', '))
        return
      }

      const updates: ProfileUpdateRequest = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio
      }

      const updatedProfile = await profileAPI.updateProfile(updates)
      setProfile(updatedProfile)
      setHasChanges(false)

      toastSuccess("Profile Updated", "Your profile has been saved successfully")
    } catch (error) {
      console.error('Failed to save profile:', error)
      toastError("Save Failed", "Unable to save profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await profileAPI.uploadAvatar(file)
      if (profile) {
        setProfile({ ...profile, avatar: result.avatarUrl })
      }
      toastSuccess("Avatar Updated", "Your profile picture has been updated")
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      toastError("Upload Failed", "Unable to upload avatar. Please try again.")
    }
  }

  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to delete your avatar?')) return

    try {
      await profileAPI.deleteAvatar()
      if (profile) {
        setProfile({ ...profile, avatar: undefined })
      }
      toastSuccess("Avatar Deleted", "Your profile picture has been removed")
    } catch (error) {
      console.error('Failed to delete avatar:', error)
      toastError("Delete Failed", "Unable to delete avatar. Please try again.")
    }
  }

  const user = profile ? {
    name: profile.name,
    primaryDID: profile.did,
    anonymousDID: profile.preferences.privacy.anonymousIdentity ? "did:key:z6Mk..." : undefined
  } : {
    name: "Loading...",
    primaryDID: "Loading...",
    anonymousDID: undefined
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} notifications={3} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
              <span>Loading your profile...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} notifications={3} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadProfile}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} notifications={3} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <User className="mr-3 w-8 h-8 text-blue-600" />
            Profile Settings
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadProfile}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Refresh profile"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'preferences', label: 'Preferences', icon: Settings },
                { id: 'stats', label: 'Statistics', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && profile && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

                {/* Avatar Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        <Camera className="w-4 h-4 mr-2" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                      {profile.avatar && (
                        <button
                          onClick={handleDeleteAvatar}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary DID</label>
                      <input
                        value={profile.did}
                        disabled
                        className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Account Status</label>
                      <div className="flex items-center p-3 border border-gray-200 bg-gray-50 rounded-lg">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          profile.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          profile.isActive ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {profile.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !hasChanges}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && profile && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>

                <div className="space-y-6">
                  {/* Two-Factor Authentication */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        profile.preferences.security.twoFactorEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.preferences.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      {profile.preferences.security.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                    </button>
                  </div>

                  {/* Session Management */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Active Sessions</h3>
                    <p className="text-sm text-gray-600 mb-4">Manage your active login sessions</p>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      View Sessions
                    </button>
                  </div>

                  {/* Login History */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Login History</h3>
                    <p className="text-sm text-gray-600 mb-4">View your recent login activity</p>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      View History
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && profile && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold mb-6">Preferences</h2>

                <div className="space-y-6">
                  {/* Notification Preferences */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(profile.preferences.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                          <div className={`w-12 h-6 rounded-full relative transition-colors ${
                            value ? "bg-blue-600" : "bg-gray-300"
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                              value ? "translate-x-6" : "translate-x-0.5"
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Preferences */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      Privacy
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Profile Visibility</span>
                        <span className="text-sm text-gray-600 capitalize">
                          {profile.preferences.privacy.profileVisibility}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Credential Sharing</span>
                        <span className="text-sm text-gray-600 capitalize">
                          {profile.preferences.privacy.credentialSharing.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Data Retention</span>
                        <span className="text-sm text-gray-600">
                          {profile.preferences.privacy.dataRetention} days
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Display Preferences */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Display
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Theme</label>
                        <select className="w-full border border-gray-300 rounded-lg p-2">
                          <option value="system">System</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Language</label>
                        <select className="w-full border border-gray-300 rounded-lg p-2">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && stats && (
              <div className="max-w-4xl">
                <h2 className="text-xl font-semibold mb-6">Account Statistics</h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalCredentials}</div>
                    <div className="text-sm text-gray-600">Total Credentials</div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalConnections}</div>
                    <div className="text-sm text-gray-600">Total Connections</div>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalPresentations}</div>
                    <div className="text-sm text-gray-600">Presentations Created</div>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 mb-2">{stats.securityScore}%</div>
                    <div className="text-sm text-gray-600">Security Score</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Account Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Age:</span>
                        <span>{stats.accountAge} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Activity:</span>
                        <span>{new Date(stats.lastActivity).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Role:</span>
                        <span className="capitalize">{profile?.role || 'User'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Data Export</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download your profile data and account information
                    </p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


 } from 'react'
import { profileAPI } from "@/services"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  FileText,
  Camera,
  Trash2,
  Save,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Shield,
  Bell,
  Eye,
  Settings,
  Download
} from "lucide-react"
import type { UserProfile, ProfileUpdateRequest, ProfileStats } from "@/services"

export default function ProfilePage() {
  const { toastSuccess, toastError } = useToast()
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [stats, setStats] = React.useState<ProfileStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<'profile' | 'security' | 'preferences' | 'stats'>('profile')

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    bio: ''
  })
  const [hasChanges, setHasChanges] = React.useState(false)

  // Load profile data on mount
  React.useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [profileData, statsData] = await Promise.allSettled([
        profileAPI.getProfile(),
        profileAPI.getProfileStats()
      ])

      if (profileData.status === 'fulfilled') {
        setProfile(profileData.value)
        setFormData({
          name: profileData.value.name,
          email: profileData.value.email || '',
          bio: profileData.value.bio || ''
        })
      }

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value)
      }

      if (profileData.status === 'rejected' && statsData.status === 'rejected') {
        throw new Error('Failed to load profile data')
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to load profile')
      toastError("Loading Failed", "Unable to load profile data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)

    try {
      // Validate input
      const validation = profileAPI.validateProfileUpdate({
        name: formData.name,
        email: formData.email,
        bio: formData.bio
      })

      if (!validation.valid) {
        toastError("Validation Error", validation.errors.join(', '))
        return
      }

      const updates: ProfileUpdateRequest = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio
      }

      const updatedProfile = await profileAPI.updateProfile(updates)
      setProfile(updatedProfile)
      setHasChanges(false)

      toastSuccess("Profile Updated", "Your profile has been saved successfully")
    } catch (error) {
      console.error('Failed to save profile:', error)
      toastError("Save Failed", "Unable to save profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await profileAPI.uploadAvatar(file)
      if (profile) {
        setProfile({ ...profile, avatar: result.avatarUrl })
      }
      toastSuccess("Avatar Updated", "Your profile picture has been updated")
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      toastError("Upload Failed", "Unable to upload avatar. Please try again.")
    }
  }

  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to delete your avatar?')) return

    try {
      await profileAPI.deleteAvatar()
      if (profile) {
        setProfile({ ...profile, avatar: undefined })
      }
      toastSuccess("Avatar Deleted", "Your profile picture has been removed")
    } catch (error) {
      console.error('Failed to delete avatar:', error)
      toastError("Delete Failed", "Unable to delete avatar. Please try again.")
    }
  }

  const user = profile ? {
    name: profile.name,
    primaryDID: profile.did,
    anonymousDID: profile.preferences.privacy.anonymousIdentity ? "did:key:z6Mk..." : undefined
  } : {
    name: "Loading...",
    primaryDID: "Loading...",
    anonymousDID: undefined
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} notifications={3} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
              <span>Loading your profile...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} notifications={3} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadProfile}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} notifications={3} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <User className="mr-3 w-8 h-8 text-blue-600" />
            Profile Settings
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadProfile}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Refresh profile"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'preferences', label: 'Preferences', icon: Settings },
                { id: 'stats', label: 'Statistics', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && profile && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

                {/* Avatar Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        <Camera className="w-4 h-4 mr-2" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                      {profile.avatar && (
                        <button
                          onClick={handleDeleteAvatar}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary DID</label>
                      <input
                        value={profile.did}
                        disabled
                        className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Account Status</label>
                      <div className="flex items-center p-3 border border-gray-200 bg-gray-50 rounded-lg">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          profile.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          profile.isActive ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {profile.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !hasChanges}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && profile && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>

                <div className="space-y-6">
                  {/* Two-Factor Authentication */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        profile.preferences.security.twoFactorEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.preferences.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      {profile.preferences.security.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                    </button>
                  </div>

                  {/* Session Management */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Active Sessions</h3>
                    <p className="text-sm text-gray-600 mb-4">Manage your active login sessions</p>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      View Sessions
                    </button>
                  </div>

                  {/* Login History */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Login History</h3>
                    <p className="text-sm text-gray-600 mb-4">View your recent login activity</p>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      View History
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && profile && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold mb-6">Preferences</h2>

                <div className="space-y-6">
                  {/* Notification Preferences */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(profile.preferences.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                          <div className={`w-12 h-6 rounded-full relative transition-colors ${
                            value ? "bg-blue-600" : "bg-gray-300"
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                              value ? "translate-x-6" : "translate-x-0.5"
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Preferences */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      Privacy
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Profile Visibility</span>
                        <span className="text-sm text-gray-600 capitalize">
                          {profile.preferences.privacy.profileVisibility}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Credential Sharing</span>
                        <span className="text-sm text-gray-600 capitalize">
                          {profile.preferences.privacy.credentialSharing.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Data Retention</span>
                        <span className="text-sm text-gray-600">
                          {profile.preferences.privacy.dataRetention} days
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Display Preferences */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Display
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Theme</label>
                        <select className="w-full border border-gray-300 rounded-lg p-2">
                          <option value="system">System</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Language</label>
                        <select className="w-full border border-gray-300 rounded-lg p-2">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && stats && (
              <div className="max-w-4xl">
                <h2 className="text-xl font-semibold mb-6">Account Statistics</h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalCredentials}</div>
                    <div className="text-sm text-gray-600">Total Credentials</div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalConnections}</div>
                    <div className="text-sm text-gray-600">Total Connections</div>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalPresentations}</div>
                    <div className="text-sm text-gray-600">Presentations Created</div>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 mb-2">{stats.securityScore}%</div>
                    <div className="text-sm text-gray-600">Security Score</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Account Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Age:</span>
                        <span>{stats.accountAge} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Activity:</span>
                        <span>{new Date(stats.lastActivity).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Role:</span>
                        <span className="capitalize">{profile?.role || 'User'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Data Export</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download your profile data and account information
                    </p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


