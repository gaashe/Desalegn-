"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  studentName: string;
  className: string;
  date: string;
  status: string;
  remarks: string;
}

interface Child {
  id: string;
  name: string;
}

export default function ParentAttendancePage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

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
    fetch(`/api/attendance?studentId=${selectedChild}`)
      .then((r) => r.json())
      .then(setRecords);
  }, [selectedChild]);

  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const rate = total > 0 ? Math.round(((present + records.filter((r) => r.status === "late").length) / total) * 100) : 0;

  const statusVariant = (s: string) => {
    if (s === "present") return "success" as const;
    if (s === "absent") return "danger" as const;
    if (s === "late") return "warning" as const;
    return "info" as const;
  };

  const columns = [
    { key: "className", label: "Class" },
    { key: "date", label: "Date", render: (r: AttendanceRecord) => formatDate(r.date) },
    { key: "status", label: "Status", render: (r: AttendanceRecord) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
    { key: "remarks", label: "Remarks" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Track your child&apos;s attendance</p>
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

        <div className="flex gap-2">
          <Badge variant="success">Present: {present}</Badge>
          <Badge variant="danger">Absent: {absent}</Badge>
          <Badge variant="info">Rate: {rate}%</Badge>
        </div>
      </div>

      <DataTable columns={columns} data={records} emptyMessage="No attendance records" />
    </div>
  );
}
