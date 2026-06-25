"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { Plus, Bell, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Role } from "@/lib/db";

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  targetRoles: Role[];
  priority: string;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    targetRoles: ["admin", "teacher", "student", "parent"] as Role[],
    priority: "medium",
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    const res = await fetch("/api/announcements");
    const data = await res.json();
    setAnnouncements(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        authorId: user?.userId,
      }),
    });
    setShowModal(false);
    setForm({ title: "", content: "", targetRoles: ["admin", "teacher", "student", "parent"], priority: "medium" });
    loadAnnouncements();
  }

  const priorityVariant = (p: string) => {
    if (p === "urgent") return "danger" as const;
    if (p === "high") return "warning" as const;
    if (p === "medium") return "info" as const;
    return "default" as const;
  };

  const toggleRole = (role: Role) => {
    const roles = form.targetRoles.includes(role)
      ? form.targetRoles.filter((r) => r !== role)
      : [...form.targetRoles, role];
    setForm({ ...form, targetRoles: roles });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 text-sm mt-1">{announcements.length} announcements</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors text-sm"
        >
          <Plus size={18} />
          New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg mt-0.5">
                  <Bell size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{ann.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{ann.content}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={12} />
                      {formatDate(ann.createdAt)}
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-400">{ann.authorName}</span>
                    <span className="text-gray-300">|</span>
                    {ann.targetRoles.map((role) => (
                      <Badge key={role} variant="default">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Badge variant={priorityVariant(ann.priority)}>{ann.priority}</Badge>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Announcement" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <div className="flex flex-wrap gap-2">
              {(["admin", "teacher", "student", "parent"] as Role[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    form.targetRoles.includes(role)
                      ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                      : "bg-gray-50 border-gray-200 text-gray-500"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium"
            >
              Publish
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
