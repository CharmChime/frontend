import React, { useEffect, useState } from 'react';
import { ParentSidebar } from '../components/ParentSidebar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Download } from 'lucide-react';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { api } from '../services/api';
import { ParentThemeToggle } from '../components/ParentThemeToggle';

interface ParentAnalyticsScreenProps {
  childName: string;
  childAvatar?: string;
  parentId?: string;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => Promise<void>;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function ParentAnalyticsScreen({ childName, childAvatar, parentId, theme = 'light', onThemeToggle, onNavigate, onLogout }: ParentAnalyticsScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [analytics, setAnalytics] = useState<any | null>(null);

  useEffect(() => {
    if (!parentId) return;
    api.dashboard.analytics(parentId).then(setAnalytics).catch(() => setAnalytics(null));
  }, [parentId]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const handleExportAnalytics = () => {
    const content = JSON.stringify(
      {
        timeRange,
        analytics: {
          sentimentTrend,
          emotionalProfile,
          writingActivity,
          topThemes,
          totalEntries,
          averageWords,
          dominantMood,
        },
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

  const rangeConfig = {
    week: {
      label: 'Last 7 Days',
      sentimentLimit: 7,
      activityLimit: 1,
      themeLimit: 3,
    },
    month: {
      label: 'Last 30 Days',
      sentimentLimit: 30,
      activityLimit: 4,
      themeLimit: 5,
    },
    year: {
      label: 'Last Year',
      sentimentLimit: 365,
      activityLimit: 52,
      themeLimit: 10,
    },
  }[timeRange];

  const filterByDateOrLimit = (items: any[], dateKey: string, limit: number) => {
    if (!items.length) return [];

    const now = Date.now();
    const cutoff = now - limit * 24 * 60 * 60 * 1000;
    const datedItems = items.filter((item) => {
      const value = item?.[dateKey];
      if (!value) return false;
      const timestamp = new Date(value).getTime();
      return Number.isFinite(timestamp) && timestamp >= cutoff;
    });

    if (datedItems.length) {
      return datedItems;
    }

    return items.slice(-Math.min(limit, items.length));
  };

  const sentimentTrend = filterByDateOrLimit(analytics?.sentimentTrend?.data || [], 'date', rangeConfig.sentimentLimit);
  const emotionalProfile = (analytics?.emotionalProfile?.topEmotions || []).map((item: any) => ({
    emotion: item.emotion,
    value: item.percentage || item.count || 0,
  }));
  const writingActivity = (analytics?.writingActivity?.weeklyActivity || [])
    .slice(-Math.min(rangeConfig.activityLimit, analytics?.writingActivity?.weeklyActivity?.length || 0))
    .map((item: any) => ({
    week: item.label,
    entries: item.count,
    words: analytics?.writingActivity?.averageWordsPerEntry || 0,
  }));
  const topThemes = (analytics?.mostDiscussedThemes || []).slice(0, rangeConfig.themeLimit);
  const totalEntries = writingActivity.reduce((sum: number, item: any) => sum + Number(item.entries || 0), 0);
  const averageWords = analytics?.writingActivity?.averageWordsPerEntry || 0;
  const dominantMood = analytics?.emotionalProfile?.dominantMood || 'Not available';

  const handleTimeRangeChange = (nextRange: 'week' | 'month' | 'year') => {
    setTimeRange(nextRange);
  };

  return (
    <div className="min-h-screen bg-[var(--parent-bg)] flex">
      <ParentSidebar 
        childName={childName}
        childAvatar={childAvatar}
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
                <p className="text-[#64748b] mt-1 text-sm sm:text-base">Deep insights into {childName}'s emotional journey</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <ParentThemeToggle theme={theme} onThemeToggle={onThemeToggle} />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTimeRangeChange('week')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                      timeRange === 'week' 
                        ? 'bg-[var(--parent-teal)] text-white' 
                        : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => handleTimeRangeChange('month')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                      timeRange === 'month' 
                        ? 'bg-[var(--parent-teal)] text-white' 
                        : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => handleTimeRangeChange('year')}
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
          {/* Sentiment Trend */}
          <Card variant="parent">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Sentiment Trend</h3>
                <Badge variant="parent-teal">{rangeConfig.label}</Badge>
              </div>
              <div className="h-64 sm:h-80 min-h-[16rem] sm:min-h-[20rem] w-full">
                {sentimentTrend.length ? (
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
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#64748b]">
                    No sentiment trend available yet.
                  </div>
                )}
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
                  {emotionalProfile.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={emotionalProfile}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="emotion" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Emotional Strength" dataKey="value" stroke="#237e8f" fill="#237e8f" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#64748b]">
                      No emotional profile available yet.
                    </div>
                  )}
                </div>
                <p className="text-sm text-[#64748b]">
                  {emotionalProfile.length ? 'Generated from shared mood analysis data.' : 'Mood profile data is not available yet.'}
                </p>
              </div>
            </Card>

            {/* Writing Activity */}
            <Card variant="parent">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[#2d3748] text-lg sm:text-xl">Writing Activity</h3>
                  <Badge variant="parent-slate">{rangeConfig.label}</Badge>
                </div>
                <div className="h-64 sm:h-80 min-h-[16rem] sm:min-h-[20rem] w-full">
                  {writingActivity.length ? (
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
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#64748b]">
                    No writing activity available for {rangeConfig.label.toLowerCase()}.
                    </div>
                  )}
                </div>
                <p className="text-sm text-[#64748b]">
                  Generated from journal activity and average word count.
                </p>
              </div>
            </Card>
          </div>

          {/* Top Themes */}
          <Card variant="parent">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Most Discussed Themes</h3>
                <Badge variant="parent-slate">Top {rangeConfig.themeLimit}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {topThemes.length ? topThemes.map((theme, index) => (
                  <div key={theme.theme} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">#{index + 1}</span>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="text-[#2d3748] mb-1">{theme.theme}</h4>
                    <p className="text-sm text-[#64748b]">{theme.count} mentions</p>
                  </div>
                )) : (
                  <div className="col-span-full rounded-xl bg-gray-50 p-4 text-sm text-[#64748b]">
                    No story themes available yet.
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Insights Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">📈</div>
                <h4 className="text-[#2d3748] mb-1 text-base sm:text-lg">Positive Trajectory</h4>
                <p className="text-sm text-[#64748b]">{analytics?.emotionalProfile?.dominantSentiment || 'No sentiment data yet'}</p>
              </div>
            </Card>
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">✍️</div>
                <h4 className="text-[#2d3748] mb-1 text-base sm:text-lg">Growing Expression</h4>
                <p className="text-sm text-[#64748b]">{averageWords} average words per entry</p>
              </div>
            </Card>
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">🎯</div>
                <h4 className="text-[#2d3748] mb-1 text-base sm:text-lg">Consistent Habit</h4>
                <p className="text-sm text-[#64748b]">{totalEntries} total journal entries. Dominant mood: {dominantMood}</p>
              </div>
            </Card>
          </div>
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
