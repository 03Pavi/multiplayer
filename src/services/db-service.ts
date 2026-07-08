import { ref, set, push, onValue, off, update, remove } from "firebase/database";
import { rtdb } from "@/shared/config/firebase.config";
import { Room, Player, Message } from "@/types";

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
  return {
    ...room,
    players: playersList,
  };
};

export const dbService = {
  /**
   * Creates a dynamic multiplayer room in the database.
   */
  createRoom: async (room: Room) => {
    await set(ref(rtdb, `rooms/${room.code}`), room);
    return true;
  },

  /**
   * Deletes a room and its associated messages from the database.
   */
  deleteRoom: async (code: string) => {
    await remove(ref(rtdb, `rooms/${code}`));
    await remove(ref(rtdb, `messages/${code}`));
    return true;
  },

  /**
   * Listens to public rooms in real-time.
   */
  subscribeToPublicRooms: (callback: (rooms: Room[]) => void) => {
    const roomsRef = ref(rtdb, "rooms");
    const unsubscribe = onValue(
      roomsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          callback([]);
          return;
        }
        const roomList: Room[] = Object.values(data).map(normalizeRoom);
        const publicRooms = roomList.filter((r) => !r.isPrivate && r.status !== "ended");
        callback(publicRooms);
      },
      (error) => {
        console.error("[Firebase RTDB] Public rooms access denied:", error);
        callback([]);
      }
    );
    return unsubscribe;
  },

  /**
   * Listens to a specific room's parameters.
   */
  subscribeToRoom: (code: string, callback: (room: Room | null) => void) => {
    const roomRef = ref(rtdb, `rooms/${code}`);
    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        const data = snapshot.val();
        callback(data ? normalizeRoom(data) : null);
      },
      (error) => {
        console.error(`[Firebase RTDB] Access denied for room ${code}:`, error);
        callback(null);
      }
    );
    return unsubscribe;
  },

  /**
   * Subscribes to chat messages in a room.
   */
  subscribeToMessages: (code: string, callback: (messages: Message[]) => void) => {
    const messagesRef = ref(rtdb, `messages/${code}`);
    const unsubscribe = onValue(
      messagesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          callback([]);
          return;
        }
        callback(Object.values(data));
      },
      (error) => {
        console.error(`[Firebase RTDB] Chat messages access denied for ${code}:`, error);
        callback([]);
      }
    );
    return unsubscribe;
  },

  /**
   * Pushes a new chat message to the room's message feed.
   */
  sendChatMessage: async (code: string, msg: Message) => {
    const newMsgRef = push(ref(rtdb, `messages/${code}`));
    await set(newMsgRef, { ...msg, id: newMsgRef.key });
    return true;
  },

  /**
   * Updates players roster in a room.
   */
  updateRoomPlayers: async (code: string, players: Player[]) => {
    await update(ref(rtdb, `rooms/${code}`), { players });
    return true;
  },

  /**
   * Subscribes to the leaderboard table.
   */
  subscribeToLeaderboard: (callback: (leaderboard: any[]) => void) => {
    const leaderboardRef = ref(rtdb, "leaderboard");
    const unsubscribe = onValue(
      leaderboardRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          callback([]);
          return;
        }
        const list = Object.values(data).sort((a: any, b: any) => b.xp - a.xp);
        callback(list);
      },
      (error) => {
        console.error("[Firebase RTDB] Leaderboard read denied:", error);
        callback([]);
      }
    );
    return unsubscribe;
  },

  /**
   * Updates or saves user leaderboard status.
   */
  updateLeaderboardXP: async (user: { id: string; name: string; avatar: string; xp: number; level: number; rank: string }) => {
    await set(ref(rtdb, `leaderboard/${user.id}`), user);
    return true;
  },

  /**
   * Subscribes to recent arena matches.
   */
  subscribeToRecentArenas: (callback: (arenas: any[]) => void) => {
    const arenasRef = ref(rtdb, "recent_arenas");
    const unsubscribe = onValue(
      arenasRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          callback([]);
          return;
        }
        callback(Object.values(data).reverse());
      },
      (error) => {
        console.error("[Firebase RTDB] Recent arenas read denied:", error);
        callback([]);
      }
    );
    return unsubscribe;
  },

  /**
   * Saves a newly completed match to the recent arenas feed.
   */
  addRecentArena: async (arena: { id: string; game: string; rank: string; xpEarned: string; date: string }) => {
    const newArenaRef = push(ref(rtdb, "recent_arenas"));
    await set(newArenaRef, { ...arena, id: newArenaRef.key });
    return true;
  },

  /**
   * Registers the current user as online in the presence system.
   */
  setPresence: async (user: { id: string; name: string; avatar: string; level: number; rank: string }) => {
    const entry = { ...user, online: true, lastSeen: Date.now() };
    await set(ref(rtdb, `presence/${user.id}`), entry);
  },

  /**
   * Removes the current user from the presence system (on logout/leave).
   */
  clearPresence: async (userId: string) => {
    await set(ref(rtdb, `presence/${userId}`), null);
  },

  /**
   * Subscribes to online players (presence feed) in real-time.
   * Shows players who were seen in the last 5 minutes.
   */
  subscribeToOnlinePlayers: (callback: (players: any[]) => void) => {
    const presenceRef = ref(rtdb, "presence");
    const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

    const filterOnline = (data: Record<string, any>) => {
      const now = Date.now();
      return Object.values(data)
        .filter((p: any) => p.online && now - (p.lastSeen || 0) < ONLINE_THRESHOLD_MS)
        .sort((a: any, b: any) => b.level - a.level);
    };

    const unsubscribe = onValue(
      presenceRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          callback([]);
          return;
        }
        callback(filterOnline(data));
      },
      (error) => {
        console.error("[Firebase RTDB] Presence read denied:", error);
        callback([]);
      }
    );
    return unsubscribe;
  },
};
