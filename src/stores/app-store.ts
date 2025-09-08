import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Credential } from '@/lib/api/credentials-service';
import { HandshakeRequest } from '@/lib/api/handshake-service';

// UI State Interface
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  loading: {
    global: boolean;
    credentials: boolean;
    handshake: boolean;
    analytics: boolean;
  };
  notifications: Notification[];
  modal: {
    isOpen: boolean;
    type: string | null;
    data: any;
  };
}

// Notification Interface
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Application State Interface
interface AppState extends UIState {
  // Data
  credentials: Credential[];
  handshakeRequests: HandshakeRequest[];
  selectedCredential: Credential | null;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLoading: (key: keyof UIState['loading'], loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Modal actions
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;

  // Data actions
  setCredentials: (credentials: Credential[]) => void;
  addCredential: (credential: Credential) => void;
  updateCredential: (id: string, updates: Partial<Credential>) => void;
  removeCredential: (id: string) => void;
  setSelectedCredential: (credential: Credential | null) => void;

  setHandshakeRequests: (requests: HandshakeRequest[]) => void;
  addHandshakeRequest: (request: HandshakeRequest) => void;
  updateHandshakeRequest: (id: string, updates: Partial<HandshakeRequest>) => void;
  removeHandshakeRequest: (id: string) => void;

  // Utility actions
  reset: () => void;
}

// Initial state
const initialState = {
  // UI State
  sidebarOpen: false,
  theme: 'system' as const,
  loading: {
    global: false,
    credentials: false,
    handshake: false,
    analytics: false,
  },
  notifications: [],
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },

  // Data
  credentials: [],
  handshakeRequests: [],
  selectedCredential: null,
};

// Create the store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // UI Actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }),

        setTheme: (theme) => set({ theme }),

        setLoading: (key, loading) =>
          set((state) => ({
            loading: { ...state.loading, [key]: loading },
          })),

        addNotification: (notification) =>
          set((state) => ({
            notifications: [
              {
                ...notification,
                id: Date.now().toString(),
                timestamp: new Date(),
                read: false,
              },
              ...state.notifications,
            ],
          })),

        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),

        markNotificationRead: (id) =>
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
          })),

        markAllNotificationsRead: () =>
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
          })),

        clearNotifications: () => set({ notifications: [] }),

        // Modal Actions
        openModal: (type, data = null) =>
          set({
            modal: { isOpen: true, type, data },
          }),

        closeModal: () =>
          set({
            modal: { isOpen: false, type: null, data: null },
          }),

        // Credential Actions
        setCredentials: (credentials) => set({ credentials }),

        addCredential: (credential) =>
          set((state) => ({
            credentials: [credential, ...state.credentials],
          })),

        updateCredential: (id, updates) =>
          set((state) => ({
            credentials: state.credentials.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          })),

        removeCredential: (id) =>
          set((state) => ({
            credentials: state.credentials.filter((c) => c.id !== id),
          })),

        setSelectedCredential: (credential) => set({ selectedCredential: credential }),

        // Handshake Actions
        setHandshakeRequests: (requests) => set({ handshakeRequests: requests }),

        addHandshakeRequest: (request) =>
          set((state) => ({
            handshakeRequests: [request, ...state.handshakeRequests],
          })),

        updateHandshakeRequest: (id, updates) =>
          set((state) => ({
            handshakeRequests: state.handshakeRequests.map((r) =>
              r.id === id ? { ...r, ...updates } : r
            ),
          })),

        removeHandshakeRequest: (id) =>
          set((state) => ({
            handshakeRequests: state.handshakeRequests.filter((r) => r.id !== id),
          })),

        // Reset
        reset: () => set(initialState),
      }),
      {
        name: 'identity-vault-store',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          theme: state.theme,
          credentials: state.credentials,
          selectedCredential: state.selectedCredential,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// Selectors for commonly used state
export const useCredentials = () => useAppStore((state) => state.credentials);
export const useHandshakeRequests = () => useAppStore((state) => state.handshakeRequests);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useLoading = () => useAppStore((state) => state.loading);
export const useModal = () => useAppStore((state) => state.modal);
export const useTheme = () => useAppStore((state) => state.theme);
