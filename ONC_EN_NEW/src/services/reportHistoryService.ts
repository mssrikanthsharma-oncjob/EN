import type { ReportData, FormData, LLMAnalysisResult } from '../types';

export interface ReportHistoryItem {
  id: string;
  reportData: ReportData;
  formData: FormData;
  analysisResult: LLMAnalysisResult;
  pdfBlob?: Blob;
  createdAt: Date;
  templateUsed: string;
}

export class ReportHistoryService {
  private readonly storageKey = 'enstructura_report_history';
  private readonly maxHistoryItems = 50;

  /**
   * Save a report to history
   */
  saveReport(
    reportData: ReportData,
    formData: FormData,
    analysisResult: LLMAnalysisResult,
    templateUsed: string,
    pdfBlob?: Blob
  ): void {
    try {
      const historyItem: ReportHistoryItem = {
        id: reportData.id,
        reportData,
        formData,
        analysisResult,
        pdfBlob,
        createdAt: new Date(),
        templateUsed
      };

      const history = this.getHistory();
      
      // Remove existing item with same ID if it exists
      const filteredHistory = history.filter(item => item.id !== reportData.id);
      
      // Add new item at the beginning
      filteredHistory.unshift(historyItem);
      
      // Keep only the most recent items
      const trimmedHistory = filteredHistory.slice(0, this.maxHistoryItems);
      
      // Save to localStorage (excluding PDF blob for storage efficiency)
      const historyForStorage = trimmedHistory.map(item => ({
        ...item,
        pdfBlob: undefined // Don't store PDF blobs in localStorage
      }));
      
      localStorage.setItem(this.storageKey, JSON.stringify(historyForStorage));
      
      // Store PDF blob separately if provided
      if (pdfBlob) {
        this.storePdfBlob(reportData.id, pdfBlob);
      }
    } catch (error) {
      console.error('Failed to save report to history:', error);
    }
  }

  /**
   * Get all reports from history
   */
  getHistory(): ReportHistoryItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      return parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        reportData: {
          ...item.reportData,
          generatedAt: new Date(item.reportData.generatedAt)
        }
      }));
    } catch (error) {
      console.error('Failed to load report history:', error);
      return [];
    }
  }

  /**
   * Get a specific report by ID
   */
  getReport(reportId: string): ReportHistoryItem | null {
    const history = this.getHistory();
    const report = history.find(item => item.id === reportId);
    
    if (report) {
      // Try to load PDF blob if it exists
      const pdfBlob = this.getPdfBlob(reportId);
      if (pdfBlob) {
        report.pdfBlob = pdfBlob;
      }
    }
    
    return report || null;
  }

  /**
   * Delete a report from history
   */
  deleteReport(reportId: string): boolean {
    try {
      const history = this.getHistory();
      const filteredHistory = history.filter(item => item.id !== reportId);
      
      if (filteredHistory.length === history.length) {
        return false; // Report not found
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredHistory));
      this.deletePdfBlob(reportId);
      
      return true;
    } catch (error) {
      console.error('Failed to delete report from history:', error);
      return false;
    }
  }

  /**
   * Clear all report history
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(this.storageKey);
      this.clearAllPdfBlobs();
    } catch (error) {
      console.error('Failed to clear report history:', error);
    }
  }

  /**
   * Get reports filtered by date range
   */
  getReportsByDateRange(startDate: Date, endDate: Date): ReportHistoryItem[] {
    const history = this.getHistory();
    return history.filter(item => 
      item.createdAt >= startDate && item.createdAt <= endDate
    );
  }

  /**
   * Get reports for a specific site location
   */
  getReportsBySite(siteLocation: string): ReportHistoryItem[] {
    const history = this.getHistory();
    return history.filter(item => 
      item.reportData.projectInfo.siteLocation.toLowerCase().includes(siteLocation.toLowerCase())
    );
  }

  /**
   * Get summary statistics
   */
  getHistoryStats(): {
    totalReports: number;
    reportsThisMonth: number;
    averageCost: number;
    mostCommonRiskLevel: string;
  } {
    const history = this.getHistory();
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const reportsThisMonth = history.filter(item => item.createdAt >= thisMonth).length;
    
    const totalCost = history.reduce((sum, item) => sum + item.reportData.costAnalysis.finalTotal, 0);
    const averageCost = history.length > 0 ? totalCost / history.length : 0;

    const riskLevels = history.map(item => item.reportData.assessment.riskLevel);
    const riskCounts = riskLevels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonRiskLevel = Object.entries(riskCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';

    return {
      totalReports: history.length,
      reportsThisMonth,
      averageCost,
      mostCommonRiskLevel
    };
  }

  /**
   * Store PDF blob separately (using IndexedDB would be better for large files)
   */
  private storePdfBlob(_reportId: string, _blob: Blob): void {
    try {
      // For now, we'll skip storing PDF blobs due to localStorage size limits
      // In a production app, this would use IndexedDB or send to a server
      console.log(`PDF blob for report ${_reportId} would be stored in production`);
    } catch (error) {
      console.error('Failed to store PDF blob:', error);
    }
  }

  /**
   * Retrieve PDF blob
   */
  private getPdfBlob(_reportId: string): Blob | null {
    try {
      // For now, return null since we're not storing PDF blobs
      // In production, this would retrieve from IndexedDB or server
      return null;
    } catch (error) {
      console.error('Failed to retrieve PDF blob:', error);
      return null;
    }
  }

  /**
   * Delete PDF blob
   */
  private deletePdfBlob(reportId: string): void {
    try {
      // For now, this is a no-op since we're not storing PDF blobs
      console.log(`PDF blob for report ${reportId} would be deleted in production`);
    } catch (error) {
      console.error('Failed to delete PDF blob:', error);
    }
  }

  /**
   * Clear all PDF blobs
   */
  private clearAllPdfBlobs(): void {
    try {
      // For now, this is a no-op since we're not storing PDF blobs
      console.log('All PDF blobs would be cleared in production');
    } catch (error) {
      console.error('Failed to clear PDF blobs:', error);
    }
  }
}

// Export singleton instance
export const reportHistoryService = new ReportHistoryService();