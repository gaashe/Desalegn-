import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb, findAttendanceId, upsertAttendance, type Attendance } from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");
  const classId = request.nextUrl.searchParams.get("classId");
  const date = request.nextUrl.searchParams.get("date");

  const db = await getDb();
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
    const records: Array<{
      studentId: string;
      classId: string;
      date: string;
      status: string;
      remarks?: string;
    }> = body.records || [body];

    const created: Attendance[] = [];
    for (const record of records) {
      const existingId = await findAttendanceId(
        record.studentId,
        record.classId,
        record.date
      );
      const entry: Attendance = {
        id: existingId || `a${generateId()}`,
        studentId: record.studentId,
        classId: record.classId,
        date: record.date,
        status: record.status as Attendance["status"],
        remarks: record.remarks,
      };
      await upsertAttendance(entry);
      created.push(entry);
    }

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}
