// Core data types for the structural analysis platform

// Currency and regional types
export type CurrencyCode = 'INR';
export type RegionalMarket = 'india';

export interface CurrencyAmount {
  value: number;
  currency: CurrencyCode;
  formatted: string;
}

export interface IndianMarketPricing {
  region: string; // e.g., 'mumbai', 'delhi', 'bangalore'
  lastUpdated: Date;
  source: string; // e.g., 'government-rates', 'market-survey'
}

export interface StructuralIssue {
  id: string;
  type: 'crack' | 'settlement' | 'corrosion' | 'deformation' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  measurements?: string;
}

export interface ObservationData {
  siteLocation: string;
  engineerName: string;
  visitDate: string; // Using string for form handling, will convert to Date when needed
  structuralIssues: StructuralIssue[];
  environmentalFactors: string;
  additionalNotes: string;
}

export interface TestResult {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  specification: string;
  status: 'pass' | 'fail' | 'marginal';
}

export interface TestResultData {
  sampleId: string;
  testType: 'compression' | 'tension' | 'flexural' | 'chemical' | 'other';
  testDate: string;
  results: TestResult[];
  labCertification: string;
  comments: string;
}

export interface PhotoData {
  id: string;
  file: File;
  preview: string;
  base64: string;
  metadata: {
    size: number;
    type: string;
    lastModified: number;
  };
}

export interface LLMConfiguration {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  endpoint?: string;
  model: string;
  temperature: number;
  reportTemplate: string;
}

export interface FormData {
  observations: ObservationData;
  testResults: TestResultData[];
  photos: PhotoData[];
  configuration: LLMConfiguration;
}

// Report generation types
export interface Finding {
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
}

export interface AssessmentSection {
  summary: string;
  findings: Finding[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface RemediationProcedure {
  step: string;
  description: string;
  materials: string[];
  timeline: string;
}

export interface RemediationSection {
  approach: string;
  procedures: RemediationProcedure[];
  timeline: string;
  requirements: string[];
}

export interface MaterialItem {
  material: string;
  quantity: number;
  unit: string;
  specification: string;
  estimatedCost: number; // Amount in INR
  marketPricing?: IndianMarketPricing;
}

export interface MaterialEstimate {
  items: MaterialItem[];
  totalQuantity: number;
  specifications: string[];
  currency: CurrencyCode;
}

export interface CostBreakdown {
  items: Array<{ name: string; cost: number }>; // Costs in INR
  total: number; // Total in INR
  currency: CurrencyCode;
}

export interface CostAnalysis {
  materialCosts: CostBreakdown;
  laborCosts: CostBreakdown;
  equipmentCosts: CostBreakdown;
  totalEstimate: number; // Amount in INR
  contingency: number; // Amount in INR
  finalTotal: number; // Amount in INR
  currency: CurrencyCode;
  marketRegion: string; // Indian region for pricing context
  priceDate: Date; // When prices were last updated
}

export interface LLMAnalysisResult {
  assessment: AssessmentSection;
  remediation: RemediationSection;
  materialEstimate: MaterialEstimate;
  costAnalysis: CostAnalysis;
}

export interface ProjectInfo {
  siteLocation: string;
  engineerName: string;
  visitDate: string;
  reportDate: string;
  projectId: string;
}

export interface ReportData {
  id: string;
  projectInfo: ProjectInfo;
  assessment: AssessmentSection;
  remediation: RemediationSection;
  materialEstimate: MaterialEstimate;
  costAnalysis: CostAnalysis;
  generatedAt: Date;
  version: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  styling: {
    headerColor: string;
    accentColor: string;
    fontFamily: string;
    fontSize: number;
  };
}