import { NextResponse } from "next/server";
import { repository } from "@/server/repository";

// GET /api/arenas -> recent arena matches
export async function GET() {
  try {
    const arenas = await repository.getRecentArenas();
    return NextResponse.json({ arenas });
  } catch (err) {
    console.error("[API] GET /arenas failed:", err);
    return NextResponse.json({ error: "Failed to load arenas" }, { status: 500 });
  }
}
