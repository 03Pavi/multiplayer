import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost, apiDelete } from "@/services/api-client";

/**
 * Dashboard feed actions (presence + recent arenas).
 *   GET    /api/presence   -> online players
 *   POST   /api/presence   -> register presence
 *   DELETE /api/presence   -> clear presence
 *   GET    /api/arenas     -> recent arenas
 */

export const fetchOnlinePlayers = createAsyncThunk("presence/fetch", async () => {
  const data = await apiGet<{ players: any[] }>("/api/presence");
  return data.players;
});

export const setPresence = createAsyncThunk(
  "presence/set",
  async (user: { id: string; name: string; avatar: string; level: number; rank: string }) => {
    await apiPost("/api/presence", { user });
    return true;
  }
);

export const clearPresence = createAsyncThunk("presence/clear", async (userId: string) => {
  await apiDelete(`/api/presence?userId=${encodeURIComponent(userId)}`);
  return userId;
});

export const fetchRecentArenas = createAsyncThunk("arenas/fetch", async () => {
  const data = await apiGet<{ arenas: any[] }>("/api/arenas");
  return data.arenas;
});
