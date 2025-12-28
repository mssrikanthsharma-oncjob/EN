import { z } from 'zod';

// Structural Issue Schema
export const StructuralIssueSchema = z.object({
  id: z.string(),
  type: z.enum(['crack', 'settlement', 'corrosion', 'deformation', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
  measurements: z.string().optional(),
});

// Observation Data Schema
export const ObservationSchema = z.object({
  siteLocation: z.string().min(1, 'Site location is required'),
  engineerName: z.string().min(1, 'Engineer name is required'),
  visitDate: z.string().min(1, 'Visit date is required'),
  structuralIssues: z.array(StructuralIssueSchema).min(1, 'At least one structural issue is required'),
  environmentalFactors: z.string(),
  additionalNotes: z.string(),
});

// Test Result Schema
export const TestResultSchema = z.object({
  id: z.string(),
  parameter: z.string().min(1, 'Parameter is required'),
  value: z.number().min(0, 'Value must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  specification: z.string().min(1, 'Specification is required'),
  status: z.enum(['pass', 'fail', 'marginal']),
});

// Test Result Data Schema
export const TestResultDataSchema = z.object({
  sampleId: z.string().min(1, 'Sample ID is required'),
  testType: z.enum(['compression', 'tension', 'flexural', 'chemical', 'other']),
  testDate: z.string().min(1, 'Test date is required'),
  results: z.array(TestResultSchema).min(1, 'At least one test result is required'),
  labCertification: z.string().min(1, 'Lab certification is required'),
  comments: z.string(),
});

// LLM Configuration Schema
export const LLMConfigurationSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'custom']),
  apiKey: z.string().min(1, 'API key is required'),
  endpoint: z.string().optional(),
  model: z.string().min(1, 'Model is required'),
  temperature: z.number().min(0).max(2).default(0.7),
  reportTemplate: z.string().min(1, 'Report template is required'),
});

// Complete Form Data Schema
export const FormDataSchema = z.object({
  observations: ObservationSchema,
  testResults: z.array(TestResultDataSchema),
  photos: z.array(z.any()), // Will be validated separately due to File objects
  configuration: LLMConfigurationSchema,
});