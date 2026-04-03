import React from 'react';

interface MaxIconProps {
  size?: number;
  className?: string;
}

const MaxIcon: React.FC<MaxIconProps> = ({ size = 34, className }) => (
  <img
    src="https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/49f69673-b992-4df7-a400-76c90cfdb859.png"
    alt="Max"
    width={size}
    height={size}
    className={className}
    style={{ objectFit: 'cover', display: 'block', flexShrink: 0, borderRadius: '8px' }}
  />
);

export default MaxIcon;
