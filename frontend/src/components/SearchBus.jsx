import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from './layout/MainLayout';
import { Button, Card } from './common';
import { busAPI } from '../services/api';

const today = new Date().toISOString().split('T')[0];

// Stored as 24-hour "HH:mm" in the database — format for display here.
const formatTime = (time24) => {
  if (!time24 || !time24.includes(':')) return time24 || '';
  const [hourStr, minuteStr] = time24.split(':');
  const hour = Number(hourStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minuteStr} ${period}`;
};

const formatJourneyDate = (isoDate) => {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const seatBadge = (availableSeats) => {
  if (availableSeats <= 5) return { label: 'Filling fast', tone: 'urgent' };
  if (availableSeats <= 15) return { label: 'Limited seats', tone: 'notice' };
  return { label: 'Available', tone: 'ok' };
};

const SearchBus = () => {
  const location = useLocation();
  const initialSearch = location.state || {};

  const [search, setSearch] = useState({
    from: initialSearch.from || 'Dhaka',
    to: initialSearch.to || '',
    date: initialSearch.date || today,
  });
  const [filters, setFilters] = useState({ type: 'All', maxFare: 1500, sort: 'recommended' });
  const [hasSearched, setHasSearched] = useState(Boolean(initialSearch.to));

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const updateSearch = (event) => {
    const { name, value } = event.target;
    setSearch((previous) => ({ ...previous, [name]: value }));
  };

  const runSearch = useCallback(async (searchParams, filterParams) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await busAPI.search({
        source: searchParams.from || undefined,
        destination: searchParams.to || undefined,
        date: searchParams.date || undefined,
        coachType: filterParams.type,
        maxFare: filterParams.maxFare,
        sort: filterParams.sort,
      });
      setBuses(data.buses || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load buses. Please try again.';
      setError(message);
      setBuses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-run whenever a filter changes (filters are always server-side now)
  useEffect(() => {
    runSearch(search, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.sort, filters.maxFare]);

  const handleSearch = (event) => {
    event.preventDefault();
    setHasSearched(true);
    runSearch(search, filters);
  };

  const handleReset = () => {
    const resetSearch = { from: 'Dhaka', to: '', date: today };
    const resetFilters = { type: 'All', maxFare: 1500, sort: 'recommended' };
    setSearch(resetSearch);
    setFilters(resetFilters);
    setHasSearched(false);
    runSearch(resetSearch, resetFilters);
  };

  const handleSelect = (bus) => {
    toast.success(`${bus.operator} selected. Seat booking will connect to the backend later.`);
  };

  return (
    <MainLayout>
      <div className="search-page-heading">
        <div>
          <p className="eyebrow-label">TRAVEL PLANNER</p>
          <h1 className="page-title">Find your next bus</h1>
          <p className="page-subtitle">Compare schedules, fares, and available seats in one place.</p>
        </div>
        <div className="search-page-stat"><strong>{loading ? '—' : buses.length}</strong><span>services found</span></div>
      </div>

      <Card variant="glass" className="search-page-panel">
        <form className="search-page-form" onSubmit={handleSearch}>
          <div className="search-page-field"><label htmlFor="searchFrom">From</label><input id="searchFrom" name="from" value={search.from} onChange={updateSearch} placeholder="Departure city" /></div>
          <button type="button" className="swap-route-btn" onClick={() => setSearch((previous) => ({ ...previous, from: previous.to, to: previous.from }))} aria-label="Swap departure and destination">↔</button>
          <div className="search-page-field"><label htmlFor="searchTo">To</label><input id="searchTo" name="to" value={search.to} onChange={updateSearch} placeholder="Destination city" /></div>
          <div className="search-page-field"><label htmlFor="searchDate">Journey date</label><input id="searchDate" type="date" name="date" value={search.date} onChange={updateSearch} /></div>
          <Button type="submit" leftIcon={<span aria-hidden="true">⌕</span>} loading={loading}>Search buses</Button>
        </form>
      </Card>

      <div className="search-results-layout">
        <aside className="search-filter-panel">
          <div className="filter-heading"><div><p className="eyebrow-label">REFINE</p><h2>Filters</h2></div><button type="button" className="filter-reset-btn" onClick={handleReset}>Reset</button></div>
          <label className="filter-label" htmlFor="busType">Coach type</label>
          <select id="busType" value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}>
            <option>All</option><option>AC</option><option>Non-AC</option>
          </select>
          <label className="filter-label" htmlFor="sortResults">Sort by</label>
          <select id="sortResults" value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}>
            <option value="recommended">Recommended</option><option value="price">Lowest fare</option><option value="departure">Earliest departure</option>
          </select>
          <div className="fare-filter-header"><label className="filter-label" htmlFor="maxFare">Maximum fare</label><strong>৳{filters.maxFare}</strong></div>
          <input id="maxFare" className="fare-range" type="range" min="500" max="1500" step="50" value={filters.maxFare} onChange={(event) => setFilters({ ...filters, maxFare: event.target.value })} />
          <div className="fare-range-labels"><span>৳500</span><span>৳1500</span></div>
          <div className="filter-note"><span>✓</span><p>Prices include standard service fees. Final availability will be confirmed at booking.</p></div>
        </aside>

        <section className="search-results-section">
          <div className="results-toolbar"><div><h2>{hasSearched ? 'Available services' : 'Popular services'}</h2><p>{search.date ? `Showing schedules for ${search.date}` : 'Choose a date to see schedules'}</p></div><span className="results-count">{loading ? '…' : `${buses.length} results`}</span></div>

          {loading ? (
            <div className="results-loading">
              {[1, 2, 3].map((key) => (
                <div key={key} className="bus-result-skeleton" />
              ))}
            </div>
          ) : error ? (
            <div className="empty-results empty-results-error">
              <span className="empty-results-icon">!</span>
              <h3>Couldn't load buses</h3>
              <p>{error}</p>
              <Button variant="outline" onClick={() => runSearch(search, filters)}>Try again</Button>
            </div>
          ) : buses.length > 0 ? buses.map((bus) => {
            const badge = seatBadge(bus.availableSeats);
            return (
              <Card key={bus._id} variant="solid" className="bus-result-card">
                <div className="bus-result-main"><div className="bus-operator-mark">{bus.operator.slice(0, 1)}</div><div><div className="bus-name-row"><h3>{bus.operator}</h3><span className={`bus-badge bus-badge-${badge.tone}`}>{badge.label}</span></div><p className="bus-type">{bus.coachType} coach <span>•</span> <span>{formatJourneyDate(bus.journeyDate)}</span></p></div></div>
                <div className="bus-timing"><div><strong>{formatTime(bus.departureTime)}</strong><span>{bus.source}</span></div><div className="timing-line"><span>{bus.duration}</span><i /></div><div><strong>{formatTime(bus.arrivalTime)}</strong><span>{bus.destination}</span></div></div>
                <div className="bus-result-action"><div><strong>৳{bus.fare}</strong><span>{bus.availableSeats} seats left</span></div><Button size="sm" onClick={() => handleSelect(bus)} disabled={bus.availableSeats === 0}>{bus.availableSeats === 0 ? 'Sold out' : 'Select bus'}</Button></div>
              </Card>
            );
          }) : <div className="empty-results"><span className="empty-results-icon">⌕</span><h3>No matching buses</h3><p>Try another destination, coach type, or fare range.</p><Button variant="outline" onClick={handleReset}>Clear filters</Button></div>}
        </section>
      </div>
    </MainLayout>
  );
};

export default SearchBus;
