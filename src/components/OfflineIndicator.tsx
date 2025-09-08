import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useOfflineStatus, useOfflineQueue, useOfflineStore } from "@/stores/offline-store";
import { useToast } from "@/components/ui/toast";

export function OfflineIndicator() {
  const { isOnline, lastSync, pendingItems, failedItems, isProcessingQueue } = useOfflineStatus();
  const queue = useOfflineQueue();
  const { processQueue, retryFailedItems } = useOfflineStore();
  const { success, error: showError } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't show if online and no pending items
  if (isOnline && pendingItems === 0 && failedItems === 0) {
    return null;
  }

  const handleSyncNow = async () => {
    try {
      await processQueue();
      success('Sync completed successfully!');
    } catch (err) {
      showError('Sync failed. Please try again.');
    }
  };

  const handleRetryFailed = async () => {
    try {
      await retryFailedItems();
      success('Failed items queued for retry.');
    } catch (err) {
      showError('Failed to retry items.');
    }
  };

  const failedQueueItems = queue.filter(item => item.retryCount >= 3);

  return (
    <Card className={`fixed bottom-4 right-4 z-50 max-w-sm shadow-lg border-2 ${
      isOnline
        ? failedItems > 0 ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"
        : "border-yellow-200 bg-yellow-50"
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 mt-0.5 ${
            isOnline ? (failedItems > 0 ? "text-orange-600" : "text-green-600") : "text-yellow-600"
          }`}>
            {isOnline ? (
              failedItems > 0 ? <AlertTriangle className="w-5 h-5" /> : <Wifi className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${
                isOnline ? (failedItems > 0 ? "text-orange-800" : "text-green-800") : "text-yellow-800"
              }`}>
                {isOnline ? (failedItems > 0 ? "Sync Issues" : "Online & Synced") : "Offline Mode"}
              </p>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            <p className={`text-sm mt-1 ${
              isOnline ? (failedItems > 0 ? "text-orange-700" : "text-green-700") : "text-yellow-700"
            }`}>
              {isOnline
                ? failedItems > 0
                  ? `${failedItems} sync error${failedItems > 1 ? 's' : ''} detected`
                  : pendingItems > 0
                    ? `${pendingItems} item${pendingItems > 1 ? 's' : ''} syncing...`
                    : "All changes synchronized"
                : "Working offline - changes will sync when online"
              }
            </p>

            {/* Status Details */}
            <div className="mt-2 space-y-1 text-xs">
              {lastSync && (
                <div className="text-gray-600">
                  Last sync: {new Date(lastSync).toLocaleTimeString()}
                </div>
              )}
              {pendingItems > 0 && (
                <div className="text-blue-600">
                  {pendingItems} pending sync
                </div>
              )}
              {failedItems > 0 && (
                <div className="text-red-600">
                  {failedItems} failed to sync
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="mt-3 space-y-2">
                {failedQueueItems.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <p className="text-xs font-medium text-red-800 mb-1">Failed Operations:</p>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {failedQueueItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="text-xs text-red-700">
                          {item.type} {item.resource} - {item.lastError || 'Unknown error'}
                        </div>
                      ))}
                      {failedQueueItems.length > 3 && (
                        <div className="text-xs text-red-600">
                          +{failedQueueItems.length - 3} more...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 flex space-x-2">
              {isOnline && pendingItems > 0 && (
                <Button
                  size="sm"
                  onClick={handleSyncNow}
                  disabled={isProcessingQueue}
                  className="text-xs h-7"
                >
                  {isProcessingQueue ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3 mr-1" />
                  )}
                  Sync Now
                </Button>
              )}
              {failedItems > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetryFailed}
                  className="text-xs h-7"
                >
                  Retry Failed
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Offline Banner for full-width notifications
export function OfflineBanner() {
  const { isOnline, pendingItems, failedItems } = useOfflineStatus();

  if (isOnline && pendingItems === 0 && failedItems === 0) {
    return null;
  }

  return (
    <div className={`border-b px-4 py-2 ${
      isOnline
        ? failedItems > 0 ? "bg-orange-100 border-orange-200" : "bg-green-100 border-green-200"
        : "bg-yellow-100 border-yellow-200"
    }`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            failedItems > 0 ? (
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            ) : (
              <Wifi className="w-4 h-4 text-green-600" />
            )
          ) : (
            <WifiOff className="w-4 h-4 text-yellow-600" />
          )}
          <span className={`text-sm ${
            isOnline
              ? failedItems > 0 ? "text-orange-800" : "text-green-800"
              : "text-yellow-800"
          }`}>
            {isOnline
              ? failedItems > 0
                ? `Sync issues detected (${failedItems} failed)`
                : pendingItems > 0
                  ? `Syncing ${pendingItems} item${pendingItems > 1 ? 's' : ''}...`
                  : "Online and synchronized"
              : "You're currently offline. Working in offline mode."
            }
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${
            isOnline ? "text-green-600" : "text-yellow-600"
          }`}>
            {isOnline ? "Auto-sync enabled" : "Auto-retry enabled"}
          </span>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            isOnline ? (failedItems > 0 ? "bg-orange-500" : "bg-green-500") : "bg-yellow-500"
          }`}></div>
        </div>
      </div>
    </div>
  );
}
