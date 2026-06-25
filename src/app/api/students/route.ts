import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import db from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const grade = request.nextUrl.searchParams.get("grade");
  const section = request.nextUrl.searchParams.get("section");
  const parentId = request.nextUrl.searchParams.get("parentId");

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
    const bcryptjs = require("bcryptjs");
    const userId = `u${Date.now()}`;
    const studentId = `s${generateId()}`;

    db.users.push({
      id: userId,
      email: body.email,
      password: bcryptjs.hashSync("student123", 10),
      name: body.name,
      role: "student",
      phone: body.phone,
      createdAt: new Date().toISOString().split("T")[0],
    });

    const student = {
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
      status: "active" as const,
    };

    db.students.push(student);

    return NextResponse.json(student, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
