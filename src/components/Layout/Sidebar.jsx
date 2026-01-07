import React from 'react';
import { NavLink } from 'react-router-dom';
// Ensure GraduationCap is imported
import { Home, Users, FolderOpen, CheckSquare, List, X, Settings, UserCheck, ClipboardCheck, User, BriefcaseBusiness, GraduationCap } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Sidebar.module.scss';
import logo from '/Logo.png';
import { useAuth } from '../../context/AuthContext';

function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }) {
  const { user } = useAuth();

  let menuItems = [];
  
  if (user.role === "Admin") {
    menuItems = [
      { path: '/', icon: Home, label: 'Dashboard' },
      { path: '/members', icon: Users, label: 'Members', adminOnly: true },
      // Admin sees Mentors
      { path: '/mentors', icon: GraduationCap, label: 'Mentors', adminOnly: true }, 
      { path: '/referees', icon: UserCheck, label: 'Referees', adminOnly: true },
      { path: '/createUser', icon: User, label: 'Create new user', adminOnly: true },
      { path: '/jobs', icon: BriefcaseBusiness, label: 'Jobs', adminOnly: true },
    ];
  }
  else if(user.role === "Member"){
   menuItems=[
     { path: `/member/${user.memberId}`, icon: FolderOpen, label: 'Profile' },
     // ✅ ADDED: Members can now see Mentors in sidebar
     { path: '/mentors', icon: GraduationCap, label: 'Mentors' }, 
     { path: '/jobs', icon: BriefcaseBusiness, label: 'Jobs'}
   ] 
  }

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={`${styles.logo} ${isCollapsed ? styles.hideLogo : ''}`}>
          <img src={logo} alt="Logo" width={200} className={styles.logoImg} />
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
        {menuItems.map((item) => {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={onClose}
            >
              <item.icon size={20} className={styles.icon} />
              {!isCollapsed && <span className={styles.label}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;