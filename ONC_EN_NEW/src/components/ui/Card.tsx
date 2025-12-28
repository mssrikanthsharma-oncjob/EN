import React from 'react';
import Icon, { type IconName } from './Icon';

export type CardVariant = 'default' | 'engineering' | 'elevated' | 'bordered' | 'gradient';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  icon?: IconName;
  title?: string;
  subtitle?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'card',
  engineering: 'card-engineering',
  elevated: 'card shadow-engineering-lg',
  bordered: 'card border-2 border-gray-200',
  gradient: 'bg-gradient-to-br from-white via-blue-50 to-indigo-50 border border-blue-200 shadow-engineering rounded-xl'
};

const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  hover = false,
  icon,
  title,
  subtitle
}) => {
  const variantClass = variantClasses[variant];
  const hoverClass = hover ? 'card-hover' : '';

  return (
    <div className={`${variantClass} ${hoverClass} ${className}`}>
      {(icon || title || subtitle) && (
        <div className="mb-6">
          {icon && (
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-sm">
                <Icon name={icon} size="lg" className="text-blue-600" />
              </div>
            </div>
          )}
          {title && (
            <h3 className="text-engineering-title mb-2">{title}</h3>
          )}
          {subtitle && (
            <p className="text-engineering-body">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;