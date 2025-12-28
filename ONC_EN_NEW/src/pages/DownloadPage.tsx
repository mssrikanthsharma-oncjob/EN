import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { FormData, LLMAnalysisResult, ReportData, ReportTemplate } from '../types';
import { reportService, ReportGenerationError } from '../services/reportService';
import { reportHistoryService } from '../services/reportHistoryService';
import Navigation from '../components/Navigation';
import { formatINR } from '../utils/currency';

interface LocationState {
  formData: FormData;
  analysisResult: LLMAnalysisResult;
}

const DownloadPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfMetadata, setPdfMetadata] = useState<{ size: number; generatedAt: Date } | null>(null);
  const [error, setError] = useState<string>('');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);

  // Get data from navigation state
  const state = location.state as LocationState | null;

  useEffect(() => {
    // Redirect if no data provided
    if (!state?.formData || !state?.analysisResult) {
      navigate('/input');
      return;
    }

    try {
      // Process the analysis result into structured report data
      const processedReportData = reportService.processAnalysisResult(
        state.formData,
        state.analysisResult
      );
      setReportData(processedReportData);

      // Load available templates
      const availableTemplates = reportService.getTemplates();
      setTemplates(availableTemplates);

      // Set default template based on form configuration
      const configuredTemplate = state.formData.configuration.reportTemplate;
      if (availableTemplates.some(t => t.id === configuredTemplate)) {
        setSelectedTemplate(configuredTemplate);
      }

      // Save to history
      reportHistoryService.saveReport(
        processedReportData,
        state.formData,
        state.analysisResult,
        selectedTemplate
      );
    } catch (error) {
      console.error('Error processing report data:', error);
      setError('Failed to process analysis results. Please try again.');
    }
  }, [state, navigate, selectedTemplate]);

  const handleGeneratePdf = async () => {
    if (!reportData) {
      setError('No report data available. Please return to input page and try again.');
      return;
    }

    setIsGeneratingPdf(true);
    setError('');

    try {
      const blob = await reportService.generatePDF(reportData, selectedTemplate);
      
      setPdfBlob(blob);
      setPdfMetadata({
        size: blob.size,
        generatedAt: new Date()
      });

      // Update history with PDF blob
      if (state) {
        reportHistoryService.saveReport(
          reportData,
          state.formData,
          state.analysisResult,
          selectedTemplate,
          blob
        );
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (error instanceof ReportGenerationError) {
        setError(`PDF Generation Error: ${error.message}`);
      } else if (error instanceof Error) {
        setError(`Failed to generate PDF: ${error.message}`);
      } else {
        setError('Failed to generate PDF. Please try again.');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfBlob || !reportData) return;

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    
    // Sanitize filename to remove invalid characters
    const sanitizedProjectId = reportData.projectInfo.projectId.replace(/[^a-zA-Z0-9-_]/g, '_');
    const sanitizedDate = reportData.projectInfo.reportDate.replace(/[^a-zA-Z0-9-_]/g, '_');
    link.download = `Structural_Analysis_Report_${sanitizedProjectId}_${sanitizedDate}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleNewAssessment = () => {
    navigate('/input');
  };

  const handleRegeneratePdf = () => {
    if (!reportData) return;
    
    if (!window.confirm('This will regenerate the PDF with the current template. Continue?')) {
      return;
    }
    
    setPdfBlob(null);
    setPdfMetadata(null);
    handleGeneratePdf();
  };

  const getRiskLevelColor = (riskLevel: string): string => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'text-green-800 bg-green-100';
      case 'medium':
        return 'text-yellow-800 bg-yellow-100';
      case 'high':
        return 'text-orange-800 bg-orange-100';
      case 'critical':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg text-gray-600">Processing analysis results...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Structural Analysis Report
            </h1>
            <p className="mt-2 text-gray-600">
              Review your analysis results and download the professional report
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Report Preview */}
            <div className="lg:col-span-2">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Report Preview
                </h2>

                {/* Project Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Project Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Site Location:</span>
                      <p className="text-gray-900">{reportData.projectInfo.siteLocation}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Project ID:</span>
                      <p className="text-gray-900">{reportData.projectInfo.projectId}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Engineer:</span>
                      <p className="text-gray-900">{reportData.projectInfo.engineerName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Report Date:</span>
                      <p className="text-gray-900">{reportData.projectInfo.reportDate}</p>
                    </div>
                  </div>
                </div>

                {/* Risk Level */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Overall Risk Assessment</h3>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(reportData.assessment.riskLevel)}`}>
                      {reportData.assessment.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Executive Summary</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {reportData.assessment.summary}
                  </p>
                </div>

                {/* Key Findings */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Key Findings ({reportData.assessment.findings.length} issues identified)
                  </h3>
                  <div className="space-y-3">
                    {reportData.assessment.findings.slice(0, 3).map((finding, index) => (
                      <div key={index} className="border-l-4 border-blue-400 pl-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{finding.issue}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(finding.severity)}`}>
                            {finding.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{finding.location}</p>
                        <p className="text-sm text-gray-700 mt-1">{finding.description}</p>
                      </div>
                    ))}
                    {reportData.assessment.findings.length > 3 && (
                      <p className="text-sm text-gray-500 italic">
                        ...and {reportData.assessment.findings.length - 3} more findings in the full report
                      </p>
                    )}
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Cost Analysis</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Material Costs:</span>
                        <p className="text-gray-900">{formatINR(reportData.costAnalysis.materialCosts.total)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Labor Costs:</span>
                        <p className="text-gray-900">{formatINR(reportData.costAnalysis.laborCosts.total)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Equipment Costs:</span>
                        <p className="text-gray-900">{formatINR(reportData.costAnalysis.equipmentCosts.total)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Contingency:</span>
                        <p className="text-gray-900">{formatINR(reportData.costAnalysis.contingency)}</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 mt-4 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Estimated Cost:</span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatINR(reportData.costAnalysis.finalTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Recommended Timeline</h3>
                  <p className="text-gray-700 text-sm">{reportData.remediation.timeline}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Report Actions
                </h2>

                {/* Template Selection */}
                <div className="mb-6">
                  <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                    Report Template
                  </label>
                  <select
                    id="template"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {templates.find(t => t.id === selectedTemplate)?.description}
                  </p>
                </div>

                {/* PDF Generation */}
                <div className="space-y-4">
                  {!pdfBlob ? (
                    <button
                      onClick={handleGeneratePdf}
                      disabled={isGeneratingPdf}
                      className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        isGeneratingPdf
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      }`}
                    >
                      {isGeneratingPdf ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating PDF...
                        </>
                      ) : (
                        'Generate PDF Report'
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center text-green-600 text-sm">
                        <span className="mr-2">✅</span>
                        PDF Generated Successfully
                        {pdfMetadata && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({(pdfMetadata.size / 1024).toFixed(1)} KB)
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={handleDownloadPdf}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Download PDF
                      </button>

                      <button
                        onClick={handleRegeneratePdf}
                        disabled={isGeneratingPdf}
                        className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                          isGeneratingPdf 
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                            : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                      >
                        {isGeneratingPdf ? 'Regenerating...' : 'Regenerate PDF'}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleNewAssessment}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    New Assessment
                  </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span className="text-red-400 text-lg">❌</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setError('')}
                            className="text-sm font-medium text-red-800 hover:text-red-600"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Report Metadata */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Report Details</h3>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Report ID: {reportData.id}</p>
                    <p>Version: {reportData.version}</p>
                    <p>Generated: {reportData.generatedAt.toLocaleString()}</p>
                    <p>Template: {templates.find(t => t.id === selectedTemplate)?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;