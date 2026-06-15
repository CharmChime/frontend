import React, { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { LogoutConfirmation } from "../components/LogoutConfirmation";
import {
  Shield,
  Home,
  Users,
  BarChart,
  FileText,
  Bell,
  Settings,
  LogOut,
  Activity,
  TrendingUp,
  Calendar,
  CheckCircle,
  Heart,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import logo from "../assets/35160e99e546074153c34366a831aa0e30d421e6.png";
import { api } from "../services/api";
import { ParentChildSelector } from "../components/ParentChildSelector";
import { useParentChildSelection } from "../hooks/useParentChildSelection";
import { LoadingState } from "../components/LoadingState";

interface ParentDashboardRedesignedProps {
  childName: string;
  parentId?: string;
  onLogout: () => void;
  onSettings?: () => void;
  onNavigate?: (page: string) => void;
}

export function ParentDashboardRedesigned({
  childName,
  parentId,
  onLogout,
  onSettings,
  onNavigate,
}: ParentDashboardRedesignedProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showLogoutConfirm, setShowLogoutConfirm] =
    useState(false);
  const [overview, setOverview] = useState<any | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const {
    children,
    selectedChild,
    selectedChildId,
    setSelectedChildId,
    isLoadingChildren,
    childrenError,
    hasNoLinkedChildren,
  } = useParentChildSelection();

  useEffect(() => {
    if (!parentId || isLoadingChildren || hasNoLinkedChildren) return;

    const params = { childId: selectedChildId || undefined };
    setIsLoadingDashboard(true);
    Promise.all([
      api.dashboard.overview(parentId, params),
      api.dashboard.analytics(parentId, params),
    ])
      .then(([overviewData, analyticsData]) => {
        setOverview(overviewData);
        setAnalytics(analyticsData);
      })
      .catch(() => {
        setOverview(null);
        setAnalytics(null);
      })
      .finally(() => setIsLoadingDashboard(false));
  }, [parentId, selectedChildId, isLoadingChildren, hasNoLinkedChildren]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const handleNavigation = (page: string) => {
    setActiveTab(page);
    if (page === "settings" && onSettings) {
      onSettings();
    } else if (page === "overview") {
      // Already on overview
    } else if (onNavigate) {
      onNavigate(page);
    }
  };

  const displayedChildName = selectedChild?.nickname || selectedChild?.name || childName;
  const hasJournalData = (overview?.totalJournals || 0) > 0;
  const hasMoodData = overview?.moodSummary?.status === "available";
  const isParentDataLoading = isLoadingChildren || isLoadingDashboard;
  const moodColors: Record<string, string> = {
    happy: "#ffe8a3",
    calm: "#b8f4d3",
    excited: "#ffd4c4",
    creative: "#e1d4f7",
    sad: "#cbd5e1",
    neutral: "#cbd5e1",
    unknown: "#e5e7eb",
  };

  const weeklyMoodData = (analytics?.weeklyMoodPattern || []).map((day: any) => {
    const row: Record<string, string | number> = {
      day: String(day.day || "").slice(0, 3),
      happy: 0,
      calm: 0,
      excited: 0,
      sad: 0,
    };
    (day.moods || []).forEach((item: any) => {
      row[item.mood] = item.count;
    });
    return row;
  });

  const moodDistribution = (overview?.moodSummary?.moodDistribution || []).map((item: any) => ({
    name: item.mood,
    value: item.count,
    color: moodColors[item.mood] || "#e5e7eb",
  }));

  const activityTrend = (analytics?.writingActivity?.weeklyActivity || []).map((item: any) => ({
    week: item.label,
    entries: item.count,
  }));

  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart className="w-5 h-5" />,
    },
    {
      id: "children",
      label: "Children",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: "reports",
      label: "Reports",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--parent-bg)] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col flex-shrink-0">
        {/* Logo/Brand Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={logo}
              alt="CharmChime Logo"
              className="w-12 h-12 object-contain"
            />
            <div className="flex-1">
              <h3 className="text-[#2d3748]">CharmChime</h3>
              <p className="text-xs text-[#64748b]">
                Parent Portal
              </p>
            </div>
          </div>

          {/* Child Info */}
          <div className="bg-[var(--parent-teal)]/10 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[var(--child-peach)] flex items-center justify-center">
                <span className="text-xl">👦</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#2d3748] truncate">
                  Monitoring
                </p>
                <p className="text-xs text-[#64748b]">
                  {displayedChildName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${
                  activeTab === item.id
                    ? "bg-[var(--parent-teal)] text-white shadow-md"
                    : "text-[#64748b] hover:bg-gray-50"
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#64748b] hover:bg-gray-50 transition-colors">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
            <Badge variant="parent-teal" className="ml-auto">
              3
            </Badge>
          </button>
          <button
            onClick={() => handleNavigation("settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#64748b] hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#64748b] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[#2d3748]">
                  Parent Dashboard
                </h1>
                <p className="text-[#64748b] mt-1">
                  Monitor {displayedChildName}'s emotional wellbeing and
                  journaling activity
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ParentChildSelector
                  childrenList={children}
                  selectedChildId={selectedChildId}
                  onChange={setSelectedChildId}
                  isLoading={isLoadingChildren}
                />
                <Badge variant="parent-teal">
                  All Systems Normal
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {(childrenError || hasNoLinkedChildren) && (
            <Card variant="parent">
              <p className="text-[#64748b]">
                {childrenError || "No linked child accounts found yet. Link a child account to see dashboard data."}
              </p>
            </Card>
          )}

          {isParentDataLoading ? (
            <LoadingState message="Loading dashboard data..." variant="parent" />
          ) : (
            <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="parent" padding="medium">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-[#64748b]">
                    Total Entries
                  </p>
                  <h3 className="text-[#2d3748]">{overview?.totalJournals || 0}</h3>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{overview?.recentJournalCount || 0} recent</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[var(--parent-teal)]/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-[var(--parent-teal)]" />
                </div>
              </div>
            </Card>

            <Card variant="parent" padding="medium">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-[#64748b]">
                    Active Streak
                  </p>
                  <h3 className="text-[#2d3748]">{overview?.totalStories || 0}</h3>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>stories</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card variant="parent" padding="medium">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-[#64748b]">
                    Overall Mood
                  </p>
                  <h3 className="text-[#2d3748] capitalize">{overview?.moodSummary?.dominantSentiment || "Not available"}</h3>
                  <div className="flex items-center gap-1 text-sm text-[var(--parent-teal)]">
                    <Heart className="w-4 h-4" />
                    <span>{overview?.moodSummary?.totalAnalyzedJournals || 0} analyzed</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <span className="text-2xl">😊</span>
                </div>
              </div>
            </Card>

            <Card variant="parent" padding="medium">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-[#64748b]">
                    Last Active
                  </p>
                  <h3 className="text-[#2d3748]">{overview?.lastActiveAt ? new Date(overview.lastActiveAt).toLocaleDateString() : "No activity"}</h3>
                  <div className="flex items-center gap-1 text-sm text-[#64748b]">
                    <Activity className="w-4 h-4" />
                    <span>Last active</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Status Alert */}
          <Card variant="parent">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-[#2d3748] mb-1">
                  All Systems Normal
                </h4>
                <p className="text-[#64748b]">
                  {hasJournalData
                    ? `${displayedChildName} has ${overview?.totalJournals || 0} journal entries included in this view.`
                    : "No journal data is available for this child yet."}
                </p>
              </div>
            </div>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mood Distribution */}
            <Card variant="parent">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#2d3748]">
                    Mood Distribution
                  </h3>
                  <Badge variant="parent-teal">
                    Last 30 days
                  </Badge>
                </div>
                <div
                  className="w-full"
                  style={{ height: "256px" }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={moodDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {moodDistribution.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-[#64748b]">
                  {hasMoodData ? "Mood data is based on analyzed journal entries." : "No mood data is available yet."}
                </p>
              </div>
            </Card>

            {/* Weekly Activity */}
            <Card variant="parent">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#2d3748]">
                    Weekly Mood Patterns
                  </h3>
                  <Badge variant="parent-teal">This Week</Badge>
                </div>
                <div
                  className="w-full"
                  style={{ height: "256px" }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <RechartsBarChart data={weeklyMoodData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="happy"
                        fill="#ffe8a3"
                        name="Happy"
                      />
                      <Bar
                        dataKey="calm"
                        fill="#b8f4d3"
                        name="Calm"
                      />
                      <Bar
                        dataKey="excited"
                        fill="#ffd4c4"
                        name="Excited"
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-[#64748b]">
                  {hasMoodData ? "Weekly patterns come from backend mood analysis." : "Mood patterns will appear after journal analysis."}
                </p>
              </div>
            </Card>
          </div>

          {/* Activity Trend */}
          <Card variant="parent">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[#2d3748]">
                  Journal Entry Frequency
                </h3>
                <Badge variant="parent-teal">
                  Monthly Trend
                </Badge>
              </div>
              <div
                className="w-full"
                style={{ height: "256px" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="entries"
                      stroke="#2d9caf"
                      strokeWidth={3}
                      name="Entries per Week"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-[#64748b]">
                {hasJournalData ? "Journal frequency comes from linked child data." : "No journal activity is available yet."}
              </p>
            </div>
          </Card>
            </>
          )}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        variant="parent"
      />
    </div>
  );
}
