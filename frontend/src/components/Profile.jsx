import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from './layout/MainLayout';
import { Button, TextField, Card } from './common';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (formData.phone && !/^[+0-9\s-]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <MainLayout maxWidth="850px">
      <Card variant="glass" className="profile-card">
        {/* Header Banner */}
        <div className="profile-card-header">
          <div className="profile-avatar-container">
            <div className="profile-avatar-large">
              {getInitials()}
            </div>
            <div className="profile-avatar-badge" title="Verified User">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="profile-header-meta">
            <h1 className="profile-name">{user?.firstName} {user?.lastName}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-badges">
              <span className="badge badge-primary">{user?.role?.toUpperCase() || 'PASSENGER'}</span>
              <span className="badge badge-success">Active Status</span>
            </div>
          </div>

          {!isEditing && (
            <Button
              variant="secondary"
              className="edit-profile-btn"
              onClick={() => setIsEditing(true)}
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              }
            >
              Edit Profile
            </Button>
          )}
        </div>

        <div className="profile-card-body">
          {!isEditing ? (
            /* View Mode */
            <div className="profile-details-grid">
              <div className="detail-item">
                <span className="detail-label">First Name</span>
                <div className="detail-value-wrapper">
                  <svg className="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                  <span className="detail-value">{user?.firstName || '—'}</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Last Name</span>
                <div className="detail-value-wrapper">
                  <svg className="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                  <span className="detail-value">{user?.lastName || '—'}</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <div className="detail-value-wrapper">
                  <svg className="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="detail-value">{user?.email || '—'}</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Phone Number</span>
                <div className="detail-value-wrapper">
                  <svg className="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="detail-value">{user?.phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Account Role</span>
                <div className="detail-value-wrapper">
                  <svg className="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="3" rx="2" /><path d="m9 12 2 2 4-4" />
                  </svg>
                  <span className="detail-value">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Standard User'}</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Member Since</span>
                <div className="detail-value-wrapper">
                  <svg className="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  <span className="detail-value">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently joined'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Form Mode */
            <form className="profile-edit-form" onSubmit={handleSubmit} noValidate>
              <div className="form-section-title">
                <h3>Edit Profile Information</h3>
                <p>Update your personal details below.</p>
              </div>

              <div className="input-row">
                <TextField
                  label="First Name"
                  id="editFirstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  required
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
                    </svg>
                  }
                />

                <TextField
                  label="Last Name"
                  id="editLastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
                    </svg>
                  }
                />
              </div>

              <TextField
                label="Email Address (Read-only)"
                id="editEmail"
                name="email"
                type="email"
                value={user?.email || ''}
                disabled
                helperText="Email address cannot be changed."
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                }
              />

              <TextField
                label="Phone Number"
                id="editPhone"
                name="phone"
                type="tel"
                placeholder="+880 1712 345678"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                }
              />

              <div className="form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="form-submit-btn"
                  loading={isLoading}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-quick-actions">
          <Button
            variant="ghost"
            className="quick-btn"
            onClick={() => navigate('/dashboard')}
            leftIcon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            }
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </MainLayout>
  );
};

export default Profile;
