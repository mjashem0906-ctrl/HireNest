import React from 'react'
import  { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styles from './Layout.module.scss'
import Sidebar from './Sidebar';
import Header from './Header';

function Layout({children}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();


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
  '/referees': 'Referees',
};

const getPageTitle = () => {
  const path = location.pathname;
  if (staticTitles[path]) return staticTitles[path];
  if (path.startsWith('/member/')) return 'Member';
  if (path.startsWith('/project/')) return 'Project';
  if (path.startsWith('/task/')) return 'Task';
  if (path.startsWith('/subtask/')) return 'SubTask';
  if (path.startsWith('/assignFor/')) return 'AssignFor';
  if (path.startsWith('/jobs')) return 'Jobs';
  if (path.startsWith('/status-requests')) return 'Status Requests'
  if (path.startsWith('/membersWorking')) return 'Members Working in Tasks';
  if (path.startsWith('/mentors')) return 'Mentors';
  if (path.startsWith('/referees')) return 'Referees';

  return 'Dashboard';
};


  return (
    <div className={`${styles.layout} ${sidebarCollapsed ? styles.collapsed : ''}`}>
      <Sidebar
  isOpen={sidebarOpen}
  isCollapsed={sidebarCollapsed}
  onClose={() => setSidebarOpen(false)}
  onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
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
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

export default Layout