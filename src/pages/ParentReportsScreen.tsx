import React, { useEffect, useState } from 'react';
import { ParentSidebar } from '../components/ParentSidebar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { FileText, Download, Calendar, Mail, TrendingUp, BarChart3, PieChart, Eye } from 'lucide-react';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { api } from '../services/api';

interface ParentReportsScreenProps {
  childName: string;
  parentId?: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function ParentReportsScreen({ childName, parentId, onNavigate, onLogout }: ParentReportsScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [reportData, setReportData] = useState<any | null>(null);
  const [reportMessage, setReportMessage] = useState('');
  const [scheduledReports, setScheduledReports] = useState([
    {
      frequency: 'Weekly',
      nextDelivery: 'Dec 29, 2024',
      email: 'sarah.johnson@email.com',
      enabled: true
    },
    {
      frequency: 'Monthly',
      nextDelivery: 'Jan 1, 2025',
      email: 'sarah.johnson@email.com',
      enabled: true
    },
  ]);

  useEffect(() => {
    if (!parentId) return;
    api.dashboard.reports(parentId).then(setReportData).catch(() => setReportData(null));
  }, [parentId]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const handleViewReport = (report: any) => {
    setReportMessage(`${report.title}: ${report.description}`);
  };

  const handleDownloadReport = (report: any) => {
    const content = JSON.stringify(
      {
        report,
        summary: reportData?.summary,
        moodSummary: reportData?.moodSummary,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    );
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.type || 'report'}-summary.json`;
    link.click();
    URL.revokeObjectURL(url);
    setReportMessage(`${report.title} downloaded.`);
  };

  const toggleScheduledReport = (index: number) => {
    setScheduledReports((current) =>
      current.map((report, reportIndex) =>
        reportIndex === index ? { ...report, enabled: !report.enabled } : report
      )
    );
  };

  const reportIconByType: Record<string, React.ReactNode> = {
    weekly: <Calendar className="w-6 h-6" />,
    monthly: <BarChart3 className="w-6 h-6" />,
    custom: <PieChart className="w-6 h-6" />,
  };

  const reports = reportData?.availableReports?.length ? reportData.availableReports.map((report: any) => ({
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
  })) : [
    {
      title: 'Weekly Summary Report',
      description: 'Overview of mood patterns, activity, and key insights from the past week',
      type: 'weekly',
      icon: <Calendar className="w-6 h-6" />,
      lastGenerated: 'Dec 22, 2024',
      status: 'Ready',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Monthly Wellbeing Report',
      description: 'Comprehensive analysis of emotional trends and developmental patterns',
      type: 'monthly',
      icon: <TrendingUp className="w-6 h-6" />,
      lastGenerated: 'Dec 1, 2024',
      status: 'Ready',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Quarterly Progress Report',
      description: 'Long-term trends, achievements, and growth indicators over 3 months',
      type: 'quarterly',
      icon: <BarChart3 className="w-6 h-6" />,
      lastGenerated: 'Nov 30, 2024',
      status: 'Ready',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Custom Date Range Report',
      description: 'Generate a report for any specific time period you choose',
      type: 'custom',
      icon: <PieChart className="w-6 h-6" />,
      lastGenerated: 'Create new',
      status: 'Configure',
      color: 'bg-orange-100 text-orange-600'
    },
  ];

  const recentDownloads = [
    { name: 'Weekly_Report_Dec_15-22.pdf', date: 'Dec 22, 2024', size: '2.4 MB' },
    { name: 'Monthly_Report_November.pdf', date: 'Dec 1, 2024', size: '5.8 MB' },
    { name: 'Weekly_Report_Dec_8-15.pdf', date: 'Dec 15, 2024', size: '2.1 MB' },
  ];

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
                <p className="text-[#64748b] mt-1 text-sm sm:text-base">Generate and manage detailed reports for {childName}</p>
              </div>
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
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
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
                          <Button variant="parent-teal" size="small" icon={<Download className="w-4 h-4" />} onClick={() => handleDownloadReport(report)}>
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
                    <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-xl">
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
                      <p className="text-xs text-[#64748b]">📧 {scheduled.email}</p>
                    </div>
                  ))}
                  <Button variant="parent-slate" size="medium" className="w-full" onClick={() => setReportMessage('Email report settings updated locally.')}>
                    Configure Email Reports
                  </Button>
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
                  {recentDownloads.map((download, index) => (
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
                  ))}
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
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] text-[#2d3748]"
                    defaultValue="2024-12-01"
                  />
                </div>
                <div>
                  <label className="block text-[#4a5568] mb-2 text-sm">End Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] text-[#2d3748]"
                    defaultValue="2024-12-29"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#4a5568] mb-2 text-sm">Include Sections</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Mood Analysis', 'Activity Summary', 'Writing Trends', 'Achievements', 'AI Insights', 'Recommendations'].map((section) => (
                    <label key={section} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input type="checkbox" defaultChecked className="rounded text-[var(--parent-teal)] focus:ring-[var(--parent-teal)]" />
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
                onClick={() => setReportMessage('Custom report settings are ready. Backend report summary refreshed from current data.')}
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
