import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameState, GameType } from "@/types";

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

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    startGame: (state, action: PayloadAction<{ gameType: GameType; totalRounds: number }>) => {
      state.gameType = action.payload.gameType;
      state.status = "intro";
      state.currentRound = 1;
      state.totalRounds = action.payload.totalRounds;
      state.timer = 10;
      state.prompt = "";
      state.options = [];
      state.gameData = null;
    },
    setRoundPrompt: (state, action: PayloadAction<{ prompt: string; options?: string[]; timer: number; currentRound?: number; gameData?: any }>) => {
      state.status = "action";
      state.prompt = action.payload.prompt;
      state.options = action.payload.options || [];
      state.timer = action.payload.timer;
      state.gameData = action.payload.gameData || null;
      if (action.payload.currentRound) {
        state.currentRound = action.payload.currentRound;
      }
    },
    setActionPhase: (state, action: PayloadAction<{ timer: number }>) => {
      state.status = "action";
      state.timer = action.payload.timer;
    },
    setVotingPhase: (state, action: PayloadAction<{ timer: number; options?: string[] }>) => {
      state.status = "voting";
      state.timer = action.payload.timer;
      if (action.payload.options) {
        state.options = action.payload.options;
      }
    },
    setRoundResults: (state, action: PayloadAction<{ gameData: any; timer: number }>) => {
      state.status = "round_results";
      state.gameData = action.payload.gameData;
      state.timer = action.payload.timer;
    },
    tickTimer: (state) => {
      if (state.timer > 0) {
        state.timer -= 1;
      }
    },
    setTimer: (state, action: PayloadAction<number>) => {
      state.timer = action.payload;
    },
    nextRound: (state) => {
      if (state.currentRound < state.totalRounds) {
        state.currentRound += 1;
        state.status = "round_prompt";
      } else {
        state.status = "ended";
      }
    },
    endGame: (state) => {
      state.status = "ended";
      state.timer = 0;
    },
    resetGame: (state) => {
      return initialState;
    },
  },
});

export const {
  startGame,
  setRoundPrompt,
  setActionPhase,
  setVotingPhase,
  setRoundResults,
  tickTimer,
  setTimer,
  nextRound,
  endGame,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
