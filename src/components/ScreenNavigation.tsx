import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router';
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

function JournalDetailRoute({
  childName,
  childId,
  onBack,
  onNavigate,
  onLogout,
}: {
  childName: string;
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
      childId={childId}
      onNavigate={onNavigate}
      onLogout={onLogout}
      entryId={entryId || ''}
    />
  );
}

export function ScreenNavigation() {
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(() => {
    const saved = localStorage.getItem('charmchime_child');
    return saved ? JSON.parse(saved) : null;
  });
  const [parent, setParent] = useState<Parent | null>(() => {
    const saved = localStorage.getItem('charmchime_parent');
    return saved ? JSON.parse(saved) : null;
  });
  const [linkedChildren, setLinkedChildren] = useState<Child[]>([]);
  const [, setUserType] = useState<'child' | 'parent' | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('charmchime_child_token');

    if (!token) return;

    api.children
      .me()
      .then(({ child: freshChild }) => {
        setChild(freshChild);
        localStorage.setItem('charmchime_child', JSON.stringify(freshChild));
      })
      .catch(() => {
        // Keep the cached profile so existing navigation stays usable.
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('charmchime_parent_token');

    if (!token) return;

    api.parents
      .me()
      .then(({ parent: freshParent }) => {
        setParent(freshParent);
        localStorage.setItem('charmchime_parent', JSON.stringify(freshParent));
      })
      .catch(() => {
        // Keep the cached profile so existing navigation stays usable.
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('charmchime_parent_token');

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

  const handleChildLogin = async (name: string, pin: string) => {
    try {
      const data = await api.auth.childLogin({ name, pin });
      setChild(data.child);
      localStorage.setItem('charmchime_child', JSON.stringify(data.child));
      localStorage.setItem('charmchime_child_token', data.token);
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

  const handleParentLogin = async (email: string, password: string) => {
    try {
      const data = await api.auth.parentLogin({ email, password });
      setParent(data.parent);
      localStorage.setItem('charmchime_parent', JSON.stringify(data.parent));
      localStorage.setItem('charmchime_parent_token', data.token);
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

  const handleSaveEntry = () => {
    goTo('/child/home');
  };

  const handleLogout = async () => {
    const logoutRequests: Promise<unknown>[] = [];

    if (localStorage.getItem('charmchime_child_token')) {
      logoutRequests.push(api.auth.logout('child'));
    }

    if (localStorage.getItem('charmchime_parent_token')) {
      logoutRequests.push(api.auth.logout('parent'));
    }

    if (logoutRequests.length) {
      await Promise.allSettled(logoutRequests);
    }

    setUserType(null);
    setChild(null);
    setParent(null);
    setLinkedChildren([]);
    localStorage.removeItem('charmchime_child');
    localStorage.removeItem('charmchime_parent');
    localStorage.removeItem('charmchime_child_token');
    localStorage.removeItem('charmchime_parent_token');
    sessionStorage.removeItem(OTP_CONTEXT_STORAGE_KEY);
    goTo('/landing');
  };

  const handleOtpVerified = (verifiedUserType: 'parent' | 'child') => {
    setUserType(null);
    setChild(null);
    setParent(null);
    setLinkedChildren([]);
    localStorage.removeItem('charmchime_child');
    localStorage.removeItem('charmchime_parent');
    localStorage.removeItem('charmchime_child_token');
    localStorage.removeItem('charmchime_parent_token');
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
    localStorage.setItem('charmchime_child', JSON.stringify(updatedChild));
  }, []);

  const handleParentProfileUpdated = useCallback((updatedParent: Parent) => {
    setParent(updatedParent);
    localStorage.setItem('charmchime_parent', JSON.stringify(updatedParent));
  }, []);

  const childDisplayName = child?.name || 'Friend';
  const parentChildName =
    linkedChildren[0]?.nickname || linkedChildren[0]?.name || child?.name || 'your child';

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
            onBack={() => goTo('/landing')}
          />
        }
      />
      <Route
        path="/child/home"
        element={
          <ChildHomeScreenRedesigned
            childName={childDisplayName}
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
            parentId={parent?.id}
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
            onProfileUpdated={handleParentProfileUpdated}
          />
        }
      />
      <Route
        path="/parent/analytics"
        element={
          <ParentAnalyticsScreen
            childName={parentChildName}
            parentId={parent?.id}
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
            parentId={parent?.id}
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
            parentId={parent?.id}
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
            parentId={parent?.id}
            onNavigate={handleParentNavigation}
            onLogout={handleLogout}
          />
        }
      />
      <Route path="/child" element={<Navigate to="/child/home" replace />} />
      <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}
