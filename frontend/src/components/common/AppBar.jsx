import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Reusable App Bar / Header Component
 * @param {Function} onToggleDrawer - Function to toggle mobile / sidebar drawer
 */
export const AppBar = ({ onToggleDrawer }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const handleSearchBusClick = () => {
    navigate('/search');
  };

  const canManageBuses = user?.role === 'admin' || user?.role === 'manager';

  return (
    <header className="app-bar">
      <div className="app-bar-left">
        {/* Mobile/Drawer Toggle Button */}
        <button
          type="button"
          className="app-bar-drawer-btn"
          onClick={onToggleDrawer}
          aria-label="Toggle navigation drawer"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Brand */}
        <Link to="/dashboard" className="app-bar-brand">
          <div className="brand-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" />
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
              <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
            </svg>
          </div>
          <span className="brand-logo-text">RideSmart</span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="app-bar-nav">
        <Link
          to="/dashboard"
          className={`app-bar-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </Link>

        <button
          type="button"
          onClick={handleSearchBusClick}
          className="app-bar-nav-link search-bus-nav-btn"
          title="Search Bus"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search Bus</span>
        </button>

        <Link
          to="/profile"
          className={`app-bar-nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
          <span>My Profile</span>
        </Link>

        {canManageBuses && (
          <Link
            to="/bus-management"
            className={`app-bar-nav-link ${location.pathname === '/bus-management' ? 'active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" />
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
              <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
            </svg>
            <span>Bus Management</span>
          </Link>
        )}
      </nav>

      {/* User Actions */}
      <div className="app-bar-right">
        <Link to="/profile" className="app-bar-user-badge">
          <div className="user-avatar-sm">{getInitials()}</div>
          <div className="user-text-info">
            <span className="user-display-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-display-role">{user?.role?.toUpperCase() || 'PASSENGER'}</span>
          </div>
        </Link>

        <button
          type="button"
          className="btn-app-logout"
          onClick={handleLogout}
          aria-label="Sign out"
          title="Sign Out"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="logout-text">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default AppBar;
