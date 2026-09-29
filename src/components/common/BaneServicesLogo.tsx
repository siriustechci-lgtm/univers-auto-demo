import React from 'react';
import { UniversAutoLogo } from './UniversAutoLogo';

interface BaneServicesLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'header';
  className?: string;
  height?: number | string;
  width?: number | string;
  alt?: string;
}

export const BaneServicesLogo: React.FC<BaneServicesLogoProps> = ({
  variant = 'full',
  className = '',
}) => {
  const sizeMap = {
    icon: 'sm' as const,
    compact: 'sm' as const,
    header: 'md' as const,
    full: 'lg' as const,
  };

  return (
    <UniversAutoLogo
      size={sizeMap[variant] || 'md'}
      showSubtitle={variant === 'full'}
      className={className}
    />
  );
};
