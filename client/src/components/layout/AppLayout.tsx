import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * AppLayout Component
 * Parent layout for all protected routes.
 * File limit rule: < 150 lines.
 */

const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className={`app-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <main className="main-container">
        <Header />
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
