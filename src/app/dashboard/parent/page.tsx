"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import StatsCard from "@/components/ui/StatsCard";
import Badge from "@/components/ui/Badge";
import { Users, ClipboardCheck, BarChart3, CreditCard, Bell } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Child {
  id: string;
  name: string;
  grade: string;
  section: string;
  rollNumber: string;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string; priority: string; createdAt: string }[]>([]);
  const [totalFees, setTotalFees] = useState(0);
  const [pendingFees, setPendingFees] = useState(0);

  useEffect(() => {
    if (!user) return;

    fetch("/api/students")
      .then((r) => r.json())
      .then((students) => {
        const parentId = user.userId;
        const kids = students.filter((s: { parentId: string }) => s.parentId === parentId);
        setChildren(kids);

        let total = 0;
        let pending = 0;
        kids.forEach((kid: { id: string }) => {
          fetch(`/api/fees?studentId=${kid.id}`)
            .then((r) => r.json())
            .then((fees) => {
              const t = fees.reduce((s: number, f: { amount: number }) => s + f.amount, 0);
              const p = fees.filter((f: { status: string }) => f.status !== "paid").reduce((s: number, f: { amount: number }) => s + f.amount, 0);
              total += t;
              pending += p;
              setTotalFees(total);
              setPendingFees(pending);
            });
        });
      });

    fetch("/api/announcements?role=parent")
      .then((r) => r.json())
      .then((data) => setAnnouncements(data.slice(0, 5)));
  }, [user]);

  const priorityVariant = (p: string) => {
    if (p === "urgent") return "danger" as const;
    if (p === "high") return "warning" as const;
    return "info" as const;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Children" value={children.length} icon={Users} color="emerald" />
        <StatsCard title="Attendance" value="View" icon={ClipboardCheck} color="blue" subtitle="Track daily" />
        <StatsCard title="Grades" value="View" icon={BarChart3} color="purple" subtitle="Academic progress" />
        <StatsCard title="Pending Fees" value={formatCurrency(pendingFees)} icon={CreditCard} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Children */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">My Children</h3>
          <div className="space-y-3">
            {children.map((child) => (
              <div key={child.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{child.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Roll No: {child.rollNumber}</p>
                </div>
                <Badge variant="info">Grade {child.grade}-{child.section}</Badge>
              </div>
            ))}
            {children.length === 0 && <p className="text-center text-gray-400 py-4">No children linked</p>}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-emerald-600" />
            <h3 className="font-semibold text-gray-900">Announcements</h3>
          </div>
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-gray-900">{ann.title}</h4>
                  <Badge variant={priorityVariant(ann.priority)}>{ann.priority}</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ann.content}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDate(ann.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
