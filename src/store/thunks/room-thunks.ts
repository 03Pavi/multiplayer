import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/services/api-client";
import { Room, Message, UserProfile } from "@/types";

/**
 * Room feature actions. Each thunk calls the REST rooms/messages routes.
 * Components dispatch these; the room/game slices react to fulfilled results.
 *
 *   GET    /api/rooms          -> list public rooms
 *   POST   /api/rooms          -> create room
 *   GET    /api/rooms/[id]     -> single room (+ messages)
 *   DELETE /api/rooms/[id]     -> delete room
 *   PATCH  /api/rooms/[id]     -> room actions (join/leave/ready) via `action`
 *   GET    /api/messages       -> list messages
 *   POST   /api/messages       -> send message
 */

export const fetchPublicRooms = createAsyncThunk("rooms/fetchPublic", async () => {
  const data = await apiGet<{ rooms: Room[] }>("/api/rooms");
  return data.rooms;
});

export const createRoom = createAsyncThunk(
  "rooms/create",
  async (payload: { user: UserProfile; roomName: string; maxPlayers: number; isPrivate: boolean }) => {
    const data = await apiPost<{ room: Room }>("/api/rooms", payload);
    return data.room;
  }
);

export const fetchRoom = createAsyncThunk("rooms/fetch", async (code: string) => {
  const data = await apiGet<{ room: Room; messages: Message[] }>(
    `/api/rooms/${encodeURIComponent(code)}`
  );
  return data;
});

export const deleteRoom = createAsyncThunk("rooms/delete", async (code: string) => {
  await apiDelete(`/api/rooms/${encodeURIComponent(code)}`);
  return code;
});

export const joinRoom = createAsyncThunk(
  "rooms/join",
  async (payload: { code: string; user: UserProfile }) => {
    const data = await apiPatch<{ room: Room }>(`/api/rooms/${encodeURIComponent(payload.code)}`, {
      action: "join",
      user: payload.user,
    });
    return data.room;
  }
);

export const leaveRoom = createAsyncThunk(
  "rooms/leave",
  async (payload: { code: string; userId: string }) => {
    await apiPatch(`/api/rooms/${encodeURIComponent(payload.code)}`, {
      action: "leave",
      userId: payload.userId,
    });
    return payload.code;
  }
);

export const toggleReady = createAsyncThunk(
  "rooms/ready",
  async (payload: { code: string; userId: string }) => {
    const data = await apiPatch<{ room: Room }>(`/api/rooms/${encodeURIComponent(payload.code)}`, {
      action: "ready",
      userId: payload.userId,
    });
    return data.room;
  }
);

export const fetchMessages = createAsyncThunk("messages/fetch", async (code: string) => {
  const data = await apiGet<{ messages: Message[] }>(
    `/api/messages?code=${encodeURIComponent(code)}`
  );
  return data.messages;
});

export const sendMessage = createAsyncThunk(
  "messages/send",
  async (payload: {
    code: string;
    sender: { id: string; name: string; avatar: string };
    content: string;
    isSystem?: boolean;
  }) => {
    const data = await apiPost<{ message: Message }>("/api/messages", payload);
    return data.message;
  }
);
