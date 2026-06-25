"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { Filter } from "lucide-react";

interface AttendanceRecord {
  id: string;
  studentName: string;
  className: string;
  rollNumber: string;
  date: string;
  status: string;
  remarks?: string;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetch(`/api/attendance?date=${dateFilter}`)
      .then((r) => r.json())
      .then(setRecords);
  }, [dateFilter]);

  const statusVariant = (s: string) => {
    if (s === "present") return "success" as const;
    if (s === "absent") return "danger" as const;
    if (s === "late") return "warning" as const;
    return "info" as const;
  };

  const columns = [
    { key: "rollNumber", label: "Roll No." },
    { key: "studentName", label: "Student" },
    { key: "className", label: "Class" },
    { key: "date", label: "Date" },
    {
      key: "status",
      label: "Status",
      render: (r: AttendanceRecord) => (
        <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
      ),
    },
    { key: "remarks", label: "Remarks" },
  ];

  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const lateCount = records.filter((r) => r.status === "late").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
        <p className="text-gray-500 text-sm mt-1">{records.length} records for selected date</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-900"
          />
        </div>
        <div className="flex gap-3">
          <Badge variant="success">Present: {presentCount}</Badge>
          <Badge variant="danger">Absent: {absentCount}</Badge>
          <Badge variant="warning">Late: {lateCount}</Badge>
        </div>
      </div>

      <DataTable columns={columns} data={records} emptyMessage="No attendance records for this date" />
    </div>
  );
}
