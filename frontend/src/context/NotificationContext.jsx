import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "./AuthContext";
import apiClient from "../services/api";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications debe ser usado dentro de un NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    desktop: true,
    fileUploads: true,
    dataChanges: true,
    systemAlerts: true,
    weeklyReports: false,
    monthlyReports: true,
  });

  // Cargar configuraciones guardadas y notificaciones iniciales
  useEffect(() => {
    if (user && user.token) {
      const savedSettings = localStorage.getItem(
        `notification-settings-${user._id}`,
      );
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      loadNotifications();
    }
  }, [user]);

  // Persistir configuraciones
  useEffect(() => {
    if (user && user._id) {
      localStorage.setItem(
        `notification-settings-${user._id}`,
        JSON.stringify(settings),
      );
    }
  }, [settings, user]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await apiClient.get("/notifications");
      if (response.data?.success && response.data?.data) {
        setNotifications(response.data.data.notifications || []);
        setUnreadCount(response.data.data.unreadCount || 0);
      } else {
        setNotifications(response.data?.notifications || []);
        setUnreadCount(response.data?.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    }
  }, []);

  const showToast = useCallback((message, type = "success", options = {}) => {
    const toastOptions = {
      duration: 4000,
      position: "top-right",
      ...options,
    };
    switch (type) {
      case "success":
        return toast.success(message, toastOptions);
      case "error":
        return toast.error(message, toastOptions);
      case "warning":
        return toast(message, {
          ...toastOptions,
          icon: "⚠️",
          style: { background: "#ff9800", color: "white" },
        });
      case "info":
        return toast(message, {
          ...toastOptions,
          icon: "ℹ️",
          style: { background: "#2196f3", color: "white" },
        });
      case "loading":
        return toast.loading(message, toastOptions);
      default:
        return toast(message, toastOptions);
    }
  }, []);

  const showPromiseToast = useCallback((promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || "Cargando...",
      success: messages.success || "Operación completada",
      error: messages.error || "Ha ocurrido un error",
    });
  }, []);

  // Notificación manual (no SSE)
  const addNotification = useCallback(
    (notification) => {
      const newNotification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
        ...notification,
      };
      setNotifications((prev) => {
        if (newNotification._id && prev.some((n) => n._id === newNotification._id)) {
          return prev;
        }
        return [newNotification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
      if (settings.desktop && "Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title || "Nueva notificación", {
          body: notification.message,
          icon: "/favicon.ico",
          tag: newNotification.id,
        });
      }
      return newNotification.id;
    },
    [settings.desktop],
  );

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId || n.id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marcando todas las notificaciones como leídas:", error);
    }
  }, []);

  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        await apiClient.delete(`/notifications/${notificationId}`);
        const notification = notifications.find((n) => n._id === notificationId || n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId && n.id !== notificationId));
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Error eliminando notificación:", error);
      }
    },
    [notifications],
  );

  const clearAllNotifications = useCallback(async () => {
    try {
      // El backend expone /notifications/read para eliminar las leídas
      await apiClient.delete("/notifications/read");
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error limpiando notificaciones:", error);
    }
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const requestDesktopPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  }, []);

  // SSE en tiempo real con fallback a polling
  useEffect(() => {
    if (!user || !user.token || !settings.push) return;

    let pollTimer = null;
    const startPolling = () => {
      if (pollTimer) return;
      pollTimer = setInterval(() => {
        loadNotifications();
      }, 15000);
    };
    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const url = `http://localhost:5001/api/notifications/stream?token=${encodeURIComponent(
      user.token,
    )}`;
    const es = new EventSource(url);
    let failures = 0;

    es.onopen = () => {
      failures = 0;
      stopPolling();
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.ping) return;
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(
            data.unreadCount || data.notifications.filter((n) => !n.read).length,
          );
        }
      } catch (err) {
        console.error("Error procesando notificación:", err);
      }
    };

    es.onerror = () => {
      failures += 1;
      if (failures > 2) {
        startPolling();
      }
    };

    return () => {
      es.close();
      stopPolling();
    };
  }, [user, settings.push, loadNotifications]);

  const value = {
    notifications,
    unreadCount,
    settings,
    showToast,
    showPromiseToast,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    requestDesktopPermission,
    loadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "8px",
          },
          success: {
            style: { background: "#4caf50" },
          },
          error: {
            style: { background: "#f44336" },
          },
        }}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;

