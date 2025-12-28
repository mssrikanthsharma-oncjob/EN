import React from 'react';
import Icon, { type IconName } from './Icon';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  icon?: IconName;
  status: 'completed' | 'active' | 'inactive';
}

interface ProgressProps {
  steps: ProgressStep[];
  currentStep: string;
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

const Progress: React.FC<ProgressProps> = ({
  steps,
  currentStep,
  className = '',
  variant = 'horizontal'
}) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  if (variant === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 transform
                      ${isCompleted 
                        ? 'bg-green-600 border-green-600 text-white shadow-lg scale-110' 
                        : isActive 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105' 
                        : 'bg-gray-100 border-gray-300 text-gray-400 scale-100'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Icon name="check" size="sm" className="animate-pulse" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <h3
                    className={`
                      text-sm font-semibold transition-all duration-200
                      ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600 font-bold' : 'text-gray-500'}
                    `}
                  >
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className={`text-sm mt-1 transition-all duration-200 ${isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {!isLast && (
                <div
                  className={`
                    absolute left-5 top-10 w-0.5 h-6 -ml-px transition-all duration-200
                    ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 transform
                    ${isCompleted 
                      ? 'bg-green-600 border-green-600 text-white shadow-lg scale-110' 
                      : isActive 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105' 
                      : 'bg-gray-100 border-gray-300 text-gray-400 scale-100'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Icon name="check" size="sm" className="animate-pulse" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <h3
                    className={`
                      text-sm font-semibold transition-all duration-200
                      ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600 font-bold' : 'text-gray-500'}
                    `}
                  >
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className={`text-xs mt-1 max-w-20 transition-all duration-200 ${isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {!isLast && (
                <div className="flex-1 mx-4">
                  <div
                    className={`
                      h-0.5 w-full transition-all duration-200
                      ${isCompleted ? 'bg-green-600' : index < currentIndex ? 'bg-green-600' : 'bg-gray-300'}
                    `}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Progress;