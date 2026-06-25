"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { Search, Filter } from "lucide-react";

interface GradeRecord {
  id: string;
  studentName: string;
  className: string;
  subject: string;
  examType: string;
  score: number;
  maxScore: number;
  grade: string;
  semester: string;
  date: string;
  remarks: string;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("");

  useEffect(() => {
    fetch("/api/grades")
      .then((r) => r.json())
      .then(setGrades);
  }, []);

  const filtered = grades.filter((g) => {
    const matchesSearch =
      !search ||
      g.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      g.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesExam = !examFilter || g.examType === examFilter;
    return matchesSearch && matchesExam;
  });

  const gradeVariant = (g: string) => {
    if (g === "A") return "success" as const;
    if (g === "B") return "info" as const;
    if (g === "C") return "warning" as const;
    return "danger" as const;
  };

  const columns = [
    { key: "studentName", label: "Student" },
    { key: "subject", label: "Subject" },
    { key: "examType", label: "Exam" },
    { key: "score", label: "Score", render: (g: GradeRecord) => `${g.score}/${g.maxScore}` },
    {
      key: "grade",
      label: "Grade",
      render: (g: GradeRecord) => <Badge variant={gradeVariant(g.grade)}>{g.grade}</Badge>,
    },
    { key: "semester", label: "Semester" },
    { key: "remarks", label: "Remarks" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grade Records</h1>
        <p className="text-gray-500 text-sm mt-1">{grades.length} total records</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-900"
          >
            <option value="">All Exams</option>
            <option value="Quiz 1">Quiz 1</option>
            <option value="Midterm">Midterm</option>
            <option value="Quiz 2">Quiz 2</option>
            <option value="Final">Final</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={filtered.slice(0, 100)} emptyMessage="No grade records found" />
    </div>
  );
}
