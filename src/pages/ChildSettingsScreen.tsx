import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ChildSidebar } from '../components/ChildSidebar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { ChildPageLoader } from '../components/PageLoaders';
import { ArrowLeft, User, Bell, Shield } from 'lucide-react';
import { api, type Child } from '../services/api';
import { toast } from 'sonner';
import { ChildAvatar } from '../components/ChildAvatar';
import { avatarPresets } from '../services/avatar';

interface ChildSettingsScreenProps {
  onBack: () => void;
  childName: string;
  childAvatar?: string;
  childId?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  onProfileUpdated?: (child: Child) => void;
}

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
  childAvatar,
  childId,
  onNavigate,
  onLogout,
  onProfileUpdated,
}: ChildSettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [shareMoodEnabled, setShareMoodEnabled] = useState(true);
  const [avatar, setAvatar] = useState(childAvatar || 'sunny-spark');
  const [name, setName] = useState(childName);
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [savedPreferences, setSavedPreferences] = useState<Record<string, unknown>>({});
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
        setAvatar(child.avatar || 'sunny-spark');
        setSavedPreferences(child.preferences || {});
        setNotificationsEnabled(
          readBooleanPreference(child.preferences, 'notificationsEnabled', true)
        );
        setShareMoodEnabled(readBooleanPreference(child.preferences, 'shareMoodEnabled', true));
        onProfileUpdated?.(child);
      })
      .catch((error) => {
        if (!isMounted) return;
        setName(childName);
        const message = error instanceof Error ? error.message : 'Could not load your profile.';
        setSettingsError(message);
        toast.error(message);
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
          ...savedPreferences,
          notificationsEnabled,
          shareMoodEnabled,
        },
      });

      onProfileUpdated?.(child);
      setSavedPreferences(child.preferences || {});
      setSettingsMessage('Profile saved successfully.');
      toast.success('Profile saved successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save your profile.';
      setSettingsError(message);
      toast.error(message);
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
          childAvatar={avatar}
          childId={childId}
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
                  <ChildPageLoader
                    childName={childName}
                    childAvatar={childAvatar}
                    message="Loading your avatar, profile, and safe settings."
                  />
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
                  <div className="rounded-3xl bg-gradient-to-br from-[var(--child-blue)]/20 via-white to-[var(--child-mint)]/20 p-4">
                    <div className="mb-4 flex items-center gap-4">
                      <ChildAvatar avatar={avatar} name={name || childName} size="xl" />
                      <div>
                        <p className="text-[#2d3748] text-base sm:text-lg">This is your CharmChime buddy</p>
                        <p className="text-xs sm:text-sm text-[#64748b]">Pick the one that feels most like you.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {avatarPresets.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setAvatar(option.id);
                          toast.info(`${option.label} avatar selected. Save changes to keep it.`);
                        }}
                        disabled={isLoadingProfile || isSavingProfile}
                        className={`rounded-3xl bg-white p-3 text-sm font-semibold transition-all duration-200 ${
                          avatar === option.id
                            ? 'scale-105 shadow-lg ring-4 ring-[var(--child-yellow)]'
                            : 'shadow-sm hover:scale-105 hover:shadow-md'
                        }`}
                      >
                        <ChildAvatar avatar={option.id} name={name || childName} size="large" className="mx-auto mb-2" />
                        <span className="block text-[#2d3748]">{option.label}</span>
                      </button>
                    ))}
                    </div>
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
                    onClick={() => {
                      const nextValue = !notificationsEnabled;
                      setNotificationsEnabled(nextValue);
                      toast.info(nextValue ? 'Journal reminders turned on.' : 'Journal reminders turned off.');
                    }}
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
                    onClick={() => {
                      const nextValue = !shareMoodEnabled;
                      setShareMoodEnabled(nextValue);
                      toast.info(nextValue ? 'Mood sharing turned on.' : 'Mood sharing turned off.');
                    }}
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
