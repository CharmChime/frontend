import React, { useEffect, useState } from 'react';
import { ParentSidebar } from '../components/ParentSidebar';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Brain, Sparkles, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Heart, MessageCircle } from 'lucide-react';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { api, type Child } from '../services/api';
import { ParentThemeToggle } from '../components/ParentThemeToggle';
import { ParentPageLoader } from '../components/PageLoaders';

interface ParentInsightsScreenProps {
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

export function ParentInsightsScreen({
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
}: ParentInsightsScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [insightData, setInsightData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Save and load last selected child
  useEffect(() => {
    if (selectedChildId) {
      localStorage.setItem('lastSelectedChildId', selectedChildId);
    }
  }, [selectedChildId]);

  useEffect(() => {
    if (!parentId) return;
    setIsLoading(true);
    setInsightData(null);
    api.dashboard.insights(parentId, { childId: selectedChildId })
      .then(setInsightData)
      .catch(() => setInsightData(null))
      .finally(() => setIsLoading(false));
  }, [parentId, selectedChildId]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const iconByInsightType: Record<string, React.ReactNode> = {
    mood: <Heart className="w-6 h-6" />,
    activity: <TrendingUp className="w-6 h-6" />,
    positive: <Heart className="w-6 h-6" />,
    attention: <AlertCircle className="w-6 h-6" />,
    opportunity: <Lightbulb className="w-6 h-6" />,
  };

  const keyInsights = Array.isArray(insightData?.keyInsights) ? insightData.keyInsights : [];
  const recommendations = Array.isArray(insightData?.recommendations) ? insightData.recommendations : [];
  const emotionalTrendData = Array.isArray(insightData?.emotionalTrends?.data) ? insightData.emotionalTrends.data : [];
  const displayInsights = keyInsights.map((insight: any) => ({
    ...insight,
    type: insight.type === 'mood' ? 'positive' : insight.type,
    icon: iconByInsightType[insight.type] || <MessageCircle className="w-6 h-6" />,
    confidence:
      typeof insight.confidence === 'number'
        ? Math.round(insight.confidence <= 1 ? insight.confidence * 100 : insight.confidence)
        : null,
    date: insight.date || 'Current',
  }));
  const displayRecommendations = recommendations.map((item: any) => ({
    ...item,
    category: item.category || item.type || 'Suggestion',
    suggestion: item.suggestion || item.title,
    reason: item.reason || item.description,
    icon: <CheckCircle className="w-5 h-5 text-[var(--parent-teal)]" />,
  }));
  const displayEmotionalTrends = emotionalTrendData.map((trend: any, index: number) => {
    const positive = Number(trend.positive || 0);
    const neutral = Number(trend.neutral || 0);
    const negative = Number(trend.negative || 0);
    const total = positive + neutral + negative;

    return {
      label: trend.label || trend.week || trend.date || `Period ${index + 1}`,
      positive,
      neutral,
      negative,
      total,
      positivePercent: total ? Math.round((positive / total) * 100) : 0,
      neutralPercent: total ? Math.round((neutral / total) * 100) : 0,
      negativePercent: total ? Math.round((negative / total) * 100) : 0,
    };
  });
  const overallWellbeing = insightData?.overallWellbeing || {
    label: 'Not available',
    message: 'AI insights will appear after shared mood analysis data is available.',
  };

  return (
    <div className="min-h-screen bg-[var(--parent-bg)] flex">
      <ParentSidebar 
        childName={childName}
        childAvatar={childAvatar}
        parentName={parentName}
        children={children}
        selectedChildId={selectedChildId}
        onSelectChild={onSelectChild}
        activeItem="insights"
        onNavigate={onNavigate}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--parent-teal)]" />
                  <h1 className="text-[#2d3748] text-xl sm:text-2xl lg:text-3xl">AI-Powered Insights</h1>
                </div>
                <p className="text-[#64748b] mt-1 text-sm sm:text-base">Intelligent analysis of {childName}'s emotional wellbeing</p>
              </div>
              <div className="flex items-center gap-3">
                <ParentThemeToggle theme={theme} onThemeToggle={onThemeToggle} />
                <Badge
                  variant="parent-teal"
                  icon={<Sparkles className="w-4 h-4" />}
                  className="w-fit"
                >
                  AI Analysis
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {isLoading ? (
            <ParentPageLoader
              title="Loading AI insights"
              message={`Analyzing ${childName}'s latest wellbeing signals.`}
            />
          ) : (
          <>
          {/* Overall Status */}
          <Card variant="parent">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#2d3748] mb-2 text-lg sm:text-xl">Overall Wellbeing: {overallWellbeing.label}</h3>
                <p className="text-[#64748b] text-sm sm:text-base">
                  {overallWellbeing.message}
                </p>
              </div>
            </div>
          </Card>

          {/* Key Insights */}
          <div>
            <h2 className="text-[#2d3748] mb-4 text-lg sm:text-xl">Key Insights</h2>
            <div className="space-y-3 sm:space-y-4">
              {displayInsights.length ? displayInsights.map((insight, index) => (
                <Card key={index} variant="parent" className={`
                  ${insight.type === 'positive' ? 'border-l-4 border-green-500' : ''}
                  ${insight.type === 'attention' ? 'border-l-4 border-yellow-500' : ''}
                  ${insight.type === 'opportunity' ? 'border-l-4 border-blue-500' : ''}
                `}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${insight.type === 'positive' ? 'bg-green-100 text-green-600' : ''}
                      ${insight.type === 'attention' ? 'bg-yellow-100 text-yellow-600' : ''}
                      ${insight.type === 'opportunity' ? 'bg-blue-100 text-blue-600' : ''}
                      ${insight.type === 'neutral' ? 'bg-gray-100 text-gray-600' : ''}
                    `}>
                      {insight.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h4 className="text-[#2d3748] text-base sm:text-lg">{insight.title}</h4>
                        <div className="flex items-center gap-2">
                          {insight.confidence !== null && (
                            <Badge variant="parent-slate" className="text-xs">{insight.confidence}% confident</Badge>
                          )}
                          <span className="text-xs text-[#64748b]">{insight.date}</span>
                        </div>
                      </div>
                      <p className="text-[#64748b] text-sm sm:text-base">{insight.description}</p>
                    </div>
                  </div>
                </Card>
              )) : (
                <Card variant="parent" className="bg-gray-50">
                  <p className="text-sm text-[#64748b]">No AI insights are available yet. Shared mood analysis data will appear here once it exists and privacy settings allow it.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Emotional Trends */}
            <Card variant="parent">
              <div className="space-y-4">
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Emotional Trends</h3>
                <div className="space-y-3">
                  {displayEmotionalTrends.length ? displayEmotionalTrends.map((trend: any) => (
                    <div key={trend.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-[#2d3748]">{trend.label}</span>
                        <span className="text-xs text-[#64748b]">{trend.total} analyzed</span>
                      </div>

                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${trend.positivePercent}%` }}
                        />
                        <div
                          className="h-full bg-slate-400 transition-all"
                          style={{ width: `${trend.neutralPercent}%` }}
                        />
                        <div
                          className="h-full bg-rose-400 transition-all"
                          style={{ width: `${trend.negativePercent}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-lg bg-white p-2">
                          <p className="text-green-600 font-medium">{trend.positivePercent}%</p>
                          <p className="text-[#64748b]">Positive</p>
                        </div>
                        <div className="rounded-lg bg-white p-2">
                          <p className="text-slate-600 font-medium">{trend.neutralPercent}%</p>
                          <p className="text-[#64748b]">Neutral</p>
                        </div>
                        <div className="rounded-lg bg-white p-2">
                          <p className="text-rose-600 font-medium">{trend.negativePercent}%</p>
                          <p className="text-[#64748b]">Negative</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-xl bg-gray-50 p-4 text-sm text-[#64748b]">
                      No emotional trend data available yet.
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* AI Recommendations */}
            <Card variant="parent">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[var(--parent-teal)]" />
                  <h3 className="text-[#2d3748] text-lg sm:text-xl">AI Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {displayRecommendations.length ? displayRecommendations.map((rec, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-[var(--parent-teal)]/5 to-blue-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Badge variant="parent-teal" className="text-xs">{rec.category}</Badge>
                            <h4 className="text-[#2d3748] text-sm sm:text-base">{rec.suggestion}</h4>
                          </div>
                          <p className="text-xs sm:text-sm text-[#64748b]">{rec.reason}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-xl bg-gray-50 p-4 text-sm text-[#64748b]">
                      No recommendations are available yet.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* AI Disclaimer */}
          <Card variant="parent" className="bg-blue-50">
            <div className="flex items-start gap-3">
              <Brain className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[#2d3748] mb-2 text-base sm:text-lg">About AI Insights</h4>
                <p className="text-[#64748b] text-sm sm:text-base mb-3">
                  Our AI analyzes sentiment patterns, emotional trends, and writing themes to provide helpful insights. 
                  These insights are suggestions and should be combined with your own observations and understanding of your child.
                </p>
                <p className="text-xs sm:text-sm text-[#64748b]">
                  <strong>Privacy Note:</strong> AI analysis is performed on mood data and themes only. 
                  Your child's actual journal content remains private and is never analyzed without explicit consent.
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
