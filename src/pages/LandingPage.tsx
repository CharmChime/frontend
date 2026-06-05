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
    <div className="min-h-screen bg-gradient-to-br from-[var(--child-blue)] via-white to-[var(--parent-teal)]/20 flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="CharmChime Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-lg sm:text-xl text-[#2d3748]">CharmChime</h1>
              <p className="text-xs sm:text-sm text-[#64748b]">Chimes of Imagination, Stories of Wonder</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center">
        <div className="text-center space-y-3 mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl text-[#2d3748]">Choose Your Role</h1>
          <p className="text-base sm:text-lg text-[#4a5568] max-w-2xl mx-auto">
            Pick how you want to enter CharmChime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto w-full">
          <Card variant="child" className="hover:scale-105 transition-all">
            <div className="text-center space-y-4 py-3 sm:py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[var(--child-blue)] to-[var(--child-mint)] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                <Sparkles className="w-7 h-7 text-[#1a365d]" fill="currentColor" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl text-[#2d3748]">I'm a Child</h2>
                <p className="text-sm sm:text-base text-[#4a5568]">
                  Write stories, share feelings, and create adventures with your AI companion.
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
                  <span className="text-sm">Chat with your companion</span>
                </div>
              </div>

              <Button variant="child-blue" size="large" className="w-full" onClick={onSelectChild}>
                Enter as Child
              </Button>
            </div>
          </Card>

          <Card variant="parent" className="hover:scale-105 transition-all">
            <div className="text-center space-y-4 py-3 sm:py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--parent-teal)] flex items-center justify-center shadow-[0_8px_24px_rgba(45,156,175,0.3)]">
                <Shield className="w-7 h-7 text-white" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl text-[#2d3748]">I'm a Parent/Guardian</h2>
                <p className="text-sm sm:text-base text-[#475569]">
                  View privacy-first insights and support your child's emotional well-being.
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
                  <span className="text-sm">Support healthy growth</span>
                </div>
              </div>

              <Button variant="parent-teal" size="large" className="w-full" onClick={onSelectParent}>
                Enter as Parent
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
