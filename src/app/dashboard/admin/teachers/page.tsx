"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  experience: number;
  salary: number;
  status: string;
  classCount: number;
  classes: string[];
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/teachers")
      .then((r) => r.json())
      .then(setTeachers);
  }, []);

  const filtered = teachers.filter(
    (t) =>
      !search ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "name", label: "Name" },
    { key: "subject", label: "Subject" },
    { key: "qualification", label: "Qualification" },
    { key: "experience", label: "Experience", render: (t: Teacher) => `${t.experience} years` },
    { key: "classCount", label: "Classes" },
    { key: "salary", label: "Salary", render: (t: Teacher) => formatCurrency(t.salary) },
    {
      key: "status",
      label: "Status",
      render: (t: Teacher) => (
        <Badge variant={t.status === "active" ? "success" : "warning"}>
          {t.status}
        </Badge>
      ),
    },
    { key: "email", label: "Email" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
        <p className="text-gray-500 text-sm mt-1">{teachers.length} total teachers</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-900"
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No teachers found" />
    </div>
  );
}
