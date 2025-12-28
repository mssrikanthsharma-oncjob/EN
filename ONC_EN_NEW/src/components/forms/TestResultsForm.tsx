import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { FormData, TestResultData, TestResult } from '../../types';

interface TestResultsFormProps {
  control: any;
}

const TestResultsForm: React.FC<TestResultsFormProps> = ({ control }) => {
  const { fields: testResultFields, append: appendTestResult, remove: removeTestResult } = useFieldArray({
    control,
    name: 'testResults',
  });

  const addTestResult = () => {
    const newTestResult: TestResultData = {
      sampleId: '',
      testType: 'compression',
      testDate: '',
      results: [],
      labCertification: '',
      comments: '',
    };
    appendTestResult(newTestResult);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Laboratory Test Results
            </h2>
            <button
              type="button"
              onClick={addTestResult}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add Test Result
            </button>
          </div>

          {testResultFields.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No test results added yet. Click "Add Test Result" to get started.
            </div>
          )}

          {testResultFields.map((testField, testIndex) => (
            <TestResultEntry
              key={testField.id}
              testIndex={testIndex}
              onRemove={() => removeTestResult(testIndex)}
              control={control}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface TestResultEntryProps {
  testIndex: number;
  onRemove: () => void;
  control: any;
}

const TestResultEntry: React.FC<TestResultEntryProps> = ({ testIndex, onRemove, control }) => {
  const { register, formState: { errors } } = useFormContext<FormData>();
  
  const { fields: resultFields, append: appendResult, remove: removeResult } = useFieldArray({
    control,
    name: `testResults.${testIndex}.results`,
  });

  const addTestParameter = () => {
    const newParameter: TestResult = {
      id: Date.now().toString(),
      parameter: '',
      value: 0,
      unit: '',
      specification: '',
      status: 'pass',
    };
    appendResult(newParameter);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-md font-medium text-gray-900">
          Test Result #{testIndex + 1}
        </h3>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Remove Test Result
        </button>
      </div>

      {/* Test Result Basic Information */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sample ID *
          </label>
          <input
            type="text"
            {...register(`testResults.${testIndex}.sampleId`)}
            className="mt-1 block w-full max-w-xs px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Enter sample ID"
          />
          {errors.testResults?.[testIndex]?.sampleId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.testResults[testIndex]?.sampleId?.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Test Type *
          </label>
          <select
            {...register(`testResults.${testIndex}.testType`)}
            className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="compression">Compression</option>
            <option value="tension">Tension</option>
            <option value="flexural">Flexural</option>
            <option value="chemical">Chemical</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Test Date *
          </label>
          <input
            type="date"
            {...register(`testResults.${testIndex}.testDate`)}
            className="mt-1 block w-full max-w-xs px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {errors.testResults?.[testIndex]?.testDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.testResults[testIndex]?.testDate?.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Lab Certification *
          </label>
          <input
            type="text"
            {...register(`testResults.${testIndex}.labCertification`)}
            className="mt-1 block w-full max-w-sm px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Lab certification number"
          />
          {errors.testResults?.[testIndex]?.labCertification && (
            <p className="mt-1 text-sm text-red-600">
              {errors.testResults[testIndex]?.labCertification?.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Comments
          </label>
          <textarea
            rows={2}
            {...register(`testResults.${testIndex}.comments`)}
            className="mt-1 block w-full max-w-lg px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Additional comments"
          />
        </div>
      </div>

      {/* Test Parameters */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-gray-900">
            Test Parameters *
          </h4>
          <button
            type="button"
            onClick={addTestParameter}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Parameter
          </button>
        </div>

        {resultFields.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No test parameters added yet. Click "Add Parameter" to get started.
          </div>
        )}

        {resultFields.map((resultField, resultIndex) => (
          <div key={resultField.id} className="bg-gray-50 rounded-md p-4 mb-3">
            <div className="flex justify-between items-start mb-3">
              <h5 className="text-xs font-medium text-gray-700">
                Parameter #{resultIndex + 1}
              </h5>
              <button
                type="button"
                onClick={() => removeResult(resultIndex)}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Parameter *
                </label>
                <input
                  type="text"
                  {...register(`testResults.${testIndex}.results.${resultIndex}.parameter`)}
                  className="mt-1 block w-full max-w-xs px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="e.g., Compressive Strength"
                />
                {errors.testResults?.[testIndex]?.results?.[resultIndex]?.parameter && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.testResults[testIndex]?.results?.[resultIndex]?.parameter?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Value *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register(`testResults.${testIndex}.results.${resultIndex}.value`, {
                    valueAsNumber: true,
                  })}
                  className="mt-1 block w-full max-w-24 px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="0.00"
                />
                {errors.testResults?.[testIndex]?.results?.[resultIndex]?.value && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.testResults[testIndex]?.results?.[resultIndex]?.value?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Unit *
                </label>
                <input
                  type="text"
                  {...register(`testResults.${testIndex}.results.${resultIndex}.unit`)}
                  className="mt-1 block w-full max-w-20 px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="MPa, kN, etc."
                />
                {errors.testResults?.[testIndex]?.results?.[resultIndex]?.unit && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.testResults[testIndex]?.results?.[resultIndex]?.unit?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Specification *
                </label>
                <input
                  type="text"
                  {...register(`testResults.${testIndex}.results.${resultIndex}.specification`)}
                  className="mt-1 block w-full max-w-32 px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Min/Max value"
                />
                {errors.testResults?.[testIndex]?.results?.[resultIndex]?.specification && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.testResults[testIndex]?.results?.[resultIndex]?.specification?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Status *
                </label>
                <select
                  {...register(`testResults.${testIndex}.results.${resultIndex}.status`)}
                  className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                  <option value="marginal">Marginal</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        {errors.testResults?.[testIndex]?.results && (
          <p className="mt-1 text-sm text-red-600">
            {errors.testResults[testIndex]?.results?.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default TestResultsForm;