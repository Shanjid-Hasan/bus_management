import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return { level: 0, text: '', class: '' };

    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const levels = [
      { level: 0, text: '', class: '' },
      { level: 1, text: 'Weak', class: 'weak' },
      { level: 2, text: 'Fair', class: 'fair' },
      { level: 3, text: 'Good', class: 'good' },
      { level: 4, text: 'Strong', class: 'strong' },
    ];
    return levels[score];
  }, [formData.password]);

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(formData.firstName, formData.lastName, formData.email, formData.password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="floating-shape shape-1" />
        <div className="floating-shape shape-2" />
        <div className="floating-shape shape-3" />
        <div className="floating-shape shape-4" />
        <div className="floating-shape shape-5" />
      </div>

      <div className="auth-card">
        <div className="auth-card-inner">
          {/* Brand */}
          <div className="brand-header">
            <div className="brand-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" />
                <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
                <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
              </svg>
            </div>
            <h1 className="brand-name">RideSmart</h1>
            <p className="brand-tagline">Bus Management System</p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">Start managing your fleet today</p>

            {/* Name Row */}
            <div className="input-row">
              <div className={`input-group ${errors.firstName ? 'has-error' : ''}`}>
                <label htmlFor="regFirstName" className="input-label">First Name</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                  <input
                    type="text"
                    id="regFirstName"
                    name="firstName"
                    className="input-field"
                    placeholder="John"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                {errors.firstName && <span className="input-error visible">{errors.firstName}</span>}
              </div>

              <div className={`input-group ${errors.lastName ? 'has-error' : ''}`}>
                <label htmlFor="regLastName" className="input-label">Last Name</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                  <input
                    type="text"
                    id="regLastName"
                    name="lastName"
                    className="input-field"
                    placeholder="Doe"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                {errors.lastName && <span className="input-error visible">{errors.lastName}</span>}
              </div>
            </div>

            {/* Email */}
            <div className={`input-group ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="regEmail" className="input-label">Email Address</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  type="email"
                  id="regEmail"
                  name="email"
                  className="input-field"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <span className="input-error visible">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className={`input-group ${errors.password ? 'has-error' : ''}`}>
              <label htmlFor="regPassword" className="input-label">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="regPassword"
                  name="password"
                  className="input-field"
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                      <path d="m2 2 20 20" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="password-strength visible">
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`strength-bar ${bar <= passwordStrength.level ? passwordStrength.class : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`strength-text ${passwordStrength.class}`}>
                    {passwordStrength.text}
                  </span>
                </div>
              )}
              {errors.password && <span className="input-error visible">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className={`input-group ${errors.confirmPassword ? 'has-error' : ''}`}>
              <label htmlFor="regConfirmPassword" className="input-label">Confirm Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="regConfirmPassword"
                  name="confirmPassword"
                  className="input-field"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                      <path d="m2 2 20 20" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <span className="input-error visible">{errors.confirmPassword}</span>}
            </div>

            {/* Terms */}
            <div className="form-options">
              <label className="checkbox-wrapper" htmlFor="agreeTerms">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <span className="checkmark" />
                <span className="checkbox-label">
                  I agree to the <a href="#" className="inline-link">Terms of Service</a>
                </span>
              </label>
              {errors.agreeTerms && <span className="input-error visible" style={{ marginTop: '4px' }}>{errors.agreeTerms}</span>}
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <span className="btn-loader">
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                  </svg>
                </span>
              ) : (
                <span className="btn-text">Create Account</span>
              )}
            </button>

            <div className="form-footer">
              <p>Already have an account? <Link to="/login" className="link-btn">Sign in</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
