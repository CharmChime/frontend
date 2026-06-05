import React, { useState } from 'react';
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

function JournalDetailRoute({
  childName,
  onBack,
  onNavigate,
  onLogout,
}: {
  childName: string;
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}) {
  const { entryId } = useParams();
  const parsedEntryId = Number(entryId);

  return (
    <JournalDetailScreen
      onBack={onBack}
      childName={childName}
      onNavigate={onNavigate}
      onLogout={onLogout}
      entryId={Number.isFinite(parsedEntryId) ? parsedEntryId : 1}
    />
  );
}

export function ScreenNavigation() {
  const navigate = useNavigate();
  const [childName, setChildName] = useState('');
  const [, setUserType] = useState<'child' | 'parent' | null>(null);

  const goTo = (path: string) => {
    navigate(path);
  };

  const handleChildLogin = (name: string, pin: string) => {
    setChildName(name);
    setUserType('child');
    goTo('/child/home');
  };

  const handleChildRegister = (name: string, age: string, pin: string) => {
    setChildName(name);
    setUserType('child');
    goTo('/child/home');
  };

  const handleParentLogin = (email: string, password: string) => {
    setUserType('parent');
    goTo('/parent/dashboard');
  };

  const handleParentRegister = (name: string, email: string, password: string) => {
    setUserType('parent');
    goTo('/parent/dashboard');
  };

  const handleSaveEntry = (entry: { title: string; content: string; mood: string }) => {
    console.log('Entry saved:', entry);
    goTo('/child/home');
  };

  const handleLogout = () => {
    setUserType(null);
    setChildName('');
    goTo('/landing');
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

  const childDisplayName = childName || 'Friend';
  const parentChildName = childName || 'Emma';

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
            childName={childName}
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
        path="/parent/dashboard"
        element={
          <ParentDashboardRedesigned
            childName={parentChildName}
            onLogout={handleLogout}
            onSettings={() => goTo('/parent/settings')}
            onNavigate={handleParentNavigation}
          />
        }
      />
      <Route
        path="/parent/settings"
        element={<ParentSettingsScreen onBack={() => goTo('/parent/dashboard')} />}
      />
      <Route
        path="/parent/analytics"
        element={
          <ParentAnalyticsScreen
            childName={parentChildName}
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
