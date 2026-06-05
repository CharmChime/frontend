import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ChildSidebar } from '../components/ChildSidebar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { ArrowLeft, User, Bell, Shield, Moon, Sun } from 'lucide-react';

interface ChildSettingsScreenProps {
  onBack: () => void;
  childName: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function ChildSettingsScreen({ onBack, childName, onNavigate, onLogout }: ChildSettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [shareMoodEnabled, setShareMoodEnabled] = useState(true);
  const [avatarEmoji, setAvatarEmoji] = useState('🌟');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  // Apply theme changes to document
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const handleSidebarNavigation = (page: string) => {
    if (page === 'settings') return; // Already here
    if (page === 'home') {
      onBack();
    } else {
      onNavigate?.(page);
    }
  };

  const avatarOptions = ['🌟', '🦄', '🌈', '🚀', '🎨', '🎭', '🎪', '🎯'];

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
          activeItem="settings"
          onNavigate={handleSidebarNavigation}
          onLogout={() => setShowLogoutConfirm(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogoClick={onBack}
        />
      )}

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="pl-20 pr-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                {!onNavigate && (
                  <Button 
                    variant="child-blue" 
                    size="small" 
                    onClick={onBack}
                    icon={<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                    className="flex-shrink-0"
                  >
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                )}
                <div>
                  <h1 className="text-[#2d3748] text-xl sm:text-2xl lg:text-3xl">Settings ⚙️</h1>
                  <p className="text-[#64748b] mt-1 text-sm sm:text-base">Customize your CharmChime experience</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Profile Settings */}
            <Card variant="child">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--child-blue)] to-[var(--child-mint)] flex items-center justify-center">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#1a365d]" />
                  </div>
                  <h3 className="text-[#2d3748] text-lg sm:text-xl">Profile</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Your Name</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-2xl text-[#2d3748]">
                      {childName}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#4a5568] mb-3 text-sm sm:text-base">Choose Your Avatar</label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
                      {avatarOptions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setAvatarEmoji(emoji)}
                          className={`
                            aspect-square rounded-2xl text-2xl sm:text-3xl flex items-center justify-center
                            transition-all duration-200
                            ${avatarEmoji === emoji
                              ? 'bg-[var(--child-blue)] scale-110 shadow-lg'
                              : 'bg-white hover:bg-gray-50 hover:scale-105'
                            }
                          `}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <Card variant="child">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--child-mint)] to-[var(--child-blue)] flex items-center justify-center">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#065f46]" />
                  </div>
                  <h3 className="text-[#2d3748] text-lg sm:text-xl">Notifications</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-[#64748b]" />
                      <div>
                        <p className="text-[#2d3748] text-sm sm:text-base">Reminders</p>
                        <p className="text-xs sm:text-sm text-[#64748b]">Get daily journal reminders</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className={`
                        w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0
                        ${notificationsEnabled ? 'bg-[var(--child-mint)]' : 'bg-gray-300'}
                      `}
                    >
                      <div className={`
                        w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1
                        ${notificationsEnabled ? 'translate-x-7' : 'translate-x-1'}
                      `} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Privacy & Safety */}
            <Card variant="child">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--child-peach)] to-[var(--child-lavender)] flex items-center justify-center">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#7c2d12]" />
                  </div>
                  <h3 className="text-[#2d3748] text-lg sm:text-xl">Privacy & Safety</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3 sm:p-4 bg-green-50 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[#2d3748] text-sm sm:text-base mb-1">Your Journal is Safe</p>
                        <p className="text-xs sm:text-sm text-[#64748b]">
                          Only you can read your journal entries. Your parents can see how you're feeling but not what you write.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-[#64748b]" />
                      <div>
                        <p className="text-[#2d3748] text-sm sm:text-base">Share Mood with Parents</p>
                        <p className="text-xs sm:text-sm text-[#64748b]">Let parents see your mood trends</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShareMoodEnabled(!shareMoodEnabled)}
                      className={`
                        w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0
                        ${shareMoodEnabled ? 'bg-[var(--child-mint)]' : 'bg-gray-300'}
                      `}
                    >
                      <div className={`
                        w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1
                        ${shareMoodEnabled ? 'translate-x-7' : 'translate-x-1'}
                      `} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end pb-6">
              <Button 
                variant="child-blue" 
                size="large" 
                onClick={onBack}
                className="w-full sm:w-auto"
              >
                Save Changes ✨
              </Button>
            </div>
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
