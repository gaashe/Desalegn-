"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";

interface GradeRecord {
  id: string;
  subject: string;
  examType: string;
  score: number;
  maxScore: number;
  grade: string;
  semester: string;
  remarks: string;
}

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch("/api/students")
      .then((r) => r.json())
      .then((students) => {
        const s = students.find((st: { userId: string }) => st.userId === user.userId);
        if (s) {
          fetch(`/api/grades?studentId=${s.id}`)
            .then((r) => r.json())
            .then(setGrades);
        }
      });
  }, [user]);

  const gradeVariant = (g: string) => {
    if (g === "A") return "success" as const;
    if (g === "B") return "info" as const;
    if (g === "C") return "warning" as const;
    return "danger" as const;
  };

  const filtered = filter ? grades.filter((g) => g.examType === filter) : grades;

  const avgPct = filtered.length > 0
    ? Math.round(filtered.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / filtered.length)
    : 0;

  const columns = [
    { key: "subject", label: "Subject" },
    { key: "examType", label: "Exam" },
    { key: "score", label: "Score", render: (g: GradeRecord) => `${g.score}/${g.maxScore}` },
    { key: "percentage", label: "%", render: (g: GradeRecord) => `${Math.round((g.score / g.maxScore) * 100)}%` },
    { key: "grade", label: "Grade", render: (g: GradeRecord) => <Badge variant={gradeVariant(g.grade)}>{g.grade}</Badge> },
    { key: "semester", label: "Semester" },
    { key: "remarks", label: "Remarks" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
        <p className="text-gray-500 text-sm mt-1">View your academic performance</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
        >
          <option value="">All Exams</option>
          <option>Quiz 1</option>
          <option>Midterm</option>
          <option>Quiz 2</option>
          <option>Final</option>
        </select>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm text-emerald-700 font-medium">
          Average: {avgPct}%
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No grades available" />
    </div>
  );
}
