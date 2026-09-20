import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from './layout/MainLayout';
import { Button, Card } from './common';
import { reservationAPI } from '../services/api';

const formatTime = (t) => {
  if (!t || !t.includes(':')) return t || '—';
  const [h, m] = t.split(':');
  const hour = Number(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m} ${period}`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatBookingRef = (id) => {
  if (!id) return '—';
  return `RS-${id.toString().slice(-8).toUpperCase()}`;
};

const isUpcoming = (journeyDate) => {
  if (!journeyDate) return true;
  const tripDate = new Date(journeyDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tripDate >= today;
};

export const MyBookings = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'upcoming' | 'past'
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await reservationAPI.getMy();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error('Failed to load reservations:', error);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredReservations = reservations.filter((res) => {
    const snap = res.busSnapshot || {};
    const tripUpcoming = isUpcoming(snap.journeyDate);

    if (activeTab === 'upcoming' && !tripUpcoming) return false;
    if (activeTab === 'past' && tripUpcoming) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const ref = formatBookingRef(res._id).toLowerCase();
      const source = (snap.source || '').toLowerCase();
      const destination = (snap.destination || '').toLowerCase();
      const operator = (snap.operator || '').toLowerCase();
      const busNumber = (snap.busNumber || '').toLowerCase();
      return (
        ref.includes(q) ||
        source.includes(q) ||
        destination.includes(q) ||
        operator.includes(q) ||
        busNumber.includes(q)
      );
    }

    return true;
  });

  const upcomingCount = reservations.filter((r) => isUpcoming(r.busSnapshot?.journeyDate)).length;
  const pastCount = reservations.length - upcomingCount;

  return (
    <MainLayout maxWidth="1100px">
      <div className="my-bookings-page">
        {/* Page Header */}
        <div className="bookings-page-header">
          <div className="header-info">
            <span className="eyebrow-label">RESERVATIONS & TICKETS</span>
            <h1 className="page-title">My Bookings & Schedule</h1>
            <p className="page-subtitle">
              Manage your reserved seats, view bus departure schedules, and access digital e-tickets.
            </p>
          </div>

          <div className="header-actions">
            <Button
              variant="primary"
              onClick={() => navigate('/search')}
              leftIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            >
              Book New Trip
            </Button>
          </div>
        </div>

        {/* Filters & Tabs */}
        <div className="bookings-toolbar">
          <div className="bookings-tabs">
            <button
              type="button"
              className={`booking-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Bookings
              <span className="tab-badge">{reservations.length}</span>
            </button>
            <button
              type="button"
              className={`booking-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming Trips
              <span className="tab-badge badge-green">{upcomingCount}</span>
            </button>
            <button
              type="button"
              className={`booking-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Past Journeys
              <span className="tab-badge">{pastCount}</span>
            </button>
          </div>

          <div className="bookings-search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by city, operator, or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bookings-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="bookings-loading-state">
            <div className="seat-loading-spinner" />
            <p>Loading your bookings and schedules…</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <Card variant="glass" className="bookings-empty-card">
            <div className="empty-icon-circle">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h3>No Bookings Found</h3>
            <p>
              {searchTerm
                ? `No reservations matching "${searchTerm}". Try a different search term.`
                : activeTab === 'upcoming'
                ? "You don't have any upcoming bus journeys scheduled."
                : activeTab === 'past'
                ? "You don't have any past journey history yet."
                : "You haven't reserved any bus seats yet. Find your route and book your seats now!"}
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/search')}
              leftIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            >
              Search Available Buses
            </Button>
          </Card>
        ) : (
          <div className="bookings-list">
            {filteredReservations.map((res) => {
              const snap = res.busSnapshot || {};
              const tripUpcoming = isUpcoming(snap.journeyDate);
              const bookingRef = formatBookingRef(res._id);

              return (
                <div key={res._id} className="my-booking-card">
                  {/* Card Top Row */}
                  <div className="booking-card-top">
                    <div className="booking-ref-group">
                      <div className="bus-operator-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" />
                          <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
                        </svg>
                        <strong>{snap.operator || 'Express Coach'}</strong>
                      </div>
                      <span className="booking-ref-tag">Ref: {bookingRef}</span>
                      <span className="coach-type-pill">{snap.coachType || 'Standard'}</span>
                    </div>

                    <div className="booking-status-group">
                      <span className={`status-pill ${tripUpcoming ? 'status-pill-upcoming' : 'status-pill-past'}`}>
                        {tripUpcoming ? 'Upcoming Journey' : 'Completed Trip'}
                      </span>
                      <span className="status-pill status-pill-confirmed">✓ Confirmed</span>
                    </div>
                  </div>

                  {/* Route & Schedule Row */}
                  <div className="booking-schedule-row">
                    <div className="schedule-station origin-station">
                      <span className="station-label">ORIGIN / DEPARTURE</span>
                      <h3 className="station-name">{snap.source || '—'}</h3>
                      <div className="schedule-time-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <strong>{formatTime(snap.departureTime)}</strong>
                      </div>
                    </div>

                    <div className="schedule-timeline">
                      <div className="timeline-date">{formatDate(snap.journeyDate)}</div>
                      <div className="timeline-track">
                        <span className="timeline-dot dot-start" />
                        <div className="timeline-line">
                          <span className="timeline-bus-icon">🚌</span>
                        </div>
                        <span className="timeline-dot dot-end" />
                      </div>
                      <span className="timeline-duration">{snap.duration || 'Direct Route'}</span>
                    </div>

                    <div className="schedule-station destination-station">
                      <span className="station-label">DESTINATION / ARRIVAL</span>
                      <h3 className="station-name">{snap.destination || '—'}</h3>
                      <div className="schedule-time-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <strong>{formatTime(snap.arrivalTime)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details Footer */}
                  <div className="booking-card-footer">
                    <div className="booking-meta-chips">
                      <div className="meta-chip">
                        <span className="meta-chip-label">Reserved Seats:</span>
                        <div className="meta-seats-list">
                          {res.seats?.map((seat) => (
                            <span key={seat} className="meta-seat-badge">
                              Seat {seat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="meta-chip">
                        <span className="meta-chip-label">Passenger:</span>
                        <strong className="meta-chip-val">{res.passengerName}</strong>
                      </div>

                      <div className="meta-chip">
                        <span className="meta-chip-label">Bus No:</span>
                        <strong className="meta-chip-val">{snap.busNumber || '—'}</strong>
                      </div>

                      <div className="meta-chip">
                        <span className="meta-chip-label">Total Fare:</span>
                        <strong className="meta-chip-val fare-highlight">৳{res.totalFare}</strong>
                      </div>
                    </div>

                    <div className="booking-card-actions">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/booking/${res._id}`, { state: { reservation: res } })}
                        leftIcon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 12h19.6" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
                          </svg>
                        }
                      >
                        View E-Ticket
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyBookings;
