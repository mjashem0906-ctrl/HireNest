
import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import API from "../axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshNotifications, setRefreshNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const toggleNotificationRefresh = () => {
    setRefreshNotifications((prev) => !prev);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await API.get("/api/notifications");
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setNotificationCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isUnread: false } : n))
      );
      setNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const dismissNotification = async (id) => {
    try {
      await API.patch(`/api/notifications/${id}/dismiss`);
      const notif = notifications.find((n) => n._id === id);
      if (notif && notif.isUnread) {
        setNotificationCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
    }
  };

  const dismissAllNotifications = async () => {
    try {
      await API.patch("/api/notifications/dismiss-all");
      setNotifications([]);
      setNotificationCount(0);
    } catch (err) {
      console.error("Failed to dismiss all notifications:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.patch("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
      setNotificationCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/check");
      if (res.status === 200 && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        console.log("No active session (guest user).");
      } else {
        console.error("Auth check failed:", err.response?.status, err.message);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setNotificationCount(0);
    }
  }, [user, refreshNotifications]);

  // LOGIN
  const login = (userData) => {
    setUser(userData);
  };

  // LOGOUT
  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout API call failed:", err);
    }
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        fetchUser,
        notificationCount,
        setNotificationCount,
        refreshNotifications,
        toggleNotificationRefresh,
        notifications,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        dismissAllNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);