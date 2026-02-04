
//--------------------------------19/01--------------------5.21-----------------

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  FolderOpen,
  UserCheck,
  User,
  BriefcaseBusiness,
  GraduationCap,
  X,
  ChevronLeft,
  ChevronRight,
  Building
} from 'lucide-react';
import styles from './Sidebar.module.scss';
import logo from '/Logo.png';
import { useAuth } from '../../context/AuthContext';

function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }) {
  const { user } = useAuth();

  // Safety check: if user data isn't loaded yet, don't crash
  if (!user) return null;

  let menuItems = [];

  if (user.role === "Admin") {
    menuItems = [
      { path: '/', icon: Home, label: 'Dashboard' },
      { path: '/members', icon: Users, label: 'Members' },
      { path: '/mentors', icon: GraduationCap, label: 'Mentors' },
      { path: '/recruiters', icon: Building, label: 'Job Recruiter' },
      { path: '/referees', icon: UserCheck, label: 'Job Referee' },
      { path: '/createUser', icon: User, label: 'Create new user' },
      { path: '/jobs', icon: BriefcaseBusiness, label: 'Jobs' },
    ];
  } else if (["Member", "Mentor", "Job", "Candidate"].includes(user.role)) {
    // Ensure memberId is valid before using it in the path
    const profilePath = (user.memberId && user.memberId !== 'null' && user.memberId !== 'undefined')
      ? `/member/${user.memberId}`
      : '/member/me';

    menuItems = [
      { path: '/', icon: Home, label: 'Dashboard' },
      { path: profilePath, icon: FolderOpen, label: 'Profile' },
      { path: '/mentors', icon: GraduationCap, label: 'Mentors' },
      { path: '/jobs', icon: BriefcaseBusiness, label: 'Jobs' }
    ];
  }
  else if (user.role === "IT_Member") {
    // Optional: Add logic for IT_Member if they have a different view
    menuItems = [
      { path: '/', icon: Home, label: 'Dashboard' },
      { path: '/members', icon: Users, label: 'Members' },
      { path: '/jobs', icon: BriefcaseBusiness, label: 'Jobs' },
    ];
  }

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={`${styles.logo} ${isCollapsed ? styles.hideLogo : ''}`}>
          <img src={logo} alt="JobBridge Logo" width={200} className={styles.logoImg} />
        </div>

        <div className={styles.collapseToggle}>
          <button className={styles.collapseIcon} onClick={onToggleCollapse}>
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose} // Closes sidebar on mobile when clicked
          >
            <item.icon size={20} className={styles.icon} />
            {!isCollapsed && <span className={styles.label}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;