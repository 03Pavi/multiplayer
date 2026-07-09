import { getAdminDb } from "@/server/firebase-admin";
import { Room, Player, Message } from "@/types";

/**
 * Server-side data access for the REST API, backed by the Firebase Admin SDK.
 *
 * This replaces the previous realtime `onValue` subscriptions and the P2P
 * socket manager. Every function performs a one-time Admin read/write so the
 * client can talk to plain REST endpoints and refresh manually. The Admin SDK
 * bypasses the `auth != null` database rules, which unauthenticated server
 * requests cannot satisfy with the client SDK.
 */

const stripUndefined = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map(stripUndefined) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, stripUndefined(item)])
    ) as T;
  }
  return value;
};

const normalizeRoom = (room: any): Room => {
  if (!room) return room;
  let playersList: Player[] = [];
  if (room.players) {
    if (Array.isArray(room.players)) {
      playersList = room.players.filter(Boolean);
    } else if (typeof room.players === "object") {
      playersList = Object.values(room.players);
    }
  }
  return { ...room, players: playersList };
};

export const repository = {
  /* ----------------------------- Rooms ----------------------------- */

  getRoom: async (code: string): Promise<Room | null> => {
    const snapshot = await getAdminDb().ref(`rooms/${code}`).get();
    const data = snapshot.val();
    return data ? normalizeRoom(data) : null;
  },

  getPublicRooms: async (): Promise<Room[]> => {
    const snapshot = await getAdminDb().ref("rooms").get();
    const data = snapshot.val();
    if (!data) return [];
    return (Object.values(data) as any[])
      .map(normalizeRoom)
      .filter((r) => !r.isPrivate && r.status !== "ended");
  },

  createRoom: async (room: Room): Promise<Room> => {
    await getAdminDb().ref(`rooms/${room.code}`).set(stripUndefined(room));
    return room;
  },

  updateRoom: async (code: string, room: Partial<Room>): Promise<void> => {
    await getAdminDb().ref(`rooms/${code}`).update(stripUndefined(room));
  },

  saveRoom: async (room: Room): Promise<Room> => {
    await getAdminDb().ref(`rooms/${room.code}`).set(stripUndefined(room));
    return room;
  },

  deleteRoom: async (code: string): Promise<void> => {
    await getAdminDb().ref(`rooms/${code}`).remove();
    await getAdminDb().ref(`messages/${code}`).remove();
  },

  /* ---------------------------- Messages --------------------------- */

  getMessages: async (code: string): Promise<Message[]> => {
    const snapshot = await getAdminDb().ref(`messages/${code}`).get();
    const data = snapshot.val();
    if (!data) return [];
    return (Object.values(data) as Message[]).sort((a, b) =>
      (a.timestamp || "").localeCompare(b.timestamp || "")
    );
  },

  addMessage: async (code: string, msg: Message): Promise<Message> => {
    const newMsgRef = getAdminDb().ref(`messages/${code}`).push();
    const stored = { ...msg, id: newMsgRef.key as string };
    await newMsgRef.set(stripUndefined(stored));
    return stored;
  },

  /* --------------------------- Leaderboard ------------------------- */

  getLeaderboard: async (): Promise<any[]> => {
    const snapshot = await getAdminDb().ref("leaderboard").get();
    const data = snapshot.val();
    if (!data) return [];
    return (Object.values(data) as any[]).sort((a, b) => (b.xp || 0) - (a.xp || 0));
  },

  updateLeaderboardXP: async (user: {
    id: string;
    name: string;
    avatar: string;
    xp: number;
    level: number;
    rank: string;
  }): Promise<void> => {
    await getAdminDb().ref(`leaderboard/${user.id}`).set(stripUndefined(user));
  },

  /* --------------------------- Recent Arenas ----------------------- */

  getRecentArenas: async (): Promise<any[]> => {
    const snapshot = await getAdminDb().ref("recent_arenas").get();
    const data = snapshot.val();
    if (!data) return [];
    return (Object.values(data) as any[]).reverse();
  },

  addRecentArena: async (arena: {
    id: string;
    game: string;
    rank: string;
    xpEarned: string;
    date: string;
  }): Promise<void> => {
    const newArenaRef = getAdminDb().ref("recent_arenas").push();
    await newArenaRef.set({ ...arena, id: newArenaRef.key });
  },

  /* ----------------------------- Presence -------------------------- */

  getOnlinePlayers: async (): Promise<any[]> => {
    const snapshot = await getAdminDb().ref("presence").get();
    const data = snapshot.val();
    if (!data) return [];
    const now = Date.now();
    const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;
    return (Object.values(data) as any[])
      .filter((p) => p.online && now - (p.lastSeen || 0) < ONLINE_THRESHOLD_MS)
      .sort((a, b) => (b.level || 0) - (a.level || 0));
  },

  setPresence: async (user: {
    id: string;
    name: string;
    avatar: string;
    level: number;
    rank: string;
  }): Promise<void> => {
    await getAdminDb()
      .ref(`presence/${user.id}`)
      .set({ ...stripUndefined(user), online: true, lastSeen: Date.now() });
  },

  clearPresence: async (userId: string): Promise<void> => {
    await getAdminDb().ref(`presence/${userId}`).remove();
  },
};
