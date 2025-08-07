"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Bell,
  CheckSquare,
  Calendar,
  FileText,
  Settings,
  X,
} from "lucide-react";
import { Notification } from "@/types";
import { mockNotifications } from "@/lib/mockData";
import { formatRelativeTime } from "@/lib/utils";

interface NotificationPanelProps {
  title?: string;
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onRemove,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case "task":
        return <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />;
      case "meeting":
        return <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-500" />;
      case "reminder":
        return <Bell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-500" />;
      case "system":
        return (
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-muted-foreground" />
        );
      default:
        return <Bell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-muted-foreground" />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case "task":
        return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
      case "meeting":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
      case "reminder":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "system":
        return "bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground";
      default:
        return "bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground";
    }
  };

  return (
    <div
      className={`px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors overflow-hidden ${
        !notification.read ? "bg-primary/10 dark:bg-primary/15" : ""
      }`}
    >
      <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0 max-w-full overflow-hidden">
          <div className="flex items-start justify-between mb-1 sm:mb-2 gap-2 sm:gap-3">
            <h4 className="text-xs sm:text-sm lg:text-base font-medium text-foreground flex-1 min-w-0 break-words leading-4 sm:leading-5 lg:leading-6 overflow-hidden text-ellipsis">
              {notification.title}
            </h4>
            <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
              {!notification.read && (
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full flex-shrink-0" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0"
                onClick={() => onRemove(notification.id)}
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-1 sm:mb-2 break-words overflow-hidden line-clamp-2">
            {notification.message}
          </p>

          <div className="flex flex-col space-y-1 sm:space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex flex-wrap gap-1 sm:gap-1.5 max-w-full">
              <Badge
                className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5 lg:py-1 ${getTypeColor()}`}
              >
                {notification.type}
              </Badge>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(notification.created_at)}
              </span>
            </div>

            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm h-6 sm:h-7 lg:h-8 px-2 py-1 whitespace-nowrap self-start lg:self-auto hover:bg-primary/10 hover:text-primary transition-colors overflow-hidden text-ellipsis max-w-full"
                onClick={() => onMarkAsRead(notification.id)}
              >
                <span className="hidden sm:inline">Mark as Read</span>
                <span className="sm:hidden">Read</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationPanel({
  title = "Notifications",
  limit = 5,
  showHeader = true,
  className,
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(
    mockNotifications.slice(0, limit)
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleRemove = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  return (
    <Card className={`${className} overflow-hidden`}>
      {showHeader && (
        <CardHeader className="flex flex-col space-y-2 sm:space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0 p-3 sm:p-4 lg:p-6 pb-3 sm:pb-4 overflow-hidden">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold truncate">{title}</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 flex-shrink-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex flex-col space-y-2 w-full lg:w-auto lg:flex-shrink-0 lg:min-w-0 overflow-hidden">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs sm:text-sm px-2 py-1 h-6 sm:h-7 lg:h-8 w-full lg:w-auto whitespace-nowrap hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0 overflow-hidden text-ellipsis"
              >
                <span className="hidden sm:inline">Mark All as Read</span>
                <span className="sm:hidden">Mark All</span>
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0 overflow-hidden">
        {notifications.length > 0 ? (
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onRemove={handleRemove}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 text-center text-muted-foreground">
            <Bell className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-2 sm:mb-4 opacity-50" />
            <p className="text-xs sm:text-sm lg:text-base">Tidak ada notifikasi</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
