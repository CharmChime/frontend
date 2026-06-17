import React, { useEffect, useState } from 'react';
import { ParentSidebar } from '../components/ParentSidebar';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Activity, Clock, PenLine, Sparkles, Filter, Smile } from 'lucide-react';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { api, type Child } from '../services/api';
import { ParentThemeToggle } from '../components/ParentThemeToggle';
import { ParentPageLoader } from '../components/PageLoaders';

interface ParentActivityScreenProps {
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

export function ParentActivityScreen({
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
}: ParentActivityScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'journal' | 'story' | 'mood'>('all');
  const [activityLimit, setActivityLimit] = useState(10);
  const [activityData, setActivityData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!parentId) return;
    setIsLoading(true);
    setActivityData(null);
    api.dashboard.activity(parentId, {
      childId: selectedChildId,
      type: filterType === 'all' ? undefined : filterType,
      limit: activityLimit,
    })
      .then(setActivityData)
      .catch(() => setActivityData(null))
      .finally(() => setIsLoading(false));
  }, [parentId, selectedChildId, filterType, activityLimit]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const handleFilterChange = (type: 'all' | 'journal' | 'story' | 'mood') => {
    setFilterType(type);
    setActivityLimit(10);
  };

  const activityItems = Array.isArray(activityData?.activities) ? activityData.activities : [];
  const activities = activityItems.length ? activityItems.map((activity: any) => ({
    ...activity,
    details: activity.details || activity.description,
    time: activity.time || (activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'Recently'),
  })) : [];
  const summary = activityData?.summary || {
    totalActivities: 0,
    journalEntries: 0,
    storiesCreated: 0,
    moodAnalyses: 0,
  };

  const filteredActivities = filterType === 'all' 
    ? activities 
    : activities.filter(a => a.type === filterType);
  const canLoadMore = activities.length >= activityLimit && activityLimit < 50;

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'journal': return <PenLine className="w-5 h-5" />;
      case 'story': return <Sparkles className="w-5 h-5" />;
      case 'mood': return <Smile className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch(type) {
      case 'journal': return 'bg-blue-100 text-blue-600';
      case 'story': return 'bg-purple-100 text-purple-600';
      case 'mood': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch(mood) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'calm': return '😌';
      case 'sad': return '😢';
      default: return '😐';
    }
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
        activeItem="activity"
        onNavigate={onNavigate}
        onLogout={() => setShowLogoutConfirm(true)}
        onLogoClick={() => onNavigate('overview')}
      />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-[#2d3748] text-xl sm:text-2xl lg:text-3xl">Activity Log</h1>
                  <p className="text-[#64748b] mt-1 text-sm sm:text-base">Track {childName}'s journaling activity and milestones</p>
                </div>
                <div className="flex items-center gap-3">
                  <ParentThemeToggle theme={theme} onThemeToggle={onThemeToggle} />
                  <Badge
                    variant="parent-teal"
                    icon={<Activity className="w-4 h-4" />}
                  >
                    {filteredActivities.length} Activities
                  </Badge>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Filter className="w-5 h-5 text-[#64748b]" />
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                    filterType === 'all'
                      ? 'bg-[var(--parent-teal)] text-white'
                      : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterChange('journal')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                    filterType === 'journal'
                      ? 'bg-[var(--parent-teal)] text-white'
                      : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                  }`}
                >
                  Journal
                </button>
                <button
                  onClick={() => handleFilterChange('story')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                    filterType === 'story'
                      ? 'bg-[var(--parent-teal)] text-white'
                      : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                  }`}
                >
                  Stories
                </button>
                <button
                  onClick={() => handleFilterChange('mood')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                    filterType === 'mood'
                      ? 'bg-[var(--parent-teal)] text-white'
                      : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                  }`}
                >
                  Mood
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <ParentPageLoader
              title="Loading activity log"
              message={`Collecting recent journal, story, and mood activity for ${childName}.`}
            />
          ) : (
          <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl mb-1">{summary.journalEntries}</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Journal Entries</p>
              </div>
            </Card>
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl mb-1">{summary.storiesCreated}</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Stories Created</p>
              </div>
            </Card>
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl mb-1">{summary.moodAnalyses}</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Mood Analyses</p>
              </div>
            </Card>
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl mb-1">{summary.totalActivities}</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Total Activities</p>
              </div>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card variant="parent">
            <h3 className="text-[#2d3748] mb-4 text-lg sm:text-xl">Recent Activity</h3>
            <div className="space-y-3">
              {filteredActivities.length ? filteredActivities.map((activity, index) => (
                <div key={index} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                      <h4 className="text-[#2d3748] text-sm sm:text-base">{activity.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-[#64748b] flex-shrink-0">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {activity.time}
                      </div>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-[#64748b] mb-2">{activity.details}</p>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {activity.mood && (
                        <Badge variant="parent-slate" className="text-xs">
                          {getMoodEmoji(activity.mood)} {activity.mood}
                        </Badge>
                      )}
                      {activity.duration && (
                        <Badge variant="parent-slate" className="text-xs">
                          ⏱️ {activity.duration}
                        </Badge>
                      )}
                      {activity.wordCount && (
                        <Badge variant="parent-slate" className="text-xs">
                          ✍️ {activity.wordCount} words
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-[#64748b]">
                  No activity found for this filter yet.
                </div>
              )}
            </div>
            {canLoadMore && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setActivityLimit((limit) => Math.min(limit + 10, 50))}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-lg bg-[var(--parent-teal)] text-white text-sm font-medium shadow-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  Load more activities
                </button>
              </div>
            )}
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
