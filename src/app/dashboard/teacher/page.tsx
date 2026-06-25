"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import StatsCard from "@/components/ui/StatsCard";
import Badge from "@/components/ui/Badge";
import { BookOpen, Users, ClipboardCheck, BarChart3, Bell, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
  subject: string;
  schedule: string;
  room: string;
  studentCount: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
  authorName: string;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (!user) return;

    fetch("/api/teachers")
      .then((r) => r.json())
      .then((teachers) => {
        const teacher = teachers.find((t: { userId: string }) => t.userId === user.userId);
        if (teacher) {
          fetch(`/api/classes?teacherId=${teacher.id}`)
            .then((r) => r.json())
            .then(setClasses);
        }
      });

    fetch("/api/announcements?role=teacher")
      .then((r) => r.json())
      .then((data) => setAnnouncements(data.slice(0, 5)));
  }, [user]);

  const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);

  const priorityVariant = (p: string) => {
    if (p === "urgent") return "danger" as const;
    if (p === "high") return "warning" as const;
    return "info" as const;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="My Classes" value={classes.length} icon={BookOpen} color="emerald" />
        <StatsCard title="Total Students" value={totalStudents} icon={Users} color="blue" />
        <StatsCard title="Attendance" value="Track" icon={ClipboardCheck} color="amber" subtitle="Record daily" />
        <StatsCard title="Grades" value="Manage" icon={BarChart3} color="purple" subtitle="Enter scores" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">My Classes</h3>
          <div className="space-y-3">
            {classes.map((cls) => (
              <div key={cls.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{cls.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {cls.schedule}
                      </span>
                      <span>Room: {cls.room}</span>
                    </div>
                  </div>
                  <Badge variant="info">{cls.studentCount} students</Badge>
                </div>
              </div>
            ))}
            {classes.length === 0 && (
              <p className="text-center text-gray-400 py-4">No classes assigned</p>
            )}
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
