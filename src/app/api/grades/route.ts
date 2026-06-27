import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb, insertGrade, updateGrade, deleteGrade, type Grade } from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");
  const classId = request.nextUrl.searchParams.get("classId");

  const db = await getDb();
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

    const grade: Grade = {
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

    await insertGrade(grade);

    return NextResponse.json(grade, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to record grade" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const db = await getDb();
    const existing = db.grades.find((g) => g.id === body.id);
    if (!existing) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    const fields: Partial<Grade> = {};
    if (body.examType !== undefined) fields.examType = body.examType;
    if (body.score !== undefined) fields.score = body.score;
    if (body.maxScore !== undefined) fields.maxScore = body.maxScore;
    if (body.grade !== undefined) fields.grade = body.grade;
    if (body.semester !== undefined) fields.semester = body.semester;
    if (body.date !== undefined) fields.date = body.date;
    if (body.remarks !== undefined) fields.remarks = body.remarks;
    await updateGrade(body.id, fields);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update grade" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    await deleteGrade(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete grade" }, { status: 500 });
  }
}
