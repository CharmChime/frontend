import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { ChildSidebar } from '../components/ChildSidebar';
import { ChildAvatar } from '../components/ChildAvatar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { Sparkles, PenLine, BookOpen, Calendar, Trophy, Home, Wand2, Smile, Star, Heart, RefreshCw } from 'lucide-react';
import { api, type AchievementItem, type AchievementProgress, type Journal, type MoodAnalysis, type Story } from '../services/api';
import { formatShortDate } from '../services/journalAdapters';
import { toast } from 'sonner';
import { ChildPageLoader } from '../components/PageLoaders';

interface ChildHomeScreenRedesignedProps {
  childName: string;
  childAvatar?: string;
  childId?: string;
  onNewEntry: () => void;
  onViewMemories: () => void;
  onStoryMode: () => void;
  onCalendar?: () => void;
  onAchievements?: () => void;
  onOpenJournal?: (journalId: string) => void;
  onOpenStory?: (storyId: string) => void;
  onSettings?: () => void;
  onLogout: () => void;
}

export function ChildHomeScreenRedesigned({ 
  childName, 
  childAvatar,
  childId,
  onNewEntry, 
  onViewMemories, 
  onStoryMode,
  onCalendar,
  onAchievements,
  onOpenJournal,
  onOpenStory,
  onSettings,
  onLogout
}: ChildHomeScreenRedesignedProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [moodAnalyses, setMoodAnalyses] = useState<MoodAnalysis[]>([]);
  const [achievementItems, setAchievementItems] = useState<AchievementItem[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState('');

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const handleNavigation = (page: string) => {
    setActiveTab(page);
    switch(page) {
      case 'home':
        // Already on home
        break;
      case 'entry':
      case 'new-entry':
        onNewEntry();
        break;
      case 'story-mode':
        onStoryMode();
        break;
      case 'memories':
        onViewMemories();
        break;
      case 'calendar':
        onCalendar?.();
        break;
      case 'achievements':
        onAchievements?.();
        break;
      case 'notifications':
      case 'settings':
        onSettings?.();
        break;
    }
  };

  useEffect(() => {
    if (!childId) {
      setJournals([]);
      setStories([]);
      setMoodAnalyses([]);
      setAchievementItems([]);
      setAchievementProgress(null);
      setIsLoadingDashboard(false);
      setDashboardError('');
      return;
    }

    let isMounted = true;
    setIsLoadingDashboard(true);
    setDashboardError('');

    Promise.all([
      api.journals.list({ childId }),
      api.stories.list({ childId }),
      api.mood.byChild(childId),
      api.achievements.me(),
    ])
      .then(([journalData, storyData, moodData, achievementData]) => {
        if (!isMounted) return;
        const sortedJournals = [...(journalData.journals || [])].sort(
          (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
        );

        setJournals(sortedJournals);
        setStories(
          [...(storyData.stories || [])].sort(
            (first, second) =>
              new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
          )
        );
        setMoodAnalyses(moodData.moodAnalyses || moodData.moods || moodData.analyses || []);
        setAchievementItems(achievementData.achievements || []);
        setAchievementProgress(achievementData.progress || null);
      })
      .catch((error) => {
        if (!isMounted) return;
        setJournals([]);
        setStories([]);
        setMoodAnalyses([]);
        setAchievementItems([]);
        setAchievementProgress(null);
        const message = error instanceof Error ? error.message : 'Could not load your child dashboard.';
        setDashboardError(message);
        toast.error(message);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDashboard(false);
      });

    return () => {
      isMounted = false;
    };
  }, [childId]);

  const toDayKey = (value?: string) => {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toISOString().slice(0, 10);
  };

  const journalDayKeys = useMemo(
    () => Array.from(new Set(journals.map((journal) => toDayKey(journal.createdAt)).filter(Boolean))).sort(),
    [journals]
  );

  const recentActivities = useMemo(
    () =>
      [
        ...journals.map((journal) => ({
          id: journal.id,
          type: 'journal' as const,
          title: journal.title,
          createdAt: journal.createdAt,
          mood:
            journal.moodStatus && journal.moodStatus !== 'pending'
              ? journal.moodStatus
              : 'thoughtful',
        })),
        ...stories.map((story) => ({
          id: story.id,
          type: 'story' as const,
          title: story.title,
          createdAt: story.createdAt,
          mood: '',
        })),
        ...achievementItems
          .filter((achievement) => achievement.unlocked && achievement.unlockedAt)
          .map((achievement) => ({
            id: achievement.id,
            type: 'achievement' as const,
            title: achievement.title,
            createdAt: achievement.unlockedAt as string,
            mood: '',
          })),
      ]
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
        )
        .slice(0, 5),
    [achievementItems, journals, stories]
  );

  const weeklyStreakDays = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const journalDays = new Set(journalDayKeys);

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + index);
      return journalDays.has(day.toISOString().slice(0, 10));
    });
  }, [journalDayKeys]);

  const currentStreak = useMemo(() => {
    if (!journalDayKeys.length) return 0;

    let streak = 1;

    for (let index = journalDayKeys.length - 1; index > 0; index -= 1) {
      const currentDay = new Date(journalDayKeys[index]);
      const previousDay = new Date(journalDayKeys[index - 1]);
      const diffDays = Math.round((currentDay.getTime() - previousDay.getTime()) / 86400000);

      if (diffDays !== 1) break;
      streak += 1;
    }

    return streak;
  }, [journalDayKeys]);

  const lastWeekMoodCounts = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return moodAnalyses.reduce<Record<string, number>>((counts, analysis) => {
      const analyzedAt = analysis.analyzedAt || analysis.createdAt;
      const timestamp = analyzedAt ? new Date(analyzedAt).getTime() : 0;

      if (!timestamp || timestamp < oneWeekAgo) return counts;

      const mood = (analysis.mood || analysis.emotion || analysis.label || analysis.sentiment || 'thoughtful').toLowerCase();
      counts[mood] = (counts[mood] || 0) + 1;
      return counts;
    }, {});
  }, [moodAnalyses]);

  const topLastWeekMoods = useMemo(
    () =>
      Object.entries(lastWeekMoodCounts)
        .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
        .slice(0, 3),
    [lastWeekMoodCounts]
  );

  const backendAchievementPreview = useMemo(
    () =>
      [...achievementItems]
        .sort((first, second) =>
          Number(second.unlocked) - Number(first.unlocked) ||
          second.progress - first.progress
        )
        .slice(0, 3),
    [achievementItems]
  );

  const unlockedAchievementCount =
    achievementProgress?.unlockedAchievementIds?.length ||
    achievementItems.filter((achievement) => achievement.unlocked).length;

  const openRecentActivity = (activity: typeof recentActivities[number]) => {
    if (activity.type === 'journal') {
      onOpenJournal?.(activity.id);
    } else if (activity.type === 'story') {
      onOpenStory?.(activity.id);
    } else {
      onAchievements?.();
    }
  };

  const getMoodIcon = (mood: string) => {
    switch(mood) {
      case 'happy': return <Smile className="w-4 h-4" fill="currentColor" />;
      case 'excited': return <Star className="w-4 h-4" fill="currentColor" />;
      case 'calm': return <Heart className="w-4 h-4" fill="currentColor" />;
      default: return <Smile className="w-4 h-4" fill="currentColor" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch(mood) {
      case 'happy': return 'child-yellow';
      case 'excited': return 'child-peach';
      case 'calm': return 'child-mint';
      case 'sad': return 'child-lavender';
      case 'worried': return 'child-lavender';
      case 'angry': return 'child-peach';
      default: return 'child-blue';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch(mood) {
      case 'happy': return '😊';
      case 'calm': return '😌';
      case 'excited': return '🤩';
      case 'sad': return '😔';
      case 'worried': return '😟';
      case 'angry': return '😤';
      default: return '🙂';
    }
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" />, active: true },
    { id: 'new-entry', label: 'New Entry', icon: <PenLine className="w-5 h-5" />, onClick: onNewEntry },
    { id: 'story-mode', label: 'Story Time', icon: <Wand2 className="w-5 h-5" />, onClick: onStoryMode },
    { id: 'memories', label: 'My Memories', icon: <BookOpen className="w-5 h-5" />, onClick: onViewMemories },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" />, onClick: onCalendar },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-5 h-5" />, onClick: onAchievements },
  ];

  return (
    <div className="min-h-screen bg-[var(--child-bg)] flex">
      <div className="lg:hidden">
        <MobileMenuButton onClick={() => setIsSidebarOpen(true)} />
        <ChildSidebar
          childName={childName}
          childAvatar={childAvatar}
          childId={childId}
          activeItem={activeTab}
          onNavigate={handleNavigation}
          onLogout={() => setShowLogoutConfirm(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogoClick={() => handleNavigation('home')}
          streakDays={currentStreak}
          weeklyStreakDays={weeklyStreakDays}
        />
      </div>

      <div className="hidden lg:block">
        <ChildSidebar
          childName={childName}
          childAvatar={childAvatar}
          childId={childId}
          activeItem={activeTab}
          onNavigate={handleNavigation}
          onLogout={() => setShowLogoutConfirm(true)}
          onLogoClick={() => handleNavigation('home')}
          streakDays={currentStreak}
          weeklyStreakDays={weeklyStreakDays}
        />
      </div>
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="pl-20 pr-4 py-4 sm:px-6 lg:px-8 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-[#2d3748] text-xl sm:text-2xl lg:text-3xl truncate">Hello, {childName}! 👋</h1>
                <p className="text-[#64748b] mt-1">Ready to share your story today?</p>
              </div>
              <Button 
                variant="child-blue" 
                icon={<PenLine className="w-5 h-5" />}
                onClick={onNewEntry}
                className="w-full sm:w-auto"
              >
                New Entry
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {isLoadingDashboard && !dashboardError && !journals.length && !stories.length ? (
            <ChildPageLoader
              childName={childName}
              childAvatar={childAvatar}
              message="Collecting your journals, stories, moods, and little wins."
            />
          ) : (isLoadingDashboard || dashboardError) && (
            <Card variant="child" className={dashboardError ? 'border-2 border-red-200 bg-red-50' : ''}>
              <div className="flex items-center justify-center gap-3 text-sm">
                {isLoadingDashboard && <RefreshCw className="w-4 h-4 animate-spin text-[#1a365d]" />}
                <p className={dashboardError ? 'text-red-700' : 'text-[#1a365d]'}>
                  {dashboardError || 'Loading your latest journals, stories, and moods...'}
                </p>
              </div>
            </Card>
          )}

          {/* Avatar Greeting Card */}
          <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-lavender)]/20">
            <div className="flex items-center gap-6">
              <ChildAvatar avatar={childAvatar} name={childName} size="xl" />
              <div className="flex-1">
                <h3 className="text-[#2d3748] mb-2">Hey there, friend! 💫</h3>
                <p className="text-[#4a5568]">
                  I'm Chime, your storytelling companion! What would you like to do today? Write about your day, or shall we create an amazing story together?
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card
              variant="child"
              className="cursor-pointer hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all focus-visible:ring-4 focus-visible:ring-[var(--child-blue)]/40"
              onClick={onNewEntry}
              aria-label="Create journal entry"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[var(--child-blue)] flex items-center justify-center shadow-md">
                  <PenLine className="w-8 h-8 text-[#1a365d]" />
                </div>
                <div>
                  <h4 className="text-[#2d3748] mb-2">Create Journal</h4>
                  <p className="text-[#64748b] text-sm">
                    {journals.length} {journals.length === 1 ? 'entry' : 'entries'} saved so far
                  </p>
                </div>
              </div>
            </Card>

            <Card
              variant="child"
              className="cursor-pointer hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all focus-visible:ring-4 focus-visible:ring-[var(--child-mint)]/40"
              onClick={onStoryMode}
              aria-label="Create story"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[var(--child-mint)] flex items-center justify-center shadow-md">
                  <Sparkles className="w-8 h-8 text-[#065f46]" fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-[#2d3748] mb-2">Create a Story</h4>
                  <p className="text-[#64748b] text-sm">
                    {stories.length} {stories.length === 1 ? 'story' : 'stories'} created
                  </p>
                </div>
              </div>
            </Card>

            <Card
              variant="child"
              className="cursor-pointer hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all focus-visible:ring-4 focus-visible:ring-[var(--child-yellow)]/40"
              onClick={onViewMemories}
              aria-label="Open my memories"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[var(--child-yellow)] flex items-center justify-center shadow-md">
                  <BookOpen className="w-8 h-8 text-[#744210]" />
                </div>
                <div>
                  <h4 className="text-[#2d3748] mb-2">My Memories</h4>
                  <p className="text-[#64748b] text-sm">
                    {journalDayKeys.length} active {journalDayKeys.length === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-[#2d3748]">Recent Activities ✨</h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <Card
                    key={`${activity.type}-${activity.id}`}
                    variant="child"
                    className="cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow"
                    onClick={() => openRecentActivity(activity)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Badge
                          variant={activity.type === 'journal' ? getMoodColor(activity.mood) as any : 'child-lavender'}
                          icon={
                            activity.type === 'journal'
                              ? getMoodIcon(activity.mood)
                              : activity.type === 'achievement'
                              ? <Trophy className="h-4 w-4" />
                              : <BookOpen className="h-4 w-4" />
                          }
                        >
                          {activity.type === 'journal' ? 'Journal' : activity.type === 'story' ? 'Story' : 'Achievement'}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[#2d3748] truncate">{activity.title}</h4>
                          <p className="text-sm text-[#64748b]">
                            {formatShortDate(activity.createdAt)}
                            {activity.type === 'journal'
                              ? ` · ${activity.mood}`
                              : activity.type === 'story'
                              ? ' · Generated story'
                              : ' · Badge unlocked'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={activity.type === 'journal' ? 'child-blue' : 'child-lavender'}
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          openRecentActivity(activity);
                        }}
                      >
                        Open
                      </Button>
                    </div>
                  </Card>
                ))}
                {recentActivities.length === 0 && (
                  <Card variant="child">
                    <p className="text-center text-sm text-[#64748b]">
                      No activities yet. Your latest journals and stories will appear here.
                    </p>
                  </Card>
                )}
              </div>
            </div>

            {/* Mood Tracker - Takes 1 column */}
            <div className="space-y-4">
              <h3 className="text-[#2d3748]">How I've Been Feeling 💭</h3>
              <Card variant="child">
                <div className="space-y-3">
                  {topLastWeekMoods.map(([mood, count]) => (
                    <div key={mood} className="text-center p-4 rounded-2xl bg-[var(--child-blue)]/20">
                      <div className="text-4xl mb-2">{getMoodEmoji(mood)}</div>
                      <p className="text-[#1a365d] capitalize">
                        {count} {mood} {count === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  ))}
                  {topLastWeekMoods.length === 0 && (
                    <div className="text-center p-4 rounded-2xl bg-[var(--child-blue)]/20">
                      <div className="text-4xl mb-2">{getMoodEmoji('thoughtful')}</div>
                      <p className="text-[#1a365d]">No moods detected this week yet</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Achievements Preview */}
              <Card variant="child">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[var(--child-yellow)]" />
                    <h4 className="text-[#2d3748]">Achievements</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[var(--child-yellow)]/15 p-3 text-center">
                    <div>
                      <p className="text-lg font-semibold text-[#744210]">{unlockedAchievementCount}</p>
                      <p className="text-[10px] text-[#64748b]">Unlocked</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-[#1a365d]">{achievementProgress?.totalPoints || 0}</p>
                      <p className="text-[10px] text-[#64748b]">Points</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-[#065f46]">{achievementProgress?.currentJournalingStreak || 0}</p>
                      <p className="text-[10px] text-[#64748b]">Day streak</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {backendAchievementPreview.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-2 text-sm">
                        <span className="text-xl">{achievement.unlocked ? '🏆' : '🎯'}</span>
                        <span className={achievement.unlocked ? 'text-[#2d3748]' : 'text-[#64748b]'}>
                          {achievement.title}
                        </span>
                        <span className="ml-auto text-xs text-[#94a3b8]">
                          {achievement.unlocked ? 'Done' : `${achievement.currentValue}/${achievement.target}`}
                        </span>
                      </div>
                    ))}
                    {backendAchievementPreview.length === 0 && (
                      <p className="text-sm text-[#64748b]">Start journaling to earn your first badge.</p>
                    )}
                  </div>
                  <Button variant="child-yellow" size="small" className="w-full" onClick={onAchievements}>
                    View all achievements
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        variant="child"
      />
    </div>
  );
}
