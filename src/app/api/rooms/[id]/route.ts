import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/server/repository";
import { gameEngine } from "@/server/game-engine";
import { Player, GameType } from "@/types";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/rooms/[id] -> single room + its messages
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const room = await repository.getRoom(id);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const messages = await repository.getMessages(id);
    return NextResponse.json({ room, messages });
  } catch (err) {
    console.error("[API] GET /rooms/[id] failed:", err);
    return NextResponse.json({ error: "Failed to load room" }, { status: 500 });
  }
}

// DELETE /api/rooms/[id]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await repository.deleteRoom(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API] DELETE /rooms/[id] failed:", err);
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
  }
}

/**
 * PATCH /api/rooms/[id]
 * A single endpoint for all room + game mutations, selected via `action`:
 *   update        -> generic partial room update ({ patch })
 *   join          -> { user }
 *   leave         -> { userId }
 *   ready         -> { userId }
 *   game:start    -> { gameType, totalRounds }
 *   game:answer   -> { playerId, answer }
 *   game:advance
 *   game:lobby
 */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = (await req.json()) as { action: string; [k: string]: any };
    const action = body.action;

    const room = await repository.getRoom(id);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    switch (action) {
      case "update": {
        await repository.updateRoom(id, body.patch || {});
        const updated = await repository.getRoom(id);
        return NextResponse.json({ room: updated });
      }

      case "join": {
        const user = body.user as Player;
        if (!user) return NextResponse.json({ error: "Missing user" }, { status: 400 });
        if (!room.players.some((p) => p.id === user.id)) {
          if (room.players.length >= room.maxPlayers) {
            return NextResponse.json({ error: "Room is full" }, { status: 409 });
          }
          room.players = [
            ...room.players,
            { ...user, isHost: false, isReady: false, isOnline: true },
          ];
          await repository.updateRoom(id, { players: room.players });
        }
        return NextResponse.json({ room });
      }

      case "leave": {
        const userId = body.userId as string;
        room.players = room.players.filter((p) => p.id !== userId);
        if (room.players.length === 0 || room.hostId === userId) {
          await repository.deleteRoom(id);
          return NextResponse.json({ ok: true, deleted: true });
        }
        await repository.updateRoom(id, { players: room.players });
        return NextResponse.json({ room });
      }

      case "ready": {
        const userId = body.userId as string;
        room.players = room.players.map((p) =>
          p.id === userId ? { ...p, isReady: !p.isReady } : p
        );
        await repository.updateRoom(id, { players: room.players });
        return NextResponse.json({ room });
      }

      case "game:start": {
        const updated = gameEngine.startGame(
          room,
          body.gameType as GameType,
          body.totalRounds || 5
        );
        await repository.saveRoom(updated);
        return NextResponse.json({ room: updated });
      }

      case "game:answer": {
        const updated = gameEngine.submitAnswer(room, body.playerId, body.answer ?? "");
        await repository.saveRoom(updated);
        return NextResponse.json({ room: updated });
      }

      case "game:advance": {
        const updated = await gameEngine.advance(room);
        await repository.saveRoom(updated);
        return NextResponse.json({ room: updated });
      }

      case "game:lobby": {
        const updated = gameEngine.returnToLobby(room);
        await repository.saveRoom(updated);
        return NextResponse.json({ room: updated });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    console.error("[API] PATCH /rooms/[id] failed:", err);
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}
