import React from 'react';
import Icon, { type IconName } from './Icon';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'engineering';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: IconName;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  success: 'bg-green-50 text-green-800 border-green-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  engineering: 'bg-gradient-to-r from-slate-50 to-blue-50 text-slate-800 border-slate-200'
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs font-medium',
  md: 'px-3 py-1.5 text-sm font-medium',
  lg: 'px-4 py-2 text-base font-semibold'
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  children
}) => {
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];

  return (
    <span className={`inline-flex items-center border rounded-full ${sizeClass} ${variantClass} ${className}`}>
      {icon && (
        <Icon 
          name={icon} 
          size={size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md'} 
          className="mr-1.5" 
        />
      )}
      {children}
    </span>
  );
};

export default Badge;