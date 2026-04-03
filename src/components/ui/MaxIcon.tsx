import React from 'react';

interface MaxIconProps {
  size?: number;
  className?: string;
}

const MaxIcon: React.FC<MaxIconProps> = ({ size = 24, className }) => (
  <img
    src="https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/a38359c5-a2ae-4a29-8839-2118b6dfda0c.png"
    alt="Max"
    width={size}
    height={size}
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

export default MaxIcon;
