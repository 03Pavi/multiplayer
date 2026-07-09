import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/server/repository";
import { Player, Room } from "@/types";

// GET /api/rooms -> list public, non-ended rooms
export async function GET() {
  try {
    const rooms = await repository.getPublicRooms();
    return NextResponse.json({ rooms });
  } catch (err) {
    console.error("[API] GET /rooms failed:", err);
    return NextResponse.json({ error: "Failed to load rooms" }, { status: 500 });
  }
}

// POST /api/rooms -> create a room
export async function POST(req: NextRequest) {
  try {
    const { user, roomName, maxPlayers, isPrivate } = (await req.json()) as {
      user: Player;
      roomName: string;
      maxPlayers: number;
      isPrivate: boolean;
    };

    if (!user) {
      return NextResponse.json({ error: "Missing user" }, { status: 400 });
    }

    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const host: Player = { ...user, isHost: true, isReady: true, isOnline: true };

    const room: Room = {
      id: `room-${Date.now()}`,
      code,
      name: roomName || `${user.name}'s Arena`,
      maxPlayers: maxPlayers || 6,
      isPrivate: Boolean(isPrivate),
      players: [host],
      status: "lobby",
      hostId: host.id,
      createdAt: new Date().toISOString(),
    };

    await repository.createRoom(room);
    return NextResponse.json({ room });
  } catch (err) {
    console.error("[API] POST /rooms failed:", err);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
