import React from 'react';

interface MaxIconProps {
  size?: number;
  className?: string;
}

const MaxIcon: React.FC<MaxIconProps> = ({ size = 18, className }) => (
  <img
    src="https://logo-teka.com/wp-content/uploads/2025/07/max-messenger-sign-logo.svg"
    alt="Max"
    width={size}
    height={size}
    className={className}
    style={{ display: 'block', flexShrink: 0 }}
  />
);

export default MaxIcon;