import React, { useState } from 'react';
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

type Screen = 
  | 'intro'
  | 'landing'
  | 'child-auth'
  | 'child-home'
  | 'journal-entry'
  | 'story-mode'
  | 'memories'
  | 'journal-detail'
  | 'calendar'
  | 'achievements'
  | 'child-settings'
  | 'parent-auth'
  | 'parent-dashboard'
  | 'parent-settings'
  | 'parent-analytics'
  | 'parent-insights'
  | 'parent-activity'
  | 'parent-reports';

export function ScreenNavigation() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('intro');
  const [childName, setChildName] = useState('');
  const [userType, setUserType] = useState<'child' | 'parent' | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<number>(1);

  const handleChildLogin = (name: string, pin: string) => {
    setChildName(name);
    setUserType('child');
    setCurrentScreen('child-home');
  };

  const handleChildRegister = (name: string, age: string, pin: string) => {
    setChildName(name);
    setUserType('child');
    setCurrentScreen('child-home');
  };

  const handleParentLogin = (email: string, password: string) => {
    setUserType('parent');
    setCurrentScreen('parent-dashboard');
  };

  const handleParentRegister = (name: string, email: string, password: string) => {
    setUserType('parent');
    setCurrentScreen('parent-dashboard');
  };

  const handleSaveEntry = (entry: { title: string; content: string; mood: string }) => {
    console.log('Entry saved:', entry);
    setCurrentScreen('child-home');
  };

  const handleLogout = () => {
    setUserType(null);
    setChildName('');
    setCurrentScreen('landing');
  };

  const handleLogoClick = () => {
    setCurrentScreen('landing');
  };

  // Helper function to map sidebar navigation to screen names
  const handleChildNavigation = (page: string) => {
    const pageMap: { [key: string]: Screen } = {
      'home': 'child-home',
      'entry': 'journal-entry',
      'story-mode': 'story-mode',
      'memories': 'memories',
      'calendar': 'calendar',
      'achievements': 'achievements',
      'settings': 'child-settings',
    };
    
    const screen = pageMap[page];
    if (screen) {
      setCurrentScreen(screen);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'intro':
        return (
          <IntroLandingPage 
            onGetStarted={() => setCurrentScreen('landing')}
          />
        );
      
      case 'landing':
        return (
          <LandingPage 
            onSelectChild={() => setCurrentScreen('child-auth')}
            onSelectParent={() => setCurrentScreen('parent-auth')}
          />
        );
      
      case 'child-auth':
        return (
          <ChildAuthScreen
            onLogin={handleChildLogin}
            onRegister={handleChildRegister}
            onBack={() => setCurrentScreen('landing')}
          />
        );
      
      case 'child-home':
        return (
          <ChildHomeScreenRedesigned
            childName={childName}
            onNewEntry={() => setCurrentScreen('journal-entry')}
            onViewMemories={() => setCurrentScreen('memories')}
            onStoryMode={() => setCurrentScreen('story-mode')}
            onCalendar={() => setCurrentScreen('calendar')}
            onAchievements={() => setCurrentScreen('achievements')}
            onSettings={() => setCurrentScreen('child-settings')}
            onLogout={handleLogout}
          />
        );
      
      case 'journal-entry':
        return (
          <JournalEntryScreen
            onBack={() => setCurrentScreen('child-home')}
            onSave={handleSaveEntry}
            childName={childName}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
          />
        );
      
      case 'story-mode':
        return (
          <StoryModeScreen 
            onBack={() => setCurrentScreen('child-home')} 
            childName={childName}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
          />
        );
      
      case 'memories':
        return (
          <MemoriesScreen 
            onBack={() => setCurrentScreen('child-home')} 
            childName={childName}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
            onViewEntry={(entryId) => {
              setSelectedEntryId(entryId);
              setCurrentScreen('journal-detail');
            }}
          />
        );
      
      case 'journal-detail':
        return (
          <JournalDetailScreen 
            onBack={() => setCurrentScreen('memories')} 
            childName={childName}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
            entryId={selectedEntryId}
          />
        );
      
      case 'calendar':
        return (
          <CalendarScreen 
            onBack={() => setCurrentScreen('child-home')} 
            childName={childName}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
          />
        );
      
      case 'achievements':
        return (
          <AchievementsScreen 
            onBack={() => setCurrentScreen('child-home')} 
            childName={childName}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
          />
        );
      
      case 'child-settings':
        return (
          <ChildSettingsScreen 
            onBack={() => setCurrentScreen('child-home')} 
            childName={childName}
            onNavigate={handleChildNavigation}
            onLogout={handleLogout}
          />
        );
      
      case 'parent-auth':
        return (
          <ParentAuthScreen
            onLogin={handleParentLogin}
            onRegister={handleParentRegister}
            onBack={() => setCurrentScreen('landing')}
          />
        );
      
      case 'parent-dashboard':
        return (
          <ParentDashboardRedesigned 
            childName={childName || 'Emma'} 
            onLogout={handleLogout}
            onSettings={() => setCurrentScreen('parent-settings')}
            onNavigate={(page) => setCurrentScreen(`parent-${page}` as Screen)}
          />
        );
      
      case 'parent-settings':
        return <ParentSettingsScreen onBack={() => setCurrentScreen('parent-dashboard')} />;
      
      case 'parent-analytics':
        return (
          <ParentAnalyticsScreen 
            childName={childName || 'Emma'} 
            onNavigate={(page) => setCurrentScreen(`parent-${page}` as Screen)}
            onLogout={handleLogout}
          />
        );
      
      case 'parent-insights':
        return (
          <ParentInsightsScreen 
            childName={childName || 'Emma'} 
            onNavigate={(page) => setCurrentScreen(`parent-${page}` as Screen)}
            onLogout={handleLogout}
          />
        );
      
      case 'parent-activity':
        return (
          <ParentActivityScreen 
            childName={childName || 'Emma'} 
            onNavigate={(page) => setCurrentScreen(`parent-${page}` as Screen)}
            onLogout={handleLogout}
          />
        );
      
      case 'parent-reports':
        return (
          <ParentReportsScreen 
            childName={childName || 'Emma'} 
            onNavigate={(page) => setCurrentScreen(`parent-${page}` as Screen)}
            onLogout={handleLogout}
          />
        );
      
      default:
        return (
          <LandingPage 
            onSelectChild={() => setCurrentScreen('child-auth')}
            onSelectParent={() => setCurrentScreen('parent-auth')}
          />
        );
    }
  };

  return <div>{renderScreen()}</div>;
}