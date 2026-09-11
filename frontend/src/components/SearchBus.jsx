import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from './layout/MainLayout';
import { Button, Card } from './common';

const MOCK_BUSES = [
  { id: 1, operator: 'Green Line Paribahan', type: 'AC', departure: '06:30 AM', arrival: '12:00 PM', duration: '5h 30m', from: 'Dhaka', to: 'Rajshahi', seats: 18, fare: 850, rating: 4.8, badge: 'Best rated' },
  { id: 2, operator: 'Hanif Enterprise', type: 'AC', departure: '08:15 AM', arrival: '01:00 PM', duration: '4h 45m', from: 'Dhaka', to: 'Chittagong', seats: 9, fare: 950, rating: 4.6, badge: 'Popular' },
  { id: 3, operator: 'Shohagh Paribahan', type: 'Non-AC', departure: '10:00 AM', arrival: '03:30 PM', duration: '5h 30m', from: 'Dhaka', to: 'Rajshahi', seats: 24, fare: 650, rating: 4.3, badge: 'Lowest fare' },
  { id: 4, operator: 'Desh Travels', type: 'AC', departure: '02:30 PM', arrival: '07:45 PM', duration: '5h 15m', from: 'Dhaka', to: 'Sylhet', seats: 12, fare: 900, rating: 4.7, badge: 'Featured' },
  { id: 5, operator: 'Ena Transport', type: 'Non-AC', departure: '09:45 PM', arrival: '03:15 AM', duration: '5h 30m', from: 'Dhaka', to: 'Rajshahi', seats: 31, fare: 600, rating: 4.2, badge: 'Night service' },
];

const today = new Date().toISOString().split('T')[0];

const SearchBus = () => {
  const location = useLocation();
  const initialSearch = location.state || {};
  const [search, setSearch] = useState({ from: initialSearch.from || 'Dhaka', to: initialSearch.to || '', date: initialSearch.date || today });
  const [filters, setFilters] = useState({ type: 'All', maxFare: 1500, sort: 'recommended' });
  const [hasSearched, setHasSearched] = useState(Boolean(initialSearch.to));

  const updateSearch = (event) => {
    const { name, value } = event.target;
    setSearch((previous) => ({ ...previous, [name]: value }));
  };

  const results = useMemo(() => {
    const filtered = MOCK_BUSES.filter((bus) => {
      const matchesFrom = !search.from || bus.from.toLowerCase().includes(search.from.toLowerCase());
      const matchesTo = !search.to || bus.to.toLowerCase().includes(search.to.toLowerCase());
      const matchesType = filters.type === 'All' || bus.type === filters.type;
      return matchesFrom && matchesTo && matchesType && bus.fare <= Number(filters.maxFare);
    });

    return [...filtered].sort((first, second) => {
      if (filters.sort === 'price') return first.fare - second.fare;
      if (filters.sort === 'departure') return first.departure.localeCompare(second.departure);
      return second.rating - first.rating;
    });
  }, [filters, search]);

  const handleSearch = (event) => {
    event.preventDefault();
    setHasSearched(true);
  };

  const handleReset = () => {
    setFilters({ type: 'All', maxFare: 1500, sort: 'recommended' });
    setSearch({ from: 'Dhaka', to: '', date: today });
    setHasSearched(false);
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
        <div className="search-page-stat"><strong>{results.length}</strong><span>services found</span></div>
      </div>

      <Card variant="glass" className="search-page-panel">
        <form className="search-page-form" onSubmit={handleSearch}>
          <div className="search-page-field"><label htmlFor="searchFrom">From</label><input id="searchFrom" name="from" value={search.from} onChange={updateSearch} placeholder="Departure city" /></div>
          <button type="button" className="swap-route-btn" onClick={() => setSearch((previous) => ({ ...previous, from: previous.to, to: previous.from }))} aria-label="Swap departure and destination">↔</button>
          <div className="search-page-field"><label htmlFor="searchTo">To</label><input id="searchTo" name="to" value={search.to} onChange={updateSearch} placeholder="Destination city" /></div>
          <div className="search-page-field"><label htmlFor="searchDate">Journey date</label><input id="searchDate" type="date" name="date" value={search.date} onChange={updateSearch} /></div>
          <Button type="submit" leftIcon={<span aria-hidden="true">⌕</span>}>Search buses</Button>
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
          <div className="results-toolbar"><div><h2>{hasSearched ? 'Available services' : 'Popular services'}</h2><p>{search.date ? `Showing schedules for ${search.date}` : 'Choose a date to see schedules'}</p></div><span className="results-count">{results.length} results</span></div>
          {results.length > 0 ? results.map((bus) => (
            <Card key={bus.id} variant="solid" className="bus-result-card">
              <div className="bus-result-main"><div className="bus-operator-mark">{bus.operator.slice(0, 1)}</div><div><div className="bus-name-row"><h3>{bus.operator}</h3><span className="bus-badge">{bus.badge}</span></div><p className="bus-type">{bus.type} coach <span>•</span> <span className="rating">★ {bus.rating}</span></p></div></div>
              <div className="bus-timing"><div><strong>{bus.departure}</strong><span>{bus.from}</span></div><div className="timing-line"><span>{bus.duration}</span><i /></div><div><strong>{bus.arrival}</strong><span>{bus.to}</span></div></div>
              <div className="bus-result-action"><div><strong>৳{bus.fare}</strong><span>{bus.seats} seats left</span></div><Button size="sm" onClick={() => handleSelect(bus)}>Select bus</Button></div>
            </Card>
          )) : <div className="empty-results"><span className="empty-results-icon">⌕</span><h3>No matching buses</h3><p>Try another destination, coach type, or fare range.</p><Button variant="outline" onClick={handleReset}>Clear filters</Button></div>}
        </section>
      </div>
    </MainLayout>
  );
};

export default SearchBus;