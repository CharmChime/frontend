import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ChildSidebar } from '../components/ChildSidebar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { ArrowLeft, ChevronLeft, ChevronRight, Smile, Heart, Star, Calendar as CalendarIcon } from 'lucide-react';
import { api, type Journal } from '../services/api';

interface CalendarScreenProps {
  onBack: () => void;
  childName?: string;
  childAvatar?: string;
  childId?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function CalendarScreen({ onBack, childName = 'Friend', childAvatar, childId, onNavigate, onLogout }: CalendarScreenProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [journals, setJournals] = useState<Journal[]>([]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const handleSidebarNavigation = (page: string) => {
    if (page === 'calendar') return; // Already here
    if (page === 'home') {
      onBack();
    } else {
      onNavigate?.(page);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  useEffect(() => {
    if (!childId) {
      setJournals([]);
      return;
    }

    api.journals
      .list({ childId })
      .then((data) => setJournals(data.journals))
      .catch(() => setJournals([]));
  }, [childId]);

  const journalEntries = useMemo(() => {
    return journals.reduce<{ [key: number]: { mood: string; title: string } }>((entries, journal) => {
      const date = new Date(journal.createdAt);
      if (
        date.getMonth() === currentMonth.getMonth() &&
        date.getFullYear() === currentMonth.getFullYear()
      ) {
        entries[date.getDate()] = {
          mood: journal.moodStatus && journal.moodStatus !== 'pending' ? journal.moodStatus : 'thoughtful',
          title: journal.title,
        };
      }
      return entries;
    }, {});
  }, [journals, currentMonth]);

  const entriesThisMonth = Object.keys(journalEntries).length;
  const totalEntries = journals.length;
  const activeDays = new Set(journals.map((journal) => new Date(journal.createdAt).toDateString())).size;

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'calm': return '😌';
      case 'excited': return '🤩';
      case 'creative': return '🎨';
      default: return '✨';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return 'bg-[var(--child-yellow)]';
      case 'calm': return 'bg-[var(--child-mint)]';
      case 'excited': return 'bg-[var(--child-peach)]';
      case 'creative': return 'bg-[var(--child-lavender)]';
      default: return 'bg-[var(--child-blue)]';
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square" />
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasEntry = journalEntries[day];
      const isToday = 
        day === new Date().getDate() &&
        currentMonth.getMonth() === new Date().getMonth() &&
        currentMonth.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`
            aspect-square p-2 rounded-2xl transition-all cursor-pointer
            ${hasEntry ? getMoodColor(hasEntry.mood) + '/30 hover:' + getMoodColor(hasEntry.mood) + '/50' : 'hover:bg-gray-50'}
            ${isToday ? 'ring-2 ring-[var(--child-blue)] ring-offset-2' : ''}
          `}
        >
          <div className="h-full flex flex-col">
            <div className={`text-sm ${isToday ? 'font-bold text-[#1a365d]' : 'text-[#64748b]'}`}>
              {day}
            </div>
            {hasEntry && (
              <div className="flex-1 flex items-center justify-center">
                <span className="text-2xl">{getMoodEmoji(hasEntry.mood)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

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
          activeItem="calendar"
          onNavigate={onNavigate}
          onLogout={() => setShowLogoutConfirm(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogoClick={onBack}
        />
      )}

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-[var(--child-blue)] to-[var(--child-mint)] shadow-lg sticky top-0 z-10">
          <div className="pl-20 pr-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!onNavigate && (
                  <button
                    onClick={onBack}
                    className="p-2 sm:p-3 rounded-full bg-[var(--child-yellow)] hover:bg-[var(--child-yellow)]/80 transition-colors shadow-md"
                  >
                    <ArrowLeft className="w-5 h-5 text-[#744210]" />
                  </button>
                )}
                <div>
                  <h1 className="text-[#1a365d] text-xl sm:text-2xl lg:text-3xl">My Journal Calendar 📅</h1>
                  <p className="text-[#2d5f7e] text-sm sm:text-base mt-1">See all your journaling adventures!</p>
                </div>
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--child-blue)]" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
          {/* Calendar Card */}
          <Card variant="child">
            <div className="space-y-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <Button variant="child-blue" size="small" onClick={previousMonth} icon={<ChevronLeft className="w-4 h-4" />}>
                  Previous
                </Button>
                <h2 className="text-[#2d3748] text-lg sm:text-xl">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <Button variant="child-blue" size="small" onClick={nextMonth} icon={<ChevronRight className="w-4 h-4" />}>
                  Next
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs sm:text-sm text-[#64748b] py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {renderCalendarDays()}
              </div>

              {/* Legend */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-[#2d3748] mb-3 text-base sm:text-lg">Mood Legend</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--child-yellow)]/30 flex items-center justify-center">
                      <span className="text-lg">😊</span>
                    </div>
                    <span className="text-sm text-[#64748b]">Happy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--child-mint)]/30 flex items-center justify-center">
                      <span className="text-lg">😌</span>
                    </div>
                    <span className="text-sm text-[#64748b]">Calm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--child-peach)]/30 flex items-center justify-center">
                      <span className="text-lg">🤩</span>
                    </div>
                    <span className="text-sm text-[#64748b]">Excited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--child-lavender)]/30 flex items-center justify-center">
                      <span className="text-lg">🎨</span>
                    </div>
                    <span className="text-sm text-[#64748b]">Creative</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card variant="child" padding="medium">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--child-blue)] flex items-center justify-center">
                  <Star className="w-6 h-6 text-[#1a365d]" fill="currentColor" />
                </div>
                <h3 className="text-[#2d3748] text-xl sm:text-2xl">{entriesThisMonth}</h3>
                <p className="text-xs sm:text-sm text-[#64748b]">Entries This Month</p>
              </div>
            </Card>

            <Card variant="child" padding="medium">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--child-yellow)] flex items-center justify-center">
                  <Smile className="w-6 h-6 text-[#744210]" fill="currentColor" />
                </div>
                <h3 className="text-[#2d3748] text-xl sm:text-2xl">{activeDays}</h3>
                <p className="text-xs sm:text-sm text-[#64748b]">Active Days</p>
              </div>
            </Card>

            <Card variant="child" padding="medium">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--child-mint)] flex items-center justify-center">
                  <Heart className="w-6 h-6 text-[#065f46]" fill="currentColor" />
                </div>
                <h3 className="text-[#2d3748] text-xl sm:text-2xl">{totalEntries}</h3>
                <p className="text-xs sm:text-sm text-[#64748b]">Total Entries</p>
              </div>
            </Card>
          </div>
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
