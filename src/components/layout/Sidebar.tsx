"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  BarChart3,
  CreditCard,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  School,
  UserCheck,
  Home,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const roleMenus = {
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Students", href: "/dashboard/admin/students", icon: Users },
    { label: "Teachers", href: "/dashboard/admin/teachers", icon: GraduationCap },
    { label: "Classes", href: "/dashboard/admin/classes", icon: BookOpen },
    { label: "Attendance", href: "/dashboard/admin/attendance", icon: ClipboardCheck },
    { label: "Grades", href: "/dashboard/admin/grades", icon: BarChart3 },
    { label: "Fees", href: "/dashboard/admin/fees", icon: CreditCard },
    { label: "Announcements", href: "/dashboard/admin/announcements", icon: Bell },
    { label: "Messages", href: "/dashboard/admin/messages", icon: MessageSquare },
  ],
  teacher: [
    { label: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
    { label: "My Classes", href: "/dashboard/teacher/classes", icon: BookOpen },
    { label: "Attendance", href: "/dashboard/teacher/attendance", icon: ClipboardCheck },
    { label: "Grades", href: "/dashboard/teacher/grades", icon: BarChart3 },
    { label: "Schedule", href: "/dashboard/teacher/schedule", icon: Calendar },
    { label: "Messages", href: "/dashboard/teacher/messages", icon: MessageSquare },
    { label: "Announcements", href: "/dashboard/teacher/announcements", icon: Bell },
  ],
  student: [
    { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "My Classes", href: "/dashboard/student/classes", icon: BookOpen },
    { label: "Attendance", href: "/dashboard/student/attendance", icon: UserCheck },
    { label: "Grades", href: "/dashboard/student/grades", icon: BarChart3 },
    { label: "Schedule", href: "/dashboard/student/schedule", icon: Calendar },
    { label: "Fees", href: "/dashboard/student/fees", icon: CreditCard },
    { label: "Announcements", href: "/dashboard/student/announcements", icon: Bell },
  ],
  parent: [
    { label: "Dashboard", href: "/dashboard/parent", icon: LayoutDashboard },
    { label: "Children", href: "/dashboard/parent/children", icon: Users },
    { label: "Attendance", href: "/dashboard/parent/attendance", icon: UserCheck },
    { label: "Grades", href: "/dashboard/parent/grades", icon: BarChart3 },
    { label: "Fees", href: "/dashboard/parent/fees", icon: CreditCard },
    { label: "Messages", href: "/dashboard/parent/messages", icon: MessageSquare },
    { label: "Announcements", href: "/dashboard/parent/announcements", icon: Bell },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const menuItems = roleMenus[user.role] || [];

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-emerald-600 text-white shadow-lg"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-emerald-800 to-emerald-950 text-white z-40 transform transition-transform duration-200 ease-in-out flex flex-col",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <School size={24} className="text-emerald-200" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Bshewam</h1>
              <p className="text-emerald-300 text-xs">School Management</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-emerald-300 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-white/15 text-white font-medium"
                        : "text-emerald-200 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-emerald-700 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-emerald-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Home size={18} />
            Home
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-emerald-200 hover:bg-red-500/20 hover:text-red-200 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
