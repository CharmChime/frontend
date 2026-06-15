import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ChildSidebar } from '../components/ChildSidebar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { LoadingState } from '../components/LoadingState';
import { ArrowLeft, Trophy, Star, Heart, Flame, BookOpen, Sparkles, Target, Award, Zap } from 'lucide-react';
import { api, type Journal, type MoodAnalysis, type Story } from '../services/api';

interface AchievementsScreenProps {
  onBack: () => void;
  childName?: string;
  childId?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

type Achievement = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  progress: number;
  date: string;
};

const formatDate = (value?: string) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const toDayKey = (value?: string) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 10);
};

const progressPercent = (current: number, target: number) =>
  Math.min(100, Math.round((current / target) * 100));

const countWords = (content?: string) =>
  (content || '').trim().split(/\s+/).filter(Boolean).length;

const getUniqueJournalDays = (journals: Journal[]) =>
  Array.from(new Set(journals.map((journal) => toDayKey(journal.createdAt)).filter(Boolean))).sort();

const getLongestStreak = (dayKeys: string[]) => {
  if (!dayKeys.length) return 0;

  let longest = 1;
  let current = 1;

  for (let index = 1; index < dayKeys.length; index += 1) {
    const previous = new Date(dayKeys[index - 1]);
    const currentDay = new Date(dayKeys[index]);
    const diffDays = Math.round((currentDay.getTime() - previous.getTime()) / 86400000);

    current = diffDays === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }

  return longest;
};

const getCurrentStreak = (dayKeys: string[]) => {
  if (!dayKeys.length) return 0;

  let streak = 1;

  for (let index = dayKeys.length - 1; index > 0; index -= 1) {
    const currentDay = new Date(dayKeys[index]);
    const previous = new Date(dayKeys[index - 1]);
    const diffDays = Math.round((currentDay.getTime() - previous.getTime()) / 86400000);

    if (diffDays !== 1) break;
    streak += 1;
  }

  return streak;
};

const getStreakUnlockDate = (dayKeys: string[], target: number) => {
  let streak = 0;
  let previousKey = '';

  for (const dayKey of dayKeys) {
    if (!previousKey) {
      streak = 1;
    } else {
      const diffDays = Math.round(
        (new Date(dayKey).getTime() - new Date(previousKey).getTime()) / 86400000
      );
      streak = diffDays === 1 ? streak + 1 : 1;
    }

    if (streak >= target) return dayKey;
    previousKey = dayKey;
  }

  return '';
};

const getNthDate = (items: { createdAt?: string }[], target: number) =>
  items
    .map((item) => item.createdAt)
    .filter(Boolean)
    .sort()[target - 1];

const getEntriesInOneDay = (journals: Journal[]) => {
  const counts = journals.reduce<Record<string, number>>((result, journal) => {
    const dayKey = toDayKey(journal.createdAt);
    if (dayKey) result[dayKey] = (result[dayKey] || 0) + 1;
    return result;
  }, {});

  return Math.max(0, ...Object.values(counts));
};

const getEntriesInOneDayUnlockDate = (journals: Journal[], target: number) => {
  const counts = new Map<string, number>();

  for (const journal of [...journals].sort((first, second) => first.createdAt.localeCompare(second.createdAt))) {
    const dayKey = toDayKey(journal.createdAt);
    if (!dayKey) continue;

    const count = (counts.get(dayKey) || 0) + 1;
    counts.set(dayKey, count);

    if (count >= target) return journal.createdAt;
  }

  return '';
};

const getMoodLabel = (analysis: MoodAnalysis) =>
  (analysis.mood || analysis.emotion || analysis.label || analysis.sentiment || '').toLowerCase();

export function AchievementsScreen({ onBack, childName = 'Friend', childId, onNavigate, onLogout }: AchievementsScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [moodAnalyses, setMoodAnalyses] = useState<MoodAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const handleSidebarNavigation = (page: string) => {
    if (page === 'achievements') return; // Already here
    if (page === 'home') {
      onBack();
    } else {
      onNavigate?.(page);
    }
  };

  useEffect(() => {
    if (!childId) {
      setError('Please log in as a child to see real achievements.');
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError('');

    Promise.all([
      api.journals.list({ childId }),
      api.stories.list({ childId }),
      api.mood.byChild(childId),
    ])
      .then(([journalData, storyData, moodData]) => {
        if (!isMounted) return;

        setJournals(journalData.journals || []);
        setStories(storyData.stories || []);
        setMoodAnalyses(moodData.moodAnalyses || moodData.moods || moodData.analyses || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Could not load achievements.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [childId]);

  const achievements = useMemo<Achievement[]>(() => {
    const journalDays = getUniqueJournalDays(journals);
    const currentStreak = getCurrentStreak(journalDays);
    const longestStreak = getLongestStreak(journalDays);
    const uniqueMoods = new Set(moodAnalyses.map(getMoodLabel).filter(Boolean)).size;
    const maxEntriesInOneDay = getEntriesInOneDay(journals);
    const totalWords = journals.reduce((sum, journal) => sum + countWords(journal.content), 0);

    const buildDateText = (unlocked: boolean, date: string | undefined, fallback: string) =>
      unlocked && date ? `Unlocked ${formatDate(date)}` : fallback;

    return [
      {
      id: 1,
      title: 'First Steps',
      description: 'Write your first journal entry',
      icon: <Star className="w-8 h-8" fill="currentColor" />,
      color: 'from-[var(--child-yellow)] to-[#f59e0b]',
        unlocked: journals.length >= 1,
        progress: progressPercent(journals.length, 1),
        date: buildDateText(journals.length >= 1, getNthDate(journals, 1), `${journals.length}/1 entry`),
    },
    {
      id: 2,
      title: 'Week Warrior',
      description: 'Journal for 7 days in a row',
      icon: <Flame className="w-8 h-8" />,
      color: 'from-[var(--child-peach)] to-[#f97316]',
        unlocked: longestStreak >= 7,
        progress: progressPercent(longestStreak, 7),
        date: buildDateText(longestStreak >= 7, getStreakUnlockDate(journalDays, 7), `${longestStreak}/7 days`),
    },
    {
      id: 3,
      title: 'Story Master',
      description: 'Create 5 AI-powered stories',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-[var(--child-lavender)] to-[#a855f7]',
        unlocked: stories.length >= 5,
        progress: progressPercent(stories.length, 5),
        date: buildDateText(stories.length >= 5, getNthDate(stories, 5), `${stories.length}/5 stories`),
    },
    {
      id: 4,
      title: 'Emotion Explorer',
      description: 'Express 10 different emotions',
      icon: <Heart className="w-8 h-8" fill="currentColor" />,
      color: 'from-[var(--child-mint)] to-[#10b981]',
        unlocked: uniqueMoods >= 5,
        progress: progressPercent(uniqueMoods, 5),
        date: uniqueMoods >= 5 ? 'Unlocked from mood history' : `${uniqueMoods}/5 emotions`,
    },
    {
      id: 5,
      title: 'Century Club',
      description: 'Write 100 journal entries',
      icon: <Trophy className="w-8 h-8" />,
      color: 'from-[var(--child-blue)] to-[#3b82f6]',
        unlocked: journals.length >= 100,
        progress: progressPercent(journals.length, 100),
        date: buildDateText(journals.length >= 100, getNthDate(journals, 100), `${journals.length}/100 entries`),
    },
    {
      id: 6,
      title: 'Month Master',
      description: 'Journal every day for 30 days',
      icon: <Target className="w-8 h-8" />,
      color: 'from-purple-400 to-purple-600',
        unlocked: longestStreak >= 30,
        progress: progressPercent(longestStreak, 30),
        date: buildDateText(longestStreak >= 30, getStreakUnlockDate(journalDays, 30), `${longestStreak}/30 days`),
    },
    {
      id: 7,
      title: 'Creative Genius',
      description: 'Write 50 creative stories',
      icon: <Sparkles className="w-8 h-8" fill="currentColor" />,
      color: 'from-yellow-400 to-amber-500',
        unlocked: stories.length >= 50,
        progress: progressPercent(stories.length, 50),
        date: buildDateText(stories.length >= 50, getNthDate(stories, 50), `${stories.length}/50 stories`),
    },
    {
      id: 8,
      title: 'Lightning Writer',
      description: 'Write 3 entries in one day',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-blue-400 to-cyan-500',
        unlocked: maxEntriesInOneDay >= 3,
        progress: progressPercent(maxEntriesInOneDay, 3),
        date: buildDateText(maxEntriesInOneDay >= 3, getEntriesInOneDayUnlockDate(journals, 3), `${maxEntriesInOneDay}/3 entries`),
    },
    {
      id: 9,
      title: 'Legendary Journaler',
      description: 'Journal for 365 days straight',
      icon: <Award className="w-8 h-8" />,
      color: 'from-amber-400 to-orange-500',
        unlocked: longestStreak >= 365,
        progress: progressPercent(longestStreak, 365),
        date: buildDateText(longestStreak >= 365, getStreakUnlockDate(journalDays, 365), `${longestStreak}/365 days`),
      },
      {
        id: 10,
        title: 'Word Wizard',
        description: 'Write 1,000 words across your journal',
        icon: <Award className="w-8 h-8" />,
        color: 'from-emerald-400 to-teal-500',
        unlocked: totalWords >= 1000,
        progress: progressPercent(totalWords, 1000),
        date: totalWords >= 1000 ? 'Unlocked from journal writing' : `${totalWords}/1000 words`,
      },
    ];
  }, [journals, moodAnalyses, stories]);

  const currentStreak = useMemo(() => getCurrentStreak(getUniqueJournalDays(journals)), [journals]);
  const stats = {
    totalAchievements: achievements.length,
    unlocked: achievements.filter(a => a.unlocked).length,
    points: achievements.filter(a => a.unlocked).length * 50,
  };

  const overallProgress = stats.totalAchievements
    ? Math.round((stats.unlocked / stats.totalAchievements) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[var(--child-bg)] flex">
      {/* Mobile Menu Button */}
      {onNavigate && onLogout && (
        <MobileMenuButton onClick={() => setIsSidebarOpen(true)} />
      )}

      {/* Sidebar */}
      {onNavigate && onLogout && (
        <ChildSidebar 
          childName={childName}
          activeItem="achievements"
          onNavigate={handleSidebarNavigation}
          onLogout={() => setShowLogoutConfirm(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogoClick={onBack}
        />
      )}

      <main className="flex-1 overflow-auto">
        <div className="px-4 pb-4 pt-20 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            {!onNavigate && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-[#2d3748] hover:text-[#1a365d] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm sm:text-base">Back to Home</span>
              </button>
            )}
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[#f59e0b] flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-[#744210]" />
              </div>
            </div>
            <h1 className="text-[#2d3748] text-xl sm:text-2xl lg:text-3xl">My Achievements 🏆</h1>
            <p className="text-[#64748b] text-sm sm:text-base">Look at all the amazing things you've done!</p>
          </div>

          {isLoading && (
            <LoadingState message="Loading your achievements..." variant="child" />
          )}

          {error && (
            <Card variant="child" className={error ? 'border-2 border-red-200 bg-red-50' : ''}>
              <p className="text-center text-sm text-red-700">{error}</p>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card variant="child" padding="medium">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[#f59e0b] flex items-center justify-center">
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-[#744210]" />
                </div>
                <h3 className="text-[#2d3748] text-xl sm:text-2xl">{stats.unlocked}/{stats.totalAchievements}</h3>
                <p className="text-xs sm:text-sm text-[#64748b]">Achievements Unlocked</p>
              </div>
            </Card>

            <Card variant="child" padding="medium">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-gradient-to-br from-[var(--child-blue)] to-[#3b82f6] flex items-center justify-center">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 text-[#1a365d]" fill="currentColor" />
                </div>
                <h3 className="text-[#2d3748] text-xl sm:text-2xl">{stats.points}</h3>
                <p className="text-xs sm:text-sm text-[#64748b]">Total Points</p>
              </div>
            </Card>

            <Card variant="child" padding="medium">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-gradient-to-br from-[var(--child-mint)] to-[#10b981] flex items-center justify-center">
                  <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-[#065f46]" />
                </div>
                <h3 className="text-[#2d3748] text-xl sm:text-2xl">{currentStreak} Days</h3>
                <p className="text-xs sm:text-sm text-[#64748b]">Current Streak</p>
              </div>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card variant="child">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[#2d3748] text-base sm:text-lg">Overall Progress</h4>
                <Badge variant="child-yellow">{overallProgress}%</Badge>
              </div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--child-yellow)] to-[#f59e0b] transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="text-xs sm:text-sm text-[#64748b]">Keep journaling to unlock more achievements!</p>
            </div>
          </Card>

          {/* Achievements Grid */}
          <div className="space-y-4">
            <h3 className="text-[#2d3748] text-lg sm:text-xl">All Achievements</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {achievements.map(achievement => (
                <Card 
                  key={achievement.id} 
                  variant="child" 
                  className={`transition-all ${achievement.unlocked ? 'hover:shadow-xl' : 'opacity-60'}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center shadow-md ${achievement.unlocked ? '' : 'grayscale'}`}>
                        <div className="text-white">
                          {achievement.icon}
                        </div>
                      </div>
                      {achievement.unlocked && (
                        <Badge variant="child-mint">Unlocked ✓</Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[#2d3748] text-base sm:text-lg">{achievement.title}</h4>
                      <p className="text-xs sm:text-sm text-[#64748b]">{achievement.description}</p>
                    </div>

                    {!achievement.unlocked && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-[#64748b]">Progress</span>
                          <span className="text-[#2d3748]">{achievement.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${achievement.color} transition-all duration-500`}
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-[#94a3b8]">{achievement.date}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Motivational Card */}
          <Card variant="child" className="bg-gradient-to-br from-[var(--child-blue)]/20 to-[var(--child-mint)]/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[#f59e0b] flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-2xl sm:text-3xl">🌟</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[#2d3748] mb-2 text-base sm:text-lg">Keep Going! 💪</h3>
                <p className="text-[#4a5568] text-sm sm:text-base">
                  You're doing amazing! Every journal entry helps you grow. Keep writing, keep exploring, and watch your achievements grow!
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Logout Confirmation */}
      {onLogout && (
        <LogoutConfirmation 
          isOpen={showLogoutConfirm}
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
          variant="child"
        />
      )}
    </div>
  );
}
