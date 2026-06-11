import React, { useState, useEffect, useRef } from "react";
import styles from "./Header.module.scss";
import { Menu, Sun, Moon, Bell, X } from "lucide-react";

import Logout from "../UI/Logout";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { useTheme } from "../../context/ThemeContext";

function NotificationItem({ notif, onDismiss, onClick }) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setStartX(e.touches[0].clientX);
    setSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!swiping || e.touches.length !== 1) return;
    const diffX = e.touches[0].clientX - startX;
    setCurrentX(diffX);
  };

  const handleTouchEnd = () => {
    if (!swiping) return;
    setSwiping(false);
    
    if (Math.abs(currentX) > 80) {
      setIsDismissing(true);
      setTimeout(() => {
        onDismiss(notif);
      }, 300);
    } else {
      setCurrentX(0);
    }
  };

  let itemStyle = {};
  if (isDismissing) {
    itemStyle = {
      transform: `translateX(${currentX > 0 ? "100%" : "-100%"})`,
      opacity: 0,
      maxHeight: "0px",
      paddingTop: "0px",
      paddingBottom: "0px",
      marginTop: "0px",
      marginBottom: "0px",
      borderBottomWidth: "0px",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    };
  } else if (swiping) {
    itemStyle = {
      transform: `translateX(${currentX}px)`,
      opacity: Math.max(0.3, 1 - Math.abs(currentX) / 200),
      maxHeight: "150px",
      transition: "none"
    };
  } else {
    itemStyle = {
      transform: "translateX(0px)",
      opacity: 1,
      maxHeight: "150px",
      transition: "transform 0.25s ease, opacity 0.25s ease, max-height 0.25s ease, padding 0.25s ease"
    };
  }

  const handleItemClick = () => {
    if (Math.abs(currentX) > 5) return;
    onClick(notif);
  };

  return (
    <div
      className={`${styles.notificationItem} ${
        notif.isUnread ? styles.unread : ""
      }`}
      style={itemStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleItemClick}
    >
      {notif.isUnread && <span className={styles.unreadDot} />}
      <div className={styles.notifContent}>
        <h4 className={styles.notifTitle}>{notif.title}</h4>
        <p className={styles.notifMessage}>{notif.message}</p>
        <span className={styles.notifTime}>
          {new Date(notif.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </span>
      </div>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={(e) => {
          e.stopPropagation();
          setIsDismissing(true);
          setTimeout(() => {
            onDismiss(notif);
          }, 300);
        }}
        aria-label="Dismiss notification"
        title="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function Header({ title, onMenuClick }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const {
    user,
    notifications,
    notificationCount,
    markAsRead,
    markAllAsRead
  } = useAuth();
  
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Reset dismissed notification states when toggled closed
  useEffect(() => {
    if (!showNotifications) {
      setDismissedIds([]);
    }
  }, [showNotifications]);

  const handleNotificationClick = async (notif) => {
    await markAsRead(notif._id);
    setShowNotifications(false);

    // Dynamic routing depending on notification context
    if (notif.relatedId) {
      if (notif.relatedModel === "Service") {
        if (notif.type === "status_update" || notif.type === "interview_notification") {
          navigate("/jobs", { state: { view: "myPost", jobId: notif.relatedId } });
        } else {
          navigate(`/jobs/${notif.relatedId}`);
        }
      } else if (notif.relatedModel === "Candidate") {
        navigate(`/members`);
      } else if (notif.relatedModel === "StatusChangeRequest") {
        navigate(`/jobs`);
      } else if (notif.relatedModel === "Mentor" || notif.type === "mentor_acceptance") {
        if (notif.relatedModel === "Mentor") {
          navigate(`/mentors/${notif.relatedId}`);
        } else {
          // Fallback if relatedId is the old connection ID
          navigate(`/mentors`);
        }
      } else if (notif.relatedModel === "MentorConnection") {
        navigate(`/mentors`);
      }
    } else {
      // Default fallback
      if (user?.role === "Admin") {
        navigate("/");
      } else {
        navigate("/");
      }
    }
  };

  const handleDismiss = async (notif) => {
    if (notif.isUnread) {
      await markAsRead(notif._id);
    }
    setDismissedIds((prev) => [...prev, notif._id]);
  };

  const visibleNotifications = notifications.filter(
    (notif) => !dismissedIds.includes(notif._id)
  );

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
        {/* Notification Bell */}
        {user && (
          <div className={styles.notificationWrapper} ref={dropdownRef}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Toggle notifications"
              title="Notifications"
            >
              <Bell size={18} />
              {notificationCount > 0 && (
                <span className={styles.notificationBadge}>
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className={styles.notificationDropdown}>
                <div className={styles.dropdownHeader}>
                  <h3>Notifications</h3>
                  {notificationCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      className={styles.markAllBtn}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className={styles.dropdownList}>
                  {visibleNotifications.length === 0 ? (
                    <div className={styles.emptyNotifications}>
                      <Bell size={24} style={{ opacity: 0.3, marginBottom: "8px" }} />
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    visibleNotifications.map((notif) => (
                      <NotificationItem
                        key={notif._id}
                        notif={notif}
                        onDismiss={handleDismiss}
                        onClick={handleNotificationClick}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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
