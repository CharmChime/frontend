import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Users,
  Palette,
  Sun,
  Moon,
  TrendingUp,
} from 'lucide-react';
import { api, type Child, type Parent } from '../services/api';
import { toast } from 'sonner';

interface ParentSettingsScreenProps {
  onBack: () => void;
  onProfileUpdated?: (parent: Parent) => void;
}

const readBooleanPreference = (
  preferences: Record<string, unknown> | undefined,
  key: string,
  fallback: boolean
) => {
  return typeof preferences?.[key] === 'boolean' ? Boolean(preferences[key]) : fallback;
};

const readStringPreference = (
  preferences: Record<string, unknown> | undefined,
  key: string,
  fallback: string
) => {
  return typeof preferences?.[key] === 'string' ? String(preferences[key]) : fallback;
};

const applyParentAppearance = (appearance: { theme: 'light' | 'dark'; colorTheme: string }) => {
  document.documentElement.classList.toggle('dark', appearance.theme === 'dark');
  document.documentElement.dataset.parentColorTheme = appearance.colorTheme;
};

export function ParentSettingsScreen({ onBack, onProfileUpdated }: ParentSettingsScreenProps) {
  const [parentProfile, setParentProfile] = useState<Parent | null>(null);
  const [linkedChildren, setLinkedChildren] = useState<Child[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [concernAlerts, setConcernAlerts] = useState(true);
  const [moodInsights, setMoodInsights] = useState(true);
  const [activityNotifications, setActivityNotifications] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedColorTheme, setSelectedColorTheme] = useState('Teal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setSettingsError('');

    Promise.all([api.parents.me(), api.parents.children()])
      .then(([profileResponse, childrenResponse]) => {
        if (!isMounted) return;

        const parent = profileResponse.parent;
        const preferences = parent.notificationPreferences;
        const appearancePreferences = parent.appearancePreferences;
        const nextTheme = readStringPreference(appearancePreferences, 'theme', 'light') === 'dark' ? 'dark' : 'light';
        const nextColorTheme = readStringPreference(appearancePreferences, 'colorTheme', 'Teal');

        setParentProfile(parent);
        setName(parent.fullName || parent.name || '');
        setEmail(parent.email || '');
        setPhone(parent.phone || '');
        setEmailNotifications(readBooleanPreference(preferences, 'emailNotifications', true));
        setWeeklyReports(readBooleanPreference(preferences, 'weeklyReports', true));
        setConcernAlerts(readBooleanPreference(preferences, 'concernAlerts', true));
        setMoodInsights(readBooleanPreference(preferences, 'moodInsights', true));
        setActivityNotifications(readBooleanPreference(preferences, 'activityNotifications', true));
        setTheme(nextTheme);
        setSelectedColorTheme(nextColorTheme);
        applyParentAppearance({ theme: nextTheme, colorTheme: nextColorTheme });
        setLinkedChildren(childrenResponse.children || []);
        onProfileUpdated?.(parent);
      })
      .catch((error) => {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : 'Could not load parent settings.';
        setSettingsError(message);
        toast.error(message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onProfileUpdated]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    applyParentAppearance({ theme: newTheme, colorTheme: selectedColorTheme });
    toast.info(`${newTheme === 'dark' ? 'Dark' : 'Light'} theme selected. Save changes to keep it.`);
  };

  const handleColorThemeChange = (colorTheme: string) => {
    setSelectedColorTheme(colorTheme);
    applyParentAppearance({ theme, colorTheme });
    toast.info(`${colorTheme} color theme selected. Save changes to keep it.`);
  };

  const handleTogglePreference = (
    label: string,
    enabled: boolean,
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const nextValue = !enabled;
    setEnabled(nextValue);
    toast.info(`${label} ${nextValue ? 'enabled' : 'disabled'}. Save changes to keep it.`);
  };

  const handleSaveProfile = async () => {
    setSettingsMessage('');
    setSettingsError('');

    if (!name.trim()) {
      setSettingsError('Full name is required.');
      return;
    }

    setIsSaving(true);

    try {
      const { parent } = await api.parents.updateMe({
        name: name.trim(),
        phone: phone.trim() || undefined,
        notificationPreferences: {
          emailNotifications,
          weeklyReports,
          concernAlerts,
          moodInsights,
          activityNotifications,
        },
        appearancePreferences: {
          theme,
          colorTheme: selectedColorTheme,
        },
      });

      setParentProfile(parent);
      onProfileUpdated?.(parent);
      setSettingsMessage('Settings saved successfully.');
      applyParentAppearance({ theme, colorTheme: selectedColorTheme });
      toast.success('Parent settings saved successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save settings.';
      setSettingsError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
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
                <p className="text-[#64748b] mt-1 text-sm sm:text-base">
                  Manage your account and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {(settingsMessage || settingsError || isLoading) && (
            <Card variant="parent" className={settingsError ? 'border border-red-200 bg-red-50' : ''}>
              <p
                className={`text-sm ${
                  settingsError
                    ? 'text-red-700'
                    : settingsMessage
                      ? 'text-[var(--parent-teal-dark)]'
                      : 'text-[#64748b]'
                }`}
              >
                {settingsError || settingsMessage || 'Loading your settings...'}
              </p>
            </Card>
          )}

          <Card variant="parent">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--parent-teal)]/10 flex items-center justify-center">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--parent-teal)]" />
                </div>
                <div>
                  <h3 className="text-[#2d3748] text-lg sm:text-xl">Account Information</h3>
                  {parentProfile?.isVerified && (
                    <p className="text-xs text-green-700 mt-1">Verified account</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={isLoading || isSaving}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] text-[#2d3748]"
                  />
                </div>

                <div>
                  <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Email Address</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-[#64748b]"
                    />
                    <Badge variant="parent-teal" className="hidden sm:flex flex-shrink-0 items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    disabled={isLoading || isSaving}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] text-[#2d3748]"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card variant="parent">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--parent-teal)]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--parent-teal)]" />
                </div>
                <div>
                  <h3 className="text-[#2d3748] text-lg sm:text-xl">Children Accounts</h3>
                  <p className="text-xs sm:text-sm text-[#64748b]">
                    {linkedChildren.length} linked {linkedChildren.length === 1 ? 'child' : 'children'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {linkedChildren.length ? (
                  linkedChildren.map((child) => (
                    <div
                      key={child.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gradient-to-r from-[var(--child-blue)]/20 to-[var(--child-mint)]/20 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[var(--child-peach)] flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-[#744210]">
                            {(child.nickname || child.name || '?').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-[#2d3748] text-sm sm:text-base">
                            {child.nickname || child.name}
                          </p>
                          <p className="text-xs sm:text-sm text-[#64748b]">
                            Age {child.age || 'not set'} - {child.isVerified === false ? 'Pending verification' : 'Active'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="parent-slate">{child.parentId ? 'Linked' : 'Unlinked'}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl text-sm text-[#64748b]">
                    No linked children found for this parent account yet.
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card variant="parent">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--parent-teal)]/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--parent-teal)]" />
                </div>
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Security</h3>
              </div>

              <div className="p-3 sm:p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#2d3748] text-sm sm:text-base mb-1">Security Status: Good</p>
                    <p className="text-xs sm:text-sm text-[#64748b]">
                      Password and email changes stay outside this profile update flow.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="parent">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--parent-teal)]/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--parent-teal)]" />
                </div>
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Notifications</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: 'Email Notifications',
                    description: 'Receive updates via email',
                    icon: <Mail className="w-5 h-5 text-[#64748b]" />,
                    enabled: emailNotifications,
                    setEnabled: setEmailNotifications,
                  },
                  {
                    label: 'Weekly Reports',
                    description: 'Receive weekly summary reports',
                    icon: <Bell className="w-5 h-5 text-[#64748b]" />,
                    enabled: weeklyReports,
                    setEnabled: setWeeklyReports,
                  },
                  {
                    label: 'Concern Alerts',
                    description: 'Immediate alerts for concerning patterns',
                    icon: <Shield className="w-5 h-5 text-[#64748b]" />,
                    enabled: concernAlerts,
                    setEnabled: setConcernAlerts,
                  },
                  {
                    label: 'Mood Insights',
                    description: 'Receive insights on mood trends',
                    icon: <TrendingUp className="w-5 h-5 text-[#64748b]" />,
                    enabled: moodInsights,
                    setEnabled: setMoodInsights,
                  },
                  {
                    label: 'Activity Notifications',
                    description: 'Receive notifications for child activities',
                    icon: <Users className="w-5 h-5 text-[#64748b]" />,
                    enabled: activityNotifications,
                    setEnabled: setActivityNotifications,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <div>
                        <p className="text-[#2d3748] text-sm sm:text-base">{item.label}</p>
                        <p className="text-xs sm:text-sm text-[#64748b]">{item.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePreference(item.label, item.enabled, item.setEnabled)}
                      disabled={isLoading || isSaving}
                      className={`w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0 ${
                        item.enabled ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1 ${
                          item.enabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

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
                    className={`w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0 ${
                      theme === 'light' ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1 ${
                        theme === 'light' ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
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
                    className={`w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0 ${
                      theme === 'dark' ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1 ${
                        theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Color Theme</label>
                  <div className="flex gap-2">
                    {colorThemes.map((colorTheme) => (
                      <button
                        key={colorTheme.name}
                        onClick={() => handleColorThemeChange(colorTheme.name)}
                        className={`w-10 h-10 rounded-full transition-all duration-200 ${
                          selectedColorTheme === colorTheme.name
                            ? 'border-2 border-[var(--parent-teal)]'
                            : 'border border-gray-300'
                        }`}
                        style={{ backgroundColor: colorTheme.color }}
                        aria-label={colorTheme.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pb-6">
            <Button variant="parent-slate" size="large" onClick={onBack} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="parent-teal"
              size="large"
              className="w-full sm:w-auto"
              onClick={handleSaveProfile}
              disabled={isLoading || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
