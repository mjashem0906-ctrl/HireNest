
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

  const [notificationCount, setNotificationCount] =
    useState(0);

  const [refreshNotifications, setRefreshNotifications] =
    useState(false);

  const toggleNotificationRefresh = () => {
    setRefreshNotifications((prev) => !prev);
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

      console.error(
        "Auth check failed:",
        err.response?.status,
        err.message
      );

      setUser(null);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // LOGIN
  const login = (userData) => {

    setUser(userData);

    // DO NOT REMOVE TOKEN
  };

  // LOGOUT
  const logout = async () => {

    try {

      await API.post("/auth/logout");

    } catch (err) {

      console.error(
        "Logout API call failed:",
        err
      );
    }

    setUser(null);

    // REMOVE TOKEN ONLY ON LOGOUT
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);