import { createContext, useContext, useState, useEffect } from 'react';
import API from '../axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { userId, role }
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshNotifications, setRefreshNotifications] = useState(false);

  const toggleNotificationRefresh = () => {
    setRefreshNotifications(prev => !prev);
  };

  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/check', { withCredentials: true }); // adjust path if needed
      setUser(res.data); // { userId, role }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (userData) => {
    setUser(userData); // optional manual login update
  };

  const logout = async () => {
    await API.post('/auth/logout', {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, notificationCount, setNotificationCount, refreshNotifications, toggleNotificationRefresh }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy use
export const useAuth = () => useContext(AuthContext);