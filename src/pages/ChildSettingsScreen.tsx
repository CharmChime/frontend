import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ChildSidebar } from '../components/ChildSidebar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { ArrowLeft, User, Bell, Shield } from 'lucide-react';
import { api, type Child } from '../services/api';

interface ChildSettingsScreenProps {
  onBack: () => void;
  childName: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  onProfileUpdated?: (child: Child) => void;
}

const avatarOptions = ['star', 'rainbow', 'rocket', 'palette', 'theater', 'target'];
const avatarLabel: Record<string, string> = {
  star: '*',
  rainbow: 'RB',
  rocket: 'RK',
  palette: 'PA',
  theater: 'TH',
  target: 'TG',
};

const readBooleanPreference = (
  preferences: Record<string, unknown> | undefined,
  key: string,
  fallback: boolean
) => {
  return typeof preferences?.[key] === 'boolean' ? Boolean(preferences[key]) : fallback;
};

export function ChildSettingsScreen({
  onBack,
  childName,
  onNavigate,
  onLogout,
  onProfileUpdated,
}: ChildSettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [shareMoodEnabled, setShareMoodEnabled] = useState(true);
  const [avatar, setAvatar] = useState('star');
  const [name, setName] = useState(childName);
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    setIsLoadingProfile(true);
    setSettingsError('');

    api.children
      .me()
      .then(({ child }) => {
        if (!isMounted) return;

        setName(child.name || childName);
        setNickname(child.nickname || '');
        setAge(child.age ? String(child.age) : '');
        setAvatar(child.avatar || 'star');
        setNotificationsEnabled(
          readBooleanPreference(child.preferences, 'notificationsEnabled', true)
        );
        setShareMoodEnabled(readBooleanPreference(child.preferences, 'shareMoodEnabled', true));
        onProfileUpdated?.(child);
      })
      .catch((error) => {
        if (!isMounted) return;
        setName(childName);
        setSettingsError(error instanceof Error ? error.message : 'Could not load your profile.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [childName, onProfileUpdated]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const handleSidebarNavigation = (page: string) => {
    if (page === 'settings') return;
    if (page === 'home') {
      onBack();
    } else {
      onNavigate?.(page);
    }
  };

  const handleSaveProfile = async () => {
    setSettingsMessage('');
    setSettingsError('');

    const parsedAge = Number(age);

    if (!name.trim()) {
      setSettingsError('Name is required.');
      return;
    }

    if (!Number.isInteger(parsedAge) || parsedAge <= 0) {
      setSettingsError('Age must be a positive whole number.');
      return;
    }

    setIsSavingProfile(true);

    try {
      const { child } = await api.children.updateMe({
        name: name.trim(),
        nickname: nickname.trim() || undefined,
        age: parsedAge,
        avatar,
        preferences: {
          notificationsEnabled,
          shareMoodEnabled,
        },
      });

      onProfileUpdated?.(child);
      setSettingsMessage('Profile saved successfully.');
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : 'Could not save your profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--child-bg)] flex">
      {onNavigate && onLogout && <MobileMenuButton onClick={() => setIsSidebarOpen(true)} />}

      {onNavigate && onLogout && (
        <ChildSidebar
          childName={name || childName}
          activeItem="settings"
          onNavigate={handleSidebarNavigation}
          onLogout={() => setShowLogoutConfirm(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogoClick={onBack}
        />
      )}

      <main className="flex-1 overflow-auto">
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
                  <h1 className="text-[#2d3748] text-xl sm:text-2xl lg:text-3xl">Settings</h1>
                  <p className="text-[#64748b] mt-1 text-sm sm:text-base">
                    Customize your CharmChime experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {(settingsMessage || settingsError) && (
              <Card variant="child">
                <p className={`text-sm ${settingsError ? 'text-red-700' : 'text-green-700'}`}>
                  {settingsError || settingsMessage}
                </p>
              </Card>
            )}

            <Card variant="child">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--child-blue)] to-[var(--child-mint)] flex items-center justify-center">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#1a365d]" />
                  </div>
                  <h3 className="text-[#2d3748] text-lg sm:text-xl">Profile</h3>
                </div>

                {isLoadingProfile && (
                  <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[#64748b]">
                    Loading your profile...
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      disabled={isLoadingProfile || isSavingProfile}
                      className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--child-blue)] text-[#2d3748]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Nickname</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      disabled={isLoadingProfile || isSavingProfile}
                      placeholder="What should CharmChime call you?"
                      className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--child-blue)] text-[#2d3748]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#4a5568] mb-2 text-sm sm:text-base">Age</label>
                    <input
                      type="number"
                      min="1"
                      value={age}
                      onChange={(event) => setAge(event.target.value)}
                      disabled={isLoadingProfile || isSavingProfile}
                      className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--child-blue)] text-[#2d3748]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#4a5568] mb-3 text-sm sm:text-base">Choose Your Avatar</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                    {avatarOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setAvatar(option)}
                        disabled={isLoadingProfile || isSavingProfile}
                        className={`aspect-square rounded-2xl text-sm font-semibold flex items-center justify-center transition-all duration-200 ${
                          avatar === option
                            ? 'bg-[var(--child-blue)] scale-105 shadow-lg text-[#1a365d]'
                            : 'bg-white hover:bg-gray-50 hover:scale-105 text-[#64748b]'
                        }`}
                      >
                        {avatarLabel[option] || option.slice(0, 2).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="child">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--child-mint)] to-[var(--child-blue)] flex items-center justify-center">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#065f46]" />
                  </div>
                  <h3 className="text-[#2d3748] text-lg sm:text-xl">Notifications</h3>
                </div>

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
                    disabled={isLoadingProfile || isSavingProfile}
                    className={`w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0 ${
                      notificationsEnabled ? 'bg-[var(--child-mint)]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1 ${
                        notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>

            <Card variant="child">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--child-peach)] to-[var(--child-lavender)] flex items-center justify-center">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#7c2d12]" />
                  </div>
                  <h3 className="text-[#2d3748] text-lg sm:text-xl">Privacy & Safety</h3>
                </div>

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
                    disabled={isLoadingProfile || isSavingProfile}
                    className={`w-14 h-8 rounded-full transition-all duration-200 flex-shrink-0 ${
                      shareMoodEnabled ? 'bg-[var(--child-mint)]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 mt-1 ${
                        shareMoodEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>

            <div className="flex justify-end pb-6">
              <Button
                variant="child-blue"
                size="large"
                onClick={handleSaveProfile}
                className="w-full sm:w-auto"
                disabled={isLoadingProfile || isSavingProfile}
              >
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </main>

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
