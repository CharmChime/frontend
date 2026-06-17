import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { ParentSidebar } from '../components/ParentSidebar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { FileText, Download, Calendar, Mail, BarChart3, PieChart, Eye } from 'lucide-react';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { api, type Child, type Parent } from '../services/api';
import { toast } from 'sonner';
import { ParentThemeToggle } from '../components/ParentThemeToggle';
import { ParentPageLoader } from '../components/PageLoaders';

interface ParentReportsScreenProps {
  childName: string;
  childAvatar?: string;
  parentName?: string;
  children?: Child[];
  selectedChildId?: string;
  onSelectChild?: (childId: string) => void;
  parentId?: string;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => Promise<void>;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function ParentReportsScreen({
  childName,
  childAvatar,
  parentName,
  children,
  selectedChildId,
  onSelectChild,
  parentId,
  theme = 'light',
  onThemeToggle,
  onNavigate,
  onLogout,
}: ParentReportsScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [reportData, setReportData] = useState<any | null>(null);
  const [reportMessage, setReportMessage] = useState('');
  const [parentProfile, setParentProfile] = useState<Parent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentDownloads, setRecentDownloads] = useState<{ name: string; date: string; size: string }[]>([]);
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [emailConfigLoading, setEmailConfigLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return date.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [includedSections, setIncludedSections] = useState([
    'Mood Analysis',
    'Activity Summary',
    'Writing Trends',
    'Achievements',
    'AI Insights',
    'Recommendations',
  ]);
  const [scheduledReports, setScheduledReports] = useState([
    { frequency: 'Weekly', nextDelivery: 'Next week', email: '', enabled: false, preferenceKey: 'weeklyReports' },
    { frequency: 'Monthly', nextDelivery: 'Next month', email: '', enabled: false, preferenceKey: 'monthlyReports' },
  ]);

  // Save and load last selected child
  useEffect(() => {
    if (selectedChildId) {
      localStorage.setItem('lastSelectedChildId', selectedChildId);
    }
  }, [selectedChildId]);

  useEffect(() => {
    if (!parentId) return;
    setIsLoading(true);
    setReportData(null);
    Promise.all([
      api.dashboard.reports(parentId, { childId: selectedChildId }),
      api.parents.me(),
    ])
      .then(([reportsData, profileResponse]) => {
        setReportData(reportsData);
        const parent = profileResponse.parent;
        const preferences = parent.notificationPreferences || {};
        setParentProfile(parent);
        setScheduledReports([
          {
            frequency: 'Weekly',
            nextDelivery: 'Next week',
            email: parent.email,
            enabled: preferences.emailNotifications !== false && preferences.weeklyReports !== false,
            preferenceKey: 'weeklyReports',
          },
          {
            frequency: 'Monthly',
            nextDelivery: 'Next month',
            email: parent.email,
            enabled: preferences.emailNotifications !== false && preferences.monthlyReports === true,
            preferenceKey: 'monthlyReports',
          },
        ]);
      })
      .catch(() => {
        setReportData(null);
        setParentProfile(null);
        toast.error('Could not load report data.');
      })
      .finally(() => setIsLoading(false));
  }, [parentId, selectedChildId]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const generateReportPDF = (report: any) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;
    const maxWidth = pageWidth - 2 * margin;

    const addNewPageIfNeeded = (minSpace: number = 20) => {
      if (yPosition + minSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Set default font
    doc.setFont('Helvetica', 'normal');

    // Title
    doc.setFontSize(20);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${report.title}`, margin, yPosition);
    yPosition += 12;

    // Date and Status
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Child: ${childName}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Report Type: ${report.type || 'Standard'}`, margin, yPosition);
    yPosition += 10;

    // Description
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('Helvetica', 'normal');
    doc.text(report.description || '', margin, yPosition, { maxWidth });
    yPosition += 15;

    // Add Report Summary from reportData
    if (reportData?.summary) {
      addNewPageIfNeeded(15);
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.text('Summary', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const summaryText = String(reportData.summary);
      const summaryLines = doc.splitTextToSize(summaryText, maxWidth);
      doc.text(summaryLines, margin, yPosition);
      yPosition += summaryLines.length * 5 + 8;
    }

    // Add Mood Summary from reportData
    if (reportData?.moodSummary) {
      addNewPageIfNeeded(15);
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.text('Mood & Emotional Insights', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const moodText = String(reportData.moodSummary);
      const moodLines = doc.splitTextToSize(moodText, maxWidth);
      doc.text(moodLines, margin, yPosition);
      yPosition += moodLines.length * 5 + 8;
    }

    // Add insights from reportData
    if (reportData?.insights && Array.isArray(reportData.insights)) {
      reportData.insights.forEach((insight: any) => {
        addNewPageIfNeeded(15);
        doc.setFontSize(11);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(insight.title || 'Insight', margin, yPosition);
        yPosition += 7;
        
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'normal');
        const insightLines = doc.splitTextToSize(insight.description || '', maxWidth);
        doc.text(insightLines, margin, yPosition);
        yPosition += insightLines.length * 5 + 6;
      });
    }

    // Add statistics
    if (reportData?.stats && typeof reportData.stats === 'object') {
      addNewPageIfNeeded(15);
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Key Statistics', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      Object.entries(reportData.stats).forEach(([key, value]: [string, any]) => {
        const statText = `${key}: ${value}`;
        doc.text(statText, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Add included sections
    if (includedSections.length > 0) {
      addNewPageIfNeeded(15);
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Report Sections Included', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      includedSections.forEach((section) => {
        addNewPageIfNeeded(8);
        doc.text(`• ${section}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`This is a confidential report. Report Type: ${report.type}`, margin, pageHeight - 10);

    return doc;
  };

  const handleViewReport = (report: any) => {
    try {
      const doc = generateReportPDF(report);
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      setReportMessage(`Opened ${report.title}`);
      toast.success(`Viewing ${report.title}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Could not generate PDF report');
    }
  };

  const handleDownloadReport = (report: any) => {
    try {
      const doc = generateReportPDF(report);
      const fileName = `${report.type || 'report'}-${childName}-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);

      const estimatedSize = `${Math.max(100, Math.round(Math.random() * 500))} KB`;
      setRecentDownloads((current) => [
        {
          name: fileName,
          date: new Date().toLocaleDateString(),
          size: estimatedSize,
        },
        ...current,
      ].slice(0, 5));

      setReportMessage(`${report.title} downloaded.`);
      toast.success(`${report.title} downloaded successfully`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Could not download report');
    }
  };

  const toggleScheduledReport = async (index: number) => {
    const selected = scheduledReports[index];
    if (!selected) return;

    const nextEnabled = !selected.enabled;
    const nextReports = scheduledReports.map((report, reportIndex) =>
      reportIndex === index ? { ...report, enabled: nextEnabled } : report
    );
    setScheduledReports(nextReports);

    try {
      const currentPreferences = parentProfile?.notificationPreferences || {};
      const { parent } = await api.parents.updateMe({
        notificationPreferences: {
          ...currentPreferences,
          emailNotifications: nextReports.some((report) => report.enabled),
          [selected.preferenceKey]: nextEnabled,
        },
      });
      setParentProfile(parent);
      toast.success(`${selected.frequency} reports ${nextEnabled ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      setScheduledReports(scheduledReports);
      toast.error(err instanceof Error ? err.message : 'Could not update report schedule.');
    }
  };

  const handleSaveEmailConfig = async () => {
    if (!parentProfile) return;
    
    setEmailConfigLoading(true);
    try {
      const currentPreferences = parentProfile?.notificationPreferences || {};
      const enabledReports = scheduledReports.filter(r => r.enabled);
      
      // Only update supported preference keys
      const preferencesToUpdate: Record<string, any> = {
        ...currentPreferences,
        emailNotifications: enabledReports.length > 0,
      };

      // Add only supported report preference keys
      scheduledReports.forEach((report) => {
        if (report.preferenceKey) {
          preferencesToUpdate[report.preferenceKey] = report.enabled;
        }
      });

      const { parent } = await api.parents.updateMe({
        notificationPreferences: preferencesToUpdate,
      });
      
      setParentProfile(parent);
      // Update scheduled reports with confirmed email from parent profile
      const updatedReports = scheduledReports.map(r => ({
        ...r,
        email: parent.email || r.email,
      }));
      setScheduledReports(updatedReports);
      
      toast.success('Email report preferences saved successfully');
      setShowEmailConfig(false);
    } catch (err) {
      console.error('Error saving email config:', err);
      toast.error(err instanceof Error ? err.message : 'Could not save email configuration');
    } finally {
      setEmailConfigLoading(false);
    }
  };

  const handleEmailChange = (index: number, newEmail: string) => {
    setScheduledReports((current) =>
      current.map((report, reportIndex) =>
        reportIndex === index ? { ...report, email: newEmail } : report
      )
    );
  };

  const handleGenerateCustomReport = async () => {
    if (!parentId) return;
    try {
      setReportMessage('Generating custom report...');
      const data = await api.dashboard.reports(parentId, { 
        range: 'custom', 
        startDate, 
        endDate, 
        childId: selectedChildId,
        sections: includedSections
      });
      
      if (data) {
        setReportData(data);
        setReportMessage(`Custom report generated successfully for ${startDate} to ${endDate}.`);
        toast.success('Custom report generated.');
        
        // Auto-open first available report for viewing
        const availableReports = Array.isArray(data?.availableReports) 
          ? data.availableReports.filter((r: any) => r.type !== 'custom')
          : [];
        if (availableReports.length > 0) {
          setTimeout(() => {
            handleViewReport({
              title: 'Custom Report',
              type: 'custom',
              description: `Report from ${startDate} to ${endDate}`
            });
          }, 500);
        }
      } else {
        setReportMessage('No data available for the selected date range.');
        toast.info('Custom report generated but no data available for this period.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not generate custom report.';
      setReportMessage(message);
      toast.error(message);
    }
  };

  const toggleIncludedSection = (section: string) => {
    setIncludedSections((current) =>
      current.includes(section)
        ? current.filter((item) => item !== section)
        : [...current, section]
    );
  };

  const reportIconByType: Record<string, React.ReactNode> = {
    weekly: <Calendar className="w-6 h-6" />,
    monthly: <BarChart3 className="w-6 h-6" />,
    custom: <PieChart className="w-6 h-6" />,
  };

  const availableReports = Array.isArray(reportData?.availableReports) 
    ? reportData.availableReports.filter((report: any) => report.type !== 'custom')
    : [];
  const reports = availableReports.length ? availableReports.map((report: any) => ({
    ...report,
    description:
      report.description ||
      (report.type === 'custom'
        ? 'Configure a custom date range report from current backend data'
        : `Generated from current ${report.type} activity and wellbeing data`),
    icon: reportIconByType[report.type] || <FileText className="w-6 h-6" />,
    lastGenerated: report.lastGenerated || 'Current data',
    status: report.status || 'Ready',
    color:
      report.type === 'monthly'
        ? 'bg-purple-100 text-purple-600'
        : report.type === 'custom'
          ? 'bg-green-100 text-green-600'
          : 'bg-blue-100 text-blue-600',
  })) : [];

  return (
    <div className="min-h-screen bg-[var(--parent-bg)] flex">
      <ParentSidebar 
        childName={childName}
        childAvatar={childAvatar}
        parentName={parentName}
        children={children}
        selectedChildId={selectedChildId}
        onSelectChild={onSelectChild}
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
                <p className="text-[#64748b] mt-1 text-sm sm:text-base">Generate and manage detailed reports for {childName}</p>
              </div>
              <div className="flex items-center gap-3">
                <ParentThemeToggle theme={theme} onThemeToggle={onThemeToggle} />
                <Button
                  variant="parent-teal"
                  size="medium"
                  icon={<Download className="w-5 h-5" />}
                  onClick={() => handleDownloadReport({ title: 'All Reports', type: 'all', description: 'Complete report bundle' })}
                >
                  <span className="hidden sm:inline">Download All</span>
                  <span className="sm:hidden">Download</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {isLoading ? (
            <ParentPageLoader
              title="Loading reports"
              message={`Preparing report options and schedules for ${childName}.`}
            />
          ) : (
          <>
          {/* Available Reports */}
          <div>
            <h2 className="text-[#2d3748] mb-4 text-lg sm:text-xl">Available Reports</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {reports.length ? reports.map((report, index) => (
                <Card key={index} variant="parent">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${report.color}`}>
                        {report.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#2d3748] mb-2 text-base sm:text-lg">{report.title}</h3>
                        <p className="text-xs sm:text-sm text-[#64748b] mb-3">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="parent-slate" className="text-xs">{report.status}</Badge>
                        <span className="text-xs text-[#64748b]">Last: {report.lastGenerated}</span>
                      </div>
                      <div className="flex gap-2 w-full">
                        <Button 
                          variant="parent-slate" 
                          size="small" 
                          icon={<Eye className="w-4 h-4" />} 
                          onClick={() => handleViewReport(report)}
                          className="flex-1"
                        >
                          <span className="hidden sm:inline">View</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button 
                          variant="parent-teal" 
                          size="small" 
                          icon={<Download className="w-4 h-4" />} 
                          onClick={() => handleDownloadReport(report)}
                          className="flex-1"
                        >
                          <span className="hidden sm:inline">Download</span>
                          <span className="sm:hidden">Download</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )) : (
                <Card variant="parent" className="lg:col-span-2 bg-gray-50">
                  <p className="text-sm text-[#64748b]">No reports are available yet. Reports will appear when backend summary data is available.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Scheduled Reports */}
            <Card variant="parent">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[var(--parent-teal)]" />
                    <h3 className="text-[#2d3748] text-lg sm:text-xl">Scheduled Email Reports</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {scheduledReports.map((scheduled, index) => (
                    <div key={`scheduled-${index}`} className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div>
                          <h4 className="text-[#2d3748] mb-1 text-sm sm:text-base">{scheduled.frequency} Report</h4>
                          <p className="text-xs sm:text-sm text-[#64748b]">Next: {scheduled.nextDelivery}</p>
                        </div>
                        <button
                          onClick={() => toggleScheduledReport(index)}
                          className={`
                            w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0
                            ${scheduled.enabled ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'}
                          `}
                        >
                          <div className={`
                            w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1
                            ${scheduled.enabled ? 'translate-x-7' : 'translate-x-1'}
                          `} />
                        </button>
                      </div>
                      <p className="text-xs text-[#64748b]">📧 {scheduled.email || 'No email configured'}</p>
                    </div>
                  ))}
                  <Button 
                    variant={showEmailConfig ? "parent-teal" : "parent-slate"} 
                    size="medium" 
                    className="w-full" 
                    onClick={() => setShowEmailConfig(!showEmailConfig)}
                  >
                    {showEmailConfig ? 'Close Configuration' : 'Configure Email Reports'}
                  </Button>

                  {showEmailConfig && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
                      <div>
                        <h4 className="text-[#2d3748] font-semibold text-sm mb-2">Email Configuration</h4>
                        <p className="text-xs text-[#64748b] mb-3">
                          Reports will be sent to: <span className="font-medium text-[#2d3748]">{parentProfile?.email || 'Not set'}</span>
                        </p>
                      </div>
                      {scheduledReports.map((scheduled, index) => (
                        <div key={`config-${index}`} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div>
                            <p className="text-sm text-[#2d3748] font-medium">{scheduled.frequency} Reports</p>
                            <p className="text-xs text-[#64748b] mt-1">
                              {scheduled.enabled ? '✓ Enabled - Reports will be sent' : '○ Disabled - No reports sent'}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleScheduledReport(index)}
                            className={`
                              w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0
                              ${scheduled.enabled ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'}
                            `}
                          >
                            <div className={`
                              w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1
                              ${scheduled.enabled ? 'translate-x-7' : 'translate-x-1'}
                            `} />
                          </button>
                        </div>
                      ))}
                      <Button
                        variant="parent-teal"
                        size="medium"
                        className="w-full"
                        onClick={handleSaveEmailConfig}
                        disabled={emailConfigLoading}
                      >
                        {emailConfigLoading ? 'Saving...' : 'Save & Close'}
                      </Button>
                      <p className="text-xs text-[#64748b] text-center">
                        Changes to report frequency will be saved to your account
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Recent Downloads */}
            <Card variant="parent">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-[var(--parent-teal)]" />
                  <h3 className="text-[#2d3748] text-lg sm:text-xl">Recent Downloads</h3>
                </div>
                <div className="space-y-2">
                  {recentDownloads.length ? recentDownloads.map((download, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-[#2d3748] truncate">{download.name}</p>
                          <div className="flex items-center gap-2 text-xs text-[#64748b]">
                            <span>{download.date}</span>
                            <span>•</span>
                            <span>{download.size}</span>
                          </div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-[#64748b] flex-shrink-0 ml-2" />
                    </div>
                  )) : (
                    <div className="rounded-xl bg-gray-50 p-4 text-sm text-[#64748b]">
                      No reports downloaded in this session yet.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Report Configuration */}
          <Card variant="parent">
            <div className="space-y-4">
              <h3 className="text-[#2d3748] text-lg sm:text-xl">Create Custom Report</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#4a5568] mb-2 text-sm">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] text-[#2d3748]"
                  />
                </div>
                <div>
                  <label className="block text-[#4a5568] mb-2 text-sm">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] text-[#2d3748]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#4a5568] mb-2 text-sm">Include Sections</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Mood Analysis', 'Activity Summary', 'Writing Trends', 'Achievements', 'AI Insights', 'Recommendations'].map((section) => (
                    <label key={section} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={includedSections.includes(section)}
                        onChange={() => toggleIncludedSection(section)}
                        className="rounded text-[var(--parent-teal)] focus:ring-[var(--parent-teal)]"
                      />
                      <span className="text-sm text-[#2d3748]">{section}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button
                variant="parent-teal"
                size="large"
                icon={<FileText className="w-5 h-5" />}
                className="w-full sm:w-auto"
                onClick={handleGenerateCustomReport}
              >
                Generate Custom Report
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
