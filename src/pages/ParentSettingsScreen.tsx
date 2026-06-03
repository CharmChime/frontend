import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ArrowLeft, User, Mail, Lock, Bell, Shield, CreditCard, Users, Eye, EyeOff, Palette, Sun, Moon, Globe, TrendingUp, CheckCircle } from 'lucide-react';

interface ParentSettingsScreenProps {
  onBack: () => void;
}

export function ParentSettingsScreen({ onBack }: ParentSettingsScreenProps) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [concernAlerts, setConcernAlerts] = useState(true);
  const [privacyMode, setPrivacyMode] = useState<'high' | 'medium' | 'low'>('high');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedColorTheme, setSelectedColorTheme] = useState('Teal');
  const [moodInsights, setMoodInsights] = useState(true);
  const [activityNotifications, setActivityNotifications] = useState(true);

  // Apply theme changes to document
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const colorThemes = [
    { name: 'Teal', color: 'var(--parent-teal)' },
    { name: 'Slate', color: 'var(--parent-slate)' },
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Purple', color: '#a855f7' },
    { name: 'Green', color: '#10b981' },
  ];

  return (
    <div className="min-h-screen bg-[var(--parent-bg)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button 
                variant="parent-teal" 
                size="small" 
                onClick={onBack}
                icon={<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                className="flex-shrink-0"
              >
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div>
                <h1 className="text-[#2d3748] text-xl sm:text-2xl lg:text-3xl">Parent Settings</h1>
                <p className="text-[#64748b] mt-1 text-sm sm:text-base">Manage your account and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Account Information */}
          <Card variant="parent">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--parent-teal)]/10 flex items-center justify-center">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--parent-teal)]" />
                </div>
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Account Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Sarah Johnson"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] text-[#2d3748]"
                  />
                </div>

                <div>
                  <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Email Address</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      defaultValue="sarah.johnson@email.com"
                      className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] text-[#2d3748]"
                    />
                    <Button variant="parent-teal" size="small" className="hidden sm:flex flex-shrink-0">
                      Verify
                    </Button>
                  </div>
                  <Button variant="parent-teal" size="small" className="mt-2 sm:hidden w-full">
                    Verify Email
                  </Button>
                </div>

                <div>
                  <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] text-[#2d3748]"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card variant="parent">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--parent-teal)]/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--parent-teal)]" />
                </div>
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Security</h3>
              </div>

              <div className="space-y-3">
                <Button variant="parent-slate" size="medium" className="w-full justify-start" icon={<Lock className="w-5 h-5" />}>
                  Change Password
                </Button>
                <Button variant="parent-slate" size="medium" className="w-full justify-start" icon={<Shield className="w-5 h-5" />}>
                  Enable Two-Factor Authentication
                </Button>
                <div className="p-3 sm:p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#2d3748] text-sm sm:text-base mb-1">Security Status: Good</p>
                      <p className="text-xs sm:text-sm text-[#64748b]">
                        Your account is protected with a strong password. Consider enabling two-factor authentication for extra security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Child Management */}
          <Card variant="parent">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--parent-teal)]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--parent-teal)]" />
                </div>
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Children Accounts</h3>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gradient-to-r from-[var(--child-blue)]/20 to-[var(--child-mint)]/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[var(--child-peach)] flex items-center justify-center flex-shrink-0">
                      <span className="text-lg sm:text-xl">👦</span>
                    </div>
                    <div>
                      <p className="text-[#2d3748] text-sm sm:text-base">Emma Johnson</p>
                      <p className="text-xs sm:text-sm text-[#64748b]">Age 10 · Active</p>
                    </div>
                  </div>
                  <Button variant="parent-slate" size="small" className="w-full sm:w-auto">
                    Manage
                  </Button>
                </div>

                <Button variant="parent-teal" size="medium" className="w-full" icon={<Users className="w-5 h-5" />}>
                  Add Another Child
                </Button>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card variant="parent">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--parent-teal)]/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--parent-teal)]" />
                </div>
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Notifications</h3>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#64748b]" />
                    <div>
                      <p className="text-[#2d3748] text-sm sm:text-base">Email Notifications</p>
                      <p className="text-xs sm:text-sm text-[#64748b]">Receive updates via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`
                      w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0
                      ${emailNotifications ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'}
                    `}
                  >
                    <div className={`
                      w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1
                      ${emailNotifications ? 'translate-x-7' : 'translate-x-1'}
                    `} />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#64748b]" />
                    <div>
                      <p className="text-[#2d3748] text-sm sm:text-base">Weekly Reports</p>
                      <p className="text-xs sm:text-sm text-[#64748b]">Receive weekly summary reports</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setWeeklyReports(!weeklyReports)}
                    className={`
                      w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0
                      ${weeklyReports ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'}
                    `}
                  >
                    <div className={`
                      w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1
                      ${weeklyReports ? 'translate-x-7' : 'translate-x-1'}
                    `} />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#64748b]" />
                    <div>
                      <p className="text-[#2d3748] text-sm sm:text-base">Concern Alerts</p>
                      <p className="text-xs sm:text-sm text-[#64748b]">Immediate alerts for concerning patterns</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConcernAlerts(!concernAlerts)}
                    className={`
                      w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0
                      ${concernAlerts ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'}
                    `}
                  >
                    <div className={`
                      w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1
                      ${concernAlerts ? 'translate-x-7' : 'translate-x-1'}
                    `} />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[#64748b]" />
                    <div>
                      <p className="text-[#2d3748] text-sm sm:text-base">Mood Insights</p>
                      <p className="text-xs sm:text-sm text-[#64748b]">Receive insights on mood trends</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMoodInsights(!moodInsights)}
                    className={`
                      w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0
                      ${moodInsights ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'}
                    `}
                  >
                    <div className={`
                      w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1
                      ${moodInsights ? 'translate-x-7' : 'translate-x-1'}
                    `} />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#64748b]" />
                    <div>
                      <p className="text-[#2d3748] text-sm sm:text-base">Activity Notifications</p>
                      <p className="text-xs sm:text-sm text-[#64748b]">Receive notifications for child activities</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivityNotifications(!activityNotifications)}
                    className={`
                      w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0
                      ${activityNotifications ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'}
                    `}
                  >
                    <div className={`
                      w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1
                      ${activityNotifications ? 'translate-x-7' : 'translate-x-1'}
                    `} />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Subscription */}
          <Card variant="parent">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--parent-teal)]/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--parent-teal)]" />
                </div>
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Subscription</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 sm:p-4 bg-gradient-to-r from-[var(--parent-teal)]/10 to-blue-50 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-[#2d3748] text-sm sm:text-base mb-1">Premium Plan</p>
                      <p className="text-xs sm:text-sm text-[#64748b]">$9.99/month · Renews on Jan 15, 2025</p>
                    </div>
                    <div className="px-3 py-1 bg-[var(--parent-teal)] text-white rounded-full text-sm w-fit">
                      Active
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button variant="parent-slate" size="medium" className="flex-1">
                    Manage Subscription
                  </Button>
                  <Button variant="parent-slate" size="medium" className="flex-1">
                    View Billing
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Language */}
          <Card variant="parent">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--parent-teal)]/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--parent-teal)]" />
                </div>
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Language & Region</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Preferred Language</label>
                  <select className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] text-[#2d3748]">
                    <option>English (US)</option>
                    <option>Español</option>
                    <option>Français</option>
                    <option>Deutsch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Timezone</label>
                  <select className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] text-[#2d3748]">
                    <option>Pacific Time (PT)</option>
                    <option>Eastern Time (ET)</option>
                    <option>Central Time (CT)</option>
                    <option>Mountain Time (MT)</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Theme */}
          <Card variant="parent">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--parent-teal)]/10 flex items-center justify-center">
                  <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--parent-teal)]" />
                </div>
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Appearance</h3>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-[#64748b]" />
                    <div>
                      <p className="text-[#2d3748] text-sm sm:text-base">Light Theme</p>
                      <p className="text-xs sm:text-sm text-[#64748b]">Switch to light mode</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`
                      w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0
                      ${theme === 'light' ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'}
                    `}
                  >
                    <div className={`
                      w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1
                      ${theme === 'light' ? 'translate-x-7' : 'translate-x-1'}
                    `} />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-[#64748b]" />
                    <div>
                      <p className="text-[#2d3748] text-sm sm:text-base">Dark Theme</p>
                      <p className="text-xs sm:text-sm text-[#64748b]">Switch to dark mode</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`
                      w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0
                      ${theme === 'dark' ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'}
                    `}
                  >
                    <div className={`
                      w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1
                      ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}
                    `} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Color Theme</label>
                  <div className="flex gap-2">
                    {colorThemes.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => setSelectedColorTheme(theme.name)}
                        className={`
                          w-10 h-10 rounded-full transition-all duration-200
                          ${selectedColorTheme === theme.name ? 'border-2 border-[var(--parent-teal)]' : 'border border-gray-300'}
                        `}
                        style={{ backgroundColor: theme.color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pb-6">
            <Button 
              variant="parent-slate" 
              size="large" 
              onClick={onBack}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="parent-teal" 
              size="large" 
              className="w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}