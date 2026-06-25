import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import db from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const messages = db.messages.filter(
    (m) => m.senderId === userId || m.receiverId === userId
  );

  const enriched = messages.map((m) => {
    const sender = db.users.find((u) => u.id === m.senderId);
    const receiver = db.users.find((u) => u.id === m.receiverId);
    return {
      ...m,
      senderName: sender?.name,
      receiverName: receiver?.name,
      senderRole: sender?.role,
      receiverRole: receiver?.role,
    };
  });

  enriched.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const message = {
      id: `m${generateId()}`,
      senderId: body.senderId,
      receiverId: body.receiverId,
      subject: body.subject,
      content: body.content,
      read: false,
      createdAt: new Date().toISOString().split("T")[0],
    };

    db.messages.push(message);

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
