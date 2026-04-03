import React from 'react';

interface MaxIconProps {
  size?: number;
  className?: string;
}

const MaxIcon: React.FC<MaxIconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="100" height="100" rx="22" fill="url(#maxGrad)" />
    <defs>
      <radialGradient id="maxGrad" cx="30%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#6B7FFF" />
        <stop offset="55%" stopColor="#5B5BD6" />
        <stop offset="100%" stopColor="#8B3FC8" />
      </radialGradient>
    </defs>
    <path
      d="M50 18C33.4 18 20 30.4 20 46c0 8.4 3.9 15.9 10 21L28 82l12-6c3.1.9 6.5 1.4 10 1.4 16.6 0 30-12.4 30-27.4S66.6 18 50 18z"
      fill="white"
    />
    <circle cx="50" cy="46" r="13" fill="url(#maxGrad2)" />
    <defs>
      <radialGradient id="maxGrad2" cx="40%" cy="40%" r="70%">
        <stop offset="0%" stopColor="#6B7FFF" />
        <stop offset="100%" stopColor="#7B2FBE" />
      </radialGradient>
    </defs>
  </svg>
);

export default MaxIcon;
