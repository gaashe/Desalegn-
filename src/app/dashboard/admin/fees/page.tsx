"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { Search, Filter } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface FeeRecord {
  id: string;
  studentName: string;
  grade: string;
  section: string;
  rollNumber: string;
  type: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  paymentMethod?: string;
}

export default function FeesPage() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetch("/api/fees")
      .then((r) => r.json())
      .then(setFees);
  }, []);

  const filtered = fees.filter((f) => {
    const matchesSearch =
      !search ||
      f.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      f.rollNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusVariant = (s: string) => {
    if (s === "paid") return "success" as const;
    if (s === "pending") return "warning" as const;
    if (s === "overdue") return "danger" as const;
    return "info" as const;
  };

  const totalAmount = filtered.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = filtered.filter((f) => f.status === "paid").reduce((sum, f) => sum + f.amount, 0);

  const columns = [
    { key: "studentName", label: "Student" },
    { key: "rollNumber", label: "Roll No." },
    { key: "type", label: "Fee Type" },
    { key: "amount", label: "Amount", render: (f: FeeRecord) => formatCurrency(f.amount) },
    { key: "dueDate", label: "Due Date", render: (f: FeeRecord) => formatDate(f.dueDate) },
    { key: "paidDate", label: "Paid Date", render: (f: FeeRecord) => (f.paidDate ? formatDate(f.paidDate) : "-") },
    {
      key: "status",
      label: "Status",
      render: (f: FeeRecord) => <Badge variant={statusVariant(f.status)}>{f.status}</Badge>,
    },
    { key: "paymentMethod", label: "Method" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Total: {formatCurrency(totalAmount)} | Collected: {formatCurrency(paidAmount)}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-900"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={filtered.slice(0, 100)} emptyMessage="No fee records found" />
    </div>
  );
}
