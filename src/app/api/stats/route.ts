import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const totalStudents = db.students.filter((s) => s.status === "active").length;
  const totalTeachers = db.teachers.filter((t) => t.status === "active").length;
  const totalClasses = db.classes.length;

  const totalFees = db.fees.reduce((sum, f) => sum + f.amount, 0);
  const paidFees = db.fees
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + f.amount, 0);
  const pendingFees = totalFees - paidFees;

  const today = new Date().toISOString().split("T")[0];
  const todayAttendance = db.attendance.filter((a) => a.date === today);
  const presentToday = todayAttendance.filter((a) => a.status === "present").length;
  const totalToday = todayAttendance.length;
  const attendanceRate = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;

  // Grade distribution
  const gradeDistribution: Record<string, number> = {};
  db.students.forEach((s) => {
    const key = `Grade ${s.grade}`;
    gradeDistribution[key] = (gradeDistribution[key] || 0) + 1;
  });

  // Attendance trend (last 7 days)
  const attendanceTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayRecords = db.attendance.filter((a) => a.date === dateStr);
    const present = dayRecords.filter((a) => a.status === "present").length;
    const total = dayRecords.length;
    attendanceTrend.push({
      date: dateStr,
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
      present,
      total,
    });
  }

  // Fee status summary
  const feeStatusCounts = {
    paid: db.fees.filter((f) => f.status === "paid").length,
    pending: db.fees.filter((f) => f.status === "pending").length,
    overdue: db.fees.filter((f) => f.status === "overdue").length,
  };

  // Recent announcements
  const recentAnnouncements = db.announcements
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
    .map((a) => {
      const author = db.users.find((u) => u.id === a.authorId);
      return { ...a, authorName: author?.name };
    });

  return NextResponse.json({
    totalStudents,
    totalTeachers,
    totalClasses,
    totalFees,
    paidFees,
    pendingFees,
    attendanceRate,
    gradeDistribution,
    attendanceTrend,
    feeStatusCounts,
    recentAnnouncements,
    totalParents: db.users.filter((u) => u.role === "parent").length,
  });
}
