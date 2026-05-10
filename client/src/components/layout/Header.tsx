import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, Wifi, Home, ChevronRight, User as UserIcon, Menu } from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuthStore';
import '../../styles/layout/Header.css';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  tasks: 'Tasks',
  'grade-planner': 'Grade Planner',
  burnout: 'Burnout',
  analytics: 'Analytics',
  'ai-assistant': 'AI Assistant',
  settings: 'Settings',
  profile: 'Profile',
};

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { notificationApi } = await import('../../api/notificationApi');
        const { data } = await notificationApi.getNotifications();
        setNotifications(data.data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      const { notificationApi } = await import('../../api/notificationApi');
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const { notificationApi } = await import('../../api/notificationApi');
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn mobile-only" onClick={onMobileMenuToggle} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <nav className="breadcrumbs">
          <Link to="/dashboard" className="breadcrumb-link">
            <Home size={15} />
          </Link>
          {segments.map((seg, i) => (
            <React.Fragment key={seg}>
              <ChevronRight size={14} className="breadcrumb-sep" />
              {i === segments.length - 1 ? (
                <span className="breadcrumb-current">{routeLabels[seg] || seg}</span>
              ) : (
                <Link to={`/${seg}`} className="breadcrumb-link">
                  {routeLabels[seg] || seg}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <Search size={16} />
          <input type="text" placeholder="Search tasks, notes, or grades..." />
        </div>
      </div>

      <div className="header-right">
        <div className="sync-status">
          <Wifi size={14} />
          <span>Synced</span>
        </div>
        <div className="notification-wrapper">
          <button className="header-action-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <h4>Notifications</h4>
                <button className="btn-mark-read" onClick={handleMarkAllRead}>Mark all as read</button>
              </div>
              <div className="dropdown-body">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n._id} 
                      className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                      onClick={() => handleMarkRead(n._id)}
                    >
                      <div className="notif-content">
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                        <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notif-empty">No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>
        <Link to="/profile" className="header-user-profile">
          <div className="header-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <UserIcon size={18} />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
