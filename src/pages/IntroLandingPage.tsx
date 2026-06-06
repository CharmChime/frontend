import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Sparkles, BookOpen, Brain, Award, Users, Shield, ArrowRight, Menu, X } from 'lucide-react';
import logo from '../assets/35160e99e546074153c34366a831aa0e30d421e6.png';

interface IntroLandingPageProps {
  onGetStarted: () => void;
}

export function IntroLandingPage({ onGetStarted }: IntroLandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Multimodal Journaling',
      description: 'Write or speak your thoughts with our easy text and speech-to-text features',
      color: 'from-[var(--child-blue)] to-[#3b82f6]'
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI-Powered Stories',
      description: 'Transform your journal entries into magical stories with our AI storyteller',
      color: 'from-[var(--child-lavender)] to-[#a855f7]'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Mood Analysis',
      description: 'Track your emotions and see patterns with intelligent mood detection',
      color: 'from-[var(--child-mint)] to-[#10b981]'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Achievements & Rewards',
      description: 'Earn badges and unlock rewards as you journal regularly',
      color: 'from-[var(--child-yellow)] to-[#f59e0b]'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Parent Dashboard',
      description: 'Parents can monitor progress and gain insights into their child\'s emotional journey',
      color: 'from-[var(--child-peach)] to-[#f97316]'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Safe & Secure',
      description: 'Privacy-first platform with secure authentication and data protection',
      color: 'from-slate-500 to-slate-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--child-bg)] via-white to-[var(--child-mint)]/10">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onGetStarted}
                className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--child-blue)] rounded-xl"
                aria-label="Go to home page"
              >
                <img 
                  src={logo} 
                  alt="CharmChime Logo" 
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl text-[#1a365d]">CharmChime</h1>
                <p className="text-xs sm:text-sm text-[#64748b] hidden sm:block">AI-Powered Journaling for Kids</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[#2d3748] hover:text-[#1a365d] transition-colors">Features</a>
              <a href="#how-it-works" className="text-[#2d3748] hover:text-[#1a365d] transition-colors">How It Works</a>
              <a href="#for-parents" className="text-[#2d3748] hover:text-[#1a365d] transition-colors">For Parents</a>
              <Button 
                variant="child-blue" 
                size="medium"
                onClick={onGetStarted}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#2d3748]" />
              ) : (
                <Menu className="w-6 h-6 text-[#2d3748]" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
              <a 
                href="#features" 
                className="block px-4 py-2 text-[#2d3748] hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="block px-4 py-2 text-[#2d3748] hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#for-parents" 
                className="block px-4 py-2 text-[#2d3748] hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Parents
              </a>
              <div className="px-4">
                <Button 
                  variant="child-blue" 
                  size="medium"
                  onClick={onGetStarted}
                  icon={<ArrowRight className="w-5 h-5" />}
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--child-yellow)]/20 animate-bounce" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-40 right-20 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[var(--child-lavender)]/20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[var(--child-peach)]/20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}></div>

            <div className="relative">
              <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[var(--child-blue)]/10 to-[var(--child-mint)]/10 rounded-full mb-4 sm:mb-6">
                <p className="text-sm sm:text-base text-[#2d3748]">✨ AI-Powered Journaling Platform for Children Aged 6-18</p>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl text-[#1a365d] mb-4 sm:mb-6 px-4">
                Where Stories Come to Life! 🌟
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-[#4a5568] max-w-3xl mx-auto mb-8 sm:mb-12 px-4">
                Help your child express themselves, track their emotions, and create magical stories with CharmChime - the safe and fun journaling platform powered by AI.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                <Button 
                  variant="child-blue" 
                  size="large"
                  onClick={onGetStarted}
                  icon={<Sparkles className="w-6 h-6" />}
                  className="w-full sm:w-auto"
                >
                  Start Journaling Free
                </Button>
                <Button 
                  variant="child-yellow" 
                  size="large"
                  onClick={onGetStarted}
                  className="w-full sm:w-auto"
                >
                  View Demo
                </Button>
              </div>

              <p className="text-sm sm:text-base text-[#64748b] mt-4 sm:mt-6">
                No credit card required • Safe for kids • Parent dashboard included
              </p>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,64 C240,96 480,96 720,64 C960,32 1200,32 1440,64 L1440,120 L0,120 Z" fill="white" fillOpacity="0.5"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-12 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#1a365d] mb-4">
              Amazing Features for Growing Minds 🚀
            </h2>
            <p className="text-lg sm:text-xl text-[#64748b] max-w-2xl mx-auto">
              Everything your child needs to express themselves and parents need to support their emotional journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                variant="child"
                className="hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="space-y-4">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl text-[#2d3748]">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-[#64748b] leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gradient-to-br from-[var(--child-blue)]/5 to-[var(--child-mint)]/5 py-12 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#1a365d] mb-4">
              How CharmChime Works 📚
            </h2>
            <p className="text-lg sm:text-xl text-[#64748b] max-w-2xl mx-auto">
              Simple steps to start your journaling journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: '1',
                title: 'Create an Account',
                description: 'Sign up for free - choose child or parent account with secure authentication',
                emoji: '👋'
              },
              {
                step: '2',
                title: 'Start Journaling',
                description: 'Write or speak your thoughts, select your mood, and watch the magic happen',
                emoji: '✍️'
              },
              {
                step: '3',
                title: 'Create & Explore',
                description: 'Turn entries into stories, earn achievements, and track your emotional growth',
                emoji: '🎨'
              }
            ].map((item, index) => (
              <Card key={index} variant="child" className="text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[#f59e0b] flex items-center justify-center text-white shadow-lg">
                    <span className="text-2xl">{item.step}</span>
                  </div>
                  <div className="text-4xl sm:text-5xl">{item.emoji}</div>
                  <h3 className="text-lg sm:text-xl text-[#2d3748]">{item.title}</h3>
                  <p className="text-sm sm:text-base text-[#64748b]">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Parents Section */}
      <section id="for-parents" className="bg-white py-12 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full">
                <p className="text-sm sm:text-base text-teal-800">For Parents & Guardians</p>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#1a365d]">
                Stay Connected to Your Child's Journey 💙
              </h2>
              
              <p className="text-lg sm:text-xl text-[#64748b] leading-relaxed">
                Our comprehensive parent dashboard gives you insights into your child's emotional well-being, journaling habits, and personal growth - all while respecting their privacy.
              </p>

              <div className="space-y-4">
                {[
                  'Track mood patterns and emotional trends',
                  'Receive AI-generated insights and recommendations',
                  'View journaling activity and engagement',
                  'Set goals and monitor achievements',
                  'Generate detailed progress reports'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <p className="text-base sm:text-lg text-[#4a5568]">{item}</p>
                  </div>
                ))}
              </div>

              <Button 
                variant="child-blue" 
                size="large"
                onClick={onGetStarted}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Explore Parent Dashboard
              </Button>
            </div>

            <div className="relative">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 sm:p-8">
                  <Card variant="default" className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg text-[#1e293b]">Mood Overview</h4>
                      <span className="text-2xl">😊</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Happy</span>
                        <span className="text-slate-800">65%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 w-[65%]"></div>
                      </div>
                    </div>
                  </Card>
                  <Card variant="default">
                    <h4 className="text-lg text-[#1e293b] mb-3">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <p className="text-sm text-slate-600">New journal entry today</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-sm text-slate-600">Story created yesterday</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <p className="text-sm text-slate-600">Achievement unlocked</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[#f59e0b] opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[var(--child-mint)] to-[#10b981] opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[var(--child-blue)] to-[var(--child-mint)] py-12 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white">
            Ready to Start Your Journey? 🌈
          </h2>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of families using CharmChime to support their children's emotional growth and creativity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="child-yellow" 
              size="large"
              onClick={onGetStarted}
              icon={<Sparkles className="w-6 h-6" />}
              className="w-full sm:w-auto"
            >
              Get Started for Free
            </Button>
          </div>
          <p className="text-sm sm:text-base text-white/80">
            Start your free trial today • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a365d] text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src={logo} 
                  alt="CharmChime Logo" 
                  className="w-10 h-10 object-contain"
                />
                <h3 className="text-xl">CharmChime</h3>
              </div>
              <p className="text-white/70 text-sm">
                AI-powered journaling platform helping children express themselves and grow emotionally.
              </p>
            </div>
            
            <div>
              <h4 className="mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#for-parents" className="hover:text-white transition-colors">For Parents</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#features" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#for-parents" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="mailto:support@charmchime.local" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#for-parents" className="hover:text-white transition-colors">Safety Guidelines</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/60">
            <p>© 2025 CharmChime. All rights reserved. Made with ❤️ for kids and families.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
