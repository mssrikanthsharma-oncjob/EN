import React from 'react';

export type LoadingVariant = 'spinner' | 'dots' | 'pulse';
export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  className?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  className = '',
  text
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const renderSpinner = () => (
    <div className={`loading-spinner ${sizeClasses[size]} ${className}`} />
  );

  const renderDots = () => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`bg-primary-500 rounded-full animate-bounce ${
            size === 'xs' ? 'w-1 h-1' :
            size === 'sm' ? 'w-1.5 h-1.5' :
            size === 'md' ? 'w-2 h-2' :
            size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`loading-pulse ${sizeClasses[size]} ${className}`} />
  );

  const renderLoading = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  if (text) {
    return (
      <div className="flex items-center space-x-3">
        {renderLoading()}
        <span className="text-sm font-medium text-secondary-600">{text}</span>
      </div>
    );
  }

  return renderLoading();
};

export default Loading;