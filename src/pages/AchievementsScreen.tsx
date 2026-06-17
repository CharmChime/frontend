import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ChildSidebar } from '../components/ChildSidebar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { ChildPageLoader } from '../components/PageLoaders';
import { ArrowLeft, Trophy, Star, Heart, Flame, BookOpen, Sparkles, Target, Award, Zap } from 'lucide-react';
import { api, type AchievementItem, type AchievementProgress } from '../services/api';

interface AchievementsScreenProps {
  onBack: () => void;
  childName?: string;
  childAvatar?: string;
  childId?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  progress: number;
  date: string;
};

const achievementPresentation: Record<string, { icon: React.ReactNode; color: string }> = {
  'first-steps': {
    icon: <Star className="w-8 h-8" fill="currentColor" />,
    color: 'from-[var(--child-yellow)] to-[#f59e0b]',
  },
  'week-warrior': {
    icon: <Flame className="w-8 h-8" />,
    color: 'from-[var(--child-peach)] to-[#f97316]',
  },
  'story-master': {
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-[var(--child-lavender)] to-[#a855f7]',
  },
  'emotion-explorer': {
    icon: <Heart className="w-8 h-8" fill="currentColor" />,
    color: 'from-[var(--child-mint)] to-[#10b981]',
  },
  'century-club': {
    icon: <Trophy className="w-8 h-8" />,
    color: 'from-[var(--child-blue)] to-[#3b82f6]',
  },
  'month-master': {
    icon: <Target className="w-8 h-8" />,
    color: 'from-purple-400 to-purple-600',
  },
  'creative-genius': {
    icon: <Sparkles className="w-8 h-8" fill="currentColor" />,
    color: 'from-yellow-400 to-amber-500',
  },
  'lightning-writer': {
    icon: <Zap className="w-8 h-8" />,
    color: 'from-blue-400 to-cyan-500',
  },
  'legendary-journaler': {
    icon: <Award className="w-8 h-8" />,
    color: 'from-amber-400 to-orange-500',
  },
  'word-wizard': {
    icon: <Award className="w-8 h-8" />,
    color: 'from-emerald-400 to-teal-500',
  },
};

const mapBackendAchievement = (achievement: AchievementItem): Achievement => {
  const presentation = achievementPresentation[achievement.id] || {
    icon: <Award className="w-8 h-8" />,
    color: 'from-[var(--child-blue)] to-[#3b82f6]',
  };

  return {
    id: achievement.id,
    title: achievement.title,
    description: achievement.description,
    icon: presentation.icon,
    color: presentation.color,
    unlocked: achievement.unlocked,
    progress: achievement.progress,
    date: achievement.unlocked
      ? `Unlocked ${formatDate(achievement.unlockedAt || '') || 'recently'}`
      : `${achievement.currentValue}/${achievement.target}`,
  };
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

export function AchievementsScreen({ onBack, childName = 'Friend', childAvatar, childId, onNavigate, onLogout }: AchievementsScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [achievementData, setAchievementData] = useState<AchievementItem[]>([]);
  const [progress, setProgress] = useState<AchievementProgress | null>(null);
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

    api.achievements
      .me()
      .then((data) => {
        if (!isMounted) return;
        setAchievementData(data.achievements || []);
        setProgress(data.progress);
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

  const achievements = useMemo<Achievement[]>(() => achievementData.map(mapBackendAchievement), [achievementData]);
  const currentStreak = progress?.currentJournalingStreak || 0;
  const stats = {
    totalAchievements: achievements.length,
    unlocked: progress?.unlockedAchievementIds?.length || achievements.filter(a => a.unlocked).length,
    points: progress?.totalPoints || 0,
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
          childAvatar={childAvatar}
          childId={childId}
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

          {isLoading && !error ? (
            <ChildPageLoader
              childName={childName}
              childAvatar={childAvatar}
              message="Counting your badges, points, and new wins."
            />
          ) : error && (
            <Card variant="child" className={error ? 'border-2 border-red-200 bg-red-50' : ''}>
              <p className={`text-center text-sm ${error ? 'text-red-700' : 'text-[#64748b]'}`}>
                {error}
              </p>
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
