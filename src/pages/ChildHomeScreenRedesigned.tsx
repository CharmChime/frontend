import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { Sparkles, PenLine, BookOpen, Settings, LogOut, Calendar, Trophy, Home, Wand2, Smile, Star, Heart } from 'lucide-react';
import logo from '../assets/35160e99e546074153c34366a831aa0e30d421e6.png';

interface ChildHomeScreenRedesignedProps {
  childName: string;
  onNewEntry: () => void;
  onViewMemories: () => void;
  onStoryMode: () => void;
  onCalendar?: () => void;
  onAchievements?: () => void;
  onSettings?: () => void;
  onLogout: () => void;
}

export function ChildHomeScreenRedesigned({ 
  childName, 
  onNewEntry, 
  onViewMemories, 
  onStoryMode,
  onCalendar,
  onAchievements,
  onSettings,
  onLogout
}: ChildHomeScreenRedesignedProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
      case 'settings':
        onSettings?.();
        break;
    }
  };

  const recentEntries = [
    { id: 1, title: "My Amazing Day at the Park", mood: "happy", date: "Today" },
    { id: 2, title: "Learning About Space", mood: "excited", date: "Yesterday" },
    { id: 3, title: "Rainy Day Thoughts", mood: "calm", date: "2 days ago" }
  ];

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
      default: return 'child-blue';
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
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col">
        {/* Logo/Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={logo} 
              alt="CharmChime Logo" 
              className="w-12 h-12 object-contain"
            />
            <div className="flex-1">
              <h3 className="text-[#2d3748]">CharmChime</h3>
            </div>
          </div>
          
          {/* User Info */}
          <div className="bg-gradient-to-br from-[var(--child-blue)]/10 to-[var(--child-mint)]/10 rounded-2xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[var(--child-peach)] flex items-center justify-center">
                <span className="text-xl">🌟</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#2d3748] truncate">{childName}</p>
                <p className="text-xs text-[#64748b]">7-day streak 🔥</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={item.onClick || (() => setActiveTab(item.id))}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${activeTab === item.id || item.active
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

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={onSettings}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#64748b] hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#64748b] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[#2d3748]">Hello, {childName}! 👋</h1>
                <p className="text-[#64748b] mt-1">Ready to share your story today?</p>
              </div>
              <Button 
                variant="child-blue" 
                icon={<PenLine className="w-5 h-5" />}
                onClick={onNewEntry}
              >
                New Entry
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Avatar Greeting Card */}
          <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-lavender)]/20">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[var(--child-peach)] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex-shrink-0">
                <span className="text-4xl">🌟</span>
              </div>
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
            <Card variant="child" className="cursor-pointer hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all" onClick={onNewEntry}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[var(--child-blue)] flex items-center justify-center shadow-md">
                  <PenLine className="w-8 h-8 text-[#1a365d]" />
                </div>
                <div>
                  <h4 className="text-[#2d3748] mb-2">Write in Journal</h4>
                  <p className="text-[#64748b] text-sm">Share your thoughts and feelings</p>
                </div>
              </div>
            </Card>

            <Card variant="child" className="cursor-pointer hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all" onClick={onStoryMode}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[var(--child-mint)] flex items-center justify-center shadow-md">
                  <Sparkles className="w-8 h-8 text-[#065f46]" fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-[#2d3748] mb-2">Create a Story</h4>
                  <p className="text-[#64748b] text-sm">Let AI help you write magic</p>
                </div>
              </div>
            </Card>

            <Card variant="child" className="cursor-pointer hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all" onClick={onViewMemories}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[var(--child-yellow)] flex items-center justify-center shadow-md">
                  <BookOpen className="w-8 h-8 text-[#744210]" />
                </div>
                <div>
                  <h4 className="text-[#2d3748] mb-2">Read Memories</h4>
                  <p className="text-[#64748b] text-sm">Look back at past entries</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Entries - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-[#2d3748]">Recent Memories ✨</h3>
              <div className="space-y-3">
                {recentEntries.map(entry => (
                  <Card key={entry.id} variant="child" className="cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Badge variant={getMoodColor(entry.mood) as any} icon={getMoodIcon(entry.mood)}>
                          {entry.mood}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[#2d3748] truncate">{entry.title}</h4>
                          <p className="text-sm text-[#64748b]">{entry.date}</p>
                        </div>
                      </div>
                      <Button variant="child-blue" size="small">
                        Read
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Mood Tracker - Takes 1 column */}
            <div className="space-y-4">
              <h3 className="text-[#2d3748]">How I've Been Feeling 💭</h3>
              <Card variant="child">
                <div className="space-y-3">
                  <div className="text-center p-4 rounded-2xl bg-[var(--child-yellow)]/30">
                    <div className="text-4xl mb-2">😊</div>
                    <p className="text-[#744210]">5 happy days</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-[var(--child-mint)]/30">
                    <div className="text-4xl mb-2">😌</div>
                    <p className="text-[#065f46]">3 calm days</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-[var(--child-peach)]/30">
                    <div className="text-4xl mb-2">🤩</div>
                    <p className="text-[#7c2d12]">2 excited days</p>
                  </div>
                </div>
              </Card>

              {/* Achievements Preview */}
              <Card variant="child">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[var(--child-yellow)]" />
                    <h4 className="text-[#2d3748]">Achievements</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-2xl">🏆</span>
                      <span className="text-[#64748b]">7-Day Streak</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-2xl">⭐</span>
                      <span className="text-[#64748b]">First Story</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-2xl">💖</span>
                      <span className="text-[#64748b]">Mood Master</span>
                    </div>
                  </div>
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