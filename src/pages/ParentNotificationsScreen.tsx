import React, { useEffect, useState } from 'react';
import { Bell, Mail, Shield, TrendingUp, Users, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { ParentSidebar } from '../components/ParentSidebar';
import { ParentThemeToggle } from '../components/ParentThemeToggle';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { api, type Child, type Parent } from '../services/api';
import { ParentPageLoader } from '../components/PageLoaders';

interface ParentNotificationsScreenProps {
  childName: string;
  childAvatar?: string;
  parentName?: string;
  children?: Child[];
  selectedChildId?: string;
  onSelectChild?: (childId: string) => void;
  parentId?: string;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => Promise<void>;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onProfileUpdated?: (parent: Parent) => void;
}

const readPreference = (preferences: Record<string, unknown> | undefined, key: string, fallback: boolean) =>
  typeof preferences?.[key] === 'boolean' ? Boolean(preferences[key]) : fallback;

export function ParentNotificationsScreen({
  childName,
  childAvatar,
  parentName,
  children,
  selectedChildId,
  onSelectChild,
  parentId,
  theme = 'light',
  onThemeToggle,
  onNavigate,
  onLogout,
  onProfileUpdated,
}: ParentNotificationsScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [parentProfile, setParentProfile] = useState<Parent | null>(null);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyReports: true,
    monthlyReports: false,
    concernAlerts: true,
    moodInsights: true,
    activityNotifications: true,
  });
  const [activityItems, setActivityItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      api.parents.me(),
      parentId ? api.dashboard.activity(parentId, { childId: selectedChildId }).catch(() => null) : Promise.resolve(null),
    ])
      .then(([profileResponse, activityResponse]) => {
        if (!isMounted) return;
        const parent = profileResponse.parent;
        const saved = parent.notificationPreferences || {};
        setParentProfile(parent);
        setPreferences({
          emailNotifications: readPreference(saved, 'emailNotifications', true),
          weeklyReports: readPreference(saved, 'weeklyReports', true),
          monthlyReports: readPreference(saved, 'monthlyReports', false),
          concernAlerts: readPreference(saved, 'concernAlerts', true),
          moodInsights: readPreference(saved, 'moodInsights', true),
          activityNotifications: readPreference(saved, 'activityNotifications', true),
        });
        setActivityItems((activityResponse as any)?.activities?.slice(0, 5) || []);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Could not load notifications.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [parentId, selectedChildId]);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { parent } = await api.parents.updateMe({
        notificationPreferences: {
          ...(parentProfile?.notificationPreferences || {}),
          ...preferences,
        },
      });
      setParentProfile(parent);
      onProfileUpdated?.(parent);
      toast.success('Notification settings saved.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save notification settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const preferenceItems: {
    key: keyof typeof preferences;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    { key: 'emailNotifications', label: 'Email Notifications', description: 'Send important updates to your email.', icon: <Mail className="h-5 w-5" /> },
    { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive a weekly child wellbeing summary.', icon: <Bell className="h-5 w-5" /> },
    { key: 'monthlyReports', label: 'Monthly Reports', description: 'Receive a deeper monthly progress report.', icon: <TrendingUp className="h-5 w-5" /> },
    { key: 'concernAlerts', label: 'Concern Alerts', description: 'Notify you when concerning patterns need attention.', icon: <Shield className="h-5 w-5" /> },
    { key: 'moodInsights', label: 'Mood Insights', description: 'Include emotional trend notifications.', icon: <TrendingUp className="h-5 w-5" /> },
    { key: 'activityNotifications', label: 'Activity Notifications', description: 'Notify you when your child journals or creates stories.', icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--parent-bg)] flex">
      <ParentSidebar
        childName={childName}
        childAvatar={childAvatar}
        parentName={parentName}
        children={children}
        selectedChildId={selectedChildId}
        onSelectChild={onSelectChild}
        activeItem="notifications"
        onNavigate={onNavigate}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[#2d3748] text-xl sm:text-2xl lg:text-3xl">Notifications</h1>
                <p className="text-[#64748b] mt-1 text-sm sm:text-base">Manage parent alerts and report reminders</p>
              </div>
              <ParentThemeToggle theme={theme} onThemeToggle={onThemeToggle} />
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {isLoading ? (
            <ParentPageLoader
              title="Loading notifications"
              message="Loading saved preferences and recent alert activity."
            />
          ) : (
          <>
          <Card variant="parent">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-[#2d3748] text-lg sm:text-xl">Delivery Preferences</h2>
                <p className="text-sm text-[#64748b]">{isLoading ? 'Loading saved preferences...' : 'These settings are saved to your parent profile.'}</p>
              </div>
              <Button variant="parent-teal" onClick={handleSave} disabled={isSaving || isLoading}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>

            <div className="space-y-3">
              {preferenceItems.map((item) => {
                const enabled = preferences[item.key];
                return (
                  <div key={item.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--parent-teal)]/10 text-[var(--parent-teal)]">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[#2d3748] text-sm sm:text-base">{item.label}</p>
                        <p className="text-xs sm:text-sm text-[#64748b]">{item.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle(item.key)}
                      className={`h-8 w-14 rounded-full transition-colors ${enabled ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'}`}
                      aria-label={`${enabled ? 'Disable' : 'Enable'} ${item.label}`}
                    >
                      <span className={`block h-6 w-6 rounded-full bg-white shadow-md transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card variant="parent">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-[#2d3748] text-lg sm:text-xl">Recent Notification Triggers</h2>
              <Badge variant="parent-teal">{activityItems.length} recent</Badge>
            </div>
            <div className="space-y-3">
              {activityItems.length ? activityItems.map((item, index) => (
                <div key={`${item.id || item.type}-${index}`} className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--parent-teal)]/10 text-[var(--parent-teal)]">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[#2d3748] text-sm sm:text-base">{item.title || item.type || 'Activity update'}</p>
                    <p className="text-xs sm:text-sm text-[#64748b]">{item.description || item.details || 'A recent child activity was recorded.'}</p>
                  </div>
                </div>
              )) : (
                <p className="rounded-xl bg-gray-50 p-4 text-sm text-[#64748b]">No recent notification-triggering activity yet.</p>
              )}
            </div>
          </Card>
          </>
          )}
        </div>
      </main>

      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
        variant="parent"
      />
    </div>
  );
}
