"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Clock, MapPin, Users } from "lucide-react";

interface ClassInfo {
  id: string;
  name: string;
  subject: string;
  schedule: string;
  room: string;
  studentCount: number;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TeacherSchedulePage() {
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

  const getClassesForDay = (day: string) =>
    classes.filter((cls) => cls.schedule.toLowerCase().includes(day.toLowerCase()));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-500 text-sm mt-1">Weekly class schedule</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DAYS.map((day) => {
          const dayClasses = getClassesForDay(day);
          return (
            <div key={day} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold">{day}</div>
              <div className="p-3 space-y-2 min-h-[120px]">
                {dayClasses.length > 0 ? (
                  dayClasses.map((cls) => (
                    <div key={cls.id} className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-800">{cls.subject}</p>
                      <p className="text-xs text-emerald-600 mt-0.5">{cls.name}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                        <span className="flex items-center gap-0.5"><MapPin size={10} /> {cls.room}</span>
                        <span className="flex items-center gap-0.5"><Users size={10} /> {cls.studentCount}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">No classes</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
