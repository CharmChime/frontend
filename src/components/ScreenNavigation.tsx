import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router';
import { IntroLandingPage } from '../pages/IntroLandingPage';
import { LandingPage } from '../pages/LandingPage';
import { ChildAuthScreen } from '../pages/ChildAuthScreen';
import { ChildHomeScreenRedesigned } from '../pages/ChildHomeScreenRedesigned';
import { JournalEntryScreen } from '../pages/JournalEntryScreen';
import { StoryModeScreen } from '../pages/StoryModeScreen';
import { MemoriesScreen } from '../pages/MemoriesScreen';
import { JournalDetailScreen } from '../pages/JournalDetailScreen';
import { CalendarScreen } from '../pages/CalendarScreen';
import { AchievementsScreen } from '../pages/AchievementsScreen';
import { ChildSettingsScreen } from '../pages/ChildSettingsScreen';
import { ParentAuthScreen } from '../pages/ParentAuthScreen';
import { ParentDashboardRedesigned } from '../pages/ParentDashboardRedesigned';
import { ParentSettingsScreen } from '../pages/ParentSettingsScreen';
import { ParentAnalyticsScreen } from '../pages/ParentAnalyticsScreen';
import { ParentInsightsScreen } from '../pages/ParentInsightsScreen';
import { ParentActivityScreen } from '../pages/ParentActivityScreen';
import { ParentReportsScreen } from '../pages/ParentReportsScreen';
import { ParentNotificationsScreen } from '../pages/ParentNotificationsScreen';
import { ParentChildrenScreen } from '../pages/ParentChildrenScreen';
import { OTP_CONTEXT_STORAGE_KEY, VerifyOtpScreen } from '../pages/VerifyOtpScreen';
import { ApiRequestError, api, type Child, type OtpContext, type Parent } from '../services/api';

const childRoutes: Record<string, string> = {
  home: '/child/home',
  entry: '/child/journal-entry',
  'story-mode': '/child/story-mode',
  memories: '/child/memories',
  calendar: '/child/calendar',
  achievements: '/child/achievements',
  settings: '/child/settings',
};

const parentRoutes: Record<string, string> = {
  dashboard: '/parent/dashboard',
  overview: '/parent/dashboard',
  analytics: '/parent/analytics',
  insights: '/parent/insights',
  activity: '/parent/activity',
  reports: '/parent/reports',
  children: '/parent/children',
  notifications: '/parent/notifications',
  settings: '/parent/settings',
};

const getOtpRequiredContext = (
  error: unknown,
  fallback: OtpContext
): OtpContext | null => {
  if (!(error instanceof ApiRequestError)) {
    return null;
  }

  const otpError = error.errors.find((item) => {
    if (!item || typeof item !== 'object') {
      return false;
    }

    return (item as { code?: string }).code === 'OTP_REQUIRED';
  });

  if (!otpError) {
    return null;
  }

  const destination = (otpError as { destination?: string }).destination;

  return {
    userType: fallback.userType,
    email: destination || fallback.email,
  };
};

const saveOtpContext = (context: OtpContext) => {
  sessionStorage.setItem(OTP_CONTEXT_STORAGE_KEY, JSON.stringify(context));
};

const getStoredItem = (key: string) => localStorage.getItem(key) || sessionStorage.getItem(key);

const setAuthItem = (key: string, value: string, rememberMe: boolean) => {
  const activeStorage = rememberMe ? localStorage : sessionStorage;
  const inactiveStorage = rememberMe ? sessionStorage : localStorage;

  activeStorage.setItem(key, value);
  inactiveStorage.removeItem(key);
};

const removeAuthItems = (...keys: string[]) => {
  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

const getStringPreference = (
  preferences: Record<string, unknown> | undefined,
  key: string,
  fallback: string
) => (typeof preferences?.[key] === 'string' ? String(preferences[key]) : fallback);

const applyParentAppearance = (parentProfile: Parent | null, isParentRoute = false) => {
  const appearance = parentProfile?.appearancePreferences;
  const theme = getStringPreference(appearance, 'theme', 'light') === 'dark' ? 'dark' : 'light';
  const colorTheme = getStringPreference(appearance, 'colorTheme', 'Teal');

  document.documentElement.classList.remove('dark');
  document.documentElement.dataset.parentTheme = isParentRoute ? theme : 'light';
  document.documentElement.dataset.parentColorTheme = colorTheme;
};

function JournalDetailRoute({
  childName,
  childAvatar,
  childId,
  onBack,
  onNavigate,
  onLogout,
}: {
  childName: string;
  childAvatar?: string;
  childId?: string;
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}) {
  const { entryId } = useParams();

  return (
    <JournalDetailScreen
      onBack={onBack}
      childName={childName}
      childAvatar={childAvatar}
      childId={childId}
      onNavigate={onNavigate}
      onLogout={onLogout}
      entryId={entryId || ''}
    />
  );
}

export function ScreenNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [child, setChild] = useState<Child | null>(() => {
    const saved = getStoredItem('charmchime_child');
    return saved ? JSON.parse(saved) : null;
  });
  const [parent, setParent] = useState<Parent | null>(() => {
    const saved = getStoredItem('charmchime_parent');
    const savedParent = saved ? JSON.parse(saved) : null;
    applyParentAppearance(savedParent, window.location.pathname.startsWith('/parent'));
    return savedParent;
  });
  const [linkedChildren, setLinkedChildren] = useState<Child[]>([]);
  const [, setUserType] = useState<'child' | 'parent' | null>(null);

  useEffect(() => {
    const token = getStoredItem('charmchime_child_token');

    if (!token) return;

    api.children
      .me()
      .then(({ child: freshChild }) => {
        setChild(freshChild);
        const rememberMe = Boolean(localStorage.getItem('charmchime_child_token'));
        setAuthItem('charmchime_child', JSON.stringify(freshChild), rememberMe);
      })
      .catch(() => {
        // Keep the cached profile so existing navigation stays usable.
      });
  }, []);

  useEffect(() => {
    const token = getStoredItem('charmchime_parent_token');

    if (!token) return;

    api.parents
      .me()
      .then(({ parent: freshParent }) => {
        setParent(freshParent);
        const rememberMe = Boolean(localStorage.getItem('charmchime_parent_token'));
        setAuthItem('charmchime_parent', JSON.stringify(freshParent), rememberMe);
        applyParentAppearance(freshParent, location.pathname.startsWith('/parent'));
      })
      .catch(() => {
        // Keep the cached profile so existing navigation stays usable.
      });
  }, []);

  useEffect(() => {
    const token = getStoredItem('charmchime_parent_token');

    if (!token || !parent) {
      setLinkedChildren([]);
      return;
    }

    api.parents
      .children()
      .then(({ children }) => setLinkedChildren(children))
      .catch(() => setLinkedChildren([]));
  }, [parent]);

  const goTo = (path: string) => {
    navigate(path);
  };

  const handleChildLogin = async (name: string, pin: string, rememberMe: boolean) => {
    try {
      const data = await api.auth.childLogin({ name, pin });
      setChild(data.child);
      setAuthItem('charmchime_child', JSON.stringify(data.child), rememberMe);
      setAuthItem('charmchime_child_token', data.token, rememberMe);
      setUserType('child');
      goTo('/child/home');
    } catch (error) {
      const context = getOtpRequiredContext(error, {
        userType: 'child',
        email: '',
      });

      if (context?.email) {
        saveOtpContext(context);
        navigate('/verify-otp', { state: context });
        return;
      }

      throw error;
    }
  };

  const handleChildRegister = async (name: string, email: string, age: string, pin: string) => {
    await api.auth.childSignup({ name, email, age, pin, confirmPin: pin });
    const context: OtpContext = { userType: 'child', email };
    saveOtpContext(context);
    navigate('/verify-otp', { state: context });
  };

  const handleParentLogin = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const data = await api.auth.parentLogin({ email, password });
      setParent(data.parent);
      setAuthItem('charmchime_parent', JSON.stringify(data.parent), rememberMe);
      setAuthItem('charmchime_parent_token', data.token, rememberMe);
      applyParentAppearance(data.parent, true);
      setUserType('parent');
      goTo('/parent/dashboard');
    } catch (error) {
      const context = getOtpRequiredContext(error, {
        userType: 'parent',
        email,
      });

      if (context?.email) {
        saveOtpContext(context);
        navigate('/verify-otp', { state: context });
        return;
      }

      throw error;
    }
  };

  const handleParentRegister = async (name: string, email: string, password: string) => {
    await api.auth.parentSignup({
      fullName: name,
      email,
      password,
      confirmPassword: password,
    });
    const context: OtpContext = { userType: 'parent', email };
    saveOtpContext(context);
    navigate('/verify-otp', { state: context });
  };

  const handleChildRequestPinReset = async (name: string, email: string) => {
    await api.auth.forgotPassword({
      userType: 'child',
      name,
      email,
    });
  };

  const handleChildResetPin = async (name: string, email: string, otp: string, pin: string) => {
    await api.auth.resetPassword({
      userType: 'child',
      name,
      email,
      otp,
      pin,
      confirmPin: pin,
    });
  };

  const handleParentRequestPasswordReset = async (email: string) => {
    await api.auth.forgotPassword({
      userType: 'parent',
      email,
    });
  };

  const handleParentResetPassword = async (email: string, otp: string, password: string) => {
    await api.auth.resetPassword({
      userType: 'parent',
      email,
      otp,
      password,
      confirmPassword: password,
    });
  };

  const handleParentThemeToggle = async () => {
    if (!parent) return;

    const currentTheme =
      getStringPreference(parent.appearancePreferences, 'theme', 'light') === 'dark' ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const rememberMe = Boolean(localStorage.getItem('charmchime_parent_token'));
    const nextParent: Parent = {
      ...parent,
      appearancePreferences: {
        ...(parent.appearancePreferences || {}),
        theme: nextTheme,
      },
    };

    setParent(nextParent);
    setAuthItem('charmchime_parent', JSON.stringify(nextParent), rememberMe);
    applyParentAppearance(nextParent, true);

    try {
      const { parent: savedParent } = await api.parents.updateMe({
        appearancePreferences: nextParent.appearancePreferences,
      });

      setParent(savedParent);
      setAuthItem('charmchime_parent', JSON.stringify(savedParent), rememberMe);
      applyParentAppearance(savedParent, true);
    } catch (error) {
      setParent(parent);
      setAuthItem('charmchime_parent', JSON.stringify(parent), rememberMe);
      applyParentAppearance(parent, true);
      throw error;
    }
  };

  const handleSaveEntry = () => {
    goTo('/child/home');
  };

  const handleLogout = async () => {
    const logoutRequests: Promise<unknown>[] = [];

    if (getStoredItem('charmchime_child_token')) {
      logoutRequests.push(api.auth.logout('child'));
    }

    if (getStoredItem('charmchime_parent_token')) {
      logoutRequests.push(api.auth.logout('parent'));
    }

    if (logoutRequests.length) {
      await Promise.allSettled(logoutRequests);
    }

    setUserType(null);
    setChild(null);
    setParent(null);
    setLinkedChildren([]);
    removeAuthItems(
      'charmchime_child',
      'charmchime_parent',
      'charmchime_child_token',
      'charmchime_parent_token'
    );
    sessionStorage.removeItem(OTP_CONTEXT_STORAGE_KEY);
    applyParentAppearance(null);
    goTo('/landing');
  };

  const handleOtpVerified = (verifiedUserType: 'parent' | 'child') => {
    setUserType(null);
    setChild(null);
    setParent(null);
    setLinkedChildren([]);
    removeAuthItems(
      'charmchime_child',
      'charmchime_parent',
      'charmchime_child_token',
      'charmchime_parent_token'
    );
    applyParentAppearance(null);
    goTo(verifiedUserType === 'parent' ? '/parent/auth' : '/child/auth');
  };

  const handleChildNavigation = (page: string) => {
    const path = childRoutes[page];

    if (path) {
      goTo(path);
    }
  };

  const handleParentNavigation = (page: string) => {
    const path = parentRoutes[page];

    if (path) {
      goTo(path);
    }
  };

  const handleChildProfileUpdated = useCallback((updatedChild: Child) => {
    setChild(updatedChild);
    const rememberMe = Boolean(localStorage.getItem('charmchime_child_token'));
    setAuthItem('charmchime_child', JSON.stringify(updatedChild), rememberMe);
  }, []);

  const handleParentProfileUpdated = useCallback((updatedParent: Parent) => {
    setParent(updatedParent);
    const rememberMe = Boolean(localStorage.getItem('charmchime_parent_token'));
    setAuthItem('charmchime_parent', JSON.stringify(updatedParent), rememberMe);
    applyParentAppearance(updatedParent, location.pathname.startsWith('/parent'));
  }, [location.pathname]);

  const handleParentChildrenChanged = useCallback((children: Child[]) => {
    setLinkedChildren(children);
  }, []);

  useEffect(() => {
    applyParentAppearance(parent, location.pathname.startsWith('/parent'));
  }, [location.pathname, parent]);

  const childDisplayName = child?.name || 'Friend';
  const childAvatar = child?.avatar;
  const parentChildName =
    linkedChildren[0]?.nickname || linkedChildren[0]?.name || child?.name || 'your child';
  const parentChildAvatar = linkedChildren[0]?.avatar || child?.avatar;
  const parentTheme =
    getStringPreference(parent?.appearancePreferences, 'theme', 'light') === 'dark' ? 'dark' : 'light';

  return (
    <Routes>
      <Route
        path="/"
        element={<IntroLandingPage onGetStarted={() => goTo('/landing')} />}
      />
      <Route
        path="/landing"
        element={
          <LandingPage
            onSelectChild={() => goTo('/child/auth')}
            onSelectParent={() => goTo('/parent/auth')}
          />
        }
      />
      <Route
        path="/child/auth"
        element={
          <ChildAuthScreen
            onLogin={handleChildLogin}
            onRegister={handleChildRegister}
            onRequestPinReset={handleChildRequestPinReset}
            onResetPin={handleChildResetPin}
            onBack={() => goTo('/landing')}
          />
        }
      />
      <Route
        path="/child/home"
        element={
          <ChildHomeScreenRedesigned
            childName={childDisplayName}
            childAvatar={childAvatar}
            childId={child?.id}
            onNewEntry={() => goTo('/child/journal-entry')}
            onViewMemories={() => goTo('/child/memories')}
            onStoryMode={() => goTo('/child/story-mode')}
            onCalendar={() => goTo('/child/calendar')}
            onAchievements={() => goTo('/child/achievements')}
            onSettings={() => goTo('/child/settings')}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/child/journal-entry"
        element={
          <JournalEntryScreen
            onBack={() => goTo('/child/home')}
            onSave={handleSaveEntry}
            childName={childDisplayName}
            childAvatar={childAvatar}
            childId={child?.id}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/child/story-mode"
        element={
          <StoryModeScreen
            onBack={() => goTo('/child/home')}
            childName={childDisplayName}
            childAvatar={childAvatar}
            childId={child?.id}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/child/memories"
        element={
          <MemoriesScreen
            onBack={() => goTo('/child/home')}
            childName={childDisplayName}
            childAvatar={childAvatar}
            childId={child?.id}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
            onViewEntry={(entryId) => goTo(`/child/journal-detail/${entryId}`)}
          />
        }
      />
      <Route
        path="/child/journal-detail/:entryId"
        element={
          <JournalDetailRoute
            onBack={() => goTo('/child/memories')}
            childName={childDisplayName}
            childAvatar={childAvatar}
            childId={child?.id}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/child/journal-detail"
        element={<Navigate to="/child/journal-detail/1" replace />}
      />
      <Route
        path="/child/calendar"
        element={
          <CalendarScreen
            onBack={() => goTo('/child/home')}
            childName={childDisplayName}
            childAvatar={childAvatar}
            childId={child?.id}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/child/achievements"
        element={
          <AchievementsScreen
            onBack={() => goTo('/child/home')}
            childName={childDisplayName}
            childAvatar={childAvatar}
            childId={child?.id}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/child/settings"
        element={
          <ChildSettingsScreen
            onBack={() => goTo('/child/home')}
            childName={childDisplayName}
            childAvatar={childAvatar}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
            onProfileUpdated={handleChildProfileUpdated}
          />
        }
      />
      <Route
        path="/parent/auth"
        element={
          <ParentAuthScreen
            onLogin={handleParentLogin}
            onRegister={handleParentRegister}
            onRequestPasswordReset={handleParentRequestPasswordReset}
            onResetPassword={handleParentResetPassword}
            onBack={() => goTo('/landing')}
          />
        }
      />
      <Route
        path="/verify-otp"
        element={
          <VerifyOtpScreen
            onBack={() => goTo('/landing')}
            onVerified={handleOtpVerified}
          />
        }
      />
      <Route
        path="/parent/dashboard"
        element={
          <ParentDashboardRedesigned
            childName={parentChildName}
            childAvatar={parentChildAvatar}
            parentId={parent?.id}
            theme={parentTheme}
            onThemeToggle={handleParentThemeToggle}
            onLogout={handleLogout}
            onSettings={() => goTo('/parent/settings')}
            onNavigate={handleParentNavigation}
          />
        }
      />
      <Route
        path="/parent/settings"
        element={
          <ParentSettingsScreen
            onBack={() => goTo('/parent/dashboard')}
            theme={parentTheme}
            onThemeToggle={handleParentThemeToggle}
            onProfileUpdated={handleParentProfileUpdated}
          />
        }
      />
      <Route
        path="/parent/analytics"
        element={
          <ParentAnalyticsScreen
            childName={parentChildName}
            childAvatar={parentChildAvatar}
            parentId={parent?.id}
            theme={parentTheme}
            onThemeToggle={handleParentThemeToggle}
            onNavigate={handleParentNavigation}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/parent/insights"
        element={
          <ParentInsightsScreen
            childName={parentChildName}
            childAvatar={parentChildAvatar}
            parentId={parent?.id}
            theme={parentTheme}
            onThemeToggle={handleParentThemeToggle}
            onNavigate={handleParentNavigation}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/parent/activity"
        element={
          <ParentActivityScreen
            childName={parentChildName}
            childAvatar={parentChildAvatar}
            parentId={parent?.id}
            theme={parentTheme}
            onThemeToggle={handleParentThemeToggle}
            onNavigate={handleParentNavigation}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/parent/reports"
        element={
          <ParentReportsScreen
            childName={parentChildName}
            childAvatar={parentChildAvatar}
            parentId={parent?.id}
            theme={parentTheme}
            onThemeToggle={handleParentThemeToggle}
            onNavigate={handleParentNavigation}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/parent/notifications"
        element={
          <ParentNotificationsScreen
            childName={parentChildName}
            childAvatar={parentChildAvatar}
            parentId={parent?.id}
            theme={parentTheme}
            onThemeToggle={handleParentThemeToggle}
            onNavigate={handleParentNavigation}
            onLogout={handleLogout}
            onProfileUpdated={handleParentProfileUpdated}
          />
        }
      />
      <Route
        path="/parent/children"
        element={
          <ParentChildrenScreen
            childName={parentChildName}
            childAvatar={parentChildAvatar}
            theme={parentTheme}
            onThemeToggle={handleParentThemeToggle}
            onNavigate={handleParentNavigation}
            onLogout={handleLogout}
            onChildrenChanged={handleParentChildrenChanged}
          />
        }
      />
      <Route path="/child" element={<Navigate to="/child/home" replace />} />
      <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}
