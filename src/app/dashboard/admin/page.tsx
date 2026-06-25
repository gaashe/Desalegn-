"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/ui/StatsCard";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  UserCheck,
  TrendingUp,
  Bell,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  attendanceRate: number;
  gradeDistribution: Record<string, number>;
  attendanceTrend: { date: string; day: string; rate: number; present: number; total: number }[];
  feeStatusCounts: { paid: number; pending: number; overdue: number };
  recentAnnouncements: { id: string; title: string; priority: string; createdAt: string; authorName: string }[];
  totalParents: number;
}

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const gradeData = Object.entries(stats.gradeDistribution).map(([name, value]) => ({
    name,
    students: value,
  }));

  const feeData = [
    { name: "Paid", value: stats.feeStatusCounts.paid },
    { name: "Pending", value: stats.feeStatusCounts.pending },
    { name: "Overdue", value: stats.feeStatusCounts.overdue },
  ];

  const priorityVariant = (p: string) => {
    if (p === "urgent") return "danger" as const;
    if (p === "high") return "warning" as const;
    if (p === "medium") return "info" as const;
    return "default" as const;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to Bshewam School Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="emerald"
          subtitle="Active students"
        />
        <StatsCard
          title="Total Teachers"
          value={stats.totalTeachers}
          icon={GraduationCap}
          color="blue"
          subtitle="Active teachers"
        />
        <StatsCard
          title="Total Classes"
          value={stats.totalClasses}
          icon={BookOpen}
          color="purple"
          subtitle="This semester"
        />
        <StatsCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={UserCheck}
          color="amber"
          subtitle="Today"
        />
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Total Fees"
          value={formatCurrency(stats.totalFees)}
          icon={CreditCard}
          color="indigo"
        />
        <StatsCard
          title="Collected"
          value={formatCurrency(stats.paidFees)}
          icon={TrendingUp}
          color="emerald"
        />
        <StatsCard
          title="Pending"
          value={formatCurrency(stats.pendingFees)}
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attendance Trend */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Attendance Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Fee Collection Status</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={feeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {feeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Students by Grade</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-emerald-600" />
            <h3 className="font-semibold text-gray-900">Recent Announcements</h3>
          </div>
          <div className="space-y-3">
            {stats.recentAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-gray-900">{ann.title}</h4>
                  <Badge variant={priorityVariant(ann.priority)}>
                    {ann.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {ann.authorName} &middot; {formatDate(ann.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
