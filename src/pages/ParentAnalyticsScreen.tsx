import React, { useEffect, useState } from 'react';
import { ParentSidebar } from '../components/ParentSidebar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { BarChart as RechartsBar, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { api } from '../services/api';

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

  // Mock data
  const sentimentTrend = analytics?.sentimentTrend?.length ? analytics.sentimentTrend : [
    { date: 'Jan 1', positive: 85, neutral: 10, negative: 5 },
    { date: 'Jan 8', positive: 78, neutral: 15, negative: 7 },
    { date: 'Jan 15', positive: 92, neutral: 5, negative: 3 },
    { date: 'Jan 22', positive: 88, neutral: 8, negative: 4 },
    { date: 'Jan 29', positive: 95, neutral: 3, negative: 2 },
  ];

  const emotionalProfile = analytics?.emotionalProfile?.length ? analytics.emotionalProfile : [
    { emotion: 'Happy', value: 85 },
    { emotion: 'Calm', value: 75 },
    { emotion: 'Excited', value: 70 },
    { emotion: 'Creative', value: 80 },
    { emotion: 'Curious', value: 90 },
    { emotion: 'Confident', value: 65 },
  ];

  const writingActivity = analytics?.writingActivity?.weeklyActivity?.length ? analytics.writingActivity.weeklyActivity : [
    { week: 'Week 1', entries: 5, words: 450, time: 35 },
    { week: 'Week 2', entries: 7, words: 680, time: 52 },
    { week: 'Week 3', entries: 6, words: 550, time: 45 },
    { week: 'Week 4', entries: 8, words: 720, time: 58 },
  ];

  const topThemes = analytics?.mostDiscussedThemes?.length ? analytics.mostDiscussedThemes : [
    { theme: 'School', count: 24, trend: 'up' },
    { theme: 'Friends', count: 18, trend: 'up' },
    { theme: 'Family', count: 15, trend: 'stable' },
    { theme: 'Hobbies', count: 12, trend: 'up' },
    { theme: 'Sports', count: 8, trend: 'down' },
  ];

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
                <p className="text-[#64748b] mt-1 text-sm sm:text-base">Deep insights into {childName}'s emotional journey</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                  Well-balanced emotional expression with strong curiosity and happiness indicators.
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
                  Increasing engagement with consistent growth in both frequency and depth.
                </p>
              </div>
            </Card>
          </div>

          {/* Top Themes */}
          <Card variant="parent">
            <div className="space-y-4">
              <h3 className="text-[#2d3748] text-lg sm:text-xl">Most Discussed Themes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {topThemes.map((theme, index) => (
                  <div key={theme.theme} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">#{index + 1}</span>
                      {theme.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {theme.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-600" />}
                    </div>
                    <h4 className="text-[#2d3748] mb-1">{theme.theme}</h4>
                    <p className="text-sm text-[#64748b]">{theme.count} mentions</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Insights Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">📈</div>
                <h4 className="text-[#2d3748] mb-1 text-base sm:text-lg">Positive Trajectory</h4>
                <p className="text-sm text-[#64748b]">15% increase in positive sentiment this month</p>
              </div>
            </Card>
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">✍️</div>
                <h4 className="text-[#2d3748] mb-1 text-base sm:text-lg">Growing Expression</h4>
                <p className="text-sm text-[#64748b]">Average word count increased by 45%</p>
              </div>
            </Card>
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">🎯</div>
                <h4 className="text-[#2d3748] mb-1 text-base sm:text-lg">Consistent Habit</h4>
                <p className="text-sm text-[#64748b]">Writing 6.5 times per week on average</p>
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
