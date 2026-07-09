import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameState, Room } from "@/types";
import {
  startGame,
  submitAnswer,
  advanceRound,
  returnToLobby,
} from "@/store/thunks/game-thunks";
import { fetchRoom, createRoom, joinRoom } from "@/store/thunks/room-thunks";

const initialState: GameState = {
  gameType: "TruthOrDare",
  status: "idle",
  currentRound: 0,
  totalRounds: 5,
  timer: 0,
  prompt: "",
  options: [],
  gameData: null,
};

/**
 * Maps the authoritative server game (persisted on the room) into the local
 * GameState shape the game UIs consume.
 */
function mapRoomToGame(room: Room | null | undefined): GameState {
  const g = room?.game;
  if (!g) {
    return { ...initialState };
  }
  const status: GameState["status"] =
    room?.status === "ended" || g.phase === "ended"
      ? "ended"
      : g.phase === "results"
      ? "round_results"
      : "action";

  return {
    gameType: g.gameType,
    status,
    currentRound: g.currentRound,
    totalRounds: g.totalRounds,
    timer: g.timer,
    prompt: g.prompt,
    options: g.options || [],
    gameData: g.results
      ? { ...g.results, podium: g.podium }
      : g.podium
      ? { podium: g.podium }
      : null,
  };
}

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setTimer: (state, action: PayloadAction<number>) => {
      state.timer = action.payload;
    },
    tickTimer: (state) => {
      if (state.timer > 0) state.timer -= 1;
    },
    resetGame: () => initialState,
  },
  extraReducers: (builder) => {
    const sync = (_state: GameState, action: PayloadAction<Room>) => mapRoomToGame(action.payload);

    builder
      .addCase(startGame.fulfilled, sync)
      .addCase(submitAnswer.fulfilled, sync)
      .addCase(advanceRound.fulfilled, sync)
      .addCase(returnToLobby.fulfilled, sync)
      .addCase(createRoom.fulfilled, sync)
      .addCase(joinRoom.fulfilled, sync)
      .addCase(fetchRoom.fulfilled, (_state, action) => mapRoomToGame(action.payload.room));
  },
});

export const { setTimer, tickTimer, resetGame } = gameSlice.actions;

export default gameSlice.reducer;
