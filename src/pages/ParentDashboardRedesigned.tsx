import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { LogoutConfirmation } from "../components/LogoutConfirmation";
import {
  Calendar,
  CheckCircle,
  Heart,
  BarChart3,
  TrendingUp,
  Activity,
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
import { api, type Child } from "../services/api";
import { ParentThemeToggle } from "../components/ParentThemeToggle";
import { ParentSidebar } from "../components/ParentSidebar";
import { ParentDashboardLoader } from "../components/PageLoaders";

interface ParentDashboardRedesignedProps {
  childName: string;
  childAvatar?: string;
  parentName?: string;
  children?: Child[];
  selectedChildId?: string;
  onSelectChild?: (childId: string) => void;
  parentId?: string;
  theme?: "light" | "dark";
  onThemeToggle?: () => Promise<void>;
  onLogout: () => void;
  onSettings?: () => void;
  onNavigate?: (page: string) => void;
}

export function ParentDashboardRedesigned({
  childName,
  childAvatar,
  parentName,
  children,
  selectedChildId,
  onSelectChild,
  parentId,
  theme = "light",
  onThemeToggle,
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

  // Save and load last selected child
  useEffect(() => {
    if (selectedChildId) {
      localStorage.setItem('lastSelectedChildId', selectedChildId);
    }
  }, [selectedChildId]);

  useEffect(() => {
    if (!parentId) return;

    setOverview(null);
    setAnalytics(null);
    setIsLoadingDashboard(true);
    const scope = { childId: selectedChildId };

    Promise.all([
      api.dashboard.overview(parentId, scope),
      api.dashboard.analytics(parentId, scope),
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
  }, [parentId, selectedChildId]);

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

  const moodColors = ["#ffe8a3", "#b8f4d3", "#ffd4c4", "#e1d4f7", "#cbd5e1"];
  const weeklyMoodPattern = Array.isArray(analytics?.weeklyMoodPattern)
    ? analytics.weeklyMoodPattern
    : [];
  const weeklyActivity = Array.isArray(analytics?.writingActivity?.weeklyActivity)
    ? analytics.writingActivity.weeklyActivity
    : [];
  const moodSummaryDistribution = Array.isArray(overview?.moodSummary?.moodDistribution)
    ? overview.moodSummary.moodDistribution
    : [];
  const weeklyMoodData = useMemo(
    () =>
      weeklyMoodPattern.map((day: any) => {
        const row: Record<string, string | number> = { day: day.day };
        const moods = Array.isArray(day.moods) ? day.moods : [];
        moods.forEach((item: any) => {
          row[item.mood] = item.count;
        });
        return row;
      }),
    [weeklyMoodPattern]
  );
  const moodKeys = useMemo(
    () => Array.from(new Set(weeklyMoodData.flatMap((row) => Object.keys(row).filter((key) => key !== "day")))),
    [weeklyMoodData]
  );
  const moodDistribution = moodSummaryDistribution.map((item: any, index: number) => ({
    name: item.mood,
    value: item.count,
    color: moodColors[index % moodColors.length],
  }));
  const activityTrend = weeklyActivity.map((item: any) => ({
    week: item.label,
    entries: item.count,
  }));
  const dominantMood = overview?.moodSummary?.overallMood || "Not available";
  const lastActiveLabel = overview?.lastActiveAt
    ? new Date(overview.lastActiveAt).toLocaleString()
    : "No activity yet";

  return (
    <div className="min-h-screen bg-[var(--parent-bg)] flex">
      <ParentSidebar
        childName={childName}
        childAvatar={childAvatar}
        parentName={parentName}
        children={children}
        selectedChildId={selectedChildId}
        onSelectChild={onSelectChild}
        activeItem={activeTab}
        onNavigate={handleNavigation}
        onLogout={() => setShowLogoutConfirm(true)}
        onLogoClick={() => handleNavigation("overview")}
      />

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
                  Monitor {childName}'s emotional wellbeing and
                  journaling activity
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ParentThemeToggle theme={theme} onThemeToggle={onThemeToggle} />
                <Badge variant="parent-teal">{isLoadingDashboard ? "Loading" : "Live data"}</Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {isLoadingDashboard ? (
            <ParentDashboardLoader childName={childName} />
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
                    Stories Created
                  </p>
                  <h3 className="text-[#2d3748]">{overview?.totalStories || 0}</h3>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>{overview?.recentStoryCount || 0} recent</span>
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
                  <h3 className="text-[#2d3748]">{dominantMood}</h3>
                  <div className="flex items-center gap-1 text-sm text-[var(--parent-teal)]">
                    <Heart className="w-4 h-4" />
                    <span>{overview?.moodSummary?.dominantSentiment || "No sentiment"}</span>
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
                  <h3 className="text-[#2d3748]">{lastActiveLabel}</h3>
                  <div className="flex items-center gap-1 text-sm text-[#64748b]">
                    <Activity className="w-4 h-4" />
                    <span>Last activity</span>
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
                  Dashboard Summary
                </h4>
                <p className="text-[#64748b]">
                  {overview
                    ? `${childName} has ${overview.totalJournals || 0} journal entries and ${overview.totalStories || 0} generated stories in the current dashboard view.`
                    : "Loading parent dashboard data..."}
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
                  {moodDistribution.length ? (
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
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#64748b]">
                      No shared mood data available yet.
                    </div>
                  )}
                </div>
                <p className="text-sm text-[#64748b]">
                  {moodDistribution.length
                    ? "Generated from shared mood analysis data."
                    : "Mood details may be unavailable because there is no analyzed data yet or sharing is disabled."}
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
                  {weeklyMoodData.length && moodKeys.length ? (
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
                      {moodKeys.map((mood, index) => (
                        <Bar key={mood} dataKey={mood} fill={moodColors[index % moodColors.length]} name={mood} />
                      ))}
                    </RechartsBarChart>
                  </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#64748b]">
                      No weekly mood pattern available yet.
                    </div>
                  )}
                </div>
                <p className="text-sm text-[#64748b]">
                  Generated from shared mood patterns.
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
                {activityTrend.length ? (
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
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#64748b]">
                    No journal activity trend available yet.
                  </div>
                )}
              </div>
              <p className="text-sm text-[#64748b]">
                Generated from recent journal activity.
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
