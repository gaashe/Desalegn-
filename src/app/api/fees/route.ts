import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb, insertFee, updateFee, deleteFee, type Fee } from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");
  const status = request.nextUrl.searchParams.get("status");

  const db = await getDb();
  let fees = db.fees;

  if (studentId) fees = fees.filter((f) => f.studentId === studentId);
  if (status) fees = fees.filter((f) => f.status === status);

  const enriched = fees.map((f) => {
    const student = db.students.find((s) => s.id === f.studentId);
    const user = student ? db.users.find((u) => u.id === student.userId) : null;
    return {
      ...f,
      studentName: user?.name,
      grade: student?.grade,
      section: student?.section,
      rollNumber: student?.rollNumber,
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fee: Fee = {
      id: `f${generateId()}`,
      studentId: body.studentId,
      type: body.type,
      amount: body.amount,
      dueDate: body.dueDate,
      paidDate: body.paidDate,
      status: body.status || "pending",
      paymentMethod: body.paymentMethod,
      transactionId: body.transactionId,
    };

    await insertFee(fee);

    return NextResponse.json(fee, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create fee" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const db = await getDb();
    const existing = db.fees.find((f) => f.id === body.id);
    if (!existing) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });
    }

    const fields: Partial<Fee> = {};
    if (body.type !== undefined) fields.type = body.type;
    if (body.amount !== undefined) fields.amount = body.amount;
    if (body.dueDate !== undefined) fields.dueDate = body.dueDate;
    if (body.paidDate !== undefined) fields.paidDate = body.paidDate;
    if (body.status !== undefined) fields.status = body.status;
    if (body.paymentMethod !== undefined) fields.paymentMethod = body.paymentMethod;
    if (body.transactionId !== undefined) fields.transactionId = body.transactionId;
    await updateFee(body.id, fields);

    return NextResponse.json({ ...existing, ...fields });
  } catch {
    return NextResponse.json({ error: "Failed to update fee" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    await deleteFee(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete fee" }, { status: 500 });
  }
}
