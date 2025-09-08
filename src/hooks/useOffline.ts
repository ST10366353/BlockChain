import { useState, useEffect, useCallback } from "react";

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineTime: Date | null;
  connectionType: string;
  effectiveType: string;
}

export function useOffline(): OfflineState {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);
  const [connectionType, setConnectionType] = useState("unknown");
  const [effectiveType, setEffectiveType] = useState("unknown");

  // Update connection info
  const updateConnectionInfo = useCallback(() => {
    // @ts-expect-error - navigator.connection is not in all TypeScript definitions
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      setConnectionType(connection.type || "unknown");
      setEffectiveType(connection.effectiveType || "unknown");
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(false);
      setLastOnlineTime(new Date());
      updateConnectionInfo();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    // Listen for online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen for connection changes
    // @ts-expect-error - navigator.connection is not in all TypeScript definitions
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener("change", updateConnectionInfo);
    }

    // Initial connection info
    updateConnectionInfo();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if (connection) {
        connection.removeEventListener("change", updateConnectionInfo);
      }
    };
  }, [updateConnectionInfo]);

  return {
    isOnline,
    wasOffline,
    lastOnlineTime,
    connectionType,
    effectiveType,
  };
}

// Hook for managing offline queue
interface QueueItem {
  id: number;
  action: string;
  data?: unknown;
  timestamp: Date;
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const { isOnline } = useOffline();

  const addToQueue = useCallback((item: Omit<QueueItem, "id" | "timestamp">) => {
    setQueue((prev) => [...prev, { ...item, id: Date.now(), timestamp: new Date() }]);
  }, []);

  const removeFromQueue = useCallback((id: number) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  // Process queue when back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      // In a real implementation, you'd retry the queued operations
      console.log("Processing offline queue:", queue.length, "items");

      // For now, just clear the queue after a delay
      setTimeout(() => {
        clearQueue();
      }, 2000);
    }
  }, [isOnline, queue.length, clearQueue]);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    queueLength: queue.length,
  };
}

// Hook for offline storage
export function useOfflineStorage() {
  const saveToStorage = useCallback(async (key: string, data: unknown) => {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(`offline_${key}`, serializedData);
      return true;
    } catch (error) {
      console.error("Failed to save to offline storage:", error);
      return false;
    }
  }, []);

  const getFromStorage = useCallback((key: string) => {
    try {
      const data = localStorage.getItem(`offline_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to get from offline storage:", error);
      return null;
    }
  }, []);

  const removeFromStorage = useCallback((key: string) => {
    try {
      localStorage.removeItem(`offline_${key}`);
      return true;
    } catch (error) {
      console.error("Failed to remove from offline storage:", error);
      return false;
    }
  }, []);

  const clearStorage = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith("offline_"));
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error("Failed to clear offline storage:", error);
      return false;
    }
  }, []);

  return {
    saveToStorage,
    getFromStorage,
    removeFromStorage,
    clearStorage,
  };
}
