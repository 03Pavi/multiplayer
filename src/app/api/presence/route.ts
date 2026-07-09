import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/server/repository";

// GET /api/presence -> online players
export async function GET() {
  try {
    const players = await repository.getOnlinePlayers();
    return NextResponse.json({ players });
  } catch (err) {
    console.error("[API] GET /presence failed:", err);
    return NextResponse.json({ error: "Failed to load presence" }, { status: 500 });
  }
}

// POST /api/presence  { user:{id,name,avatar,level,rank} }
export async function POST(req: NextRequest) {
  try {
    const { user } = (await req.json()) as {
      user: { id: string; name: string; avatar: string; level: number; rank: string };
    };
    if (!user?.id) {
      return NextResponse.json({ error: "Missing user" }, { status: 400 });
    }
    await repository.setPresence(user);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API] POST /presence failed:", err);
    return NextResponse.json({ error: "Failed to set presence" }, { status: 500 });
  }
}

// DELETE /api/presence?userId=XXXX
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    await repository.clearPresence(userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API] DELETE /presence failed:", err);
    return NextResponse.json({ error: "Failed to clear presence" }, { status: 500 });
  }
}
