import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get("teacherId");
  const grade = request.nextUrl.searchParams.get("grade");
  const section = request.nextUrl.searchParams.get("section");

  let classes = db.classes;

  if (teacherId) classes = classes.filter((c) => c.teacherId === teacherId);
  if (grade) classes = classes.filter((c) => c.grade === grade);
  if (section) classes = classes.filter((c) => c.section === section);

  const enriched = classes.map((c) => {
    const teacher = db.teachers.find((t) => t.id === c.teacherId);
    const teacherUser = teacher ? db.users.find((u) => u.id === teacher.userId) : null;
    const studentCount = db.students.filter(
      (s) => s.grade === c.grade && s.section === c.section
    ).length;

    return {
      ...c,
      teacherName: teacherUser?.name,
      studentCount,
    };
  });

  return NextResponse.json(enriched);
}
