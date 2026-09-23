import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  FolderOpen,
  UserCheck,
  User,
  BriefcaseBusiness,
  Briefcase,
  GraduationCap,
  X,
  ChevronLeft,
  ChevronRight,
  Building,
  Settings,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import styles from './Sidebar.module.scss';
import logo from '/Logo.png';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Safety check: if user data isn't loaded yet, don't crash
  if (!user) return null;

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Something went wrong while logging out.");
    }
  };

  let menuItems = [];

  if (user.role === "Admin") {
    menuItems = [
      { path: '/', icon: Home, label: 'Dashboard' },
      { path: '/members', icon: Users, label: 'Members' },
      { path: '/job-seekers', icon: Briefcase, label: 'Job Seekers' },
      { path: '/mentors', icon: GraduationCap, label: 'Mentors' },
      { path: '/recruiters', icon: Building, label: 'Job Recruiter' },
      { path: '/referees', icon: UserCheck, label: 'Job Referee' },
      { path: '/createUser', icon: User, label: 'Create new user', hidden: true },
      { path: '/jobs', icon: BriefcaseBusiness, label: 'Jobs' },
      { path: '/settings', icon: Settings, label: 'Settings' },
    ];
  } else if (user.role === "Recruiter") {
    const recruiterProfilePath = user.recruiterId ? `/recruiters/${user.recruiterId}` : '/recruiters';
    menuItems = [
      { path: '/recruiter-dashboard', icon: Home, label: 'Dashboard' },
      { path: '/jobs', icon: BriefcaseBusiness, label: 'Jobs' },
      { path: recruiterProfilePath, icon: Building, label: 'Profile' },
    ];
  } else if (["Member", "Mentor", "Job", "Candidate"].includes(user.role)) {
    const profilePath = (user.memberId && user.memberId !== 'null' && user.memberId !== 'undefined')
      ? `/member/${user.memberId}`
      : '/member/me';

    menuItems = [
      { path: '/', icon: Home, label: 'Dashboard' },
      { path: profilePath, icon: FolderOpen, label: 'Profile' },
      { path: '/mentors', icon: GraduationCap, label: 'Mentors' },
      { path: '/jobs', icon: BriefcaseBusiness, label: 'Jobs' }
    ];
  } else if (user.role === "IT_Member") {
    menuItems = [
      { path: '/', icon: Home, label: 'Dashboard' },
      { path: '/members', icon: Users, label: 'Members' },
      { path: '/job-seekers', icon: Briefcase, label: 'Job Seekers' },
      { path: '/jobs', icon: BriefcaseBusiness, label: 'Jobs' },
    ];
  }

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Header with Logo Emblem, Title & Collapse Toggle */}
      <div className={styles.header}>
        <div className={styles.brandWrapper}>
          <div className={styles.logoBadge}>
            <img src={logo} alt="Hirenest" className={styles.logoEmblem} />
          </div>
          {!isCollapsed && <span className={styles.brandTitle}>Hirenest</span>}
        </div>

        <button
          type="button"
          className={styles.collapseBtn}
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation list */}
      <nav className={styles.nav}>
        {menuItems.filter(item => !item.hidden).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon size={19} className={styles.icon} />
            {!isCollapsed && <span className={styles.label}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer Area: Logout & Theme Toggle Switch */}
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
          title={isCollapsed ? "Log out" : undefined}
        >
          <LogOut size={19} className={styles.icon} />
          {!isCollapsed && <span className={styles.label}>Log out</span>}
        </button>

        <div className={styles.themeToggleWrapper}>
          {!isCollapsed ? (
            <div
              className={styles.themeSwitchPill}
              onClick={toggleTheme}
              role="button"
              tabIndex={0}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleTheme();
              }}
            >
              <div
                className={`${styles.themeOption} ${
                  theme !== 'dark' ? styles.activeThemeOption : ''
                }`}
              >
                <Sun size={15} />
              </div>
              <div
                className={`${styles.themeOption} ${
                  theme === 'dark' ? styles.activeThemeOption : ''
                }`}
              >
                <Moon size={15} />
              </div>
            </div>
          ) : (
            <button
              type="button"
              className={styles.collapsedThemeBtn}
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;