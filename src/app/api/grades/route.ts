import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import db from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");
  const classId = request.nextUrl.searchParams.get("classId");

  let grades = db.grades;

  if (studentId) grades = grades.filter((g) => g.studentId === studentId);
  if (classId) grades = grades.filter((g) => g.classId === classId);

  const enriched = grades.map((g) => {
    const student = db.students.find((s) => s.id === g.studentId);
    const user = student ? db.users.find((u) => u.id === student.userId) : null;
    const cls = db.classes.find((c) => c.id === g.classId);
    return {
      ...g,
      studentName: user?.name,
      className: cls?.name,
      subject: cls?.subject,
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const grade = {
      id: `g${generateId()}`,
      studentId: body.studentId,
      classId: body.classId,
      examType: body.examType,
      score: body.score,
      maxScore: body.maxScore,
      grade: body.grade,
      semester: body.semester || "Semester 1",
      date: body.date || new Date().toISOString().split("T")[0],
      remarks: body.remarks,
    };

    db.grades.push(grade);

    return NextResponse.json(grade, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to record grade" }, { status: 500 });
  }
}
