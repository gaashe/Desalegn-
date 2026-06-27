import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getDb,
  insertUser,
  updateUser,
  deleteUser,
  insertTeacher,
  updateTeacher,
  deleteTeacher,
  type Teacher,
} from "@/lib/db";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const enriched = db.teachers.map((t) => {
    const user = db.users.find((u) => u.id === t.userId);
    const classes = db.classes.filter((c) => c.teacherId === t.id);
    return {
      ...t,
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      classCount: classes.length,
      classes: classes.map((c) => c.name),
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bcryptjs = await import("bcryptjs");
    const userId = `u${Date.now()}`;
    const teacherId = `t${generateId()}`;

    await insertUser({
      id: userId,
      email: body.email,
      password: bcryptjs.hashSync("teacher123", 10),
      name: body.name,
      role: "teacher",
      phone: body.phone,
      createdAt: new Date().toISOString().split("T")[0],
    });

    const teacher: Teacher = {
      id: teacherId,
      userId,
      subject: body.subject || "",
      qualification: body.qualification || "B.Ed",
      experience: Number(body.experience) || 0,
      salary: Number(body.salary) || 0,
      joinDate: body.joinDate || new Date().toISOString().split("T")[0],
      status: body.status || "active",
    };

    await insertTeacher(teacher);

    return NextResponse.json(teacher, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const db = await getDb();
    const existing = db.teachers.find((t) => t.id === body.id);
    if (!existing) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const fields: Partial<Teacher> = {};
    if (body.subject !== undefined) fields.subject = body.subject;
    if (body.qualification !== undefined) fields.qualification = body.qualification;
    if (body.experience !== undefined) fields.experience = Number(body.experience);
    if (body.salary !== undefined) fields.salary = Number(body.salary);
    if (body.status !== undefined) fields.status = body.status;
    await updateTeacher(body.id, fields);

    const userFields: Record<string, unknown> = {};
    if (body.name !== undefined) userFields.name = body.name;
    if (body.email !== undefined) userFields.email = body.email;
    if (body.phone !== undefined) userFields.phone = body.phone;
    if (Object.keys(userFields).length > 0) {
      await updateUser(existing.userId, userFields);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const db = await getDb();
    const existing = db.teachers.find((t) => t.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    await deleteTeacher(id);
    await deleteUser(existing.userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}
