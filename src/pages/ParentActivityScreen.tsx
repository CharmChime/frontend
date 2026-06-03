import React, { useState } from 'react';
import { ParentSidebar } from '../components/ParentSidebar';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Activity, Clock, PenLine, BookOpen, Sparkles, Filter, Search } from 'lucide-react';
import { LogoutConfirmation } from '../components/LogoutConfirmation';

interface ParentActivityScreenProps {
  childName: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function ParentActivityScreen({ childName, onNavigate, onLogout }: ParentActivityScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'journal' | 'story' | 'achievement'>('all');

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const activities = [
    {
      type: 'journal',
      title: 'New Journal Entry: "My Amazing Day at School"',
      mood: 'happy',
      time: '2 hours ago',
      duration: '12 min',
      wordCount: 245,
      details: 'Completed entry with mood tracking and voice-to-text'
    },
    {
      type: 'achievement',
      title: 'Achievement Unlocked: "Week Warrior"',
      time: '2 hours ago',
      details: 'Earned for maintaining a 7-day writing streak'
    },
    {
      type: 'story',
      title: 'Created Story: "The Space Adventure"',
      time: '5 hours ago',
      duration: '18 min',
      wordCount: 380,
      details: 'Collaborated with AI to create a space-themed story'
    },
    {
      type: 'journal',
      title: 'New Journal Entry: "Learning About Planets"',
      mood: 'excited',
      time: 'Yesterday, 4:30 PM',
      duration: '8 min',
      wordCount: 156,
      details: 'Completed entry with mood tracking'
    },
    {
      type: 'achievement',
      title: 'Achievement Unlocked: "Word Wizard"',
      time: 'Yesterday, 4:35 PM',
      details: 'Earned for writing over 1000 words total'
    },
    {
      type: 'journal',
      title: 'New Journal Entry: "Fun with Friends"',
      mood: 'happy',
      time: 'Yesterday, 11:20 AM',
      duration: '10 min',
      wordCount: 198,
      details: 'Completed entry with mood tracking'
    },
    {
      type: 'story',
      title: 'Created Story: "The Magical Garden"',
      time: '2 days ago, 3:15 PM',
      duration: '15 min',
      wordCount: 312,
      details: 'Collaborated with AI to create a fantasy story'
    },
    {
      type: 'journal',
      title: 'New Journal Entry: "Rainy Day Thoughts"',
      mood: 'calm',
      time: '2 days ago, 10:45 AM',
      duration: '9 min',
      wordCount: 167,
      details: 'Completed entry with mood tracking'
    },
  ];

  const filteredActivities = filterType === 'all' 
    ? activities 
    : activities.filter(a => a.type === filterType);

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'journal': return <PenLine className="w-5 h-5" />;
      case 'story': return <Sparkles className="w-5 h-5" />;
      case 'achievement': return <span className="text-xl">🏆</span>;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch(type) {
      case 'journal': return 'bg-blue-100 text-blue-600';
      case 'story': return 'bg-purple-100 text-purple-600';
      case 'achievement': return 'bg-yellow-100 text-yellow-600';
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
        activeItem="activity"
        onNavigate={onNavigate}
        onLogout={() => setShowLogoutConfirm(true)}
        onLogoClick={onLogout}
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
                <Badge variant="parent-teal">
                  <Activity className="w-4 h-4 mr-1" />
                  {filteredActivities.length} Activities
                </Badge>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Filter className="w-5 h-5 text-[#64748b]" />
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                    filterType === 'all'
                      ? 'bg-[var(--parent-teal)] text-white'
                      : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('journal')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                    filterType === 'journal'
                      ? 'bg-[var(--parent-teal)] text-white'
                      : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                  }`}
                >
                  Journal
                </button>
                <button
                  onClick={() => setFilterType('story')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                    filterType === 'story'
                      ? 'bg-[var(--parent-teal)] text-white'
                      : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                  }`}
                >
                  Stories
                </button>
                <button
                  onClick={() => setFilterType('achievement')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                    filterType === 'achievement'
                      ? 'bg-[var(--parent-teal)] text-white'
                      : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                  }`}
                >
                  Achievements
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl mb-1">24</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Journal Entries</p>
              </div>
            </Card>
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl mb-1">8</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Stories Created</p>
              </div>
            </Card>
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl mb-1">12</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Achievements</p>
              </div>
            </Card>
            <Card variant="parent" padding="medium">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl mb-1">45m</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Avg Session</p>
              </div>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card variant="parent">
            <h3 className="text-[#2d3748] mb-4 text-lg sm:text-xl">Recent Activity</h3>
            <div className="space-y-3">
              {filteredActivities.map((activity, index) => (
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
              ))}
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