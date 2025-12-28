import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportHistoryService, type ReportHistoryItem } from '../services/reportHistoryService';
import { reportService } from '../services/reportService';
import Navigation from '../components/Navigation';
import { formatINR } from '../utils/currency';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Icon from '../components/ui/Icon';

const ReportHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportHistoryItem[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'site' | 'cost'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState({
    totalReports: 0,
    reportsThisMonth: 0,
    averageCost: 0,
    mostCommonRiskLevel: 'unknown'
  });

  useEffect(() => {
    loadReports();
    loadStats();
  }, []);

  useEffect(() => {
    filterAndSortReports();
  }, [reports, searchTerm, sortBy, sortOrder]);

  const loadReports = () => {
    const history = reportHistoryService.getHistory();
    setReports(history);
  };

  const loadStats = () => {
    const historyStats = reportHistoryService.getHistoryStats();
    setStats(historyStats);
  };

  const filterAndSortReports = () => {
    let filtered = reports;

    // Apply search filter
    if (searchTerm) {
      filtered = reports.filter(report =>
        report.reportData.projectInfo.siteLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportData.projectInfo.engineerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportData.projectInfo.projectId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'site':
          comparison = a.reportData.projectInfo.siteLocation.localeCompare(b.reportData.projectInfo.siteLocation);
          break;
        case 'cost':
          comparison = a.reportData.costAnalysis.finalTotal - b.reportData.costAnalysis.finalTotal;
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredReports(filtered);
  };

  const handleDeleteReport = (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      const success = reportHistoryService.deleteReport(reportId);
      if (success) {
        loadReports();
        loadStats();
      } else {
        alert('Failed to delete report. Please try again.');
      }
    }
  };

  const handleRegenerateReport = async (report: ReportHistoryItem) => {
    try {
      const pdfBlob = await reportService.generatePDF(report.reportData, report.templateUsed);
      
      // Update the report with new PDF
      reportHistoryService.saveReport(
        report.reportData,
        report.formData,
        report.analysisResult,
        report.templateUsed,
        pdfBlob
      );

      // Download the regenerated PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Structural_Analysis_Report_${report.reportData.projectInfo.projectId}_${report.reportData.projectInfo.reportDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      loadReports();
    } catch (error) {
      console.error('Error regenerating report:', error);
      alert('Failed to regenerate report. Please try again.');
    }
  };

  const handleViewReport = (report: ReportHistoryItem) => {
    // Navigate to download page with the report data
    navigate('/download', {
      state: {
        formData: report.formData,
        analysisResult: report.analysisResult
      }
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all report history? This action cannot be undone.')) {
      reportHistoryService.clearHistory();
      loadReports();
      loadStats();
    }
  };

  const getRiskLevelVariant = (riskLevel: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
      case 'critical':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pattern-grid">
      <Navigation />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-engineering-title mb-4">Report History</h1>
            <p className="text-engineering-body">
              View and manage your structural analysis reports
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card variant="engineering" icon="file-text" hover>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800 mb-1">{stats.totalReports}</div>
                <div className="text-engineering-caption">Total Reports</div>
              </div>
            </Card>

            <Card variant="engineering" icon="calendar" hover>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800 mb-1">{stats.reportsThisMonth}</div>
                <div className="text-engineering-caption">This Month</div>
              </div>
            </Card>

            <Card variant="engineering" icon="dollar" hover>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800 mb-1">{formatINR(stats.averageCost)}</div>
                <div className="text-engineering-caption">Average Cost</div>
              </div>
            </Card>

            <Card variant="engineering" icon="shield" hover>
              <div className="text-center">
                <Badge variant={getRiskLevelVariant(stats.mostCommonRiskLevel)} size="lg">
                  {stats.mostCommonRiskLevel.toUpperCase()}
                </Badge>
                <div className="text-engineering-caption mt-2">Common Risk Level</div>
              </div>
            </Card>
          </div>

          {/* Controls */}
          <Card variant="elevated" className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 max-w-lg">
                <label htmlFor="search" className="sr-only">Search reports</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="search" size="sm" className="text-gray-400" />
                  </div>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by site, engineer, or project ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10 max-w-md"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="sort" className="form-label mb-0">Sort by:</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'site' | 'cost')}
                    className="form-input max-w-32"
                  >
                    <option value="date">Date</option>
                    <option value="site">Site</option>
                    <option value="cost">Cost</option>
                  </select>
                </div>

                <Button
                  variant="outline"
                  icon="sort"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  Sort {sortOrder === 'asc' ? 'Desc' : 'Asc'}
                </Button>

                {reports.length > 0 && (
                  <Button
                    variant="danger"
                    icon="trash"
                    onClick={handleClearHistory}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <Card variant="elevated" className="text-center py-12">
              <div className="mb-4">
                <Icon name="file-text" size="2xl" className="text-gray-400 mx-auto" />
              </div>
              <h3 className="text-engineering-subtitle mb-2">No reports found</h3>
              <p className="text-engineering-body mb-6">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first structural analysis report.'}
              </p>
              <Button
                variant="engineering"
                onClick={() => navigate('/input')}
                size="lg"
              >
                New Assessment
              </Button>
            </Card>
          ) : (
            <Card variant="elevated">
              <div className="divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <div key={report.id} className="py-6 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-engineering-subtitle text-blue-600 truncate">
                            {report.reportData.projectInfo.siteLocation}
                          </h3>
                          <Badge variant={getRiskLevelVariant(report.reportData.assessment.riskLevel)}>
                            {report.reportData.assessment.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Icon name="user" size="sm" className="mr-2" />
                          <span className="truncate">{report.reportData.projectInfo.engineerName}</span>
                          <span className="mx-2">•</span>
                          <Icon name="clipboard" size="sm" className="mr-1" />
                          <span className="truncate">ID: {report.reportData.projectInfo.projectId}</span>
                          <span className="mx-2">•</span>
                          <Icon name="dollar" size="sm" className="mr-1" />
                          <span className="truncate">{formatINR(report.reportData.costAnalysis.finalTotal)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Icon name="clock" size="sm" className="mr-2" />
                          <span>Created: {report.createdAt.toLocaleDateString()} at {report.createdAt.toLocaleTimeString()}</span>
                          <span className="mx-2">•</span>
                          <Icon name="file-text" size="sm" className="mr-1" />
                          <span>Template: {report.templateUsed}</span>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                        <Button
                          variant="outline"
                          icon="eye"
                          size="sm"
                          onClick={() => handleViewReport(report)}
                        >
                          View
                        </Button>
                        <Button
                          variant="primary"
                          icon="download"
                          size="sm"
                          onClick={() => handleRegenerateReport(report)}
                        >
                          Download
                        </Button>
                        <Button
                          variant="danger"
                          icon="trash"
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportHistoryPage;