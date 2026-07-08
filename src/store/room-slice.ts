import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Room, Player, Message } from "@/types";

export interface RoomState {
  currentRoom: Room | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  currentRoom: null,
  messages: [],
  loading: false,
  error: null,
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<Room>) => {
      state.currentRoom = action.payload;
    },
    updatePlayers: (state, action: PayloadAction<Player[]>) => {
      if (state.currentRoom) {
        state.currentRoom.players = action.payload;
      }
    },
    playerJoined: (state, action: PayloadAction<Player>) => {
      if (state.currentRoom) {
        const index = state.currentRoom.players.findIndex(p => p.id === action.payload.id);
        if (index === -1) {
          state.currentRoom.players.push(action.payload);
        } else {
          state.currentRoom.players[index] = action.payload;
        }
      }
    },
    playerLeft: (state, action: PayloadAction<string>) => {
      if (state.currentRoom) {
        state.currentRoom.players = state.currentRoom.players.filter(p => p.id !== action.payload);
      }
    },
    updatePlayerStatus: (state, action: PayloadAction<{ id: string; status: Partial<Player> }>) => {
      if (state.currentRoom) {
        const player = state.currentRoom.players.find(p => p.id === action.payload.id);
        if (player) {
          Object.assign(player, action.payload.status);
        }
      }
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    clearRoom: (state) => {
      state.currentRoom = null;
      state.messages = [];
    },
  },
});

export const {
  setRoom,
  updatePlayers,
  playerJoined,
  playerLeft,
  updatePlayerStatus,
  addMessage,
  clearRoom,
} = roomSlice.actions;

export default roomSlice.reducer;
