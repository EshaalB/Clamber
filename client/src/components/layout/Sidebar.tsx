import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  CheckSquare,
  GraduationCap, 
  Flame,
  BarChart3,
  MessageSquare, 
  Users,
  Settings,
  Mountain,
  LogOut,
  User,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuthStore';
import '../../styles/layout/Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, isMobileOpen, onMobileClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const isAdvisor = user?.role === 'advisor';
  const isAdmin = user?.role === 'admin';
  
  const navItems = isAdmin 
    ? [
        { icon: <Users size={20} />, path: '/admin', label: 'Admin Panel' },
        { icon: <MessageSquare size={20} />, path: '/ai-assistant', label: 'AI Assistant' },
        { icon: <Settings size={20} />, path: '/settings', label: 'Settings' },
        { icon: <User size={20} />, path: '/profile', label: 'Profile' },
      ]
    : isAdvisor 
      ? [
          { icon: <Users size={20} />, path: '/advisor', label: 'Advisor Portal' },
          { icon: <MessageSquare size={20} />, path: '/ai-assistant', label: 'AI Assistant' },
          { icon: <Settings size={20} />, path: '/settings', label: 'Settings' },
          { icon: <User size={20} />, path: '/profile', label: 'Profile' },
        ]
      : [
          { icon: <LayoutGrid size={20} />, path: '/dashboard', label: 'Dashboard' },
          { icon: <CheckSquare size={20} />, path: '/tasks', label: 'Tasks' },
          { icon: <GraduationCap size={20} />, path: '/grade-planner', label: 'Grades' },
          { icon: <Flame size={20} />, path: '/burnout', label: 'Burnout' },
          { icon: <BarChart3 size={20} />, path: '/analytics', label: 'Analytics' },
          { icon: <MessageSquare size={20} />, path: '/ai-assistant', label: 'AI Assistant' },
          { icon: <Settings size={20} />, path: '/settings', label: 'Settings' },
          { icon: <User size={20} />, path: '/profile', label: 'Profile' },
        ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        {isCollapsed ? (
          <button className="sidebar-toggle-collapsed" onClick={onToggle}>
            <Menu size={24} color="var(--active-accent)" />
          </button>
        ) : (
          <>
            <NavLink to="/dashboard" className="logo-link">
              <div className="logo-circle">
                <Mountain size={24} color="var(--active-accent)" />
              </div>
              <span className="logo-text">Clamber</span>
            </NavLink>
            <button className="sidebar-toggle desktop-only" onClick={onToggle}>
              <ChevronLeft size={20} />
            </button>
            <button className="sidebar-toggle mobile-close-btn mobile-only" onClick={onMobileClose}>
              <X size={20} />
            </button>
          </>
        )}
      </div>

      <nav className="sidebar-menu">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? item.label : ''}
            onClick={onMobileClose}
          >
            <span className="item-icon">{item.icon}</span>
            {!isCollapsed && <span className="item-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-item btn-logout" onClick={handleLogout} title={isCollapsed ? 'Logout' : ''}>
          <span className="item-icon"><LogOut size={20} /></span>
          {!isCollapsed && <span className="item-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
