import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';
import { Sparkles, PenLine, BookOpen, Settings, Smile, Frown, Meh, Heart, Star } from 'lucide-react';

interface ChildHomeScreenProps {
  childName: string;
  onNewEntry: () => void;
  onViewMemories: () => void;
  onStoryMode: () => void;
}

export function ChildHomeScreen({ 
  childName, 
  onNewEntry, 
  onViewMemories, 
  onStoryMode 
}: ChildHomeScreenProps) {
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
      default: return <Meh className="w-4 h-4" fill="currentColor" />;
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

  return (
    <div className="min-h-screen bg-[var(--child-bg)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--child-blue)] to-[var(--child-mint)] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
              <Sparkles className="w-7 h-7 text-[var(--child-blue)]" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-[#1a365d]">Hello, {childName}! 👋</h2>
              <p className="text-[#1a365d]/70">Ready to share your story today?</p>
            </div>
          </div>
          <IconButton variant="child-yellow" size="medium">
            <Settings className="w-5 h-5" />
          </IconButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="child" className="cursor-pointer hover:scale-105 transition-transform" onClick={onNewEntry}>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--child-blue)] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                <PenLine className="w-8 h-8 text-[#1a365d]" />
              </div>
              <h4 className="text-[#2d3748]">New Journal Entry</h4>
              <p className="text-[#64748b] text-sm">Write or speak about your day</p>
            </div>
          </Card>

          <Card variant="child" className="cursor-pointer hover:scale-105 transition-transform" onClick={onStoryMode}>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--child-mint)] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                <Sparkles className="w-8 h-8 text-[#065f46]" fill="currentColor" />
              </div>
              <h4 className="text-[#2d3748]">Story Time</h4>
              <p className="text-[#64748b] text-sm">Create magical stories with AI</p>
            </div>
          </Card>

          <Card variant="child" className="cursor-pointer hover:scale-105 transition-transform" onClick={onViewMemories}>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--child-yellow)] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                <BookOpen className="w-8 h-8 text-[#744210]" />
              </div>
              <h4 className="text-[#2d3748]">My Memories</h4>
              <p className="text-[#64748b] text-sm">Read your past entries</p>
            </div>
          </Card>
        </div>

        {/* Recent Entries */}
        <div className="space-y-4">
          <h3 className="text-[#2d3748]">Recent Memories ✨</h3>
          <div className="space-y-3">
            {recentEntries.map(entry => (
              <Card key={entry.id} variant="child" className="cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant={getMoodColor(entry.mood) as any} icon={getMoodIcon(entry.mood)}>
                      {entry.mood}
                    </Badge>
                    <div>
                      <h4 className="text-[#2d3748]">{entry.title}</h4>
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

        {/* Mood Tracker Quick View */}
        <Card variant="child">
          <div className="space-y-4">
            <h3 className="text-[#2d3748]">How I've Been Feeling 💭</h3>
            <div className="flex gap-3">
              <div className="flex-1 text-center p-4 rounded-[1.5rem] bg-[var(--child-yellow)]/30">
                <div className="text-3xl mb-2">😊</div>
                <p className="text-sm text-[#744210]">5 happy days</p>
              </div>
              <div className="flex-1 text-center p-4 rounded-[1.5rem] bg-[var(--child-mint)]/30">
                <div className="text-3xl mb-2">😌</div>
                <p className="text-sm text-[#065f46]">3 calm days</p>
              </div>
              <div className="flex-1 text-center p-4 rounded-[1.5rem] bg-[var(--child-peach)]/30">
                <div className="text-3xl mb-2">🤩</div>
                <p className="text-sm text-[#7c2d12]">2 excited days</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
