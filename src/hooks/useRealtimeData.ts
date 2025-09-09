/**
 * Real-time Data Hook
 * Provides live updates for credentials and handshake requests
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores';
import { websocketService } from '@/lib/websocket/websocket-service';
import { dataPersistence } from '@/lib/persistence/data-persistence';
// import { Credential } from '@/lib/api/credentials-service';
// import { HandshakeRequest } from '@/lib/api/handshake-service';

export interface RealtimeDataOptions {
  enabled?: boolean;
  credentials?: boolean;
  handshakeRequests?: boolean;
  notifications?: boolean;
  syncInterval?: number;
}

export interface RealtimeDataState {
  isConnected: boolean;
  lastUpdate: Date | null;
  pendingUpdates: number;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
}

export function useRealtimeData(options: RealtimeDataOptions = {}) {
  const {
    enabled = true,
    credentials = true,
    handshakeRequests = true,
    notifications = true,
    syncInterval = 30000
  } = options;

  const [state, setState] = useState<RealtimeDataState>({
    isConnected: false,
    lastUpdate: null,
    pendingUpdates: 0,
    connectionStatus: 'disconnected'
  });

  const { addNotification } = useAppStore.getState();

  // Update connection status
  const updateConnectionStatus = useCallback(() => {
    const wsStatus = websocketService.getConnectionStatus();
    setState(prev => ({
      ...prev,
      isConnected: wsStatus.connected,
      connectionStatus: wsStatus.connected ? 'connected' :
                       wsStatus.connecting ? 'connecting' : 'disconnected'
    }));
  }, []);

  // Handle credential updates
  const handleCredentialUpdate = useCallback(async (message: any) => {
    if (!credentials) return;

    try {
      const { payload } = message;

      switch (payload.action) {
        case 'created':
          await dataPersistence.saveCredential(payload.credential, { sync: false });
          break;
        case 'updated':
          await dataPersistence.updateCredential(payload.credential.id, payload.credential, { sync: false });
          break;
        case 'deleted':
          await dataPersistence.deleteCredential(payload.credentialId, { sync: false });
          break;
      }

      setState(prev => ({
        ...prev,
        lastUpdate: new Date(),
        pendingUpdates: Math.max(0, prev.pendingUpdates - 1)
      }));

      if (notifications) {
        addNotification({
          type: 'info',
          title: 'Credential Updated',
          message: `Credential has been ${payload.action} in real-time.`
        });
      }
    } catch (error) {
      console.error('Failed to handle credential update:', error);
    }
  }, [credentials, notifications, addNotification]);

  // Handle handshake request updates
  const handleHandshakeUpdate = useCallback(async (message: any) => {
    if (!handshakeRequests) return;

    try {
      const { payload } = message;

      switch (payload.action) {
        case 'created':
          await dataPersistence.saveHandshakeRequest(payload.request, { sync: false });
          break;
        case 'updated':
          await dataPersistence.updateHandshakeRequest(payload.request.id, payload.request, { sync: false });
          break;
        case 'deleted':
          await dataPersistence.deleteHandshakeRequest(payload.requestId, { sync: false });
          break;
      }

      setState(prev => ({
        ...prev,
        lastUpdate: new Date(),
        pendingUpdates: Math.max(0, prev.pendingUpdates - 1)
      }));

      if (notifications) {
        addNotification({
          type: 'info',
          title: 'Handshake Request Updated',
          message: `Handshake request has been ${payload.action} in real-time.`
        });
      }
    } catch (error) {
      console.error('Failed to handle handshake update:', error);
    }
  }, [handshakeRequests, notifications, addNotification]);

  // Periodic sync fallback
  const performPeriodicSync = useCallback(async () => {
    if (!enabled || state.isConnected) return;

    try {
      setState(prev => ({ ...prev, pendingUpdates: prev.pendingUpdates + 1 }));

      // Refresh data from local storage
      if (credentials) {
        await dataPersistence.getAllCredentials();
      }

      if (handshakeRequests) {
        await dataPersistence.getAllHandshakeRequests();
      }

      setState(prev => ({
        ...prev,
        lastUpdate: new Date(),
        pendingUpdates: Math.max(0, prev.pendingUpdates - 1)
      }));
    } catch (error) {
      console.error('Periodic sync failed:', error);
      setState(prev => ({
        ...prev,
        connectionStatus: 'error',
        pendingUpdates: Math.max(0, prev.pendingUpdates - 1)
      }));
    }
  }, [enabled, state.isConnected, credentials, handshakeRequests]);

  // Set up WebSocket event listeners
  useEffect(() => {
    if (!enabled) return;

    // Subscribe to real-time updates
    if (credentials) {
      websocketService.onMessage('credential_created', handleCredentialUpdate);
      websocketService.onMessage('credential_updated', handleCredentialUpdate);
      websocketService.onMessage('credential_deleted', handleCredentialUpdate);
    }

    if (handshakeRequests) {
      websocketService.onMessage('handshake_created', handleHandshakeUpdate);
      websocketService.onMessage('handshake_updated', handleHandshakeUpdate);
      websocketService.onMessage('handshake_deleted', handleHandshakeUpdate);
    }

    // Monitor connection status
    const connectionCheck = setInterval(updateConnectionStatus, 5000);

    return () => {
      if (credentials) {
        websocketService.offMessage('credential_created');
        websocketService.offMessage('credential_updated');
        websocketService.offMessage('credential_deleted');
      }

      if (handshakeRequests) {
        websocketService.offMessage('handshake_created');
        websocketService.offMessage('handshake_updated');
        websocketService.offMessage('handshake_deleted');
      }

      clearInterval(connectionCheck);
    };
  }, [enabled, credentials, handshakeRequests, handleCredentialUpdate, handleHandshakeUpdate, updateConnectionStatus]);

  // Set up periodic sync
  useEffect(() => {
    if (!enabled) return;

    const syncTimer = setInterval(performPeriodicSync, syncInterval);

    return () => clearInterval(syncTimer);
  }, [enabled, syncInterval, performPeriodicSync]);

  // Initial data load
  useEffect(() => {
    if (!enabled) return;

    const loadInitialData = async () => {
      try {
        if (credentials) {
          await dataPersistence.getAllCredentials();
        }

        if (handshakeRequests) {
          await dataPersistence.getAllHandshakeRequests();
        }

        setState(prev => ({
          ...prev,
          lastUpdate: new Date()
        }));
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [enabled, credentials, handshakeRequests]);

  // Connection status monitoring
  useEffect(() => {
    updateConnectionStatus();
  }, [updateConnectionStatus]);

  return {
    ...state,
    reconnect: () => websocketService.connect(),
    disconnect: () => websocketService.disconnect(),
    sendMessage: (type: string, payload: any) => websocketService.send(type, payload)
  };
}

// Hook for real-time credentials
export function useRealtimeCredentials() {
  const { credentials, setCredentials } = useAppStore();

  useRealtimeData({
    enabled: true,
    credentials: true,
    handshakeRequests: false,
    notifications: true
  });

  return {
    credentials,
    refetch: async () => {
      const updatedCredentials = await dataPersistence.getAllCredentials();
      setCredentials(updatedCredentials);
    }
  };
}

// Hook for real-time handshake requests
export function useRealtimeHandshakeRequests() {
  const { handshakeRequests, setHandshakeRequests } = useAppStore();

  useRealtimeData({
    enabled: true,
    credentials: false,
    handshakeRequests: true,
    notifications: true
  });

  return {
    handshakeRequests,
    refetch: async () => {
      const updatedRequests = await dataPersistence.getAllHandshakeRequests();
      setHandshakeRequests(updatedRequests);
    }
  };
}

// Hook for offline status with real-time updates
export function useRealtimeOfflineStatus() {
  const [offlineState, setOfflineState] = useState({
    isOnline: navigator.onLine,
    wasOffline: false,
    lastOnlineTime: null as Date | null,
    connectionQuality: 'unknown' as 'good' | 'poor' | 'unknown'
  });

  useEffect(() => {
    const handleOnline = () => {
      setOfflineState(prev => ({
        ...prev,
        isOnline: true,
        wasOffline: false,
        lastOnlineTime: new Date()
      }));
    };

    const handleOffline = () => {
      setOfflineState(prev => ({
        ...prev,
        isOnline: false,
        wasOffline: true
      }));
    };

    // Monitor connection quality
    const checkConnectionQuality = () => {
      if (navigator.onLine) {
        // Simple connection quality check
        const connection = (navigator as any).connection;
        if (connection) {
          const quality = connection.effectiveType === '4g' ? 'good' :
                         connection.effectiveType === '3g' ? 'poor' : 'unknown';
          setOfflineState(prev => ({ ...prev, connectionQuality: quality }));
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const qualityCheck = setInterval(checkConnectionQuality, 10000);
    checkConnectionQuality();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(qualityCheck);
    };
  }, []);

  return offlineState;
}
