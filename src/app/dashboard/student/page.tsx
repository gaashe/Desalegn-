"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import StatsCard from "@/components/ui/StatsCard";
import Badge from "@/components/ui/Badge";
import { BookOpen, ClipboardCheck, BarChart3, CreditCard, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface StudentInfo {
  id: string;
  grade: string;
  section: string;
  rollNumber: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [grades, setGrades] = useState<{ grade: string; score: number; maxScore: number; examType: string; subject: string }[]>([]);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string; priority: string; createdAt: string }[]>([]);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [fees, setFees] = useState<{ total: number; paid: number; pending: number }>({ total: 0, paid: 0, pending: 0 });

  useEffect(() => {
    if (!user) return;

    fetch("/api/students")
      .then((r) => r.json())
      .then((students) => {
        const s = students.find((st: { userId: string }) => st.userId === user.userId);
        if (s) {
          setStudent(s);
          fetch(`/api/grades?studentId=${s.id}`).then((r) => r.json()).then(setGrades);
          fetch(`/api/attendance?studentId=${s.id}`).then((r) => r.json()).then((records) => {
            if (records.length > 0) {
              const present = records.filter((r: { status: string }) => r.status === "present" || r.status === "late").length;
              setAttendanceRate(Math.round((present / records.length) * 100));
            }
          });
          fetch(`/api/fees?studentId=${s.id}`).then((r) => r.json()).then((feeRecords) => {
            const total = feeRecords.reduce((s: number, f: { amount: number }) => s + f.amount, 0);
            const paid = feeRecords.filter((f: { status: string }) => f.status === "paid").reduce((s: number, f: { amount: number }) => s + f.amount, 0);
            setFees({ total, paid, pending: total - paid });
          });
        }
      });

    fetch("/api/announcements?role=student").then((r) => r.json()).then((data) => setAnnouncements(data.slice(0, 5)));
  }, [user]);

  const avgScore = grades.length > 0
    ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length)
    : 0;

  const priorityVariant = (p: string) => {
    if (p === "urgent") return "danger" as const;
    if (p === "high") return "warning" as const;
    return "info" as const;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        {student && (
          <p className="text-sm text-emerald-600 mt-1">Grade {student.grade} - Section {student.section} | Roll No: {student.rollNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="My Classes" value={grades.length > 0 ? new Set(grades.map((g) => g.subject)).size : 0} icon={BookOpen} color="emerald" />
        <StatsCard title="Attendance" value={`${attendanceRate}%`} icon={ClipboardCheck} color="blue" />
        <StatsCard title="Avg Score" value={`${avgScore}%`} icon={BarChart3} color="purple" />
        <StatsCard title="Pending Fees" value={`${fees.pending.toLocaleString()} ETB`} icon={CreditCard} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Grades</h3>
          <div className="space-y-3">
            {grades.slice(0, 6).map((g, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 border border-gray-100 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{g.subject}</p>
                  <p className="text-xs text-gray-500">{g.examType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{g.score}/{g.maxScore}</p>
                  <Badge variant={g.grade === "A" ? "success" : g.grade === "B" ? "info" : g.grade === "C" ? "warning" : "danger"}>{g.grade}</Badge>
                </div>
              </div>
            ))}
            {grades.length === 0 && <p className="text-center text-gray-400 py-4">No grades yet</p>}
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
