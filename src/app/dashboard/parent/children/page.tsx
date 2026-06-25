"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/ui/Badge";
import { GraduationCap, Calendar, BookOpen } from "lucide-react";

interface Child {
  id: string;
  name: string;
  grade: string;
  section: string;
  rollNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  status: string;
}

export default function ParentChildrenPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/students")
      .then((r) => r.json())
      .then((students) => {
        const kids = students.filter((s: { parentId: string }) => s.parentId === user.userId);
        setChildren(kids);
      });
  }, [user]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
        <p className="text-gray-500 text-sm mt-1">View your children&apos;s information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map((child) => (
          <div key={child.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <GraduationCap size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{child.name}</h3>
                  <p className="text-sm text-gray-500">{child.email}</p>
                </div>
              </div>
              <Badge variant={child.status === "active" ? "success" : "default"}>{child.status}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BookOpen size={14} /> Grade {child.grade} - Section {child.section}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-gray-600">Roll:</span> {child.rollNumber}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={14} /> {child.dateOfBirth}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-gray-600">Gender:</span> {child.gender}
              </div>
            </div>
          </div>
        ))}
        {children.length === 0 && (
          <div className="col-span-2 text-center text-gray-400 py-8">No children linked to your account</div>
        )}
      </div>
    </div>
  );
}
