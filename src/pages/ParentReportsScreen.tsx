import React, { useEffect, useState } from 'react';
import { ParentSidebar } from '../components/ParentSidebar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { FileText, Download, Calendar, BarChart3, PieChart, Eye } from 'lucide-react';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { api } from '../services/api';
import { ParentChildSelector } from '../components/ParentChildSelector';
import { useParentChildSelection } from '../hooks/useParentChildSelection';
import { LoadingState } from '../components/LoadingState';

interface ParentReportsScreenProps {
  childName: string;
  parentId?: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

export function ParentReportsScreen({ childName, parentId, onNavigate, onLogout }: ParentReportsScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [reportData, setReportData] = useState<any | null>(null);
  const [reportMessage, setReportMessage] = useState('');
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [customFrom, setCustomFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return formatDateInput(date);
  });
  const [customTo, setCustomTo] = useState(() => formatDateInput(new Date()));
  const {
    children,
    selectedChild,
    selectedChildId,
    setSelectedChildId,
    isLoadingChildren,
    childrenError,
    hasNoLinkedChildren,
  } = useParentChildSelection();
  useEffect(() => {
    if (!parentId || isLoadingChildren || hasNoLinkedChildren) return;
    setIsLoadingReport(true);
    api.reports
      .summary({ childId: selectedChildId || undefined })
      .then(setReportData)
      .catch(() => setReportData(null))
      .finally(() => setIsLoadingReport(false));
  }, [parentId, selectedChildId, isLoadingChildren, hasNoLinkedChildren]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const handleViewReport = (report: any) => {
    setReportMessage(`${report.title}: ${report.description}`);
  };

  const handleDownloadReport = async (report: any) => {
    setIsDownloading(true);
    setReportMessage('');

    try {
      const isCustom = report.type === 'custom';
      const pdfBlob = await api.reports.pdf({
        childId: selectedChildId || undefined,
        range: isCustom ? 'custom' : report.type || 'weekly',
        from: isCustom ? customFrom : undefined,
        to: isCustom ? customTo : undefined,
      });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'charmchime-report.pdf';
      link.click();
      URL.revokeObjectURL(url);
      setReportMessage(`${report.title} downloaded as PDF.`);
    } catch (err) {
      setReportMessage(err instanceof Error ? err.message : 'Could not download PDF report.');
    } finally {
      setIsDownloading(false);
    }
  };

  const reportIconByType: Record<string, React.ReactNode> = {
    weekly: <Calendar className="w-6 h-6" />,
    monthly: <BarChart3 className="w-6 h-6" />,
    custom: <PieChart className="w-6 h-6" />,
  };

  const displayedChildName = selectedChild?.nickname || selectedChild?.name || childName;
  const hasReportData = (reportData?.summary?.totalJournals || 0) > 0 || (reportData?.summary?.totalStories || 0) > 0;
  const isParentDataLoading = isLoadingChildren || isLoadingReport;
  const reports = [
    { type: 'weekly', title: 'Weekly Summary Report' },
    { type: 'monthly', title: 'Monthly Wellbeing Report' },
    { type: 'quarterly', title: 'Quarterly Progress Report' },
    { type: 'custom', title: 'Custom Date Range Report' },
  ].map((report) => ({
    ...report,
    description:
      report.type === 'custom'
        ? 'Generate a PDF for the custom date range below'
        : `Download a ${report.type} PDF from backend report data`,
    icon: reportIconByType[report.type] || <FileText className="w-6 h-6" />,
    lastGenerated: reportData?.dateRange?.endDate
      ? new Date(reportData.dateRange.endDate).toLocaleDateString()
      : 'Current data',
    status: hasReportData ? 'Ready' : 'No data yet',
    color:
      report.type === 'monthly'
        ? 'bg-purple-100 text-purple-600'
        : report.type === 'custom'
          ? 'bg-green-100 text-green-600'
          : 'bg-blue-100 text-blue-600',
  }));

  return (
    <div className="min-h-screen bg-[var(--parent-bg)] flex">
      <ParentSidebar 
        childName={childName}
        activeItem="reports"
        onNavigate={onNavigate}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[#2d3748] text-xl sm:text-2xl lg:text-3xl">Reports & Analytics</h1>
                <p className="text-[#64748b] mt-1 text-sm sm:text-base">Generate and manage detailed reports for {displayedChildName}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ParentChildSelector
                  childrenList={children}
                  selectedChildId={selectedChildId}
                  onChange={setSelectedChildId}
                  isLoading={isLoadingChildren}
                />
                <Button
                  variant="parent-teal"
                  size="medium"
                  icon={<Download className="w-5 h-5" />}
                  onClick={() => handleDownloadReport({ title: 'Weekly Summary Report', type: 'weekly' })}
                  disabled={isDownloading || hasNoLinkedChildren}
                >
                  <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
                  <span className="sm:hidden">Download</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {(childrenError || hasNoLinkedChildren || (!isParentDataLoading && !hasReportData)) && (
            <Card variant="parent">
              <p className="text-sm text-[#64748b]">
                {childrenError ||
                  (hasNoLinkedChildren
                    ? 'No linked child accounts found yet.'
                    : 'No report data is available yet. Reports will include activity after journals, mood analyses, or stories exist.')}
              </p>
            </Card>
          )}

          {isParentDataLoading ? (
            <LoadingState message="Loading report data..." variant="parent" />
          ) : (
            <>
          {reportData?.summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card variant="parent" padding="medium">
                <p className="text-2xl sm:text-3xl mb-1">{reportData.summary.totalJournals || 0}</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Journals</p>
              </Card>
              <Card variant="parent" padding="medium">
                <p className="text-2xl sm:text-3xl mb-1">{reportData.summary.totalStories || 0}</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Stories</p>
              </Card>
              <Card variant="parent" padding="medium">
                <p className="text-2xl sm:text-3xl mb-1">{reportData.summary.totalMoodAnalyses || 0}</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Mood Analyses</p>
              </Card>
              <Card variant="parent" padding="medium">
                <p className="text-2xl sm:text-3xl mb-1 capitalize">{reportData.summary.dominantSentiment || 'N/A'}</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Dominant Sentiment</p>
              </Card>
            </div>
          )}

          {/* Available Reports */}
          <div>
            <h2 className="text-[#2d3748] mb-4 text-lg sm:text-xl">Available Reports</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {reports.map((report, index) => (
                <Card key={index} variant="parent">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${report.color}`}>
                      {report.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#2d3748] mb-2 text-base sm:text-lg">{report.title}</h3>
                      <p className="text-xs sm:text-sm text-[#64748b] mb-3">{report.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="parent-slate" className="text-xs">{report.status}</Badge>
                          <span className="text-xs text-[#64748b]">Last: {report.lastGenerated}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="parent-slate" size="small" icon={<Eye className="w-4 h-4" />} onClick={() => handleViewReport(report)}>
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button
                            variant="parent-teal"
                            size="small"
                            icon={<Download className="w-4 h-4" />}
                            onClick={() => handleDownloadReport(report)}
                            disabled={isDownloading || hasNoLinkedChildren}
                          >
                            <span className="hidden sm:inline">Download</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card variant="parent" className="bg-blue-50">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Backend Report Status</h3>
                <p className="text-xs sm:text-sm text-[#64748b]">
                  PDF reports are generated from the selected child and current backend data. Scheduled email delivery and download history are not connected yet, so they are not shown as active features.
                </p>
              </div>
            </div>
          </Card>

          {/* Report Configuration */}
          <Card variant="parent">
            <div className="space-y-4">
              <h3 className="text-[#2d3748] text-lg sm:text-xl">Create Custom Report</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#4a5568] mb-2 text-sm">Start Date</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(event) => setCustomFrom(event.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] text-[#2d3748]"
                  />
                </div>
                <div>
                  <label className="block text-[#4a5568] mb-2 text-sm">End Date</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(event) => setCustomTo(event.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] text-[#2d3748]"
                  />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#64748b]">
                Custom PDFs include the backend report sections currently available for the selected child.
              </p>
              <Button
                variant="parent-teal"
                size="large"
                icon={<FileText className="w-5 h-5" />}
                className="w-full sm:w-auto"
                onClick={() => handleDownloadReport({ title: 'Custom Date Range Report', type: 'custom' })}
                disabled={isDownloading || hasNoLinkedChildren}
              >
                {isDownloading ? 'Generating PDF...' : 'Generate Custom PDF'}
              </Button>
              {reportMessage && (
                <p className="text-sm text-[var(--parent-teal)]">{reportMessage}</p>
              )}
            </div>
          </Card>

          {/* Privacy Notice */}
          <Card variant="parent" className="bg-blue-50">
            <div className="flex items-start gap-3">
              <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[#2d3748] mb-2 text-base sm:text-lg">Report Privacy</h4>
                <p className="text-xs sm:text-sm text-[#64748b]">
                  All reports are generated based on your current privacy settings. Reports respect your child's privacy 
                  and only include mood data and themes based on your configured access level. Actual journal content is 
                  never included unless you have full access permissions.
                </p>
              </div>
            </div>
          </Card>
            </>
          )}
        </div>
      </main>

      <LogoutConfirmation 
        isOpen={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        variant="parent"
      />
    </div>
  );
}
