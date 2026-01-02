import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'gradient' | 'primary' | 'engineering';

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className = '',
  hover = false,
  padding = 'md'
}) => {
  const baseClasses = 'card';
  
  const variantClasses = {
    default: '',
    elevated: 'shadow-large',
    gradient: 'card-gradient',
    primary: 'card-primary',
    engineering: 'card-gradient border-primary-200',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover ? 'card-hover' : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hoverClasses}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  );
};

export default Card;