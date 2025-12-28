import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { FormData, StructuralIssue } from '../../types';

interface ObservationFormProps {
  control: any;
}

const ObservationForm: React.FC<ObservationFormProps> = ({ control }) => {
  const { register, formState: { errors } } = useFormContext<FormData>();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'observations.structuralIssues',
  });

  const addStructuralIssue = () => {
    const newIssue: StructuralIssue = {
      id: Date.now().toString(),
      type: 'crack',
      severity: 'medium',
      location: '',
      description: '',
      measurements: '',
    };
    append(newIssue);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
        <div className="px-6 py-8 sm:p-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Manual Observations
          </h2>
          
          {/* Site Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
            <div>
              <label htmlFor="siteLocation" className="block text-base font-semibold text-gray-700 mb-2">
                Site Location *
              </label>
              <input
                type="text"
                id="siteLocation"
                {...register('observations.siteLocation')}
                className="block w-full max-w-md px-3 py-2 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                placeholder="Enter site location"
              />
              {errors.observations?.siteLocation && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {errors.observations.siteLocation.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="engineerName" className="block text-base font-semibold text-gray-700 mb-2">
                Engineer Name *
              </label>
              <input
                type="text"
                id="engineerName"
                {...register('observations.engineerName')}
                className="block w-full max-w-md px-3 py-2 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                placeholder="Enter engineer name"
              />
              {errors.observations?.engineerName && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {errors.observations.engineerName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="visitDate" className="block text-base font-semibold text-gray-700 mb-2">
                Visit Date *
              </label>
              <input
                type="date"
                id="visitDate"
                {...register('observations.visitDate')}
                className="block w-full max-w-md px-3 py-2 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
              />
              {errors.observations?.visitDate && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {errors.observations.visitDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Environmental Factors */}
          <div className="mb-8">
            <label htmlFor="environmentalFactors" className="block text-base font-semibold text-gray-700 mb-2">
              Environmental Factors
            </label>
            <textarea
              id="environmentalFactors"
              rows={3}
              {...register('observations.environmentalFactors')}
              className="block w-full max-w-2xl px-3 py-2 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
              placeholder="Describe environmental conditions, weather, etc."
            />
          </div>

          {/* Structural Issues */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Structural Issues *
              </h3>
              <button
                type="button"
                onClick={addStructuralIssue}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
              >
                Add Issue
              </button>
            </div>

            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-lg">No structural issues added yet.</p>
                <p className="text-base">Click "Add Issue" to get started.</p>
              </div>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="border-2 border-gray-200 rounded-xl p-6 mb-6 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-lg font-bold text-gray-900">
                    Issue #{index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-800 text-base font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition-all duration-200"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Issue Type *
                    </label>
                    <select
                      {...register(`observations.structuralIssues.${index}.type`)}
                      className="block w-full px-3 py-2 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                    >
                      <option value="crack">Crack</option>
                      <option value="settlement">Settlement</option>
                      <option value="corrosion">Corrosion</option>
                      <option value="deformation">Deformation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Severity *
                    </label>
                    <select
                      {...register(`observations.structuralIssues.${index}.severity`)}
                      className="block w-full px-3 py-2 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      {...register(`observations.structuralIssues.${index}.location`)}
                      className="block w-full max-w-lg px-3 py-2 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                      placeholder="Specify the location of the issue"
                    />
                    {errors.observations?.structuralIssues?.[index]?.location && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errors.observations.structuralIssues[index]?.location?.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      {...register(`observations.structuralIssues.${index}.description`)}
                      className="block w-full max-w-2xl px-3 py-2 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                      placeholder="Detailed description of the structural issue"
                    />
                    {errors.observations?.structuralIssues?.[index]?.description && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errors.observations.structuralIssues[index]?.description?.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Measurements
                    </label>
                    <input
                      type="text"
                      {...register(`observations.structuralIssues.${index}.measurements`)}
                      className="block w-full max-w-lg px-3 py-2 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                      placeholder="Dimensions, crack width, etc. (optional)"
                    />
                  </div>
                </div>
              </div>
            ))}

            {errors.observations?.structuralIssues && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                {errors.observations.structuralIssues.message}
              </p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="additionalNotes" className="block text-base font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="additionalNotes"
              rows={4}
              {...register('observations.additionalNotes')}
              className="block w-full max-w-2xl px-3 py-2 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
              placeholder="Any additional observations or notes"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservationForm;