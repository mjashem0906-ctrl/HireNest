//------------------20/01-----------------12.37--------------------

import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styles from './Layout.module.scss';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Define static titles for exact path matches
  const staticTitles = {
    '/': 'Dashboard',
    '/members': 'Members',
    '/projects': 'Projects',
    '/tasks': 'Tasks',
    '/subtasks': 'Subtasks',
    '/settings': 'Settings',
    '/assignFor': 'AssignFor',
    '/memberComments': 'About Members',
    '/mentors': 'Mentors',
    '/referees': 'Job Referees',
    '/recruiters': 'Job Recruiter',
    '/job-seekers': 'Job Seekers',
    '/createUser': 'Create new user',
  };

  const getPageTitle = () => {
    const path = location.pathname;
    // 1. Check for exact matches first
    if (staticTitles[path]) return staticTitles[path];

    // 2. Check for dynamic/nested routes
    if (path.startsWith('/member/')) return 'Member';
    if (path.startsWith('/project/')) return 'Project';
    if (path.startsWith('/task/')) return 'Task';
    if (path.startsWith('/subtask/')) return 'SubTask';
    if (path.startsWith('/assignFor/')) return 'AssignFor';
    if (path.startsWith('/jobs')) return 'Jobs';
    if (path.startsWith('/status-requests')) return 'Status Requests';
    if (path.startsWith('/membersWorking')) return 'Members Working in Tasks';
    if (path.startsWith('/mentors')) return 'Mentors';
    if (path.startsWith('/referees')) return 'Job Referees';
    if (path.startsWith('/recruiters')) return 'Job Recruiter';
    if (path.startsWith('/job-seekers')) return 'Job Seekers';
    if (path.startsWith('/createUser')) return 'Create new user';

    // 3. Fallback
    return 'Dashboard';
  };

  return (
    <div className={`${styles.layout} ${sidebarCollapsed ? styles.collapsed : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      
      <div className={styles.main}>
        <Header 
          title={getPageTitle()} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className={styles.content}>
          <Outlet context={{ sidebarCollapsed }} />
        </main>
      </div>

      {sidebarOpen && (
        <div 
          className={styles.overlay} 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
    </div>
  );
}

export default Layout;