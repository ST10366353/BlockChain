"use client"

;
import { notificationsAPI } from '@/services'
import type { NotificationData, NotificationPreferences } from '@/services/notifications-api'
import { useToast } from '@/hooks/use-toast'

// Notification state interface
interface NotificationState {
  notifications: NotificationData[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  preferences: NotificationPreferences | null
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastFetched: string | null
}

// Action types
type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: NotificationData[] }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationData }
  | { type: 'UPDATE_NOTIFICATION'; payload: NotificationData }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_UNREAD'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'SET_PREFERENCES'; payload: NotificationPreferences }
  | { type: 'SET_CONNECTION_STATUS'; payload: NotificationState['connectionStatus'] }
  | { type: 'SET_LAST_FETCHED'; payload: string }

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  preferences: null,
  connectionStatus: 'disconnected',
  lastFetched: null
}

// Reducer function
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
        isLoading: false,
        error: null
      }

    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications]
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.read).length
      }

    case 'UPDATE_NOTIFICATION':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload.id ? action.payload : n
      )
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      }

    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload)
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.read).length
      }

    case 'MARK_READ':
      const markReadNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      )
      return {
        ...state,
        notifications: markReadNotifications,
        unreadCount: markReadNotifications.filter(n => !n.read).length
      }

    case 'MARK_UNREAD':
      const markUnreadNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: false } : n
      )
      return {
        ...state,
        notifications: markUnreadNotifications,
        unreadCount: markUnreadNotifications.filter(n => !n.read).length
      }

    case 'MARK_ALL_READ':
      const allReadNotifications = state.notifications.map(n => ({ ...n, read: true }))
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0
      }

    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload }

    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload }

    case 'SET_LAST_FETCHED':
      return { ...state, lastFetched: action.payload }

    default:
      return state
  }
}

// Context interface
interface NotificationContextType {
  state: NotificationState
  // Notification management
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAsUnread: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  deleteAllNotifications: () => Promise<void>
  // Preferences
  fetchPreferences: () => Promise<void>
  updatePreferences: (preferences: NotificationPreferences) => Promise<void>
  // Connection management
  connectWebSocket: (userId: string) => Promise<void>
  disconnectWebSocket: () => void
  // Utility
  refresh: () => Promise<void>
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Provider component
interface NotificationProviderProps {
  children: ReactNode
  userId?: string
}

export function NotificationProvider({ children, userId }: NotificationProviderProps) {
  const [state, dispatch] = React.useReducer(notificationReducer, initialState)
  const { toastSuccess, toastError } = useToast()

  // Connect to WebSocket on mount if userId provided
  React.useEffect(() => {
    if (userId) {
      connectWebSocket(userId)
    }

    return () => {
      disconnectWebSocket()
    }
  }, [userId])

  // Set up WebSocket event listener
  React.useEffect(() => {
    const handleWebSocketNotification = (notification: NotificationData) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification })

      // Show toast for high priority notifications
      if (notification.priority === 'high' || notification.priority === 'urgent') {
        toastSuccess(notification.title, notification.message)
      }
    }

    notificationsAPI.addListener('notification', handleWebSocketNotification)

    return () => {
      notificationsAPI.removeListener('notification')
    }
  }, [toastSuccess])

  // Update connection status periodically
  React.useEffect(() => {
    const updateConnectionStatus = () => {
      const status = notificationsAPI.getConnectionStatus()
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: status })
    }

    updateConnectionStatus()
    const interval = setInterval(updateConnectionStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = React.useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const notifications = await notificationsAPI.getNotifications({ limit: 50 })
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications })
      dispatch({ type: 'SET_LAST_FETCHED', payload: new Date().toISOString() })
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch notifications'
      })
      toastError("Error", "Failed to load notifications")
    }
  }, [toastError])

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id)
      dispatch({ type: 'MARK_READ', payload: id })
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      toastError("Error", "Failed to mark notification as read")
    }
  }

  const markAsUnread = async (id: string) => {
    try {
      await notificationsAPI.markAsUnread(id)
      dispatch({ type: 'MARK_UNREAD', payload: id })
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      toastError("Error", "Failed to mark notification as unread")
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      dispatch({ type: 'MARK_ALL_READ' })
      toastSuccess("Success", "All notifications marked as read")
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      toastError("Error", "Failed to mark all notifications as read")
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await notificationsAPI.deleteNotification(id)
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      toastError("Error", "Failed to delete notification")
    }
  }

  const deleteAllNotifications = async () => {
    try {
      await notificationsAPI.deleteAllNotifications()
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] })
      toastSuccess("Success", "All notifications deleted")
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      toastError("Error", "Failed to delete all notifications")
    }
  }

  const fetchPreferences = React.useCallback(async () => {
    try {
      const preferences = await notificationsAPI.getPreferences()
      dispatch({ type: 'SET_PREFERENCES', payload: preferences })
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      toastError("Error", "Failed to load notification preferences")
    }
  }, [toastError])

  const updatePreferences = async (preferences: NotificationPreferences) => {
    try {
      const updatedPreferences = await notificationsAPI.updatePreferences(preferences)
      dispatch({ type: 'SET_PREFERENCES', payload: updatedPreferences })
      toastSuccess("Success", "Notification preferences updated")
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      toastError("Error", "Failed to update notification preferences")
    }
  }

  const connectWebSocket = async (userId: string) => {
    try {
      await notificationsAPI.connect(userId)
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' })

      // Start polling as fallback
      notificationsAPI.startPolling(30000)
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      console.error('WebSocket connection failed:', _error)
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' })

      // Fall back to polling only
      notificationsAPI.startPolling(30000)
    }
  }

  const disconnectWebSocket = () => {
    notificationsAPI.disconnect()
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' })
  }

  const refresh = async () => {
    await Promise.all([
      fetchNotifications(),
      fetchPreferences()
    ])
  }

  // Auto-fetch notifications on mount
  React.useEffect(() => {
    if (userId) {
      fetchNotifications()
      fetchPreferences()
    }
  }, [userId, fetchNotifications, fetchPreferences])

  const value: NotificationContextType = {
    state,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    fetchPreferences,
    updatePreferences,
    connectWebSocket,
    disconnectWebSocket,
    refresh
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Custom hook to use notifications
export function useNotifications() {
  const context = React.useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Hook for notification management in components
export function useNotificationActions() {
  const { markAsRead, markAsUnread, deleteNotification } = useNotifications()

  return {
    markAsRead,
    markAsUnread,
    deleteNotification
  }
}
