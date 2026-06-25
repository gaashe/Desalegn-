"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/ui/Badge";
import { Check, X, Clock, AlertCircle, Save } from "lucide-react";

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
}

interface AttendanceEntry {
  studentId: string;
  status: "present" | "absent" | "late" | "excused";
}

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/teachers")
      .then((r) => r.json())
      .then((teachers) => {
        const teacher = teachers.find((t: { userId: string }) => t.userId === user.userId);
        if (teacher) {
          fetch(`/api/classes?teacherId=${teacher.id}`)
            .then((r) => r.json())
            .then((data) => {
              setClasses(data);
              if (data.length > 0) setSelectedClass(data[0].id);
            });
        }
      });
  }, [user]);

  useEffect(() => {
    if (!selectedClass) return;
    const cls = classes.find((c) => c.id === selectedClass);
    if (!cls) return;

    fetch(`/api/students?grade=${cls.grade}&section=${cls.section}`)
      .then((r) => r.json())
      .then(setStudents);

    fetch(`/api/attendance?classId=${selectedClass}&date=${date}`)
      .then((r) => r.json())
      .then((records) => {
        const att: Record<string, string> = {};
        records.forEach((r: { studentId: string; status: string }) => {
          att[r.studentId] = r.status;
        });
        setAttendance(att);
      });
  }, [selectedClass, date, classes]);

  const setStatus = (studentId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      classId: selectedClass,
      date,
      status,
    }));

    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records }),
    });

    setSaving(false);
    setSaved(true);
  };

  const statusButtons = [
    { value: "present", label: "Present", icon: Check, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { value: "absent", label: "Absent", icon: X, color: "text-rose-600 bg-rose-50 border-rose-200" },
    { value: "late", label: "Late", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { value: "excused", label: "Excused", icon: AlertCircle, color: "text-blue-600 bg-blue-50 border-blue-200" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Take Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Mark attendance for your classes</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || Object.keys(attendance).length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors text-sm disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Attendance"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
        >
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {students.map((student) => (
            <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900 text-sm">{student.name}</p>
                <p className="text-xs text-gray-400">{student.rollNumber}</p>
              </div>
              <div className="flex gap-2">
                {statusButtons.map((btn) => {
                  const Icon = btn.icon;
                  const isActive = attendance[student.id] === btn.value;
                  return (
                    <button
                      key={btn.value}
                      onClick={() => setStatus(student.id, btn.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isActive ? btn.color + " ring-2 ring-offset-1" : "text-gray-400 bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <Icon size={14} />
                      <span className="hidden sm:inline">{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <p className="text-center text-gray-400 py-8">Select a class to view students</p>
          )}
        </div>
      </div>
    </div>
  );
}
