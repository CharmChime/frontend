import React, { useEffect, useState } from 'react';
import { ParentSidebar } from '../components/ParentSidebar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { BarChart as RechartsBar, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { api } from '../services/api';
import { ParentChildSelector } from '../components/ParentChildSelector';
import { useParentChildSelection } from '../hooks/useParentChildSelection';
import { LoadingState } from '../components/LoadingState';

interface ParentAnalyticsScreenProps {
  childName: string;
  parentId?: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function ParentAnalyticsScreen({ childName, parentId, onNavigate, onLogout }: ParentAnalyticsScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
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
    setIsLoadingAnalytics(true);
    api.dashboard
      .analytics(parentId, { childId: selectedChildId || undefined })
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setIsLoadingAnalytics(false));
  }, [parentId, selectedChildId, isLoadingChildren, hasNoLinkedChildren]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const handleExportAnalytics = () => {
    const content = JSON.stringify(
      {
        timeRange,
        analytics,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${timeRange}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const displayedChildName = selectedChild?.nickname || selectedChild?.name || childName;
  const sentimentTrend = analytics?.sentimentTrend?.data || [];
  const emotionalProfile = analytics?.emotionalProfile?.topEmotions?.length
    ? analytics.emotionalProfile.topEmotions.map((item: any) => ({
        emotion: item.emotion,
        value: item.percentage || item.count,
      }))
    : [];
  const writingActivity = (analytics?.writingActivity?.weeklyActivity || []).map((item: any) => ({
    week: item.label,
    entries: item.count,
    words: analytics?.writingActivity?.averageWordsPerEntry || 0,
  }));
  const topThemes = (analytics?.mostDiscussedThemes || []).map((theme: any) => ({
    ...theme,
    trend: 'stable',
  }));
  const noJournalData = !analytics || (analytics?.writingActivity?.totalEntries || 0) === 0;
  const noMoodData = analytics?.emotionalProfile?.status === 'not_available';
  const isParentDataLoading = isLoadingChildren || isLoadingAnalytics;

  return (
    <div className="min-h-screen bg-[var(--parent-bg)] flex">
      <ParentSidebar 
        childName={childName}
        activeItem="analytics"
        onNavigate={onNavigate}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[#2d3748] text-xl sm:text-2xl lg:text-3xl">Advanced Analytics</h1>
                <p className="text-[#64748b] mt-1 text-sm sm:text-base">Deep insights into {displayedChildName}'s emotional journey</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <ParentChildSelector
                  childrenList={children}
                  selectedChildId={selectedChildId}
                  onChange={setSelectedChildId}
                  isLoading={isLoadingChildren}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimeRange('week')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                      timeRange === 'week' 
                        ? 'bg-[var(--parent-teal)] text-white' 
                        : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setTimeRange('month')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                      timeRange === 'month' 
                        ? 'bg-[var(--parent-teal)] text-white' 
                        : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setTimeRange('year')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                      timeRange === 'year' 
                        ? 'bg-[var(--parent-teal)] text-white' 
                        : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                    }`}
                  >
                    Year
                  </button>
                </div>
                <Button variant="parent-teal" size="small" icon={<Download className="w-4 h-4" />} onClick={handleExportAnalytics}>
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {(childrenError || hasNoLinkedChildren || (!isParentDataLoading && noJournalData)) && (
            <Card variant="parent">
              <p className="text-sm text-[#64748b]">
                {childrenError ||
                  (hasNoLinkedChildren
                    ? 'No linked child accounts found yet.'
                    : 'No journal data is available for this child yet.')}
              </p>
            </Card>
          )}

          {isParentDataLoading ? (
            <LoadingState message="Loading analytics data..." variant="parent" />
          ) : (
            <>
          {/* Sentiment Trend */}
          <Card variant="parent">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Sentiment Trend</h3>
                <Badge variant="parent-teal">Last 30 Days</Badge>
              </div>
              <div className="h-64 sm:h-80 min-h-[16rem] sm:min-h-[20rem] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sentimentTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Positive" />
                    <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6b7280" fill="#6b7280" fillOpacity={0.6} name="Neutral" />
                    <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Negative" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Emotional Profile */}
            <Card variant="parent">
              <div className="space-y-4">
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Emotional Profile</h3>
                <div className="h-64 sm:h-80 min-h-[16rem] sm:min-h-[20rem] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={emotionalProfile}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="emotion" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Emotional Strength" dataKey="value" stroke="#237e8f" fill="#237e8f" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-[#64748b]">
                  {noMoodData ? 'No mood data is available yet.' : 'Emotional profile comes from analyzed journal entries.'}
                </p>
              </div>
            </Card>

            {/* Writing Activity */}
            <Card variant="parent">
              <div className="space-y-4">
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Writing Activity</h3>
                <div className="h-64 sm:h-80 min-h-[16rem] sm:min-h-[20rem] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={writingActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="entries" stroke="#237e8f" strokeWidth={3} name="Entries" />
                      <Line yAxisId="right" type="monotone" dataKey="words" stroke="#10b981" strokeWidth={2} name="Avg Words" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-[#64748b]">
                  {writingActivity.length
                    ? 'Writing activity is based on analyzed journal history.'
                    : 'No writing activity is available yet.'}
                </p>
              </div>
            </Card>
          </div>

          {/* Top Themes */}
          <Card variant="parent">
            <div className="space-y-4">
              <h3 className="text-[#2d3748] text-lg sm:text-xl">Most Discussed Themes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {topThemes.length ? topThemes.map((theme, index) => (
                  <div key={theme.theme} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">#{index + 1}</span>
                      {theme.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {theme.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-600" />}
                    </div>
                    <h4 className="text-[#2d3748] mb-1">{theme.theme}</h4>
                    <p className="text-sm text-[#64748b]">{theme.count} mentions</p>
                  </div>
                )) : (
                  <p className="text-sm text-[#64748b]">No story themes are available yet.</p>
                )}
              </div>
            </div>
          </Card>

          {/* Insights Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[var(--parent-teal)]" />
                <h4 className="text-[#2d3748] mb-1 text-base sm:text-lg">Dominant Sentiment</h4>
                <p className="text-sm text-[#64748b] capitalize">
                  {analytics?.emotionalProfile?.dominantSentiment || 'Not available'}
                </p>
              </div>
            </Card>
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <Download className="w-8 h-8 mx-auto mb-2 text-[var(--parent-teal)]" />
                <h4 className="text-[#2d3748] mb-1 text-base sm:text-lg">Average Words</h4>
                <p className="text-sm text-[#64748b]">
                  {analytics?.writingActivity?.averageWordsPerEntry || 0} words per entry
                </p>
              </div>
            </Card>
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-[var(--parent-teal)]" />
                <h4 className="text-[#2d3748] mb-1 text-base sm:text-lg">Total Entries</h4>
                <p className="text-sm text-[#64748b]">
                  {analytics?.writingActivity?.totalEntries || 0} journal entries
                </p>
              </div>
            </Card>
          </div>
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
