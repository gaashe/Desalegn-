import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb, insertClass, updateClass, deleteClass, type ClassInfo } from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const db = await getDb();
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const cls: ClassInfo = {
      id: `c${generateId()}`,
      name: body.name || `Grade ${body.grade}${body.section} - ${body.subject}`,
      grade: body.grade,
      section: body.section,
      teacherId: body.teacherId,
      subject: body.subject,
      schedule: body.schedule || "",
      room: body.room || "",
      capacity: Number(body.capacity) || 40,
    };

    await insertClass(cls);

    return NextResponse.json(cls, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const db = await getDb();
    const existing = db.classes.find((c) => c.id === body.id);
    if (!existing) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const fields: Partial<ClassInfo> = {};
    if (body.name !== undefined) fields.name = body.name;
    if (body.grade !== undefined) fields.grade = body.grade;
    if (body.section !== undefined) fields.section = body.section;
    if (body.teacherId !== undefined) fields.teacherId = body.teacherId;
    if (body.subject !== undefined) fields.subject = body.subject;
    if (body.schedule !== undefined) fields.schedule = body.schedule;
    if (body.room !== undefined) fields.room = body.room;
    if (body.capacity !== undefined) fields.capacity = Number(body.capacity);
    await updateClass(body.id, fields);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    await deleteClass(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
  }
}
