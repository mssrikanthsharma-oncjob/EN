import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'engineering';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    engineering: 'bg-gradient-secondary text-white shadow-medium hover:shadow-large',
  };
  
  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    xl: 'btn-xl',
  };

  const loadingIcon = (
    <div className="loading-spinner w-4 h-4"></div>
  );

  const iconElement = loading ? loadingIcon : icon;

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      disabled={isDisabled}
      {...props}
    >
      {iconElement && iconPosition === 'left' && (
        <span className={children ? 'mr-2' : ''}>
          {iconElement}
        </span>
      )}
      {children}
      {iconElement && iconPosition === 'right' && (
        <span className={children ? 'ml-2' : ''}>
          {iconElement}
        </span>
      )}
    </button>
  );
};

export default Button;