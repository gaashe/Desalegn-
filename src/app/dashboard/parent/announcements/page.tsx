"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import { Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
  authorName: string;
}

export default function ParentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetch("/api/announcements?role=parent")
      .then((r) => r.json())
      .then(setAnnouncements);
  }, []);

  const priorityVariant = (p: string) => {
    if (p === "urgent") return "danger" as const;
    if (p === "high") return "warning" as const;
    if (p === "medium") return "info" as const;
    return "default" as const;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-500 text-sm mt-1">School announcements and notices</p>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <Bell size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{ann.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{ann.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span>By {ann.authorName}</span>
                    <span>{formatDate(ann.createdAt)}</span>
                  </div>
                </div>
              </div>
              <Badge variant={priorityVariant(ann.priority)}>{ann.priority}</Badge>
            </div>
          </div>
        ))}
        {announcements.length === 0 && <div className="text-center text-gray-400 py-8">No announcements</div>}
      </div>
    </div>
  );
}
