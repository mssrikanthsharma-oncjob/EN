import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { FormData } from '../../types';
import { llmService } from '../../services/llmService';

interface ConfigurationFormProps {
  control: any;
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = () => {
  const { register, formState: { errors }, watch } = useFormContext<FormData>();
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');

  const watchedProvider = watch('configuration.provider');
  const watchedApiKey = watch('configuration.apiKey');

  const testConnection = async () => {
    if (!watchedApiKey) {
      setConnectionStatus('error');
      setConnectionMessage('Please enter an API key first');
      return;
    }

    if (!watchedProvider) {
      setConnectionStatus('error');
      setConnectionMessage('Please select a provider first');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');
    setConnectionMessage('');

    try {
      const config = {
        provider: watchedProvider,
        apiKey: watchedApiKey,
        endpoint: watch('configuration.endpoint'),
        model: watch('configuration.model') || 'gpt-3.5-turbo', // Default model for testing
        temperature: watch('configuration.temperature') || 0.7,
        reportTemplate: watch('configuration.reportTemplate') || 'standard'
      };

      const isValid = await llmService.validateApiKey(config);
      
      if (isValid) {
        setConnectionStatus('success');
        setConnectionMessage('Connection successful! API key is valid.');
      } else {
        setConnectionStatus('error');
        setConnectionMessage('Invalid API key or connection failed. Please check your settings.');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage('Connection failed. Please check your settings and try again.');
      console.error('API key validation error:', error);
    } finally {
      setTestingConnection(false);
    }
  };

  const reportTemplates = [
    { value: 'standard', label: 'Standard Structural Assessment Report' },
    { value: 'detailed', label: 'Detailed Engineering Report' },
    { value: 'summary', label: 'Executive Summary Report' },
    { value: 'compliance', label: 'Code Compliance Report' },
  ];

  const modelOptions = {
    openai: [
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    ],
    anthropic: [
      { value: 'claude-3-opus', label: 'Claude 3 Opus' },
      { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
      { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
    ],
    custom: [
      { value: 'custom-model', label: 'Custom Model' },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            LLM Configuration
          </h2>

          {/* Provider Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LLM Provider *
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
                  <input
                    type="radio"
                    value="openai"
                    defaultChecked={true}
                    {...register('configuration.provider')}
                    className="sr-only"
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        OpenAI
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        GPT-4, GPT-3.5 Turbo
                      </span>
                    </span>
                  </span>
                  <span className={`text-lg ${watchedProvider === 'openai' ? 'text-blue-600' : 'text-gray-300'}`}>
                    ✓
                  </span>
                </label>
              </div>

              <div>
                <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
                  <input
                    type="radio"
                    value="anthropic"
                    {...register('configuration.provider')}
                    className="sr-only"
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        Anthropic
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        Claude 3 Models
                      </span>
                    </span>
                  </span>
                  <span className={`text-lg ${watchedProvider === 'anthropic' ? 'text-blue-600' : 'text-gray-300'}`}>
                    ✓
                  </span>
                </label>
              </div>

              <div>
                <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
                  <input
                    type="radio"
                    value="custom"
                    {...register('configuration.provider')}
                    className="sr-only"
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        Custom
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        Custom endpoint
                      </span>
                    </span>
                  </span>
                  <span className={`text-lg ${watchedProvider === 'custom' ? 'text-blue-600' : 'text-gray-300'}`}>
                    ✓
                  </span>
                </label>
              </div>
            </div>
            {errors.configuration?.provider && (
              <p className="mt-1 text-sm text-red-600">
                {errors.configuration.provider.message}
              </p>
            )}
          </div>

          {/* API Configuration */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                API Key *
              </label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  id="apiKey"
                  {...register('configuration.apiKey')}
                  className="block w-full max-w-md px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm pr-10"
                  placeholder="Enter your API key"
                />
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={testingConnection || !watchedApiKey}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {testingConnection ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  ) : (
                    <span className="text-gray-400 hover:text-gray-600">✓</span>
                  )}
                </button>
              </div>
              {errors.configuration?.apiKey && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.configuration.apiKey.message}
                </p>
              )}
              {connectionMessage && (
                <p className={`mt-1 text-sm ${connectionStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {connectionMessage}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                Model *
              </label>
              <select
                id="model"
                defaultValue="gpt-4"
                {...register('configuration.model')}
                className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select a model</option>
                {watchedProvider && modelOptions[watchedProvider]?.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
              {errors.configuration?.model && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.configuration.model.message}
                </p>
              )}
            </div>
          </div>

          {/* Custom Endpoint (only for custom provider) */}
          {watchedProvider === 'custom' && (
            <div className="mb-6">
              <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700">
                Custom Endpoint
              </label>
              <input
                type="url"
                id="endpoint"
                {...register('configuration.endpoint')}
                className="mt-1 block w-full max-w-lg px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="https://api.example.com/v1"
              />
              {errors.configuration?.endpoint && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.configuration.endpoint.message}
                </p>
              )}
            </div>
          )}

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                Temperature
              </label>
              <input
                type="number"
                id="temperature"
                step="0.1"
                min="0"
                max="2"
                defaultValue={0.7}
                {...register('configuration.temperature', { valueAsNumber: true })}
                className="mt-1 block w-full max-w-24 px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="0.7"
              />
              <p className="mt-1 text-xs text-gray-500">
                Controls randomness. Lower values = more focused, higher values = more creative
              </p>
            </div>

            <div>
              <label htmlFor="reportTemplate" className="block text-sm font-medium text-gray-700">
                Report Template *
              </label>
              <select
                id="reportTemplate"
                defaultValue="standard"
                {...register('configuration.reportTemplate')}
                className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select a template</option>
                {reportTemplates.map((template) => (
                  <option key={template.value} value={template.value}>
                    {template.label}
                  </option>
                ))}
              </select>
              {errors.configuration?.reportTemplate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.configuration.reportTemplate.message}
                </p>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-lg">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Security Notice
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Your API key is stored securely in your browser's local storage and is never transmitted to our servers. 
                    It is only used to communicate directly with your chosen LLM provider.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationForm;