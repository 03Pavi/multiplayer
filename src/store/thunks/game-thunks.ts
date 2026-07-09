import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiPatch } from "@/services/api-client";
import { Room, GameType } from "@/types";

/**
 * Game feature actions. Each thunk calls PATCH /api/rooms/[id] with a
 * `game:*` action. The route runs the authoritative server game engine and
 * returns the updated room; the room/game slices sync from it.
 */

export const startGame = createAsyncThunk(
  "game/start",
  async (payload: { code: string; gameType: GameType; totalRounds: number }) => {
    const data = await apiPatch<{ room: Room }>(`/api/rooms/${encodeURIComponent(payload.code)}`, {
      action: "game:start",
      gameType: payload.gameType,
      totalRounds: payload.totalRounds,
    });
    return data.room;
  }
);

export const submitAnswer = createAsyncThunk(
  "game/answer",
  async (payload: { code: string; playerId: string; answer: string }) => {
    const data = await apiPatch<{ room: Room }>(`/api/rooms/${encodeURIComponent(payload.code)}`, {
      action: "game:answer",
      playerId: payload.playerId,
      answer: payload.answer,
    });
    return data.room;
  }
);

export const advanceRound = createAsyncThunk(
  "game/advance",
  async (payload: { code: string }) => {
    const data = await apiPatch<{ room: Room }>(`/api/rooms/${encodeURIComponent(payload.code)}`, {
      action: "game:advance",
    });
    return data.room;
  }
);

export const returnToLobby = createAsyncThunk(
  "game/lobby",
  async (payload: { code: string }) => {
    const data = await apiPatch<{ room: Room }>(`/api/rooms/${encodeURIComponent(payload.code)}`, {
      action: "game:lobby",
    });
    return data.room;
  }
);
