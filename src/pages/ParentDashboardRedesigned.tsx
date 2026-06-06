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

  useEffect(() => {
    if (!parentId) return;

    api.dashboard.overview(parentId).then(setOverview).catch(() => setOverview(null));
    api.dashboard.analytics(parentId).then(setAnalytics).catch(() => setAnalytics(null));
  }, [parentId]);

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

  const weeklyMoodData = analytics?.weeklyMoodPattern?.length ? analytics.weeklyMoodPattern : [
    { day: "Mon", happy: 3, calm: 1, excited: 2, sad: 0 },
    { day: "Tue", happy: 4, calm: 2, excited: 1, sad: 0 },
    { day: "Wed", happy: 2, calm: 3, excited: 2, sad: 1 },
    { day: "Thu", happy: 5, calm: 1, excited: 3, sad: 0 },
    { day: "Fri", happy: 4, calm: 2, excited: 4, sad: 0 },
    { day: "Sat", happy: 3, calm: 4, excited: 2, sad: 0 },
    { day: "Sun", happy: 4, calm: 3, excited: 1, sad: 0 },
  ];

  const moodDistribution = overview?.moodSummary?.data?.length ? overview.moodSummary.data : [
    { name: "Happy", value: 45, color: "#ffe8a3" },
    { name: "Calm", value: 25, color: "#b8f4d3" },
    { name: "Excited", value: 20, color: "#ffd4c4" },
    { name: "Creative", value: 7, color: "#e1d4f7" },
    { name: "Sad", value: 3, color: "#cbd5e1" },
  ];

  const activityTrend = analytics?.writingActivity?.weeklyActivity?.length ? analytics.writingActivity.weeklyActivity : [
    { week: "Week 1", entries: 5 },
    { week: "Week 2", entries: 7 },
    { week: "Week 3", entries: 6 },
    { week: "Week 4", entries: 8 },
  ];

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
                  {childName}
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
                  Monitor {childName}'s emotional wellbeing and
                  journaling activity
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="parent-teal">
                  All Systems Normal
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="parent" padding="medium">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-[#64748b]">
                    Total Entries
                  </p>
                  <h3 className="text-[#2d3748]">142</h3>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12 this week</span>
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
                  <h3 className="text-[#2d3748]">7 days</h3>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Excellent!</span>
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
                  <h3 className="text-[#2d3748]">Positive</h3>
                  <div className="flex items-center gap-1 text-sm text-[var(--parent-teal)]">
                    <Heart className="w-4 h-4" />
                    <span>8.2/10 avg</span>
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
                  <h3 className="text-[#2d3748]">2h ago</h3>
                  <div className="flex items-center gap-1 text-sm text-[#64748b]">
                    <Activity className="w-4 h-4" />
                    <span>Recent entry</span>
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
                  {childName} has been consistently journaling
                  and showing positive emotional trends. No
                  concerns detected.
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
                  Predominantly positive moods detected, with
                  healthy emotional variety.
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
                  Consistent positive engagement throughout the
                  week.
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
                Increasing engagement trend shows growing
                comfort with journaling.
              </p>
            </div>
          </Card>
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
