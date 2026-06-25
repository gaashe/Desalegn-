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

interface Child {
  id: string;
  name: string;
}

export default function ParentGradesPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [grades, setGrades] = useState<GradeRecord[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/students")
      .then((r) => r.json())
      .then((students) => {
        const kids = students.filter((s: { parentId: string }) => s.parentId === user.userId);
        setChildren(kids);
        if (kids.length > 0) setSelectedChild(kids[0].id);
      });
  }, [user]);

  useEffect(() => {
    if (!selectedChild) return;
    fetch(`/api/grades?studentId=${selectedChild}`)
      .then((r) => r.json())
      .then(setGrades);
  }, [selectedChild]);

  const gradeVariant = (g: string) => {
    if (g === "A") return "success" as const;
    if (g === "B") return "info" as const;
    if (g === "C") return "warning" as const;
    return "danger" as const;
  };

  const avgPct = grades.length > 0
    ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length)
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
        <h1 className="text-2xl font-bold text-gray-900">Academic Progress</h1>
        <p className="text-gray-500 text-sm mt-1">View your child&apos;s grades and performance</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
        >
          {children.map((child) => (
            <option key={child.id} value={child.id}>{child.name}</option>
          ))}
        </select>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm text-emerald-700 font-medium">
          Average: {avgPct}%
        </div>
      </div>

      <DataTable columns={columns} data={grades} emptyMessage="No grade records" />
    </div>
  );
}
