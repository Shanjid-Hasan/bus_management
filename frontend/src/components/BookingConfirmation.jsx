import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from './layout/MainLayout';
import { Button } from './common';
import { reservationAPI } from '../services/api';

const formatTime = (t) => {
  if (!t || !t.includes(':')) return t || '';
  const [h, m] = t.split(':');
  const hour = Number(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m} ${period}`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
};

const formatBookingRef = (id) => {
  if (!id) return '—';
  return `RS-${id.toString().slice(-8).toUpperCase()}`;
};

const BookingConfirmation = () => {
  const { reservationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(location.state?.reservation || null);
  const [loading, setLoading] = useState(!location.state?.reservation);

  useEffect(() => {
    if (!reservation && reservationId) {
      setLoading(true);
      reservationAPI
        .getOne(reservationId)
        .then(({ data }) => setReservation(data.reservation))
        .catch(() => {
          toast.error('Could not load booking details');
          navigate('/dashboard');
        })
        .finally(() => setLoading(false));
    }
  }, [reservationId, reservation, navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="seat-loading">
          <div className="seat-loading-spinner" />
          <p>Loading your booking…</p>
        </div>
      </MainLayout>
    );
  }

  if (!reservation) return null;

  const snap = reservation.busSnapshot || {};

  return (
    <MainLayout>
      <div className="booking-page-wrapper">
        {/* ── Success banner ── */}
        <div className="booking-success-banner">
          <div className="booking-success-icon">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h1 className="booking-success-title">Booking Confirmed!</h1>
            <p className="booking-success-sub">Your seats are reserved. Have a safe journey 🚌</p>
          </div>
        </div>

        {/* ── E-Ticket Card ── */}
        <div className="ticket-card" id="ticketCard">
          {/* Ticket header */}
          <div className="ticket-header">
            <div className="ticket-brand">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" />
                <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
                <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
              </svg>
              <span className="ticket-brand-name">RideSmart</span>
            </div>
            <div className="ticket-ref-block">
              <span className="ticket-ref-label">Booking Ref</span>
              <span className="ticket-ref-code">{formatBookingRef(reservation._id)}</span>
            </div>
            <span className={`ticket-status-badge ${reservation.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled'}`}>
              {reservation.status === 'confirmed' ? '✓ Confirmed' : '✗ Cancelled'}
            </span>
          </div>

          {/* Tear line */}
          <div className="ticket-tear" aria-hidden="true">
            <div className="tear-circle tear-left" /><div className="tear-line" /><div className="tear-circle tear-right" />
          </div>

          {/* Route & timing */}
          <div className="ticket-route-section">
            <div className="ticket-city-block">
              <span className="ticket-city-label">FROM</span>
              <strong className="ticket-city-name">{snap.source || '—'}</strong>
              <span className="ticket-city-time">{formatTime(snap.departureTime)}</span>
            </div>
            <div className="ticket-route-mid">
              <div className="ticket-route-line">
                <span className="ticket-route-dot" />
                <div className="ticket-route-track">
                  <span className="ticket-route-bus-icon">🚌</span>
                </div>
                <span className="ticket-route-dot" />
              </div>
              <span className="ticket-route-duration">{snap.duration || '—'}</span>
            </div>
            <div className="ticket-city-block ticket-city-right">
              <span className="ticket-city-label">TO</span>
              <strong className="ticket-city-name">{snap.destination || '—'}</strong>
              <span className="ticket-city-time">{formatTime(snap.arrivalTime)}</span>
            </div>
          </div>

          {/* Details grid */}
          <div className="ticket-details-grid">
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Date</span>
              <span className="ticket-detail-value">{formatDate(snap.journeyDate)}</span>
            </div>
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Operator</span>
              <span className="ticket-detail-value">{snap.operator || '—'}</span>
            </div>
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Bus No.</span>
              <span className="ticket-detail-value">{snap.busNumber || '—'}</span>
            </div>
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Coach</span>
              <span className="ticket-detail-value">{snap.coachType || '—'}</span>
            </div>
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Seats</span>
              <span className="ticket-detail-value ticket-seats-value">
                {reservation.seats?.map((s) => (
                  <span key={s} className="ticket-seat-chip">Seat {s}</span>
                ))}
              </span>
            </div>
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Passenger</span>
              <span className="ticket-detail-value">{reservation.passengerName || '—'}</span>
            </div>
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Phone</span>
              <span className="ticket-detail-value">{reservation.passengerPhone || '—'}</span>
            </div>
            {reservation.passengerEmail && (
              <div className="ticket-detail-item">
                <span className="ticket-detail-label">Email</span>
                <span className="ticket-detail-value">{reservation.passengerEmail}</span>
              </div>
            )}
          </div>

          {/* Tear line bottom */}
          <div className="ticket-tear" aria-hidden="true">
            <div className="tear-circle tear-left" /><div className="tear-line" /><div className="tear-circle tear-right" />
          </div>

          {/* Fare footer */}
          <div className="ticket-fare-footer">
            <div className="ticket-fare-breakdown">
              <span>{reservation.seats?.length || 0} seat{(reservation.seats?.length || 0) > 1 ? 's' : ''} × ৳{snap.fare || 0}</span>
            </div>
            <div className="ticket-total-block">
              <span className="ticket-total-label">Total Paid</span>
              <strong className="ticket-total-amount">৳{reservation.totalFare || 0}</strong>
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="booking-actions">
          <Button
            variant="outline"
            onClick={() => window.print()}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
            }
          >
            Print Ticket
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/my-bookings')}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            }
          >
            My Bookings & Schedules
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            }
          >
            Back to Dashboard
          </Button>
        </div>

        <p className="booking-booked-note">
          Booking ID: <code>{reservation._id}</code> · Booked on {new Date(reservation.createdAt).toLocaleString('en-US')}
        </p>
      </div>
    </MainLayout>
  );
};

export default BookingConfirmation;
