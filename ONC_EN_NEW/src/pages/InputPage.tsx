import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { FormData, PhotoData } from '../types';
import { FormDataSchema, TestResultDataSchema } from '../schemas/validation';
import { z } from 'zod';
import { saveFormData, loadFormData, getDefaultFormData, clearFormData } from '../utils/localStorage';
import { llmService, LLMServiceError } from '../services/llmService';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import ObservationForm from '../components/forms/ObservationForm';
import TestResultsForm from '../components/forms/TestResultsForm';
import PhotoUploadForm from '../components/forms/PhotoUploadForm';
import ConfigurationForm from '../components/forms/ConfigurationForm';
import Progress, { type ProgressStep } from '../components/ui/Progress';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Card from '../components/ui/Card';

type FormStep = 'observations' | 'testResults' | 'photos' | 'configuration';

const InputPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentStep, setCurrentStep] = useState<FormStep>('observations');
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [processingError, setProcessingError] = useState<string>('');
  const [stepCompletionMessage, setStepCompletionMessage] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Function to validate current step
  const validateCurrentStep = (): string[] => {
    const errors: string[] = [];
    
    switch (currentStep) {
      case 'observations':
        const obsData = watchedData.observations;
        if (!obsData?.siteLocation?.trim()) {
          errors.push('Site location is required');
        }
        if (!obsData?.engineerName?.trim()) {
          errors.push('Engineer name is required');
        }
        if (!obsData?.visitDate?.trim()) {
          errors.push('Visit date is required');
        }
        if (!obsData?.structuralIssues || obsData.structuralIssues.length === 0) {
          errors.push('At least one structural issue is required');
        } else {
          obsData.structuralIssues.forEach((issue, index) => {
            if (!issue.location?.trim()) {
              errors.push(`Structural issue ${index + 1}: Location is required`);
            }
            if (!issue.description?.trim()) {
              errors.push(`Structural issue ${index + 1}: Description is required`);
            }
          });
        }
        break;
        
      case 'testResults':
        // Test results are optional, but if provided, validate them
        const testData = watchedData.testResults;
        if (testData && testData.length > 0) {
          testData.forEach((test, testIndex) => {
            if (!test.sampleId?.trim()) {
              errors.push(`Test ${testIndex + 1}: Sample ID is required`);
            }
            if (!test.testDate?.trim()) {
              errors.push(`Test ${testIndex + 1}: Test date is required`);
            }
            if (!test.labCertification?.trim()) {
              errors.push(`Test ${testIndex + 1}: Lab certification is required`);
            }
            if (!test.results || test.results.length === 0) {
              errors.push(`Test ${testIndex + 1}: At least one test result is required`);
            } else {
              test.results.forEach((result, resultIndex) => {
                if (!result.parameter?.trim()) {
                  errors.push(`Test ${testIndex + 1}, Result ${resultIndex + 1}: Parameter is required`);
                }
                if (result.value === undefined || result.value < 0) {
                  errors.push(`Test ${testIndex + 1}, Result ${resultIndex + 1}: Valid value is required`);
                }
                if (!result.unit?.trim()) {
                  errors.push(`Test ${testIndex + 1}, Result ${resultIndex + 1}: Unit is required`);
                }
                if (!result.specification?.trim()) {
                  errors.push(`Test ${testIndex + 1}, Result ${resultIndex + 1}: Specification is required`);
                }
              });
            }
          });
        }
        break;
        
      case 'photos':
        // Photos are optional, no validation needed
        break;
        
      case 'configuration':
        const configData = watchedData.configuration;
        if (!configData?.provider) {
          errors.push('LLM provider is required');
        }
        if (!configData?.apiKey?.trim()) {
          errors.push('API key is required');
        }
        if (!configData?.model?.trim()) {
          errors.push('Model selection is required');
        }
        if (!configData?.reportTemplate?.trim()) {
          errors.push('Report template is required');
        }
        if (configData?.provider === 'custom' && !configData?.endpoint?.trim()) {
          errors.push('Custom endpoint is required for custom provider');
        }
        break;
    }
    
    return errors;
  };

  const methods = useForm<FormData>({
    defaultValues: getDefaultFormData(),
    mode: 'onChange',
  });

  const { handleSubmit, watch, setValue } = methods;

  // Load saved data on component mount
  useEffect(() => {
    const savedData = loadFormData();
    if (savedData) {
      // Restore form data
      Object.keys(savedData).forEach((key) => {
        if (key !== 'photos') {
          setValue(key as keyof FormData, savedData[key as keyof FormData] as any);
        }
      });
      
      // Photos need special handling since File objects can't be serialized
      if (savedData.photos) {
        setPhotos(savedData.photos as PhotoData[]);
      }
    }
  }, [setValue]);

  // Auto-save form data when it changes
  const watchedData = watch();
  useEffect(() => {
    const dataToSave = {
      ...watchedData,
      photos,
    };
    saveFormData(dataToSave);
  }, [watchedData, photos]);

  // Function to check if a step is completed
  const isStepCompleted = (step: FormStep): boolean => {
    switch (step) {
      case 'observations':
        const obsData = watchedData.observations;
        if (!obsData?.siteLocation?.trim()) return false;
        if (!obsData?.engineerName?.trim()) return false;
        if (!obsData?.visitDate?.trim()) return false;
        if (!obsData?.structuralIssues || obsData.structuralIssues.length === 0) return false;
        
        for (const issue of obsData.structuralIssues) {
          if (!issue.location?.trim() || !issue.description?.trim()) return false;
        }
        return true;
        
      case 'testResults':
        return true; // Test results are optional
        
      case 'photos':
        return true; // Photos are optional
        
      case 'configuration':
        const configData = watchedData.configuration;
        if (!configData?.provider) return false;
        if (!configData?.apiKey?.trim()) return false;
        if (!configData?.model?.trim()) return false;
        if (!configData?.reportTemplate?.trim()) return false;
        if (configData?.provider === 'custom' && !configData?.endpoint?.trim()) return false;
        return true;
        
      default:
        return false;
    }
  };

  const progressSteps: ProgressStep[] = [
    { 
      id: 'observations', 
      title: 'Site Observations', 
      description: 'Document structural issues',
      status: currentStep === 'observations' ? 'active' : 
              isStepCompleted('observations') ? 'completed' : 'inactive'
    },
    { 
      id: 'testResults', 
      title: 'Test Results', 
      description: 'Laboratory analysis data',
      status: currentStep === 'testResults' ? 'active' : 
              (currentStep === 'photos' || currentStep === 'configuration') && isStepCompleted('testResults') ? 'completed' : 
              currentStep === 'photos' || currentStep === 'configuration' ? 'completed' : 'inactive'
    },
    { 
      id: 'photos', 
      title: 'Photo Documentation', 
      description: 'Visual evidence',
      status: currentStep === 'photos' ? 'active' : 
              currentStep === 'configuration' && isStepCompleted('photos') ? 'completed' :
              currentStep === 'configuration' ? 'completed' : 'inactive'
    },
    { 
      id: 'configuration', 
      title: 'LLM Configuration', 
      description: 'AI analysis settings',
      status: currentStep === 'configuration' ? 'active' : 
              isStepCompleted('configuration') ? 'completed' : 'inactive'
    },
  ];

  const currentStepIndex = progressSteps.findIndex(step => step.id === currentStep);

  const goToNextStep = () => {
    // Clear previous validation errors
    setValidationErrors([]);
    
    // Validate current step
    const errors = validateCurrentStep();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return; // Don't proceed if there are validation errors
    }
    
    // Show completion message if step is completed
    const stepNames = {
      observations: 'Site Observations',
      testResults: 'Test Results',
      photos: 'Photo Documentation',
      configuration: 'LLM Configuration'
    };
    setStepCompletionMessage(`✓ ${stepNames[currentStep]} completed successfully!`);
    setTimeout(() => setStepCompletionMessage(''), 3000);
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < progressSteps.length) {
      setCurrentStep(progressSteps[nextIndex].id as FormStep);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(progressSteps[prevIndex].id as FormStep);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log('Generate Report button clicked! Form data:', data);
    setIsSubmitting(true);
    setProcessingError('');
    
    try {
      // Include photos in the final data
      const finalData = {
        ...data,
        photos,
      };

      console.log('Final data prepared:', finalData);

      // Validate all required fields using Zod schema, but allow empty test results
      setProcessingStatus('Validating form data...');
      
      // Create a modified schema that allows empty test results
      const FlexibleFormDataSchema = FormDataSchema.extend({
        testResults: z.array(TestResultDataSchema).optional().default([])
      });
      
      const validationResult = FlexibleFormDataSchema.safeParse(finalData);
      
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map((err: any) => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }

      // Validate that we have at least one structural issue
      if (!finalData.observations.structuralIssues || finalData.observations.structuralIssues.length === 0) {
        throw new Error('At least one structural issue is required');
      }

      // Validate API key configuration
      setProcessingStatus('Validating LLM configuration...');
      const isValidConfig = await llmService.validateApiKey(finalData.configuration);
      if (!isValidConfig) {
        throw new Error('Invalid LLM configuration. Please check your API key and settings.');
      }

      // Call LLM service for analysis
      setProcessingStatus('Generating structural analysis...');
      const analysisResult = await llmService.generateAnalysis(finalData);

      console.log('Analysis completed:', analysisResult);
      
      // Clear saved data after successful processing
      clearFormData();
      
      // Navigate to download page with analysis results
      navigate('/download', { 
        state: { 
          formData: finalData,
          analysisResult: analysisResult
        } 
      });
      
    } catch (error) {
      console.error('Error processing form:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error instanceof LLMServiceError) {
        switch (error.code) {
          case 'MISSING_API_KEY':
            errorMessage = 'API key is required. Please configure your LLM settings.';
            break;
          case 'OPENAI_API_ERROR':
          case 'ANTHROPIC_API_ERROR':
          case 'CUSTOM_API_ERROR':
            errorMessage = `LLM API error: ${error.message}`;
            break;
          case 'MAX_RETRIES_EXCEEDED':
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          case 'EMPTY_RESPONSE':
            errorMessage = 'The LLM service returned an empty response. Please try again.';
            break;
          default:
            errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setProcessingError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setProcessingStatus('');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'observations':
        return <ObservationForm control={methods.control} />;
      case 'testResults':
        return <TestResultsForm control={methods.control} />;
      case 'photos':
        return (
          <PhotoUploadForm
            control={methods.control}
            photos={photos}
            onPhotosChange={setPhotos}
          />
        );
      case 'configuration':
        return <ConfigurationForm control={methods.control} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-primary-50 to-secondary-100 bg-pattern-dots">
        <Navigation />
        
        <div className="section-padding">
          <div className="container-modern">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 animate-fade-in">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gradient">
                Structural Analysis Input
              </h1>
              <p className="text-base sm:text-lg text-body max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
                Complete all sections to generate your comprehensive structural assessment report with AI-powered analysis
              </p>
              
              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/history')}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                >
                  View History
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  }
                >
                  Logout
                </Button>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-8 sm:mb-10 animate-slide-up px-4">
              <div className="card p-4 sm:p-6 lg:p-8 card-gradient">
                <Progress 
                  steps={progressSteps} 
                  currentStep={currentStep}
                  variant="horizontal"
                />
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 px-4">
              <div className="animate-slide-up">
                <div className="card p-4 sm:p-6 lg:p-8 shadow-large">
                  {renderCurrentStep()}
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="animate-fade-in">
                  <Alert variant="danger" title="Please fix the following errors:">
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </Alert>
                </div>
              )}

              {/* Step Completion Message */}
              {stepCompletionMessage && (
                <div className="animate-fade-in">
                  <Alert variant="success">
                    {stepCompletionMessage}
                  </Alert>
                </div>
              )}

              {/* Processing Status */}
              {(isSubmitting || processingStatus) && (
                <div className="animate-fade-in">
                  <Alert variant="info" title="Processing Report">
                    <div className="flex items-center space-x-3">
                      <div className="loading-spinner w-5 h-5 flex-shrink-0"></div>
                      <span className="text-sm sm:text-base">{processingStatus || 'Please wait while we process your structural analysis...'}</span>
                    </div>
                  </Alert>
                </div>
              )}

              {/* Error Display */}
              {processingError && (
                <div className="animate-fade-in">
                  <Alert 
                    variant="danger" 
                    title="Processing Error"
                    dismissible
                    onDismiss={() => setProcessingError('')}
                  >
                    <span className="text-sm sm:text-base">{processingError}</span>
                  </Alert>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="animate-slide-up">
                <Card padding="md" className="shadow-medium">
                  <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
                    <Button
                      variant="outline"
                      onClick={goToPreviousStep}
                      disabled={currentStepIndex === 0}
                      size="md"
                      type="button"
                      fullWidth={true}
                      className="sm:w-auto order-2 sm:order-1"
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      }
                    >
                      Previous Step
                    </Button>

                    <div className="flex items-center justify-center gap-3 px-4 py-2 bg-success-50 rounded-lg border border-success-200 order-1 sm:order-2">
                      <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-success-700 font-medium">Auto-saved</span>
                    </div>

                    <div className="order-3">
                      {currentStepIndex < progressSteps.length - 1 ? (
                        <Button
                          variant="primary"
                          onClick={goToNextStep}
                          size="md"
                          type="button"
                          fullWidth={true}
                          className="sm:w-auto"
                          iconPosition="right"
                          icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          }
                        >
                          Next Step
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          type="submit"
                          loading={isSubmitting}
                          size="lg"
                          fullWidth={true}
                          className="sm:w-auto"
                          icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          }
                        >
                          {isSubmitting ? 'Generating Report...' : 'Generate Report'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </form>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default InputPage;