import React from 'react';

interface MaxIconProps {
  size?: number;
  className?: string;
}

const MaxIcon: React.FC<MaxIconProps> = ({ size = 18, className }) => (
  <img
    src="https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/8ded17ea-3683-476c-9b11-acec4e37df65.png"
    alt="Max"
    width={size}
    height={size}
    className={className}
    style={{ display: 'block', flexShrink: 0, objectFit: 'contain' }}
  />
);

export default MaxIcon;