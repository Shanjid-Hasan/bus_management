import React from 'react';

/**
 * Reusable Button Component
 * @param {('primary'|'secondary'|'outline'|'danger'|'ghost')} variant - Button visual style
 * @param {('sm'|'md'|'lg')} size - Button size
 * @param {boolean} fullWidth - If true, stretches 100% width
 * @param {boolean} loading - Displays loading spinner and disables click
 * @param {React.ReactNode} leftIcon - Optional icon on left
 * @param {React.ReactNode} rightIcon - Optional icon on right
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...rest
}) => {
  const baseClasses = `btn-custom btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${className}`;

  return (
    <button
      type={type}
      className={baseClasses.trim()}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <span className="btn-spinner-wrapper">
          <svg className="btn-spinner" width="18" height="18" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
          </svg>
          {typeof children === 'string' ? <span>Loading...</span> : children}
        </span>
      ) : (
        <>
          {leftIcon && <span className="btn-icon btn-icon-left">{leftIcon}</span>}
          <span className="btn-content">{children}</span>
          {rightIcon && <span className="btn-icon btn-icon-right">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
