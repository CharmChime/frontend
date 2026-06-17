import React, { useEffect, useMemo, useState } from 'react';
import { Flame, PenLine, BookOpen, Calendar, Trophy, Home, Wand2, X } from 'lucide-react';
import logo from '../assets/logo.png';
import { TopAppActions } from './TopAppActions';
import { api, type Journal } from '../services/api';

interface ChildSidebarProps {
  childName: string;
  childAvatar?: string;
  childId?: string;
  activeItem?: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onLogoClick?: () => void;
  streakDays?: number;
  weeklyStreakDays?: boolean[];
}

export function ChildSidebar({
  childName,
  childAvatar,
  childId,
  activeItem = 'home',
  onNavigate,
  onLogout,
  isOpen = true,
  onClose,
  onLogoClick,
  streakDays,
  weeklyStreakDays = [],
}: ChildSidebarProps) {
  const [sidebarJournals, setSidebarJournals] = useState<Journal[]>([]);
  const weekLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'entry', label: 'New Entry', icon: <PenLine className="w-5 h-5" /> },
    { id: 'story-mode', label: 'Story Time', icon: <Wand2 className="w-5 h-5" /> },
    { id: 'memories', label: 'My Memories', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-5 h-5" /> },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  useEffect(() => {
    if (!childId || weeklyStreakDays.length || typeof streakDays === 'number') return;

    let isMounted = true;

    api.journals
      .list({ childId })
      .then(({ journals }) => {
        if (isMounted) setSidebarJournals(journals || []);
      })
      .catch(() => {
        if (isMounted) setSidebarJournals([]);
      });

    return () => {
      isMounted = false;
    };
  }, [childId, streakDays, weeklyStreakDays.length]);

  const sidebarJournalDayKeys = useMemo(() => {
    return Array.from(
      new Set(
        sidebarJournals
          .map((journal) => {
            const date = new Date(journal.createdAt);
            return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
          })
          .filter(Boolean)
      )
    ).sort();
  }, [sidebarJournals]);

  const computedWeeklyStreakDays = useMemo(() => {
    if (weeklyStreakDays.length) return weeklyStreakDays;

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const journalDays = new Set(sidebarJournalDayKeys);

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + index);
      return journalDays.has(day.toISOString().slice(0, 10));
    });
  }, [sidebarJournalDayKeys, weeklyStreakDays]);

  const computedStreakDays = useMemo(() => {
    if (typeof streakDays === 'number') return streakDays;
    if (!sidebarJournalDayKeys.length) return 0;

    let streak = 1;

    for (let index = sidebarJournalDayKeys.length - 1; index > 0; index -= 1) {
      const currentDay = new Date(sidebarJournalDayKeys[index]);
      const previousDay = new Date(sidebarJournalDayKeys[index - 1]);
      const diffDays = Math.round((currentDay.getTime() - previousDay.getTime()) / 86400000);

      if (diffDays !== 1) break;
      streak += 1;
    }

    return streak;
  }, [sidebarJournalDayKeys, streakDays]);

  const activeWeekDays = computedWeeklyStreakDays.filter(Boolean).length;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50
        w-72 h-screen bg-white border-r border-gray-200 shadow-lg flex flex-col flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <TopAppActions
          variant="child"
          onNavigate={handleNavigate}
          onLogout={onLogout}
          profileName={childName}
          profileAvatar={childAvatar}
        />

        {/* Close Button for Mobile */}
        {onClose && (
          <button
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors z-10"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Logo/Brand Section */}
        <div className="border-b border-gray-200 px-6 py-7 text-center">
          <button
            onClick={onLogoClick}
            className="mx-auto block hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--child-blue)] rounded-2xl"
            aria-label="Go to home page"
          >
            <img
              src={logo}
              alt="CharmChime Logo"
              className="mx-auto h-24 w-24 object-contain"
            />
          </button>
          <div className="mt-3">
            <h3 className="text-2xl font-semibold leading-tight tracking-normal text-[#2d3748]">
              <span className="block">Charm Chime</span>
            </h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-[#94a3b8]">
              Child Space
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${activeItem === item.id
                  ? 'bg-[var(--child-blue)] text-[#1a365d] shadow-md'
                  : 'text-[#64748b] hover:bg-gray-50'
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="rounded-2xl bg-gradient-to-br from-[#fff3c4] via-white to-[var(--child-mint)]/25 p-4 shadow-sm ring-1 ring-[#f59e0b]/10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-white text-[#b45309] shadow-sm">
                <Flame className="h-5 w-5 fill-current" />
                <span className="text-[10px] font-bold leading-none">{computedStreakDays}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#64748b]">
                  Weekly Streak
                </p>
                <p className="truncate text-sm font-semibold text-[#2d3748]">
                  {activeWeekDays ? `${activeWeekDays}/7 days journaled` : 'Start this week'}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {weekLabels.map((label, index) => {
                const isActive = Boolean(computedWeeklyStreakDays[index]);

                return (
                  <div key={`${label}-${index}`} className="space-y-1 text-center">
                    <div
                      className={`
                        mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors
                        ${isActive
                          ? 'bg-[#f59e0b] text-white shadow-sm'
                          : 'bg-white text-[#94a3b8] ring-1 ring-gray-200'
                        }
                      `}
                    >
                      {isActive ? <Flame className="h-3.5 w-3.5 fill-current" /> : label}
                    </div>
                    <p className="text-[10px] font-medium text-[#94a3b8]">{label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
