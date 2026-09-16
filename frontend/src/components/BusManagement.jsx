import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import MainLayout from './layout/MainLayout';
import { Button, Card, TextField } from './common';
import { busAPI } from '../services/api';

const emptyForm = {
  operator: '',
  busNumber: '',
  coachType: 'AC',
  source: '',
  destination: '',
  journeyDate: '',
  departureTime: '',
  arrivalTime: '',
  duration: '',
  fare: '',
  totalSeats: '',
  availableSeats: '',
  status: 'scheduled',
};

// Bus.journeyDate comes back as a full ISO timestamp — the <input type="date">
// control needs just the yyyy-mm-dd portion.
const toDateInputValue = (isoDate) => (isoDate ? new Date(isoDate).toISOString().split('T')[0] : '');

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [query, setQuery] = useState('');

  const fetchBuses = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await busAPI.getAll();
      setBuses(data.buses || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load buses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const filteredBuses = useMemo(() => {
    if (!query.trim()) return buses;
    const term = query.trim().toLowerCase();
    return buses.filter((bus) =>
      [bus.operator, bus.busNumber, bus.source, bus.destination].some((field) =>
        field?.toLowerCase().includes(term)
      )
    );
  }, [buses, query]);

  const openCreateForm = () => {
    setEditingBus(null);
    setFormData(emptyForm);
    setFormErrors({});
    setShowForm(true);
  };

  const openEditForm = (bus) => {
    setEditingBus(bus);
    setFormData({
      operator: bus.operator || '',
      busNumber: bus.busNumber || '',
      coachType: bus.coachType || 'AC',
      source: bus.source || '',
      destination: bus.destination || '',
      journeyDate: toDateInputValue(bus.journeyDate),
      departureTime: bus.departureTime || '',
      arrivalTime: bus.arrivalTime || '',
      duration: bus.duration || '',
      fare: bus.fare ?? '',
      totalSeats: bus.totalSeats ?? '',
      availableSeats: bus.availableSeats ?? '',
      status: bus.status || 'scheduled',
    });
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setShowForm(false);
    setEditingBus(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.operator.trim()) errors.operator = 'Operator name is required';
    if (!formData.busNumber.trim()) errors.busNumber = 'Bus number is required';
    if (!formData.source.trim()) errors.source = 'Source city is required';
    if (!formData.destination.trim()) errors.destination = 'Destination city is required';
    if (formData.source.trim() && formData.destination.trim() && formData.source.trim().toLowerCase() === formData.destination.trim().toLowerCase()) {
      errors.destination = 'Destination must differ from source';
    }
    if (!formData.journeyDate) errors.journeyDate = 'Journey date is required';
    if (!formData.departureTime) errors.departureTime = 'Departure time is required';
    if (!formData.arrivalTime) errors.arrivalTime = 'Arrival time is required';
    if (!formData.duration.trim()) errors.duration = 'Duration is required (e.g. 5h 30m)';

    const fare = Number(formData.fare);
    if (!formData.fare || Number.isNaN(fare) || fare < 0) errors.fare = 'Enter a valid fare';

    const totalSeats = Number(formData.totalSeats);
    if (!formData.totalSeats || Number.isNaN(totalSeats) || totalSeats < 1 || totalSeats > 100) {
      errors.totalSeats = 'Total seats must be between 1 and 100';
    }

    const availableSeats = formData.availableSeats === '' ? totalSeats : Number(formData.availableSeats);
    if (Number.isNaN(availableSeats) || availableSeats < 0) {
      errors.availableSeats = 'Enter a valid seat count';
    } else if (!Number.isNaN(totalSeats) && availableSeats > totalSeats) {
      errors.availableSeats = 'Cannot exceed total seats';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const payload = {
      ...formData,
      fare: Number(formData.fare),
      totalSeats: Number(formData.totalSeats),
      availableSeats: formData.availableSeats === '' ? Number(formData.totalSeats) : Number(formData.availableSeats),
    };

    try {
      if (editingBus) {
        await busAPI.update(editingBus._id, payload);
        toast.success('Bus updated successfully');
      } else {
        await busAPI.create(payload);
        toast.success('Bus added successfully');
      }
      setShowForm(false);
      setEditingBus(null);
      fetchBuses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await busAPI.remove(deleteTarget._id);
      toast.success('Bus deleted successfully');
      setDeleteTarget(null);
      fetchBuses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete bus.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainLayout maxWidth="1200px">
      <div className="mgmt-header">
        <div>
          <p className="eyebrow-label">FLEET ADMINISTRATION</p>
          <h1 className="page-title">Bus Management</h1>
          <p className="page-subtitle">Add, update, and retire services in the live bus inventory.</p>
        </div>
        <Button
          variant="primary"
          onClick={openCreateForm}
          leftIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Bus
        </Button>
      </div>

      <Card variant="glass" className="mgmt-toolbar">
        <input
          className="mgmt-search-input"
          type="text"
          placeholder="Search by operator, bus number, or route..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="mgmt-count">{loading ? '…' : `${filteredBuses.length} of ${buses.length} buses`}</span>
      </Card>

      <Card variant="glass" className="mgmt-table-card">
        {loading ? (
          <div className="mgmt-state"><p>Loading buses...</p></div>
        ) : error ? (
          <div className="mgmt-state">
            <p>{error}</p>
            <Button variant="outline" onClick={fetchBuses}>Try again</Button>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="mgmt-state">
            <p>{buses.length === 0 ? 'No buses in the system yet. Add your first bus, or run the seed script.' : 'No buses match your search.'}</p>
          </div>
        ) : (
          <div className="mgmt-table-wrapper">
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>Operator / Bus No.</th>
                  <th>Route</th>
                  <th>Journey</th>
                  <th>Coach</th>
                  <th>Fare</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filteredBuses.map((bus) => (
                  <tr key={bus._id}>
                    <td>
                      <div className="mgmt-operator-cell">
                        <strong>{bus.operator}</strong>
                        <span>{bus.busNumber}</span>
                      </div>
                    </td>
                    <td>{bus.source} → {bus.destination}</td>
                    <td>
                      <div className="mgmt-journey-cell">
                        <span>{new Date(bus.journeyDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="mgmt-time-range">{bus.departureTime}–{bus.arrivalTime}</span>
                      </div>
                    </td>
                    <td><span className="mgmt-coach-chip">{bus.coachType}</span></td>
                    <td>৳{bus.fare}</td>
                    <td>{bus.availableSeats}/{bus.totalSeats}</td>
                    <td><span className={`mgmt-status-chip mgmt-status-${bus.status}`}>{bus.status}</span></td>
                    <td>
                      <div className="mgmt-row-actions">
                        <button type="button" className="mgmt-icon-btn" onClick={() => openEditForm(bus)} aria-label={`Edit ${bus.operator}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                        </button>
                        <button type="button" className="mgmt-icon-btn mgmt-icon-btn-danger" onClick={() => setDeleteTarget(bus)} aria-label={`Delete ${bus.operator}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showForm && (
        <div className="modal-backdrop" onClick={closeForm}>
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBus ? 'Edit Bus' : 'Add New Bus'}</h2>
              <button type="button" className="modal-close-btn" onClick={closeForm} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit} noValidate>
              <div className="input-row">
                <TextField label="Operator" name="operator" value={formData.operator} onChange={handleChange} error={formErrors.operator} required />
                <TextField label="Bus Number" name="busNumber" value={formData.busNumber} onChange={handleChange} error={formErrors.busNumber} required />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label className="input-label" htmlFor="coachType">Coach Type <span className="text-danger">*</span></label>
                  <select id="coachType" name="coachType" className="mgmt-select" value={formData.coachType} onChange={handleChange}>
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="status">Status</label>
                  <select id="status" name="status" className="mgmt-select" value={formData.status} onChange={handleChange}>
                    <option value="scheduled">Scheduled</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="input-row">
                <TextField label="Source" name="source" value={formData.source} onChange={handleChange} error={formErrors.source} required />
                <TextField label="Destination" name="destination" value={formData.destination} onChange={handleChange} error={formErrors.destination} required />
              </div>

              <div className="input-row input-row-3">
                <TextField label="Journey Date" name="journeyDate" type="date" value={formData.journeyDate} onChange={handleChange} error={formErrors.journeyDate} required />
                <TextField label="Departure" name="departureTime" type="time" value={formData.departureTime} onChange={handleChange} error={formErrors.departureTime} required />
                <TextField label="Arrival" name="arrivalTime" type="time" value={formData.arrivalTime} onChange={handleChange} error={formErrors.arrivalTime} required />
              </div>

              <div className="input-row input-row-3">
                <TextField label="Duration" name="duration" placeholder="e.g. 5h 30m" value={formData.duration} onChange={handleChange} error={formErrors.duration} required />
                <TextField label="Fare (৳)" name="fare" type="number" min="0" value={formData.fare} onChange={handleChange} error={formErrors.fare} required />
                <TextField label="Total Seats" name="totalSeats" type="number" min="1" max="100" value={formData.totalSeats} onChange={handleChange} error={formErrors.totalSeats} required />
              </div>

              <TextField
                label="Available Seats"
                name="availableSeats"
                type="number"
                min="0"
                value={formData.availableSeats}
                onChange={handleChange}
                error={formErrors.availableSeats}
                helperText="Leave blank to fill all seats as available"
              />

              <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={closeForm} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" variant="primary" loading={isSubmitting}>{editingBus ? 'Save Changes' : 'Add Bus'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => !isDeleting && setDeleteTarget(null)}>
          <div className="modal-panel modal-panel-sm" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Bus</h2>
            </div>
            <div className="modal-body">
              <p className="modal-confirm-text">
                Delete <strong>{deleteTarget.operator}</strong> ({deleteTarget.busNumber}) on the {deleteTarget.source} → {deleteTarget.destination} route? This cannot be undone.
              </p>
              <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
                <Button type="button" variant="danger" onClick={confirmDelete} loading={isDeleting}>Delete Bus</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default BusManagement;
