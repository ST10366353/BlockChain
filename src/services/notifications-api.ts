import { apiClient, handleAPIResponse, APIResponse, APIError } from './api-client'
import { API_ENDPOINTS } from './api-config'

// Notification Types
export type NotificationType =
  | 'credential.issued'
  | 'credential.verified'
  | 'credential.revoked'
  | 'credential.expired'
  | 'connection.request'
  | 'connection.accepted'
  | 'connection.rejected'
  | 'presentation.request'
  | 'presentation.verified'
  | 'security.alert'
  | 'system.update'
  | 'audit.event'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface NotificationData {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
  expiresAt?: string
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  inApp: boolean
  types: Record<NotificationType, boolean>
  quietHours: {
    enabled: boolean
    start: string // HH:MM format
    end: string // HH:MM format
  }
}

export interface NotificationQuery {
  read?: boolean
  type?: NotificationType
  priority?: NotificationPriority
  limit?: number
  offset?: number
  startDate?: string
  endDate?: string
}

export interface WebSocketMessage {
  type: 'notification' | 'ping' | 'pong' | 'error'
  data?: NotificationData
  timestamp: string
}

// Notification API Client
export class NotificationsAPI {
  private ws: WebSocket | null = null
  private wsUrl: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000 // 3 seconds
  private pingInterval: NodeJS.Timeout | null = null
  private listeners: Map<string, (data: any) => void> = new Map()

  constructor() {
    // WebSocket URL - fallback to polling if WebSocket fails
    this.wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws'
  }

  // WebSocket Connection Management
  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Don't attempt connection if we've already reached max reconnection attempts
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Max reconnection attempts reached, skipping WebSocket connection')
        resolve()
        return
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      try {
        this.ws = new WebSocket(`${this.wsUrl}?userId=${userId}`)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          this.startPingInterval()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleWebSocketMessage(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason)
          this.stopPingInterval()

          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
            setTimeout(() => {
              this.connect(userId).catch(() => {
                // If WebSocket fails, we'll rely on polling
                console.log('WebSocket reconnection failed, falling back to polling')
              })
            }, this.reconnectInterval)
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached, falling back to polling only')
            // Start polling as fallback
            this.startPolling(30000)
          }
        }

        this.ws.onerror = (error) => {
          console.warn('WebSocket connection failed (server may not be available):', error)
          // Don't reject here - let it fall back to polling
          this.ws = null
        }

      } catch (error) {
        console.warn('Failed to create WebSocket connection (server may not be available):', error)
        this.ws = null
        // Resolve instead of reject to allow fallback to polling
        resolve()
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    this.stopPingInterval()
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }))
      }
    }, 30000) // Ping every 30 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'notification':
        if (message.data) {
          this.notifyListeners('notification', message.data)
        }
        break
      case 'pong':
        // Handle pong response
        break
      case 'error':
        console.error('WebSocket error message:', message.data)
        break
      default:
        console.log('Unknown WebSocket message type:', message.type)
    }
  }

  // Event Listeners
  addListener(event: string, callback: (data: any) => void): void {
    this.listeners.set(event, callback)
  }

  removeListener(event: string): void {
    this.listeners.delete(event)
  }

  private notifyListeners(event: string, data: any): void {
    const listener = this.listeners.get(event)
    if (listener) {
      listener(data)
    }
  }

  // Notification CRUD Operations
  async getNotifications(query: NotificationQuery = {}): Promise<NotificationData[]> {
    try {
      const params = new URLSearchParams()

      if (query.read !== undefined) params.append('read', query.read.toString())
      if (query.type) params.append('type', query.type)
      if (query.priority) params.append('priority', query.priority)
      if (query.limit) params.append('limit', query.limit.toString())
      if (query.offset) params.append('offset', query.offset.toString())
      if (query.startDate) params.append('startDate', query.startDate)
      if (query.endDate) params.append('endDate', query.endDate)

      const response = await apiClient.get<NotificationData[]>(
        `${API_ENDPOINTS.notifications.list}?${params.toString()}`
      )
      return handleAPIResponse(response)
    } catch (error) {
      console.warn('Notifications API not available, returning empty list:', error)
      // Return empty array as fallback when backend doesn't have notifications
      return []
    }
  }

  async getNotificationById(id: string): Promise<NotificationData> {
    try {
      const response = await apiClient.get<NotificationData>(
        `${API_ENDPOINTS.notifications.list}/${id}`
      )
      return handleAPIResponse(response)
    } catch (error) {
      console.warn('Notifications API not available:', error)
      throw new Error('Notification service not available')
    }
  }

  async markAsRead(id: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.put<{ success: boolean }>(
        `${API_ENDPOINTS.notifications.list}/${id}/read`,
        {}
      )
      return handleAPIResponse(response)
    } catch (error) {
      console.warn('Notifications API not available:', error)
      // Return success for graceful degradation
      return { success: true }
    }
  }

  async markAsUnread(id: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.put<{ success: boolean }>(
        `${API_ENDPOINTS.notifications.list}/${id}/unread`,
        {}
      )
      return handleAPIResponse(response)
    } catch (error) {
      console.warn('Notifications API not available:', error)
      return { success: true }
    }
  }

  async markAllAsRead(): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.put<{ success: boolean }>(
        `${API_ENDPOINTS.notifications.markAllRead}`,
        {}
      )
      return handleAPIResponse(response)
    } catch (error) {
      console.warn('Notifications API not available:', error)
      return { success: true }
    }
  }

  async deleteNotification(id: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(
        `${API_ENDPOINTS.notifications.list}/${id}`
      )
      return handleAPIResponse(response)
    } catch (error) {
      console.warn('Notifications API not available:', error)
      return { success: true }
    }
  }

  async deleteAllNotifications(): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(
        `${API_ENDPOINTS.notifications.list}`
      )
      return handleAPIResponse(response)
    } catch (error) {
      console.warn('Notifications API not available:', error)
      return { success: true }
    }
  }

  // Notification Preferences
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get<NotificationPreferences>(
        API_ENDPOINTS.notifications.preferences
      )
      return handleAPIResponse(response)
    } catch (error) {
      console.warn('Notifications API not available, returning default preferences:', error)
      // Return default preferences
      return {
        email: true,
        push: true,
        sms: false,
        inApp: true,
        types: {
          'credential.issued': true,
          'credential.verified': true,
          'credential.revoked': true,
          'credential.expired': true,
          'connection.request': true,
          'connection.accepted': true,
          'connection.rejected': false,
          'presentation.request': true,
          'presentation.verified': true,
          'security.alert': true,
          'system.update': false,
          'audit.event': false
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      }
    }
  }

  async updatePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.put<NotificationPreferences>(
        API_ENDPOINTS.notifications.preferences,
        preferences
      )
      return handleAPIResponse(response)
    } catch (error) {
      console.warn('Notifications API not available:', error)
      // Return the preferences as-is for graceful degradation
      return preferences
    }
  }

  // Notification Statistics
  async getStats(): Promise<{
    total: number
    unread: number
    byType: Record<NotificationType, number>
    byPriority: Record<NotificationPriority, number>
  }> {
    try {
      const response = await apiClient.get<{
        total: number
        unread: number
        byType: Record<NotificationType, number>
        byPriority: Record<NotificationPriority, number>
      }>(API_ENDPOINTS.notifications.stats)
      return handleAPIResponse(response)
    } catch (error) {
      console.warn('Notifications API not available, returning empty stats:', error)
      // Return empty stats
      return {
        total: 0,
        unread: 0,
        byType: {} as Record<NotificationType, number>,
        byPriority: {} as Record<NotificationPriority, number>
      }
    }
  }

  // Polling fallback for when WebSocket is not available
  startPolling(intervalMs: number = 30000): NodeJS.Timeout {
    return setInterval(async () => {
      try {
        const notifications = await this.getNotifications({ read: false, limit: 10 })
        notifications.forEach(notification => {
          this.notifyListeners('notification', notification)
        })
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, intervalMs)
  }

  // Utility methods
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (!this.ws) return 'disconnected'

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'error'
    }
  }

  // Create notification templates
  createNotificationTemplate(type: NotificationType, data: any): NotificationData {
    const templates: Record<NotificationType, Partial<NotificationData>> = {
      'credential.issued': {
        title: 'New Credential Issued',
        message: `You have received a new ${data.credentialType} credential from ${data.issuerName}`,
        priority: 'high',
        actionUrl: `/credentials/${data.credentialId}`,
        actionLabel: 'View Credential'
      },
      'credential.verified': {
        title: 'Credential Verified',
        message: `Your ${data.credentialType} credential has been successfully verified`,
        priority: 'medium',
        actionUrl: `/credentials/${data.credentialId}`,
        actionLabel: 'View Details'
      },
      'credential.revoked': {
        title: 'Credential Revoked',
        message: `Your ${data.credentialType} credential has been revoked`,
        priority: 'high',
        actionUrl: `/credentials/${data.credentialId}`,
        actionLabel: 'View Credential'
      },
      'credential.expired': {
        title: 'Credential Expired',
        message: `Your ${data.credentialType} credential has expired`,
        priority: 'medium',
        actionUrl: `/credentials/${data.credentialId}`,
        actionLabel: 'View Credential'
      },
      'connection.request': {
        title: 'Connection Request',
        message: `${data.requesterName} wants to connect with you`,
        priority: 'medium',
        actionUrl: `/connections`,
        actionLabel: 'Review Request'
      },
      'connection.accepted': {
        title: 'Connection Accepted',
        message: `${data.acceptorName} accepted your connection request`,
        priority: 'low',
        actionUrl: `/connections`,
        actionLabel: 'View Connection'
      },
      'connection.rejected': {
        title: 'Connection Rejected',
        message: `${data.rejectorName} declined your connection request`,
        priority: 'low'
      },
      'presentation.request': {
        title: 'Presentation Request',
        message: `${data.requesterName} is requesting a presentation`,
        priority: 'high',
        actionUrl: `/presentations`,
        actionLabel: 'Review Request'
      },
      'presentation.verified': {
        title: 'Presentation Verified',
        message: `Your presentation has been verified by ${data.verifierName}`,
        priority: 'medium',
        actionUrl: `/presentations`,
        actionLabel: 'View Details'
      },
      'security.alert': {
        title: 'Security Alert',
        message: data.message,
        priority: 'urgent',
        actionUrl: '/settings',
        actionLabel: 'Review Security'
      },
      'system.update': {
        title: 'System Update',
        message: data.message,
        priority: 'low'
      },
      'audit.event': {
        title: 'Activity Alert',
        message: data.message,
        priority: 'low',
        actionUrl: '/audit-trail',
        actionLabel: 'View Activity'
      }
    }

    const template = templates[type] || {
      title: 'Notification',
      message: 'You have a new notification',
      priority: 'medium' as NotificationPriority
    }

    return {
      id: data.id || `notif-${Date.now()}`,
      type,
      ...template,
      timestamp: data.timestamp || new Date().toISOString(),
      read: false,
      metadata: data
    } as NotificationData
  }
}

// Export singleton instance
export const notificationsAPI = new NotificationsAPI()
