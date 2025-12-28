import React from 'react';
import Icon from './Icon';

export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses: Record<LoadingSize, { spinner: string; text: string; dots: string }> = {
  sm: { spinner: 'w-4 h-4', text: 'text-sm', dots: 'w-2 h-2' },
  md: { spinner: 'w-6 h-6', text: 'text-base', dots: 'w-3 h-3' },
  lg: { spinner: 'w-8 h-8', text: 'text-lg', dots: 'w-4 h-4' },
  xl: { spinner: 'w-12 h-12', text: 'text-xl', dots: 'w-5 h-5' }
};

const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  text,
  className = '',
  fullScreen = false
}) => {
  const sizeClass = sizeClasses[size];

  const renderSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Icon name="loading" size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : size === 'lg' ? 'lg' : 'xl'} className="text-blue-600" />
      {text && <p className={`${sizeClass.text} text-gray-600 font-medium`}>{text}</p>}
    </div>
  );

  const renderDots = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${sizeClass.dots} bg-blue-600 rounded-full animate-pulse`}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.4s'
            }}
          />
        ))}
      </div>
      {text && <p className={`${sizeClass.text} text-gray-600 font-medium`}>{text}</p>}
    </div>
  );

  const renderPulse = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`${sizeClass.spinner} bg-blue-600 rounded-full animate-pulse-slow`} />
      {text && <p className={`${sizeClass.text} text-gray-600 font-medium animate-pulse`}>{text}</p>}
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-3 w-full max-w-sm">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
      {text && <p className={`${sizeClass.text} text-gray-600 font-medium text-center mt-4`}>{text}</p>}
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-engineering-lg p-8 max-w-sm w-full mx-4">
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      {renderContent()}
    </div>
  );
};

export default Loading;