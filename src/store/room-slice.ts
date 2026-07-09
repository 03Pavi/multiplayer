import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Room, Player, Message } from "@/types";
import {
  createRoom,
  joinRoom,
  toggleReady,
  fetchRoom,
  fetchMessages,
  sendMessage,
} from "@/store/thunks/room-thunks";
import {
  startGame,
  submitAnswer,
  advanceRound,
  returnToLobby,
} from "@/store/thunks/game-thunks";

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
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    clearRoom: (state) => {
      state.currentRoom = null;
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    const setCurrentRoom = (state: RoomState, action: PayloadAction<Room>) => {
      state.currentRoom = action.payload;
    };

    builder
      .addCase(createRoom.fulfilled, setCurrentRoom)
      .addCase(joinRoom.fulfilled, setCurrentRoom)
      .addCase(toggleReady.fulfilled, setCurrentRoom)
      .addCase(startGame.fulfilled, setCurrentRoom)
      .addCase(submitAnswer.fulfilled, setCurrentRoom)
      .addCase(advanceRound.fulfilled, setCurrentRoom)
      .addCase(returnToLobby.fulfilled, setCurrentRoom)
      .addCase(fetchRoom.fulfilled, (state, action) => {
        state.currentRoom = action.payload.room;
        state.messages = action.payload.messages;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const { setRoom, updatePlayers, addMessage, setMessages, clearRoom } = roomSlice.actions;

export default roomSlice.reducer;
