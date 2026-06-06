import React, { useEffect, useState } from 'react';
import { ParentSidebar } from '../components/ParentSidebar';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Brain, Sparkles, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Heart, MessageCircle } from 'lucide-react';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { api } from '../services/api';

interface ParentInsightsScreenProps {
  childName: string;
  parentId?: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function ParentInsightsScreen({ childName, parentId, onNavigate, onLogout }: ParentInsightsScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [insightData, setInsightData] = useState<any | null>(null);

  useEffect(() => {
    if (!parentId) return;
    api.dashboard.insights(parentId).then(setInsightData).catch(() => setInsightData(null));
  }, [parentId]);

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

  const insights = insightData?.keyInsights?.length ? insightData.keyInsights.map((insight: any) => ({
    ...insight,
    type: insight.type === 'mood' ? 'positive' : insight.type,
    icon: insight.icon || iconByInsightType[insight.type] || <MessageCircle className="w-6 h-6" />,
    confidence:
      typeof insight.confidence === 'number'
        ? Math.round(insight.confidence <= 1 ? insight.confidence * 100 : insight.confidence)
        : 0,
    date: insight.date || 'Current',
  })) : [
    {
      type: 'positive',
      icon: <Heart className="w-6 h-6" />,
      title: 'Strong Social Connections',
      description: `${childName} frequently writes about friends and social activities, indicating healthy peer relationships. Recent entries show excitement about collaborative school projects.`,
      confidence: 95,
      date: 'Today'
    },
    {
      type: 'opportunity',
      icon: <Lightbulb className="w-6 h-6" />,
      title: 'Growing Creative Interest',
      description: 'Detected increased mentions of art, drawing, and creative projects. Consider encouraging artistic activities or providing creative resources.',
      confidence: 88,
      date: 'Yesterday'
    },
    {
      type: 'neutral',
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Academic Engagement',
      description: 'Writing shows consistent interest in science topics, particularly space and animals. Emotional tone remains positive when discussing learning.',
      confidence: 92,
      date: '2 days ago'
    },
    {
      type: 'attention',
      icon: <AlertCircle className="w-6 h-6" />,
      title: 'Slight Sleep Pattern Concern',
      description: 'Recent entries mention feeling tired in the morning. Consider reviewing bedtime routines and screen time before sleep.',
      confidence: 78,
      date: '3 days ago'
    },
  ];

  const recommendations = insightData?.recommendations?.length ? insightData.recommendations.map((item: any) => ({
    ...item,
    icon: item.icon || <CheckCircle className="w-5 h-5" />,
  })) : [
    {
      category: 'Activity',
      suggestion: 'Art & Creativity Workshop',
      reason: `Based on ${childName}'s recent interests in creative expression and drawing`,
      icon: '🎨'
    },
    {
      category: 'Reading',
      suggestion: 'Space & Astronomy Books',
      reason: 'Aligns with demonstrated curiosity about science and space topics',
      icon: '📚'
    },
    {
      category: 'Social',
      suggestion: 'Group Activities',
      reason: 'Strong social engagement patterns suggest enjoyment of collaborative experiences',
      icon: '👥'
    },
    {
      category: 'Routine',
      suggestion: 'Earlier Bedtime Routine',
      reason: 'May help address mentions of morning tiredness',
      icon: '😴'
    },
  ];

  const emotionalTrends = insightData?.emotionalTrends?.data?.length ? insightData.emotionalTrends.data : [
    { mood: 'Happy', percentage: 65, change: '+5%', trend: 'up' },
    { mood: 'Excited', percentage: 20, change: '+3%', trend: 'up' },
    { mood: 'Calm', percentage: 10, change: '-2%', trend: 'down' },
    { mood: 'Worried', percentage: 5, change: '-1%', trend: 'down' },
  ];

  return (
    <div className="min-h-screen bg-[var(--parent-bg)] flex">
      <ParentSidebar 
        childName={childName}
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
              <Badge variant="parent-teal" className="w-fit">
                <Sparkles className="w-4 h-4 mr-1" />
                AI Analysis
              </Badge>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* Overall Status */}
          <Card variant="parent">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#2d3748] mb-2 text-lg sm:text-xl">Overall Wellbeing: Excellent</h3>
                <p className="text-[#64748b] text-sm sm:text-base">
                  {childName} is demonstrating healthy emotional development with strong positive sentiment, active social engagement, 
                  and growing creative expression. No concerning patterns detected in recent entries.
                </p>
              </div>
            </div>
          </Card>

          {/* Key Insights */}
          <div>
            <h2 className="text-[#2d3748] mb-4 text-lg sm:text-xl">Key Insights</h2>
            <div className="space-y-3 sm:space-y-4">
              {insights.map((insight, index) => (
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
                          <Badge variant="parent-slate" className="text-xs">{insight.confidence}% confident</Badge>
                          <span className="text-xs text-[#64748b]">{insight.date}</span>
                        </div>
                      </div>
                      <p className="text-[#64748b] text-sm sm:text-base">{insight.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Emotional Trends */}
            <Card variant="parent">
              <div className="space-y-4">
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Emotional Trends</h3>
                <div className="space-y-3">
                  {emotionalTrends.map((trend) => (
                    <div key={trend.mood} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#2d3748]">{trend.mood}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#64748b]">{trend.percentage}%</span>
                          <span className={`text-xs ${trend.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.change}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            trend.mood === 'Happy' ? 'bg-yellow-400' :
                            trend.mood === 'Excited' ? 'bg-orange-400' :
                            trend.mood === 'Calm' ? 'bg-blue-400' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${trend.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
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
                  {recommendations.map((rec, index) => (
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
                  ))}
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
