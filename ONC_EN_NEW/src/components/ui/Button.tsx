import React from 'react';
import Icon, { type IconName, type IconSize } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'engineering' | 'outline' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary border-transparent shadow-lg hover:shadow-xl',
  secondary: 'bg-white hover:bg-gray-50 focus:ring-blue-500 text-gray-700 border-gray-300 shadow-md hover:shadow-lg',
  danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white border-transparent shadow-lg hover:shadow-xl',
  success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white border-transparent shadow-lg hover:shadow-xl',
  engineering: 'btn-engineering border-transparent shadow-lg hover:shadow-xl',
  outline: 'bg-transparent hover:bg-gray-50 focus:ring-blue-500 text-gray-700 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md',
  ghost: 'bg-transparent hover:bg-gray-100 focus:ring-blue-500 text-gray-600 border-transparent hover:text-gray-900'
};

const sizeClasses: Record<ButtonSize, { button: string; icon: IconSize }> = {
  xs: { button: 'px-2.5 py-1.5 text-xs font-medium rounded-md', icon: 'xs' },
  sm: { button: 'px-3 py-2 text-sm font-medium rounded-lg', icon: 'xs' },
  md: { button: 'px-4 py-2.5 text-sm font-semibold rounded-lg', icon: 'sm' },
  lg: { button: 'px-6 py-3 text-base font-semibold rounded-xl', icon: 'sm' },
  xl: { button: 'px-8 py-4 text-lg font-bold rounded-xl', icon: 'md' }
};

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
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const isDisabled = disabled || loading;

  const iconElement = loading ? (
    <Icon name="loading" size={sizeClass.icon} />
  ) : icon ? (
    <Icon name={icon} size={sizeClass.icon} />
  ) : null;

  return (
    <button
      className={`
        inline-flex items-center justify-center
        border font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-all duration-300 ease-out
        transform hover:scale-[1.02] active:scale-[0.98]
        ${sizeClass.button}
        ${variantClass}
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