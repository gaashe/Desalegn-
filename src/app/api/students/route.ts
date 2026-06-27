import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getDb,
  insertUser,
  insertStudent,
  updateStudent,
  deleteStudent,
  deleteUser,
  updateUser,
  type Student,
} from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const grade = request.nextUrl.searchParams.get("grade");
  const section = request.nextUrl.searchParams.get("section");
  const parentId = request.nextUrl.searchParams.get("parentId");

  const db = await getDb();
  let students = db.students;

  if (grade) students = students.filter((s) => s.grade === grade);
  if (section) students = students.filter((s) => s.section === section);
  if (parentId) students = students.filter((s) => s.parentId === parentId);

  const enriched = students.map((s) => {
    const user = db.users.find((u) => u.id === s.userId);
    return { ...s, name: user?.name, email: user?.email, phone: user?.phone };
  });

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bcryptjs = await import("bcryptjs");
    const userId = `u${Date.now()}`;
    const studentId = `s${generateId()}`;

    await insertUser({
      id: userId,
      email: body.email,
      password: bcryptjs.hashSync("student123", 10),
      name: body.name,
      role: "student",
      phone: body.phone,
      createdAt: new Date().toISOString().split("T")[0],
    });

    const student: Student = {
      id: studentId,
      userId,
      grade: body.grade,
      section: body.section,
      rollNumber: body.rollNumber || `BSH-${body.grade}${body.section}-${generateId()}`,
      parentId: body.parentId,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      address: body.address || "Addis Ababa, Ethiopia",
      enrollmentDate: new Date().toISOString().split("T")[0],
      status: "active",
    };

    await insertStudent(student);

    return NextResponse.json(student, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const db = await getDb();
    const existing = db.students.find((s) => s.id === body.id);
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const fields: Partial<Student> = {};
    if (body.grade !== undefined) fields.grade = body.grade;
    if (body.section !== undefined) fields.section = body.section;
    if (body.rollNumber !== undefined) fields.rollNumber = body.rollNumber;
    if (body.gender !== undefined) fields.gender = body.gender;
    if (body.dateOfBirth !== undefined) fields.dateOfBirth = body.dateOfBirth;
    if (body.address !== undefined) fields.address = body.address;
    if (body.status !== undefined) fields.status = body.status;
    await updateStudent(body.id, fields);

    // Name/email/phone live on the linked user record.
    const userFields: Record<string, unknown> = {};
    if (body.name !== undefined) userFields.name = body.name;
    if (body.email !== undefined) userFields.email = body.email;
    if (body.phone !== undefined) userFields.phone = body.phone;
    if (Object.keys(userFields).length > 0) {
      await updateUser(existing.userId, userFields);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const db = await getDb();
    const existing = db.students.find((s) => s.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    await deleteStudent(id);
    await deleteUser(existing.userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
