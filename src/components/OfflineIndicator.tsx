import { useOffline, useOfflineQueue } from "@/hooks/useOffline";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Clock, Database, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function OfflineIndicator() {
  const { isOnline, wasOffline, lastOnlineTime, connectionType, effectiveType } = useOffline();
  const { queueLength } = useOfflineQueue();
  const { info } = useToast();

  if (isOnline && !wasOffline) {
    return null; // Don't show anything if consistently online
  }

  const handleRetryConnection = () => {
    // Force a connectivity check
    fetch(window.location.origin, { method: "HEAD", cache: "no-cache" })
      .then(() => {
        info("Connection restored", "You're back online!");
      })
      .catch(() => {
        info("Still offline", "Please check your internet connection.");
      });
  };

  return (
    <Card className={`fixed bottom-4 right-4 z-50 max-w-sm shadow-lg border-2 ${
      isOnline
        ? "border-green-200 bg-green-50"
        : "border-yellow-200 bg-yellow-50"
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 mt-0.5 ${
            isOnline ? "text-green-600" : "text-yellow-600"
          }`}>
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className={`text-sm font-medium ${
                isOnline ? "text-green-800" : "text-yellow-800"
              }`}>
                {isOnline ? "Back Online" : "You're Offline"}
              </p>
              {!isOnline && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs text-yellow-600">
                    {lastOnlineTime && Math.floor((Date.now() - lastOnlineTime.getTime()) / 1000 / 60)}m ago
                  </span>
                </div>
              )}
            </div>

            <p className={`text-sm mt-1 ${
              isOnline ? "text-green-700" : "text-yellow-700"
            }`}>
              {isOnline
                ? "All features are now available."
                : "Some features may be limited while offline."
              }
            </p>

            {/* Connection Details */}
            {isOnline && connectionType !== "unknown" && (
              <div className="mt-2 flex items-center space-x-2 text-xs text-green-600">
                <Database className="w-3 h-3" />
                <span>
                  {connectionType} • {effectiveType}
                </span>
              </div>
            )}

            {/* Offline Queue */}
            {!isOnline && queueLength > 0 && (
              <div className="mt-2 flex items-center space-x-2 text-xs text-yellow-600">
                <Database className="w-3 h-3" />
                <span>{queueLength} actions queued</span>
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 flex space-x-2">
              {!isOnline && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetryConnection}
                  className="text-xs h-7"
                >
                  Check Connection
                </Button>
              )}
              {isOnline && wasOffline && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="text-xs h-7"
                >
                  Refresh Page
                </Button>
              )}
            </div>
          </div>

          {/* Close button for online state */}
          {isOnline && wasOffline && (
            <button
              onClick={() => {
                // In a real implementation, you'd hide this component
                console.log("Hide online indicator");
              }}
              className="flex-shrink-0 text-green-600 hover:text-green-800"
            >
              <AlertCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Offline Banner for full-width notifications
export function OfflineBanner() {
  const { isOnline } = useOffline();

  if (isOnline) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <WifiOff className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            You're currently offline. Some features may be limited.
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-yellow-600">
            Auto-retry enabled
          </span>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
