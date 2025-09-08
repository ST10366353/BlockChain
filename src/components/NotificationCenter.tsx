import { useState } from "react";
import { useAppStore } from "@/stores";
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "unread" | "read">("all");

  const {
    notifications,
    removeNotification,
    markNotificationRead,
    clearNotifications,
    markAllNotificationsRead
  } = useAppStore();

  const filteredNotifications = notifications.filter(notification => {
    if (filterType === "unread") return !notification.read;
    if (filterType === "read") return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };


  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };

  const handleRemove = (id: string) => {
    removeNotification(id);
  };

  const handleClearAll = () => {
    clearNotifications();
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-full max-w-2xl max-h-[80vh]">
        <ModalHeader>
          <div className="flex items-center justify-between w-full">
            <ModalTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </ModalTitle>
            <div className="flex items-center space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm bg-white"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </ModalHeader>

        <ModalContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filterType === "unread"
                  ? "No unread notifications"
                  : filterType === "read"
                    ? "No read notifications"
                    : "No notifications"
                }
              </h3>
              <p className="text-gray-600">
                {filterType === "unread"
                  ? "You've read all your notifications!"
                  : "You'll see your notifications here when you have any."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkRead(notification.id)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemove(notification.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Remove notification"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalContent>

        {filteredNotifications.length > 0 && (
          <ModalFooter>
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
                <Button onClick={() => setIsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </ModalFooter>
        )}
      </Modal>
    </>
  );
}
