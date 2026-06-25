"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Plus } from "lucide-react";

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
}

interface GradeRecord {
  id: string;
  studentName: string;
  className: string;
  subject: string;
  examType: string;
  score: number;
  maxScore: number;
  grade: string;
  date: string;
}

interface Student {
  id: string;
  name: string;
}

export default function TeacherGradesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    examType: "Quiz 1",
    score: 0,
    maxScore: 20,
    grade: "A",
  });

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
    fetch(`/api/grades?classId=${selectedClass}`)
      .then((r) => r.json())
      .then(setGrades);

    const cls = classes.find((c) => c.id === selectedClass);
    if (cls) {
      fetch(`/api/students?grade=${cls.grade}&section=${cls.section}`)
        .then((r) => r.json())
        .then(setStudents);
    }
  }, [selectedClass, classes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, classId: selectedClass }),
    });
    setShowModal(false);
    fetch(`/api/grades?classId=${selectedClass}`)
      .then((r) => r.json())
      .then(setGrades);
  }

  const gradeVariant = (g: string) => {
    if (g === "A") return "success" as const;
    if (g === "B") return "info" as const;
    if (g === "C") return "warning" as const;
    return "danger" as const;
  };

  const columns = [
    { key: "studentName", label: "Student" },
    { key: "examType", label: "Exam" },
    { key: "score", label: "Score", render: (g: GradeRecord) => `${g.score}/${g.maxScore}` },
    {
      key: "grade",
      label: "Grade",
      render: (g: GradeRecord) => <Badge variant={gradeVariant(g.grade)}>{g.grade}</Badge>,
    },
    { key: "date", label: "Date" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Management</h1>
          <p className="text-gray-500 text-sm mt-1">Record and manage student grades</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors text-sm"
        >
          <Plus size={18} />
          Add Grade
        </button>
      </div>

      <div className="mb-6">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
        >
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={grades} emptyMessage="No grades recorded yet" />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Grade">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select
              required
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
              <select
                value={form.examType}
                onChange={(e) => setForm({ ...form, examType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
              >
                <option>Quiz 1</option>
                <option>Midterm</option>
                <option>Quiz 2</option>
                <option>Final</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
              >
                {["A", "B", "C", "D", "F"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
              <input
                type="number"
                required
                value={form.score}
                onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
              <input
                type="number"
                required
                value={form.maxScore}
                onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium">Save Grade</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
