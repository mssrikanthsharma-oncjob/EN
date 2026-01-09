import jsPDF from 'jspdf';
import type { 
  FormData, 
  LLMAnalysisResult, 
  ReportData, 
  ProjectInfo, 
  ReportTemplate 
} from '../types';
import { formatINR } from '../utils/currency';

export class ReportGenerationError extends Error {
  public code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'ReportGenerationError';
    this.code = code;
  }
}

export class ReportService {
  private readonly templates: Map<string, ReportTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize default report templates
   */
  private initializeTemplates(): void {
    const templates: ReportTemplate[] = [
      {
        id: 'standard',
        name: 'Standard Engineering Report',
        description: 'Professional standard format for structural assessments',
        sections: ['executive-summary', 'assessment', 'remediation', 'materials', 'costs', 'photos', 'appendices'],
        styling: {
          headerColor: '#1f2937',
          accentColor: '#3b82f6',
          fontFamily: 'helvetica',
          fontSize: 11
        }
      },
      {
        id: 'detailed',
        name: 'Detailed Technical Report',
        description: 'Comprehensive technical analysis with extensive details',
        sections: ['cover', 'executive-summary', 'methodology', 'assessment', 'calculations', 'remediation', 'materials', 'costs', 'photos', 'references', 'appendices'],
        styling: {
          headerColor: '#374151',
          accentColor: '#059669',
          fontFamily: 'helvetica',
          fontSize: 10
        }
      },
      {
        id: 'summary',
        name: 'Executive Summary Report',
        description: 'Concise report for stakeholders and decision makers',
        sections: ['executive-summary', 'key-findings', 'recommendations', 'cost-summary'],
        styling: {
          headerColor: '#7c2d12',
          accentColor: '#ea580c',
          fontFamily: 'helvetica',
          fontSize: 12
        }
      },
      {
        id: 'compliance',
        name: 'Code Compliance Report',
        description: 'Focus on building codes and regulatory requirements',
        sections: ['executive-summary', 'code-analysis', 'compliance-status', 'remediation', 'certification'],
        styling: {
          headerColor: '#581c87',
          accentColor: '#7c3aed',
          fontFamily: 'helvetica',
          fontSize: 11
        }
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Get available report templates
   */
  getTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get a specific template by ID
   */
  getTemplate(templateId: string): ReportTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Process LLM response into structured report data
   */
  processAnalysisResult(
    formData: FormData, 
    analysisResult: LLMAnalysisResult
  ): ReportData {
    try {
      const projectInfo: ProjectInfo = {
        siteLocation: formData.observations.siteLocation,
        engineerName: formData.observations.engineerName,
        visitDate: formData.observations.visitDate,
        reportDate: new Date().toISOString().split('T')[0],
        projectId: this.generateProjectId(formData.observations.siteLocation)
      };

      const reportData: ReportData = {
        id: this.generateReportId(),
        projectInfo,
        assessment: analysisResult.assessment,
        remediation: analysisResult.remediation,
        materialEstimate: analysisResult.materialEstimate,
        costAnalysis: analysisResult.costAnalysis,
        photos: formData.photos, // Include photos in report data
        generatedAt: new Date(),
        version: '1.0'
      };

      return reportData;
    } catch (error) {
      throw new ReportGenerationError(
        `Failed to process analysis result: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PROCESSING_ERROR'
      );
    }
  }

  /**
   * Generate PDF report using jsPDF
   */
  async generatePDF(
    reportData: ReportData, 
    templateId: string = 'standard'
  ): Promise<Blob> {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        throw new ReportGenerationError(`Template not found: ${templateId}`, 'TEMPLATE_NOT_FOUND');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set up document properties
      pdf.setProperties({
        title: `Structural Analysis Report - ${reportData.projectInfo.siteLocation}`,
        subject: 'Structural Engineering Assessment',
        author: reportData.projectInfo.engineerName,
        creator: 'Enstructura Consultants Platform'
      });

      // Add professional fonts (using built-in fonts for better compatibility)
      pdf.setFont('helvetica', 'normal');

      let currentY = 20;

      // Generate sections based on template
      for (const sectionId of template.sections) {
        currentY = await this.generateSection(pdf, reportData, sectionId, template, currentY);
        
        // Add page break if needed (leave space for footer)
        if (currentY > 250) {
          pdf.addPage();
          currentY = 20;
        }
      }

      // Add footer to all pages
      this.addFooter(pdf, reportData);

      return pdf.output('blob');
    } catch (error) {
      throw new ReportGenerationError(
        `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PDF_GENERATION_ERROR'
      );
    }
  }

  /**
   * Generate a specific section of the report
   */
  private async generateSection(
    pdf: jsPDF, 
    reportData: ReportData, 
    sectionId: string, 
    template: ReportTemplate, 
    startY: number
  ): Promise<number> {
    let currentY = startY;

    switch (sectionId) {
      case 'cover':
        currentY = this.generateCoverPage(pdf, reportData, template, currentY);
        break;
      case 'executive-summary':
        currentY = this.generateExecutiveSummary(pdf, reportData, template, currentY);
        break;
      case 'assessment':
        currentY = this.generateAssessmentSection(pdf, reportData, template, currentY);
        break;
      case 'remediation':
        currentY = this.generateRemediationSection(pdf, reportData, template, currentY);
        break;
      case 'materials':
        currentY = this.generateMaterialsSection(pdf, reportData, template, currentY);
        break;
      case 'costs':
        currentY = this.generateCostsSection(pdf, reportData, template, currentY);
        break;
      case 'photos':
        currentY = await this.generatePhotosSection(pdf, reportData, template, currentY);
        break;
      case 'key-findings':
        currentY = this.generateKeyFindings(pdf, reportData, template, currentY);
        break;
      case 'recommendations':
        currentY = this.generateRecommendations(pdf, reportData, template, currentY);
        break;
      case 'cost-summary':
        currentY = this.generateCostSummary(pdf, reportData, template, currentY);
        break;
      default:
        // Skip unknown sections
        break;
    }

    return currentY + 10; // Add spacing between sections
  }

  /**
   * Generate cover page
   */
  private generateCoverPage(
    pdf: jsPDF, 
    reportData: ReportData, 
    template: ReportTemplate, 
    _startY: number
  ): number {
    // Professional header with logo space
    pdf.setFillColor(template.styling.headerColor);
    pdf.rect(0, 0, 210, 40, 'F');
    
    // Company header
    pdf.setFontSize(28);
    pdf.setTextColor('#ffffff');
    pdf.text('ENSTRUCTURA CONSULTANTS', 105, 20, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setTextColor('#e5e7eb');
    pdf.text('Professional Structural Engineering Services', 105, 30, { align: 'center' });

    // Report title with professional styling
    pdf.setFillColor(template.styling.accentColor);
    pdf.rect(20, 60, 170, 25, 'F');
    
    pdf.setFontSize(22);
    pdf.setTextColor('#ffffff');
    pdf.text('STRUCTURAL ASSESSMENT REPORT', 105, 75, { align: 'center' });

    // Professional project information box
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(203, 213, 225);
    pdf.rect(30, 100, 150, 80, 'FD');
    
    pdf.setFontSize(16);
    pdf.setTextColor(template.styling.headerColor);
    pdf.text('PROJECT INFORMATION', 105, 115, { align: 'center' });
    
    // Project details with better formatting
    pdf.setFontSize(12);
    pdf.setTextColor('#374151');
    const projectInfo = [
      { label: 'Site Location:', value: reportData.projectInfo.siteLocation },
      { label: 'Project ID:', value: reportData.projectInfo.projectId },
      { label: 'Site Visit Date:', value: new Date(reportData.projectInfo.visitDate).toLocaleDateString('en-IN') },
      { label: 'Report Date:', value: new Date(reportData.projectInfo.reportDate).toLocaleDateString('en-IN') },
      { label: 'Lead Engineer:', value: reportData.projectInfo.engineerName }
    ];

    let infoY = 125;
    projectInfo.forEach(info => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(info.label, 35, infoY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(info.value, 85, infoY);
      infoY += 10;
    });

    // Professional risk level indicator with icon
    const riskColor = this.getRiskColor(reportData.assessment.riskLevel);
    pdf.setFillColor(riskColor.r, riskColor.g, riskColor.b);
    pdf.roundedRect(60, 200, 90, 30, 5, 5, 'F');
    
    pdf.setFontSize(18);
    pdf.setTextColor('#ffffff');
    pdf.setFont('helvetica', 'bold');
    pdf.text('RISK ASSESSMENT', 105, 212, { align: 'center' });
    pdf.setFontSize(16);
    pdf.text(reportData.assessment.riskLevel.toUpperCase(), 105, 222, { align: 'center' });

    // Professional footer
    pdf.setFillColor(71, 85, 105);
    pdf.rect(0, 270, 210, 27, 'F');
    
    pdf.setFontSize(10);
    pdf.setTextColor('#ffffff');
    pdf.text('This report is confidential and proprietary to Enstructura Consultants', 105, 280, { align: 'center' });
    pdf.text(`Generated on ${new Date().toLocaleDateString('en-IN')} | Version ${reportData.version}`, 105, 290, { align: 'center' });

    pdf.addPage();
    return 20;
  }

  /**
   * Generate executive summary section
   */
  private generateExecutiveSummary(
    pdf: jsPDF, 
    reportData: ReportData, 
    template: ReportTemplate, 
    startY: number
  ): number {
    let currentY = startY;

    // Section header
    currentY = this.addSectionHeader(pdf, 'EXECUTIVE SUMMARY', template, currentY);

    // Summary content
    pdf.setFontSize(template.styling.fontSize);
    pdf.setTextColor('#333333');
    
    const summaryLines = pdf.splitTextToSize(reportData.assessment.summary, 170);
    pdf.text(summaryLines, 20, currentY);
    currentY += summaryLines.length * 5 + 10;

    // Key metrics
    currentY = this.addSubheader(pdf, 'Key Metrics', template, currentY);
    
    const metrics = [
      `Overall Risk Level: ${reportData.assessment.riskLevel.toUpperCase()}`,
      `Number of Issues Identified: ${reportData.assessment.findings.length}`,
      `Estimated Total Cost: ${formatINR(reportData.costAnalysis.finalTotal)}`,
      `Recommended Timeline: ${reportData.remediation.timeline}`
    ];

    metrics.forEach(metric => {
      pdf.text(`• ${metric}`, 25, currentY);
      currentY += 6;
    });

    return currentY;
  }

  /**
   * Generate assessment section
   */
  private generateAssessmentSection(
    pdf: jsPDF, 
    reportData: ReportData, 
    template: ReportTemplate, 
    startY: number
  ): number {
    let currentY = startY;

    // Section header
    currentY = this.addSectionHeader(pdf, 'STRUCTURAL ASSESSMENT', template, currentY);

    // Findings
    currentY = this.addSubheader(pdf, 'Identified Issues', template, currentY);

    reportData.assessment.findings.forEach((finding, index) => {
      // Check if we need a new page
      if (currentY > 240) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFontSize(template.styling.fontSize + 1);
      pdf.setTextColor(template.styling.headerColor);
      pdf.text(`${index + 1}. ${finding.issue}`, 20, currentY);
      currentY += 7;

      pdf.setFontSize(template.styling.fontSize);
      pdf.setTextColor('#333333');
      
      // Severity indicator
      const severityColor = this.getRiskColor(finding.severity);
      pdf.setFillColor(severityColor.r, severityColor.g, severityColor.b);
      pdf.rect(25, currentY - 3, 20, 5, 'F');
      pdf.setTextColor('#ffffff');
      pdf.text(finding.severity.toUpperCase(), 35, currentY, { align: 'center' });
      
      pdf.setTextColor('#333333');
      pdf.text(`Location: ${finding.location}`, 50, currentY);
      currentY += 8;

      const descriptionLines = pdf.splitTextToSize(finding.description, 160);
      pdf.text(descriptionLines, 25, currentY);
      currentY += descriptionLines.length * 5 + 8;
    });

    return currentY;
  }

  /**
   * Generate remediation section
   */
  private generateRemediationSection(
    pdf: jsPDF, 
    reportData: ReportData, 
    template: ReportTemplate, 
    startY: number
  ): number {
    let currentY = startY;

    // Section header
    currentY = this.addSectionHeader(pdf, 'REMEDIATION PLAN', template, currentY);

    // Approach
    currentY = this.addSubheader(pdf, 'Approach', template, currentY);
    
    pdf.setFontSize(template.styling.fontSize);
    pdf.setTextColor('#333333');
    const approachLines = pdf.splitTextToSize(reportData.remediation.approach, 170);
    pdf.text(approachLines, 20, currentY);
    currentY += approachLines.length * 5 + 10;

    // Procedures
    currentY = this.addSubheader(pdf, 'Procedures', template, currentY);

    reportData.remediation.procedures.forEach((procedure, index) => {
      // Check if we need a new page
      if (currentY > 230) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFontSize(template.styling.fontSize + 1);
      pdf.setTextColor(template.styling.headerColor);
      pdf.text(`Step ${index + 1}: ${procedure.step}`, 20, currentY);
      currentY += 7;

      pdf.setFontSize(template.styling.fontSize);
      pdf.setTextColor('#333333');
      
      const descLines = pdf.splitTextToSize(procedure.description, 160);
      pdf.text(descLines, 25, currentY);
      currentY += descLines.length * 5 + 5;

      if (procedure.materials.length > 0) {
        pdf.text('Materials:', 25, currentY);
        currentY += 5;
        procedure.materials.forEach(material => {
          pdf.text(`• ${material}`, 30, currentY);
          currentY += 5;
        });
      }

      pdf.text(`Timeline: ${procedure.timeline}`, 25, currentY);
      currentY += 10;
    });

    return currentY;
  }

  /**
   * Generate materials section
   */
  private generateMaterialsSection(
    pdf: jsPDF, 
    reportData: ReportData, 
    template: ReportTemplate, 
    startY: number
  ): number {
    let currentY = startY;

    // Section header
    currentY = this.addSectionHeader(pdf, 'MATERIAL ESTIMATES', template, currentY);

    // Table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, currentY, 170, 8, 'F');
    
    pdf.setFontSize(template.styling.fontSize);
    pdf.setTextColor(template.styling.headerColor);
    pdf.text('Material', 22, currentY + 5);
    pdf.text('Quantity', 80, currentY + 5);
    pdf.text('Unit', 120, currentY + 5);
    pdf.text('Est. Cost', 160, currentY + 5);
    currentY += 12;

    // Table rows
    pdf.setTextColor('#333333');
    reportData.materialEstimate.items.forEach((item, index) => {
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
      }

      if (index % 2 === 0) {
        pdf.setFillColor(248, 248, 248);
        pdf.rect(20, currentY - 2, 170, 6, 'F');
      }

      pdf.text(item.material, 22, currentY + 2);
      pdf.text(item.quantity.toString(), 80, currentY + 2);
      pdf.text(item.unit, 120, currentY + 2);
      pdf.text(formatINR(item.estimatedCost), 160, currentY + 2);
      currentY += 6;
    });

    return currentY + 10;
  }

  /**
   * Generate costs section
   */
  private generateCostsSection(
    pdf: jsPDF, 
    reportData: ReportData, 
    template: ReportTemplate, 
    startY: number
  ): number {
    let currentY = startY;

    // Section header
    currentY = this.addSectionHeader(pdf, 'COST ANALYSIS', template, currentY);

    const costSections = [
      { title: 'Material Costs', data: reportData.costAnalysis.materialCosts },
      { title: 'Labor Costs', data: reportData.costAnalysis.laborCosts },
      { title: 'Equipment Costs', data: reportData.costAnalysis.equipmentCosts }
    ];

    costSections.forEach(section => {
      if (section.data.items.length > 0) {
        currentY = this.addSubheader(pdf, section.title, template, currentY);
        
        section.data.items.forEach(item => {
          pdf.setFontSize(template.styling.fontSize);
          pdf.setTextColor('#333333');
          pdf.text(`• ${item.name}`, 25, currentY);
          pdf.text(formatINR(item.cost), 160, currentY);
          currentY += 6;
        });

        pdf.setFontSize(template.styling.fontSize + 1);
        pdf.setTextColor(template.styling.headerColor);
        pdf.text(`Subtotal: ${formatINR(section.data.total)}`, 25, currentY);
        currentY += 10;
      }
    });

    // Summary
    currentY = this.addSubheader(pdf, 'Cost Summary', template, currentY);
    
    const summary = [
      { label: 'Total Estimate', amount: reportData.costAnalysis.totalEstimate },
      { label: 'Contingency (10%)', amount: reportData.costAnalysis.contingency },
      { label: 'Final Total', amount: reportData.costAnalysis.finalTotal, bold: true }
    ];

    summary.forEach(item => {
      pdf.setFontSize(item.bold ? template.styling.fontSize + 2 : template.styling.fontSize);
      pdf.setTextColor(item.bold ? template.styling.headerColor : '#333333');
      pdf.text(item.label, 25, currentY);
      pdf.text(formatINR(item.amount), 160, currentY);
      currentY += item.bold ? 8 : 6;
    });

    return currentY;
  }

  /**
   * Generate photos section
   */
  private async generatePhotosSection(
    pdf: jsPDF, 
    reportData: ReportData, 
    template: ReportTemplate, 
    startY: number
  ): Promise<number> {
    let currentY = startY;

    if (!reportData.photos || reportData.photos.length === 0) {
      return currentY;
    }

    // Section header
    currentY = this.addSectionHeader(pdf, 'PHOTO DOCUMENTATION', template, currentY);

    // Add photos in a grid layout
    const photosPerRow = 2;
    const photoWidth = 75; // mm
    const photoHeight = 60; // mm
    const photoSpacing = 10; // mm
    const startX = 20; // mm

    for (let i = 0; i < reportData.photos.length; i++) {
      const photo = reportData.photos[i];
      const row = Math.floor(i / photosPerRow);
      const col = i % photosPerRow;
      
      const x = startX + col * (photoWidth + photoSpacing);
      const y = currentY + row * (photoHeight + 20);

      // Check if we need a new page
      if (y + photoHeight > 250) {
        pdf.addPage();
        currentY = 20;
        const newRow = Math.floor(i / photosPerRow) - Math.floor(i / photosPerRow);
        const newY = currentY + newRow * (photoHeight + 20);
        
        try {
          // Add photo to PDF using base64 data
          if (photo.base64) {
            pdf.addImage(photo.base64, 'JPEG', x, newY, photoWidth, photoHeight);
            
            // Add photo caption
            pdf.setFontSize(8);
            pdf.setTextColor('#666666');
            const caption = photo.file?.name || `Photo ${i + 1}`;
            const captionLines = pdf.splitTextToSize(caption, photoWidth);
            pdf.text(captionLines, x, newY + photoHeight + 5);
          }
        } catch (error) {
          console.error('Error adding photo to PDF:', error);
          // Add placeholder if photo fails to load
          pdf.setDrawColor('#cccccc');
          pdf.rect(x, newY, photoWidth, photoHeight);
          pdf.setFontSize(10);
          pdf.setTextColor('#999999');
          pdf.text('Photo unavailable', x + photoWidth/2, newY + photoHeight/2, { align: 'center' });
        }
      } else {
        try {
          // Add photo to PDF using base64 data
          if (photo.base64) {
            pdf.addImage(photo.base64, 'JPEG', x, y, photoWidth, photoHeight);
            
            // Add photo caption
            pdf.setFontSize(8);
            pdf.setTextColor('#666666');
            const caption = photo.file?.name || `Photo ${i + 1}`;
            const captionLines = pdf.splitTextToSize(caption, photoWidth);
            pdf.text(captionLines, x, y + photoHeight + 5);
          }
        } catch (error) {
          console.error('Error adding photo to PDF:', error);
          // Add placeholder if photo fails to load
          pdf.setDrawColor('#cccccc');
          pdf.rect(x, y, photoWidth, photoHeight);
          pdf.setFontSize(10);
          pdf.setTextColor('#999999');
          pdf.text('Photo unavailable', x + photoWidth/2, y + photoHeight/2, { align: 'center' });
        }
      }
    }

    // Calculate final Y position
    const totalRows = Math.ceil(reportData.photos.length / photosPerRow);
    currentY += totalRows * (photoHeight + 20) + 10;

    return currentY;
  }

  /**
   * Generate key findings (for summary template)
   */
  private generateKeyFindings(
    pdf: jsPDF, 
    reportData: ReportData, 
    template: ReportTemplate, 
    startY: number
  ): number {
    let currentY = startY;

    currentY = this.addSectionHeader(pdf, 'KEY FINDINGS', template, currentY);

    const criticalFindings = reportData.assessment.findings
      .filter(f => f.severity === 'critical' || f.severity === 'high')
      .slice(0, 5); // Top 5 critical findings

    criticalFindings.forEach((finding, index) => {
      pdf.setFontSize(template.styling.fontSize);
      pdf.setTextColor('#333333');
      pdf.text(`${index + 1}. ${finding.issue} (${finding.severity.toUpperCase()})`, 25, currentY);
      currentY += 6;
    });

    return currentY + 10;
  }

  /**
   * Generate recommendations (for summary template)
   */
  private generateRecommendations(
    pdf: jsPDF, 
    reportData: ReportData, 
    template: ReportTemplate, 
    startY: number
  ): number {
    let currentY = startY;

    currentY = this.addSectionHeader(pdf, 'RECOMMENDATIONS', template, currentY);

    reportData.assessment.recommendations.slice(0, 5).forEach((rec, index) => {
      pdf.setFontSize(template.styling.fontSize);
      pdf.setTextColor('#333333');
      const recLines = pdf.splitTextToSize(`${index + 1}. ${rec}`, 165);
      pdf.text(recLines, 25, currentY);
      currentY += recLines.length * 5 + 3;
    });

    return currentY + 10;
  }

  /**
   * Generate cost summary (for summary template)
   */
  private generateCostSummary(
    pdf: jsPDF, 
    reportData: ReportData, 
    template: ReportTemplate, 
    startY: number
  ): number {
    let currentY = startY;

    currentY = this.addSectionHeader(pdf, 'COST SUMMARY', template, currentY);

    pdf.setFontSize(template.styling.fontSize + 4);
    pdf.setTextColor(template.styling.accentColor);
    pdf.text(`Total Estimated Cost: ${formatINR(reportData.costAnalysis.finalTotal)}`, 105, currentY, { align: 'center' });
    currentY += 15;

    pdf.setFontSize(template.styling.fontSize);
    pdf.setTextColor('#333333');
    pdf.text(`Timeline: ${reportData.remediation.timeline}`, 105, currentY, { align: 'center' });

    return currentY + 10;
  }

  /**
   * Add section header
   */
  private addSectionHeader(
    pdf: jsPDF, 
    title: string, 
    template: ReportTemplate, 
    y: number
  ): number {
    pdf.setFillColor(template.styling.headerColor);
    pdf.rect(20, y - 2, 170, 10, 'F');
    
    pdf.setFontSize(template.styling.fontSize + 3);
    pdf.setTextColor('#ffffff');
    pdf.text(title, 22, y + 5);
    
    return y + 15;
  }

  /**
   * Add subsection header
   */
  private addSubheader(
    pdf: jsPDF, 
    title: string, 
    template: ReportTemplate, 
    y: number
  ): number {
    pdf.setFontSize(template.styling.fontSize + 2);
    pdf.setTextColor(template.styling.accentColor);
    pdf.text(title, 20, y);
    
    return y + 8;
  }

  /**
   * Add footer to all pages
   */
  private addFooter(pdf: jsPDF, reportData: ReportData): void {
    const pageCount = pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      pdf.setFontSize(8);
      pdf.setTextColor('#666666');
      
      // Left footer
      pdf.text(`${reportData.projectInfo.siteLocation} - ${reportData.projectInfo.reportDate}`, 20, 285);
      
      // Center footer
      pdf.text('Enstructura Consultants', 105, 285, { align: 'center' });
      
      // Right footer
      pdf.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
    }
  }

  /**
   * Get color for risk/severity level
   */
  private getRiskColor(level: string): { r: number; g: number; b: number } {
    switch (level.toLowerCase()) {
      case 'low':
        return { r: 34, g: 197, b: 94 }; // Green
      case 'medium':
        return { r: 251, g: 191, b: 36 }; // Yellow
      case 'high':
        return { r: 249, g: 115, b: 22 }; // Orange
      case 'critical':
        return { r: 239, g: 68, b: 68 }; // Red
      default:
        return { r: 107, g: 114, b: 128 }; // Gray
    }
  }

  /**
   * Generate unique project ID
   */
  private generateProjectId(siteLocation: string): string {
    const locationCode = siteLocation
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 6)
      .toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `ENS-${locationCode}-${timestamp}`;
  }

  /**
   * Generate unique report ID
   */
  private generateReportId(): string {
    return `RPT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  /**
   * Get current market pricing data (placeholder implementation)
   */
  async getCurrentMarketPricing(): Promise<Record<string, number>> {
    // In a real implementation, this would fetch from a pricing API
    // For now, return static pricing data
    return {
      'concrete': 150, // per cubic yard
      'steel_rebar': 0.85, // per pound
      'structural_steel': 2.50, // per pound
      'lumber': 8.50, // per board foot
      'labor_skilled': 75, // per hour
      'labor_general': 45, // per hour
      'equipment_crane': 200, // per hour
      'equipment_excavator': 150 // per hour
    };
  }
}

// Export singleton instance
export const reportService = new ReportService();