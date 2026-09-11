import React from 'react';

/**
 * Reusable Card Component
 * @param {('glass'|'solid'|'interactive'|'flat')} variant - Visual container style
 */
export const Card = ({
  children,
  variant = 'glass',
  className = '',
  onClick,
  ...rest
}) => {
  return (
    <div
      className={`card-custom card-${variant} ${onClick ? 'card-clickable' : ''} ${className}`.trim()}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...rest }) => (
  <div className={`card-header-custom ${className}`.trim()} {...rest}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...rest }) => (
  <h3 className={`card-title-custom ${className}`.trim()} {...rest}>
    {children}
  </h3>
);

export const CardBody = ({ children, className = '', ...rest }) => (
  <div className={`card-body-custom ${className}`.trim()} {...rest}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...rest }) => (
  <div className={`card-footer-custom ${className}`.trim()} {...rest}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
