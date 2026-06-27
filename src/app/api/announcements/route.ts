import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb, insertAnnouncement, deleteAnnouncement, type Announcement } from "@/lib/db";
import { generateId } from "@/lib/utils";
import type { Role } from "@/lib/db";

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role");

  const db = await getDb();
  let announcements = db.announcements;

  if (role) {
    announcements = announcements.filter((a) =>
      a.targetRoles.includes(role as Role)
    );
  }

  const enriched = announcements.map((a) => {
    const author = db.users.find((u) => u.id === a.authorId);
    return { ...a, authorName: author?.name };
  });

  enriched.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const announcement: Announcement = {
      id: `ann${generateId()}`,
      title: body.title,
      content: body.content,
      authorId: body.authorId,
      targetRoles: body.targetRoles as Role[],
      targetGrades: body.targetGrades,
      priority: body.priority || "medium",
      createdAt: new Date().toISOString().split("T")[0],
      expiresAt: body.expiresAt,
    };

    await insertAnnouncement(announcement);

    return NextResponse.json(announcement, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    await deleteAnnouncement(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
