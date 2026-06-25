import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
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
