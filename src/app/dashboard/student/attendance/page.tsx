"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  className: string;
  date: string;
  status: string;
  remarks: string;
}

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/students")
      .then((r) => r.json())
      .then((students) => {
        const s = students.find((st: { userId: string }) => st.userId === user.userId);
        if (s) {
          fetch(`/api/attendance?studentId=${s.id}`)
            .then((r) => r.json())
            .then(setRecords);
        }
      });
  }, [user]);

  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  const statusVariant = (s: string) => {
    if (s === "present") return "success" as const;
    if (s === "absent") return "danger" as const;
    if (s === "late") return "warning" as const;
    return "info" as const;
  };

  const columns = [
    { key: "className", label: "Class" },
    { key: "date", label: "Date", render: (r: AttendanceRecord) => formatDate(r.date) },
    {
      key: "status",
      label: "Status",
      render: (r: AttendanceRecord) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge>,
    },
    { key: "remarks", label: "Remarks" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Track your attendance records</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{rate}%</p>
          <p className="text-xs text-gray-500 mt-1">Attendance Rate</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{present}</p>
          <p className="text-xs text-gray-500 mt-1">Present</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-rose-600">{absent}</p>
          <p className="text-xs text-gray-500 mt-1">Absent</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{late}</p>
          <p className="text-xs text-gray-500 mt-1">Late</p>
        </div>
      </div>

      <DataTable columns={columns} data={records} emptyMessage="No attendance records" />
    </div>
  );
}
