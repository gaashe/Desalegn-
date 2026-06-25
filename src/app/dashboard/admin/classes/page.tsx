"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import { Search } from "lucide-react";

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
  subject: string;
  teacherName: string;
  schedule: string;
  room: string;
  capacity: number;
  studentCount: number;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then(setClasses);
  }, []);

  const filtered = classes.filter(
    (c) =>
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase()) ||
      c.teacherName?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "name", label: "Class" },
    { key: "subject", label: "Subject" },
    { key: "teacherName", label: "Teacher" },
    { key: "schedule", label: "Schedule" },
    { key: "room", label: "Room" },
    { key: "studentCount", label: "Students", render: (c: ClassInfo) => `${c.studentCount}/${c.capacity}` },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        <p className="text-gray-500 text-sm mt-1">{classes.length} classes</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-900"
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No classes found" />
    </div>
  );
}
