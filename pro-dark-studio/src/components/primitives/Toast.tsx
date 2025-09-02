import { useNotificationStore } from "@/store/notification";
import { clsx } from "clsx";
import { X, Info, AlertTriangle, AlertOctagon } from "lucide-react";

const icons = {
  info: <Info className="size-5" />,
  warning: <AlertTriangle className="size-5" />,
  error: <AlertOctagon className="size-5" />,
};

const colors = {
  info: "bg-blue-500/20 text-blue-300",
  warning: "bg-yellow-500/20 text-yellow-300",
  error: "bg-red-500/20 text-red-300",
};

export function ToastProvider() {
  const { notifications, dismissNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={clsx(
            "flex items-center justify-between p-4 rounded-lg border animate-fadeIn",
            "border-stroke bg-panel-2 shadow-lg",
            colors[notification.type]
          )}
        >
          <div className="flex items-center gap-3">
            {icons[notification.type]}
            <p className="text-sm font-semibold">{notification.message}</p>
          </div>
          <button onClick={() => dismissNotification(notification.id)}>
            <X className="size-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
