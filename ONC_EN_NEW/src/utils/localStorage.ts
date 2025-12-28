import type { FormData } from '../types';

const STORAGE_KEY = 'structural-analysis-form-data';

export const saveFormData = (data: Partial<FormData>): void => {
  try {
    // Don't save File objects directly as they can't be serialized
    const dataToSave = {
      ...data,
      photos: data.photos?.map(photo => ({
        ...photo,
        file: undefined, // Remove File object
      })) || [],
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving form data to localStorage:', error);
  }
};

export const loadFormData = (): Partial<FormData> | null => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return null;
  } catch (error) {
    console.error('Error loading form data from localStorage:', error);
    return null;
  }
};

export const clearFormData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing form data from localStorage:', error);
  }
};

export const getDefaultFormData = (): FormData => {
  return {
    observations: {
      siteLocation: '',
      engineerName: '',
      visitDate: new Date().toISOString().split('T')[0], // Today's date
      structuralIssues: [],
      environmentalFactors: '',
      additionalNotes: '',
    },
    testResults: [],
    photos: [],
    configuration: {
      provider: 'openai',
      apiKey: '',
      endpoint: '',
      model: 'gpt-4',
      temperature: 0.7,
      reportTemplate: 'standard',
    },
  };
};