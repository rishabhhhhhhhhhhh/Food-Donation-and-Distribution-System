
import { cn } from "@/lib/utils";
import { Notification } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  return (
    <div
      onClick={() => onClick(notification)}
      className={cn(
        "p-4 border-b last:border-0 hover:bg-muted cursor-pointer",
        !notification.isRead && "bg-muted/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-2 h-2 mt-2 rounded-full",
          !notification.isRead ? "bg-primary" : "bg-muted-foreground/30"
        )} />
        <div className="flex-1">
          <p className={cn(
            "text-sm",
            !notification.isRead && "font-medium"
          )}>
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
