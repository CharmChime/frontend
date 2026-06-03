import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';
import { BarChart3, TrendingUp, Heart, Calendar, Settings, Bell, Shield, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ParentDashboardProps {
  childName: string;
}

export function ParentDashboard({ childName }: ParentDashboardProps) {
  // Mock data for charts
  const weeklyMoodData = [
    { day: 'Mon', happy: 3, calm: 1, excited: 2, sad: 0 },
    { day: 'Tue', happy: 4, calm: 2, excited: 1, sad: 0 },
    { day: 'Wed', happy: 2, calm: 3, excited: 2, sad: 1 },
    { day: 'Thu', happy: 5, calm: 1, excited: 3, sad: 0 },
    { day: 'Fri', happy: 4, calm: 2, excited: 4, sad: 0 },
    { day: 'Sat', happy: 3, calm: 4, excited: 2, sad: 0 },
    { day: 'Sun', happy: 4, calm: 3, excited: 1, sad: 0 },
  ];

  const moodDistribution = [
    { name: 'Happy', value: 45, color: '#ffe8a3' },
    { name: 'Calm', value: 25, color: '#b8f4d3' },
    { name: 'Excited', value: 20, color: '#ffd4c4' },
    { name: 'Creative', value: 7, color: '#e1d4f7' },
    { name: 'Sad', value: 3, color: '#cbd5e1' },
  ];

  const activityTrend = [
    { week: 'Week 1', entries: 5 },
    { week: 'Week 2', entries: 7 },
    { week: 'Week 3', entries: 6 },
    { week: 'Week 4', entries: 8 },
  ];

  return (
    <div className="min-h-screen bg-[var(--parent-bg)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--parent-teal)] flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-[#2d3748]">Parent Dashboard</h2>
                <p className="text-sm text-[#64748b]">Monitoring {childName}'s wellbeing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IconButton variant="parent-slate" size="medium">
                <Bell className="w-5 h-5" />
              </IconButton>
              <IconButton variant="parent-slate" size="medium">
                <Settings className="w-5 h-5" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="parent" padding="medium">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-[#64748b]">Total Entries</p>
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
                <p className="text-sm text-[#64748b]">Active Streak</p>
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
                <p className="text-sm text-[#64748b]">Overall Mood</p>
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
                <p className="text-sm text-[#64748b]">Last Active</p>
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

        {/* Alerts/Notifications */}
        <Card variant="parent">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-[#2d3748] mb-1">All Systems Normal</h4>
              <p className="text-[#64748b]">
                {childName} has been consistently journaling and showing positive emotional trends. No concerns detected.
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
                <h3 className="text-[#2d3748]">Mood Distribution</h3>
                <Badge variant="parent-teal">Last 30 days</Badge>
              </div>
              <div className="h-64 min-h-[16rem] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {moodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-[#64748b]">
                Predominantly positive moods detected, with healthy emotional variety.
              </p>
            </div>
          </Card>

          {/* Weekly Activity */}
          <Card variant="parent">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[#2d3748]">Weekly Mood Patterns</h3>
                <Badge variant="parent-teal">This Week</Badge>
              </div>
              <div className="h-64 min-h-[16rem] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyMoodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="happy" fill="#ffe8a3" name="Happy" />
                    <Bar dataKey="calm" fill="#b8f4d3" name="Calm" />
                    <Bar dataKey="excited" fill="#ffd4c4" name="Excited" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-[#64748b]">
                Consistent positive engagement throughout the week.
              </p>
            </div>
          </Card>
        </div>

        {/* Activity Trend */}
        <Card variant="parent">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[#2d3748]">Journal Entry Frequency</h3>
              <Badge variant="parent-teal">Monthly Trend</Badge>
            </div>
            <div className="h-64 min-h-[16rem] w-full">
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
              Increasing engagement trend shows growing comfort with journaling.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}