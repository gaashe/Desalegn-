import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import db from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");
  const status = request.nextUrl.searchParams.get("status");

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

    const fee = {
      id: `f${generateId()}`,
      studentId: body.studentId,
      type: body.type,
      amount: body.amount,
      dueDate: body.dueDate,
      paidDate: body.paidDate,
      status: body.status || ("pending" as const),
      paymentMethod: body.paymentMethod,
      transactionId: body.transactionId,
    };

    db.fees.push(fee);

    return NextResponse.json(fee, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create fee" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const feeIndex = db.fees.findIndex((f) => f.id === body.id);

    if (feeIndex < 0) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });
    }

    db.fees[feeIndex] = { ...db.fees[feeIndex], ...body };

    return NextResponse.json(db.fees[feeIndex]);
  } catch {
    return NextResponse.json({ error: "Failed to update fee" }, { status: 500 });
  }
}
