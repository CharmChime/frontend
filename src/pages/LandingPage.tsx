import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Sparkles, Shield, Heart, BookOpen, TrendingUp, Users } from 'lucide-react';
import logo from '../assets/35160e99e546074153c34366a831aa0e30d421e6.png';

interface LandingPageProps {
  onSelectChild: () => void;
  onSelectParent: () => void;
}

export function LandingPage({ onSelectChild, onSelectParent }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--child-blue)] via-white to-[var(--parent-teal)]/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="CharmChime Logo" 
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-[#2d3748]">CharmChime</h1>
              <p className="text-sm text-[#64748b]">Chimes of Imagination, Stories of Wonder</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="flex justify-center">
            <img 
              src={logo} 
              alt="CharmChime Logo" 
              className="w-24 h-24 object-contain animate-bounce" 
              style={{ animationDuration: '3s' }}
            />
          </div>
          <h1 className="text-5xl text-[#2d3748]">
            AI-Powered Journaling for Children
          </h1>
          <p className="text-xl text-[#4a5568] max-w-3xl mx-auto">
            A safe, child-friendly platform that combines journaling with AI to help children express themselves, 
            while giving parents insights into their emotional well-being.
          </p>
        </div>

        {/* User Type Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Child Card */}
          <Card variant="child" className="hover:scale-105 transition-all">
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--child-blue)] to-[var(--child-mint)] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                <Sparkles className="w-10 h-10 text-[#1a365d]" fill="currentColor" />
              </div>
              <div className="space-y-3">
                <h2 className="text-[#2d3748]">I'm a Child</h2>
                <p className="text-[#4a5568]">
                  Start your magical journaling journey! Write stories, share your feelings, and create amazing adventures.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-[#64748b]">
                  <Heart className="w-4 h-4" fill="currentColor" />
                  <span className="text-sm">Express your emotions</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[#64748b]">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Create AI-powered stories</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[#64748b]">
                  <Sparkles className="w-4 h-4" fill="currentColor" />
                  <span className="text-sm">Chat with your AI companion</span>
                </div>
              </div>
              <Button variant="child-blue" size="large" className="w-full" onClick={onSelectChild}>
                Enter as Child 🌟
              </Button>
            </div>
          </Card>

          {/* Parent Card */}
          <Card variant="parent" className="hover:scale-105 transition-all">
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-[var(--parent-teal)] flex items-center justify-center shadow-[0_8px_24px_rgba(45,156,175,0.3)]">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-[#2d3748]">I'm a Parent/Guardian</h2>
                <p className="text-[#475569]">
                  Monitor your child's emotional well-being with privacy-first insights and comprehensive analytics.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-[#64748b]">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Mood & activity analytics</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[#64748b]">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Privacy-protected insights</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[#64748b]">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Support your child's growth</span>
                </div>
              </div>
              <Button variant="parent-teal" size="large" className="w-full" onClick={onSelectParent}>
                Enter as Parent
              </Button>
            </div>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card variant="child" padding="medium">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--child-yellow)] flex items-center justify-center">
                <span className="text-2xl">🎤</span>
              </div>
              <h4 className="text-[#2d3748]">Voice & Text</h4>
              <p className="text-sm text-[#64748b]">
                Journal by typing or speaking - whatever feels natural
              </p>
            </div>
          </Card>

          <Card variant="child" padding="medium">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--child-mint)] flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="text-[#2d3748]">AI Companion</h4>
              <p className="text-sm text-[#64748b]">
                A friendly avatar that understands and responds with empathy
              </p>
            </div>
          </Card>

          <Card variant="child" padding="medium">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--child-peach)] flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="text-[#2d3748]">Safe & Private</h4>
              <p className="text-sm text-[#64748b]">
                Your thoughts are protected with industry-leading security
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-[#64748b]">
            <p>© 2025 CharmChime. Designed for children aged 6-16 and their families.</p>
            <p className="mt-2">Safe • Private • Empowering</p>
          </div>
        </div>
      </footer>
    </div>
  );
}