import React, { useEffect, useState } from "react";
import styles from "./Header.module.scss";
import { Menu, Sun, Moon } from "lucide-react";

import Logout from "../UI/Logout";
import { useAuth } from "../../context/AuthContext";
import API from "../../axios";
import { useNavigate } from "react-router";
import { useTheme } from "../../context/ThemeContext";

function Header({ title, onMenuClick }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { user, setNotificationCount, refreshNotifications } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchNotification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshNotifications]);

  const fetchNotification = async () => {
    try {
      let res;
      if (user?.role === "Admin") {
        res = await API.get("/request/status-requests");
      } else if (user?.role === "IT_Member" || user?.role === "Member") {
        res = await API.get("/request/status-requests/user");
      } else {
        return;
      }

      const count = res.data.length;
      setNotifications(res.data);
      setNotificationCount(count);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.menuButton}
          onClick={onMenuClick}
          type="button"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        <button
          className={styles.title}
          onClick={scrollToTop}
          type="button"
        >
          {title}
        </button>
      </div>

      <div className={styles.right}>
        {/* ✅ Theme Toggle Button */}
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Logout />
      </div>
    </header>
  );
}

export default Header;
