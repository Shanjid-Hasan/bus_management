import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Reusable Navigation Drawer / Sidebar Component
 * @param {boolean} isOpen - Drawer visibility state
 * @param {Function} onClose - Handler to close drawer
 */
export const NavigationDrawer = ({ isOpen, onClose }) => {
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
    if (onClose) onClose();
  };

  const handleSearchBus = () => {
    navigate('/search');
    if (onClose) onClose();
  };

  const canManageBuses = user?.role === 'admin' || user?.role === 'manager';

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      <div
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer Container */}
      <aside className={`nav-drawer ${isOpen ? 'open' : ''}`}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <Link to="/dashboard" className="drawer-brand" onClick={onClose}>
            <div className="brand-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" />
                <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
                <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
              </svg>
            </div>
            <div className="drawer-brand-text">
              <span className="brand-title">RideSmart</span>
              <span className="brand-sub">Bus Management</span>
            </div>
          </Link>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer Navigation List */}
        <div className="drawer-body">
          <div className="drawer-menu-section">
            <span className="drawer-section-title">Main Navigation</span>

            <Link
              to="/dashboard"
              className={`drawer-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={onClose}
            >
              <div className="drawer-link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="drawer-link-label">Home Dashboard</span>
            </Link>

            <button
              type="button"
              className="drawer-link drawer-action-btn"
              onClick={handleSearchBus}
            >
              <div className="drawer-link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <span className="drawer-link-label">Search Bus</span>
            </button>

            <Link
              to="/profile"
              className={`drawer-link ${location.pathname === '/profile' ? 'active' : ''}`}
              onClick={onClose}
            >
              <div className="drawer-link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>
              <span className="drawer-link-label">My Profile</span>
            </Link>

            {canManageBuses && (
              <Link
                to="/bus-management"
                className={`drawer-link ${location.pathname === '/bus-management' ? 'active' : ''}`}
                onClick={onClose}
              >
                <div className="drawer-link-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" />
                    <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
                    <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
                  </svg>
                </div>
                <span className="drawer-link-label">Bus Management</span>
              </Link>
            )}
          </div>

          <div className="drawer-menu-section">
            <span className="drawer-section-title">Future Modules</span>

            <div className="drawer-link disabled" title="Coming soon with other team members">
              <div className="drawer-link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className="drawer-link-label-group">
                <span className="drawer-link-label">My Bookings</span>
                <span className="drawer-chip chip-soon">Soon</span>
              </div>
            </div>

            <div className="drawer-link disabled" title="Coming soon with other team members">
              <div className="drawer-link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
              </div>
              <div className="drawer-link-label-group">
                <span className="drawer-link-label">Fleet Routes</span>
                <span className="drawer-chip chip-soon">Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer User Footer */}
        <div className="drawer-footer">
          <Link to="/profile" className="drawer-user-info" onClick={onClose}>
            <div className="user-avatar-sm">{getInitials()}</div>
            <div className="user-text-info">
              <span className="user-display-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-display-email">{user?.email}</span>
            </div>
          </Link>

          <button
            type="button"
            className="drawer-logout-btn"
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
};

export default NavigationDrawer;
