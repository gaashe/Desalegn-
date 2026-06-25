"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Calendar, MapPin, Users } from "lucide-react";

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
  subject: string;
  schedule: string;
  room: string;
  studentCount: number;
  capacity: number;
}

export default function TeacherClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassInfo[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/teachers")
      .then((r) => r.json())
      .then((teachers) => {
        const teacher = teachers.find((t: { userId: string }) => t.userId === user.userId);
        if (teacher) {
          fetch(`/api/classes?teacherId=${teacher.id}`)
            .then((r) => r.json())
            .then(setClasses);
        }
      });
  }, [user]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-500 text-sm mt-1">{classes.length} classes assigned</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900">{cls.name}</h3>
            <p className="text-sm text-emerald-600 font-medium mt-1">{cls.subject}</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={14} /> {cls.schedule}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={14} /> Room {cls.room}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users size={14} /> {cls.studentCount} / {cls.capacity} students
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
