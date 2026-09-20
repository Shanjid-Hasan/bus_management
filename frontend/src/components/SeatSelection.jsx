import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from './layout/MainLayout';
import { Button, Card } from './common';
import { busAPI, reservationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MAX_SEATS = 4;

// Format 24h "HH:mm" → "HH:mm AM/PM"
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Seat layout: rows of 4 (A-window, B-aisle | C-aisle, D-window)
const buildRows = (totalSeats) => {
  const rows = [];
  let seatNum = 1;
  while (seatNum <= totalSeats) {
    const row = [];
    for (let col = 0; col < 4 && seatNum <= totalSeats; col++) {
      row.push(seatNum++);
    }
    rows.push(row);
  }
  return rows;
};

const SeatSelection = () => {
  const { busId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bus, setBus] = useState(location.state?.bus || null);
  const [loading, setLoading] = useState(!location.state?.bus);
  const [submitting, setSubmitting] = useState(false);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passenger, setPassenger] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState({});

  // Fetch bus details if not passed via navigation state
  useEffect(() => {
    if (!bus && busId) {
      setLoading(true);
      busAPI
        .getOne(busId)
        .then(({ data }) => setBus(data.bus))
        .catch(() => {
          toast.error('Failed to load bus details');
          navigate('/search');
        })
        .finally(() => setLoading(false));
    }
  }, [busId, bus, navigate]);

  const toggleSeat = (seatNum) => {
    if (bus?.bookedSeats?.includes(seatNum)) return; // already booked
    setSelectedSeats((prev) => {
      if (prev.includes(seatNum)) return prev.filter((s) => s !== seatNum);
      if (prev.length >= MAX_SEATS) {
        toast.error(`You can select up to ${MAX_SEATS} seats`);
        return prev;
      }
      return [...prev, seatNum].sort((a, b) => a - b);
    });
  };

  const seatState = (seatNum) => {
    if (bus?.bookedSeats?.includes(seatNum)) return 'booked';
    if (selectedSeats.includes(seatNum)) return 'selected';
    return 'available';
  };

  const validate = () => {
    const errs = {};
    if (!passenger.name.trim()) errs.name = 'Passenger name is required';
    if (!passenger.phone.trim()) errs.phone = 'Phone number is required';
    if (passenger.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email))
      errs.email = 'Invalid email address';
    if (selectedSeats.length === 0) errs.seats = 'Please select at least one seat';
    return errs;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const { data } = await reservationAPI.create({
        busId: bus._id,
        seats: selectedSeats,
        passengerName: passenger.name.trim(),
        passengerPhone: passenger.phone.trim(),
        passengerEmail: passenger.email.trim(),
      });
      toast.success('Booking confirmed! 🎉');
      navigate(`/booking/${data.reservation._id}`, { state: { reservation: data.reservation } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed. Please try again.';
      toast.error(msg);
      // Refresh bus data to get latest booked seats
      busAPI.getOne(busId).then(({ data }) => setBus(data.bus)).catch(() => {});
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="seat-loading">
          <div className="seat-loading-spinner" />
          <p>Loading bus details…</p>
        </div>
      </MainLayout>
    );
  }

  if (!bus) return null;

  const rows = buildRows(bus.totalSeats);
  const totalFare = (bus.fare || 0) * selectedSeats.length;

  return (
    <MainLayout>
      {/* ── Page Header ── */}
      <div className="seat-page-header">
        <button className="seat-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to results
        </button>
        <div className="seat-page-title-block">
          <p className="eyebrow-label">SEAT SELECTION</p>
          <h1 className="page-title">{bus.operator}</h1>
          <p className="page-subtitle">
            {bus.source} → {bus.destination} &nbsp;·&nbsp; {formatDate(bus.journeyDate)}
          </p>
        </div>
      </div>

      <div className="seat-page-layout">
        {/* ── Left: Seat Map ── */}
        <div className="seat-map-column">
          <Card variant="solid" className="seat-map-card">
            <div className="seat-map-header">
              <div className="seat-map-bus-info">
                <span className="seat-bus-number">{bus.busNumber}</span>
                <span className={`seat-coach-badge ${bus.coachType === 'AC' ? 'badge-ac' : 'badge-nonac'}`}>
                  {bus.coachType}
                </span>
              </div>
              <div className="seat-timing-row">
                <span><strong>{formatTime(bus.departureTime)}</strong> {bus.source}</span>
                <span className="seat-timing-arrow">→</span>
                <span><strong>{formatTime(bus.arrivalTime)}</strong> {bus.destination}</span>
                <span className="seat-duration-pill">{bus.duration}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="seat-legend">
              <span className="legend-item"><span className="legend-dot legend-available" />Available</span>
              <span className="legend-item"><span className="legend-dot legend-selected" />Selected</span>
              <span className="legend-item"><span className="legend-dot legend-booked" />Booked</span>
            </div>

            {/* Driver area */}
            <div className="seat-driver-row">
              <div className="seat-driver-icon" aria-label="Driver">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
                <span>Driver</span>
              </div>
              {/* Column labels */}
              <div className="seat-col-labels">
                <span>A</span><span>B</span><span className="seat-aisle-gap" /><span>C</span><span>D</span>
              </div>
            </div>

            {/* Seat grid */}
            <div className="seat-grid">
              {rows.map((row, rowIdx) => (
                <div key={rowIdx} className="seat-row">
                  <span className="seat-row-num">{rowIdx + 1}</span>
                  {row.map((seatNum, colIdx) => {
                    const state = seatState(seatNum);
                    return (
                      <>
                        {colIdx === 2 && <div key={`gap-${rowIdx}`} className="seat-aisle" />}
                        <button
                          key={seatNum}
                          type="button"
                          className={`seat-btn seat-${state}`}
                          onClick={() => toggleSeat(seatNum)}
                          disabled={state === 'booked'}
                          aria-label={`Seat ${seatNum} — ${state}`}
                          title={`Seat ${seatNum}`}
                        >
                          {seatNum}
                        </button>
                      </>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="seat-capacity-bar">
              <div className="seat-capacity-info">
                <span>{bus.availableSeats} of {bus.totalSeats} seats available</span>
                <span>{bus.bookedSeats?.length || 0} booked</span>
              </div>
              <div className="seat-capacity-track">
                <div
                  className="seat-capacity-fill"
                  style={{ width: `${((bus.totalSeats - bus.availableSeats) / bus.totalSeats) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ── Right: Booking Panel ── */}
        <div className="seat-booking-column">
          <form onSubmit={handleBooking}>
            {/* Selected seats summary */}
            <Card variant="solid" className="seat-summary-card">
              <h2 className="seat-panel-title">Your Selection</h2>
              {selectedSeats.length === 0 ? (
                <div className="seat-empty-selection">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <p>Click seats on the map to select them</p>
                  <small>Up to {MAX_SEATS} seats per booking</small>
                </div>
              ) : (
                <>
                  <div className="selected-seats-chips">
                    {selectedSeats.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="selected-seat-chip"
                        onClick={() => toggleSeat(s)}
                        title={`Remove seat ${s}`}
                      >
                        Seat {s} <span className="chip-remove">×</span>
                      </button>
                    ))}
                  </div>
                  <div className="seat-fare-breakdown">
                    <div className="fare-row">
                      <span>{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} × ৳{bus.fare}</span>
                      <strong>৳{totalFare}</strong>
                    </div>
                    <div className="fare-row fare-row-total">
                      <span>Total</span>
                      <strong className="fare-total-amount">৳{totalFare}</strong>
                    </div>
                  </div>
                </>
              )}
              {errors.seats && <p className="seat-field-error">{errors.seats}</p>}
            </Card>

            {/* Passenger details */}
            <Card variant="solid" className="seat-passenger-card">
              <h2 className="seat-panel-title">Passenger Details</h2>

              <div className="seat-form-field">
                <label htmlFor="passengerName">Full Name <span className="required-star">*</span></label>
                <input
                  id="passengerName"
                  type="text"
                  placeholder="Enter full name"
                  value={passenger.name}
                  onChange={(e) => setPassenger((p) => ({ ...p, name: e.target.value }))}
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <p className="seat-field-error">{errors.name}</p>}
              </div>

              <div className="seat-form-field">
                <label htmlFor="passengerPhone">Phone Number <span className="required-star">*</span></label>
                <input
                  id="passengerPhone"
                  type="tel"
                  placeholder="e.g. 01XXXXXXXXX"
                  value={passenger.phone}
                  onChange={(e) => setPassenger((p) => ({ ...p, phone: e.target.value }))}
                  className={errors.phone ? 'input-error' : ''}
                />
                {errors.phone && <p className="seat-field-error">{errors.phone}</p>}
              </div>

              <div className="seat-form-field">
                <label htmlFor="passengerEmail">Email <span className="optional-label">(optional)</span></label>
                <input
                  id="passengerEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={passenger.email}
                  onChange={(e) => setPassenger((p) => ({ ...p, email: e.target.value }))}
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <p className="seat-field-error">{errors.email}</p>}
              </div>
            </Card>

            {/* Confirm button */}
            <Button
              type="submit"
              fullWidth
              loading={submitting}
              disabled={selectedSeats.length === 0}
              className="seat-confirm-btn"
              id="confirmBookingBtn"
            >
              {submitting ? 'Confirming…' : `Confirm Booking — ৳${totalFare}`}
            </Button>
            <p className="seat-confirm-note">
              Your seats will be held for this session. No payment required for demo.
            </p>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default SeatSelection;
