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
import Loading from '../components/ui/Loading';
import Card from '../components/ui/Card';
import Icon from '../components/ui/Icon';

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
    // resolver: zodResolver(FormDataSchema),
    defaultValues: getDefaultFormData(),
    mode: 'onChange',
  });

  const { handleSubmit, watch, setValue, formState: { isValid } } = methods;

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

  // const goToStep = (step: FormStep) => {
  //   setCurrentStep(step);
  // };

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

  // const getStepValidation = (step: FormStep): boolean => {
  //   switch (step) {
  //     case 'observations':
  //       return !errors.observations;
  //     case 'testResults':
  //       return true; // Test results are optional
  //     case 'photos':
  //       return true; // Photos are optional
  //     case 'configuration':
  //       return !errors.configuration;
  //     default:
  //       return false;
  //   }
  // };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pattern-blueprint">
        <Navigation />
        <div className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-12 text-center animate-fade-in">
              <h1 className="text-engineering-title mb-4">
                Structural Analysis Input
              </h1>
              <p className="text-engineering-body max-w-2xl mx-auto mb-8">
                Complete all sections to generate your comprehensive structural assessment report with AI-powered analysis
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/history')}
                >
                  View History
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-10 animate-slide-up">
              <Card variant="engineering" className="p-8">
                <Progress 
                  steps={progressSteps} 
                  currentStep={currentStep}
                  variant="horizontal"
                />
              </Card>
            </div>

            {/* Form Content and Navigation */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="animate-slide-up">
                <Card variant="elevated" className="p-8 shadow-engineering-lg">
                  <div className="space-engineering">
                    {renderCurrentStep()}
                  </div>
                </Card>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="animate-fade-in mb-4">
                  <Alert variant="error" title="Please fix the following errors:" className="shadow-lg">
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
                <div className="animate-fade-in mb-4">
                  <Alert variant="success" title="Step Completed" className="shadow-lg">
                    {stepCompletionMessage}
                  </Alert>
                </div>
              )}

              {/* Processing Status */}
              {(isSubmitting || processingStatus) && (
                <div className="animate-fade-in">
                  <Alert variant="info" title="Processing Report" className="shadow-lg">
                    <div className="flex items-center space-x-3">
                      <Loading variant="spinner" size="sm" />
                      <span className="font-medium">{processingStatus || 'Please wait while we process your structural analysis...'}</span>
                    </div>
                  </Alert>
                </div>
              )}

              {/* Error Display */}
              {processingError && (
                <div className="animate-fade-in">
                  <Alert 
                    variant="error" 
                    title="Processing Error"
                    dismissible
                    onDismiss={() => setProcessingError('')}
                    className="shadow-lg"
                  >
                    {processingError}
                  </Alert>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="animate-slide-up">
                <Card className="p-6 shadow-engineering">
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      icon="arrow-left"
                      onClick={goToPreviousStep}
                      disabled={currentStepIndex === 0}
                      size="md"
                      type="button"
                    >
                      Previous Step
                    </Button>

                    <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                      <Icon name="save" size="xs" className="text-green-600" />
                      <span className="text-sm text-gray-600 font-medium">Auto-saved</span>
                    </div>

                    <div className="flex space-x-4">
                      {currentStepIndex < progressSteps.length - 1 ? (
                        <Button
                          variant="primary"
                          icon="arrow-right"
                          iconPosition="right"
                          onClick={goToNextStep}
                          size="md"
                          type="button"
                        >
                          Next Step
                        </Button>
                      ) : (
                        <Button
                          variant="engineering"
                          icon="check"
                          type="submit"
                          loading={isSubmitting}
                          disabled={!isValid || processingError !== ''}
                          size="lg"
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