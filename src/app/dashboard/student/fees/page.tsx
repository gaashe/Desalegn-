"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { formatDate, formatCurrency } from "@/lib/utils";

interface FeeRecord {
  id: string;
  feeType: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: string;
  paymentMethod: string | null;
}

export default function StudentFeesPage() {
  const { user } = useAuth();
  const [fees, setFees] = useState<FeeRecord[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/students")
      .then((r) => r.json())
      .then((students) => {
        const s = students.find((st: { userId: string }) => st.userId === user.userId);
        if (s) {
          fetch(`/api/fees?studentId=${s.id}`)
            .then((r) => r.json())
            .then(setFees);
        }
      });
  }, [user]);

  const totalAmount = fees.reduce((s, f) => s + f.amount, 0);
  const paidAmount = fees.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

  const statusVariant = (s: string) => {
    if (s === "paid") return "success" as const;
    if (s === "pending") return "warning" as const;
    return "danger" as const;
  };

  const columns = [
    { key: "feeType", label: "Fee Type" },
    { key: "amount", label: "Amount", render: (f: FeeRecord) => formatCurrency(f.amount) },
    { key: "dueDate", label: "Due Date", render: (f: FeeRecord) => formatDate(f.dueDate) },
    { key: "paidDate", label: "Paid Date", render: (f: FeeRecord) => f.paidDate ? formatDate(f.paidDate) : "-" },
    { key: "status", label: "Status", render: (f: FeeRecord) => <Badge variant={statusVariant(f.status)}>{f.status}</Badge> },
    { key: "paymentMethod", label: "Method", render: (f: FeeRecord) => f.paymentMethod || "-" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Fees</h1>
        <p className="text-gray-500 text-sm mt-1">View your fee and payment status</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Fees</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(paidAmount)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{formatCurrency(pendingAmount)}</p>
        </div>
      </div>

      <DataTable columns={columns} data={fees} emptyMessage="No fee records" />
    </div>
  );
}
