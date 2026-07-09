import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/server/repository";

// GET /api/leaderboard
export async function GET() {
  try {
    const leaderboard = await repository.getLeaderboard();
    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error("[API] GET /leaderboard failed:", err);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}

// POST /api/leaderboard  { user:{id,name,avatar,xp,level,rank} }
export async function POST(req: NextRequest) {
  try {
    const { user } = (await req.json()) as {
      user: { id: string; name: string; avatar: string; xp: number; level: number; rank: string };
    };
    if (!user?.id) {
      return NextResponse.json({ error: "Missing user" }, { status: 400 });
    }
    await repository.updateLeaderboardXP(user);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API] POST /leaderboard failed:", err);
    return NextResponse.json({ error: "Failed to update leaderboard" }, { status: 500 });
  }
}
