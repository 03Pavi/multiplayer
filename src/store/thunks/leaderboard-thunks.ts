import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost } from "@/services/api-client";

/**
 * Leaderboard feature actions.
 *   GET  /api/leaderboard  -> ranked players
 *   POST /api/leaderboard  -> upsert player XP
 */

export const fetchLeaderboard = createAsyncThunk("leaderboard/fetch", async () => {
  const data = await apiGet<{ leaderboard: any[] }>("/api/leaderboard");
  return data.leaderboard;
});

export const updateLeaderboardXP = createAsyncThunk(
  "leaderboard/update",
  async (user: { id: string; name: string; avatar: string; xp: number; level: number; rank: string }) => {
    await apiPost("/api/leaderboard", { user });
    return true;
  }
);
