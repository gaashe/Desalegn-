import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import db from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");
  const classId = request.nextUrl.searchParams.get("classId");
  const date = request.nextUrl.searchParams.get("date");

  let records = db.attendance;

  if (studentId) records = records.filter((a) => a.studentId === studentId);
  if (classId) records = records.filter((a) => a.classId === classId);
  if (date) records = records.filter((a) => a.date === date);

  const enriched = records.map((a) => {
    const student = db.students.find((s) => s.id === a.studentId);
    const user = student ? db.users.find((u) => u.id === student.userId) : null;
    const cls = db.classes.find((c) => c.id === a.classId);
    return {
      ...a,
      studentName: user?.name,
      className: cls?.name,
      rollNumber: student?.rollNumber,
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const records = body.records || [body];

    const created = records.map((record: { studentId: string; classId: string; date: string; status: string; remarks?: string }) => {
      const existing = db.attendance.findIndex(
        (a) => a.studentId === record.studentId && a.classId === record.classId && a.date === record.date
      );

      const entry = {
        id: `a${generateId()}`,
        studentId: record.studentId,
        classId: record.classId,
        date: record.date,
        status: record.status as "present" | "absent" | "late" | "excused",
        remarks: record.remarks,
      };

      if (existing >= 0) {
        db.attendance[existing] = entry;
      } else {
        db.attendance.push(entry);
      }

      return entry;
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}
