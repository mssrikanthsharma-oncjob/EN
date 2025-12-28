import React from 'react';
import Icon, { type IconName } from './Icon';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'engineering';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: IconName;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig: Record<AlertVariant, { 
  container: string; 
  icon: IconName; 
  iconColor: string;
  titleColor: string;
  textColor: string;
}> = {
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'info',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700'
  },
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'check',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    textColor: 'text-green-700'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'alert-triangle',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-800',
    textColor: 'text-yellow-700'
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'error',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    textColor: 'text-red-700'
  },
  engineering: {
    container: 'bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200',
    icon: 'shield',
    iconColor: 'text-slate-600',
    titleColor: 'text-slate-800',
    textColor: 'text-slate-700'
  }
};

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const config = variantConfig[variant];
  const displayIcon = icon || config.icon;

  return (
    <div className={`border rounded-lg p-4 ${config.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon name={displayIcon} size="md" className={config.iconColor} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${config.textColor}`}>
            {children}
          </div>
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 ${config.iconColor} hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current`}
            >
              <Icon name="x" size="sm" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;