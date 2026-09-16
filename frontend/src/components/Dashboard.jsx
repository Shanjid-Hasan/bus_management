import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from './layout/MainLayout';
import { Button, Card } from './common';
import toast from 'react-hot-toast';

const POPULAR_ROUTES = [
  {
    id: 'dhk-raj',
    from: 'Dhaka',
    to: 'Rajshahi',
    duration: '5h 30m',
    dailyBuses: 14,
    startingFare: '৳650',
    type: 'AC & Non-AC',
    tag: 'Trending',
  },
  {
    id: 'dhk-ctg',
    from: 'Dhaka',
    to: 'Chittagong',
    duration: '4h 45m',
    dailyBuses: 26,
    startingFare: '৳750',
    type: 'Luxury Coach & AC',
    tag: 'Popular',
  },
  {
    id: 'dhk-syl',
    from: 'Dhaka',
    to: 'Sylhet',
    duration: '5h 15m',
    dailyBuses: 18,
    startingFare: '৳700',
    type: 'AC Express',
    tag: 'Featured',
  },
];

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManageBuses = user?.role === 'admin' || user?.role === 'manager';

  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSearchBus = (e) => {
    if (e) e.preventDefault();
    navigate('/search', { state: searchParams });
  };

  const handleSelectRoute = (route) => {
    setSearchParams((prev) => ({
      ...prev,
      from: route.from,
      to: route.to,
    }));
    toast.success(`Selected route: ${route.from} → ${route.to}`);
  };

  return (
    <MainLayout>
      {/* Bus Search Box Section */}
      <Card variant="glass" className="search-bus-card">
        <div className="search-card-header">
          <div className="search-header-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h3>Find Your Bus Journey</h3>
          </div>
          <span className="search-badge">Live Schedules</span>
        </div>

        <form className="search-bus-form" onSubmit={handleSearchBus}>
          <div className="search-inputs-grid">
            <div className="search-input-box">
              <label className="search-input-label">From</label>
              <div className="search-input-inner">
                <svg className="search-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                </svg>
                <input
                  type="text"
                  className="search-field-control"
                  placeholder="e.g. Dhaka"
                  value={searchParams.from}
                  onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                />
              </div>
            </div>

            <div className="search-input-box">
              <label className="search-input-label">To</label>
              <div className="search-input-inner">
                <svg className="search-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <input
                  type="text"
                  className="search-field-control"
                  placeholder="e.g. Rajshahi, Chittagong..."
                  value={searchParams.to}
                  onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                />
              </div>
            </div>

            <div className="search-input-box">
              <label className="search-input-label">Journey Date</label>
              <div className="search-input-inner">
                <svg className="search-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                <input
                  type="date"
                  className="search-field-control"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="search-submit-btn"
            id="searchBusMainBtn"
            leftIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          >
            Search Bus
          </Button>
        </form>
      </Card>

      {/* Quick Actions */}
      <section className="section-block">
        <div className="section-header">
          <h3 className="section-title">Quick Actions</h3>
          <span className="section-subtitle">Frequently accessed tools</span>
        </div>

        <div className="quick-actions-grid">
          <div className="quick-action-card quick-action-search" onClick={() => navigate('/search')}>
            <div className="quick-action-icon search-icon-bg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div className="quick-action-details">
              <h4>Search Bus</h4>
              <p>Browse routes, schedules, and book seats easily</p>
            </div>
            <span className="action-arrow">→</span>
          </div>

          <div className="quick-action-card quick-action-profile" onClick={() => navigate('/profile')}>
            <div className="quick-action-icon profile-icon-bg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            </div>
            <div className="quick-action-details">
              <h4>My Profile</h4>
              <p>View & edit your personal info and phone</p>
            </div>
            <span className="action-arrow">→</span>
          </div>

          {canManageBuses && (
            <div className="quick-action-card quick-action-mgmt" onClick={() => navigate('/bus-management')}>
              <div className="quick-action-icon mgmt-icon-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" />
                  <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
                  <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
                </svg>
              </div>
              <div className="quick-action-details">
                <h4>Bus Management</h4>
                <p>Add, edit, and retire buses in the live fleet</p>
              </div>
              <span className="action-arrow">→</span>
            </div>
          )}
        </div>
      </section>

      {/* Popular Routes */}
      <section className="section-block">
        <div className="section-header">
          <div>
            <h3 className="section-title">Popular Routes</h3>
            <p className="section-subtitle">Top traveling destinations with high frequency trips</p>
          </div>
        </div>

        <div className="popular-routes-grid">
          {POPULAR_ROUTES.map((route) => (
            <Card key={route.id} variant="interactive" className="route-card" onClick={() => handleSelectRoute(route)}>
              <div className="route-card-top">
                <span className={`route-tag tag-${route.tag.toLowerCase()}`}>{route.tag}</span>
                <span className="route-fare">{route.startingFare} <small>/ seat</small></span>
              </div>

              <div className="route-direction">
                <div className="route-city from-city">
                  <span className="city-dot" />
                  <strong>{route.from}</strong>
                </div>

                <div className="route-line-container">
                  <span className="route-duration">{route.duration}</span>
                  <div className="route-line">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>

                <div className="route-city to-city">
                  <span className="city-dot to-dot" />
                  <strong>{route.to}</strong>
                </div>
              </div>

              <div className="route-card-footer">
                <div className="route-info-meta">
                  <span className="route-buses-count">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 6v6" /><path d="M15 6v6" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
                    </svg>
                    {route.dailyBuses} Daily Buses
                  </span>
                  <span className="route-coach-type">{route.type}</span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="route-select-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRoute(route);
                    navigate('/search', { state: { from: route.from, to: route.to, date: searchParams.date } });
                  }}
                >
                  Select Route
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </MainLayout>
  );
};

export default Dashboard;
