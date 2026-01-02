import React from 'react';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
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
      <div className={`space-y-6 ${className}`}>
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
                      progress-step
                      ${isCompleted 
                        ? 'progress-step-completed' 
                        : isActive 
                        ? 'progress-step-active' 
                        : 'progress-step-inactive'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <h3
                    className={`
                      text-sm font-semibold transition-colors duration-200
                      ${isActive ? 'text-primary-600' : isCompleted ? 'text-success-600' : 'text-secondary-500'}
                    `}
                  >
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className={`text-sm mt-1 transition-colors duration-200 ${isCompleted ? 'text-success-500' : 'text-secondary-500'}`}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {!isLast && (
                <div
                  className={`
                    absolute left-5 top-10 w-0.5 h-6 -ml-px transition-colors duration-200
                    ${isCompleted ? 'bg-success-500' : 'bg-secondary-300'}
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
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center min-w-0 flex-shrink-0">
                <div
                  className={`
                    progress-step
                    ${isCompleted 
                      ? 'progress-step-completed' 
                      : isActive 
                      ? 'progress-step-active' 
                      : 'progress-step-inactive'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 sm:mt-3 text-center max-w-20 sm:max-w-24">
                  <h3
                    className={`
                      text-xs sm:text-sm font-semibold transition-colors duration-200 leading-tight
                      ${isActive ? 'text-primary-600' : isCompleted ? 'text-success-600' : 'text-secondary-500'}
                    `}
                  >
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className={`text-xs mt-1 transition-colors duration-200 leading-tight ${isCompleted ? 'text-success-500' : 'text-secondary-500'}`}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {!isLast && (
                <div className="flex-1 mx-2 sm:mx-4 min-w-8">
                  <div
                    className={`
                      progress-connector
                      ${isCompleted ? 'progress-connector-completed' : index < currentIndex ? 'progress-connector-completed' : 'progress-connector-inactive'}
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