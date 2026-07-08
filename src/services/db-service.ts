import { ref, set, push, onValue, off, update } from "firebase/database";
import { rtdb } from "@/shared/config/firebase.config";
import { Room, Player, Message } from "@/types";

// In-Memory fallback store
const localStore: {
  rooms: { [code: string]: Room };
  messages: { [code: string]: Message[] };
  leaderboard: { [id: string]: any };
  recent_arenas: any[];
  presence: { [id: string]: any };
} = {
  rooms: {},
  messages: {},
  leaderboard: {
    "host-1": { id: "host-1", name: "Alpha Player", avatar: "🦊", xp: 1200, level: 5, rank: "Gold" },
    "guest-1": { id: "guest-1", name: "Beta Gamer", avatar: "🐰", xp: 950, level: 3, rank: "Silver" },
  },
  recent_arenas: [
    { id: "arena-1", game: "Quiz", rank: "1st Place", xpEarned: "+300 XP", date: "1 hour ago" },
    { id: "arena-2", game: "TruthOrDare", rank: "Completed", xpEarned: "+150 XP", date: "2 hours ago" },
  ],
  presence: {
    "p-1": { id: "p-1", name: "PixelQueen", avatar: "👾", level: 8, rank: "Silver", online: true, lastSeen: Date.now() },
    "p-2": { id: "p-2", name: "ShadowNinja", avatar: "🦊", level: 14, rank: "Platinum", online: true, lastSeen: Date.now() },
    "p-3": { id: "p-3", name: "MemeLord", avatar: "🐼", level: 4, rank: "Bronze", online: true, lastSeen: Date.now() },
  },
};

export const dbService = {
  /**
   * Creates a dynamic multiplayer room in the database.
   */
  createRoom: async (room: Room) => {
    try {
      localStore.rooms[room.code] = room;
      await set(ref(rtdb, `rooms/${room.code}`), room);
      return true;
    } catch (e) {
      console.warn("[Firebase RTDB] Using Local Store Fallback for createRoom:", e);
      return true;
    }
  },

  /**
   * Listens to public rooms in real-time.
   */
  subscribeToPublicRooms: (callback: (rooms: Room[]) => void) => {
    const roomsRef = ref(rtdb, "rooms");
    let fallbackTimer: any;

    const useLocalFallback = () => {
      if (fallbackTimer) clearInterval(fallbackTimer);
      fallbackTimer = setInterval(() => {
        const roomList = Object.values(localStore.rooms);
        const publicRooms = roomList.filter((r) => !r.isPrivate && r.status !== "ended");
        callback(publicRooms);
      }, 1000);
    };

    try {
      const unsubscribe = onValue(
        roomsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (!data) {
            callback([]);
            return;
          }
          const roomList: Room[] = Object.values(data);
          const publicRooms = roomList.filter((r) => !r.isPrivate && r.status !== "ended");
          callback(publicRooms);
        },
        (error) => {
          console.warn("[Firebase RTDB] Permission denied. Falling back to local rooms stream.", error);
          useLocalFallback();
        }
      );

      return () => {
        if (fallbackTimer) clearInterval(fallbackTimer);
        unsubscribe();
      };
    } catch (e) {
      useLocalFallback();
      return () => {
        if (fallbackTimer) clearInterval(fallbackTimer);
      };
    }
  },

  /**
   * Listens to a specific room's parameters.
   */
  subscribeToRoom: (code: string, callback: (room: Room | null) => void) => {
    const roomRef = ref(rtdb, `rooms/${code}`);
    let fallbackTimer: any;

    const useLocalFallback = () => {
      if (fallbackTimer) clearInterval(fallbackTimer);
      fallbackTimer = setInterval(() => {
        callback(localStore.rooms[code] || null);
      }, 1000);
    };

    try {
      const unsubscribe = onValue(
        roomRef,
        (snapshot) => {
          const data = snapshot.val();
          callback(data || localStore.rooms[code] || null);
        },
        (error) => {
          console.warn(`[Firebase RTDB] Permission denied for room ${code}. Switching to local state.`, error);
          useLocalFallback();
        }
      );

      return () => {
        if (fallbackTimer) clearInterval(fallbackTimer);
        unsubscribe();
      };
    } catch (e) {
      useLocalFallback();
      return () => {
        if (fallbackTimer) clearInterval(fallbackTimer);
      };
    }
  },

  /**
   * Subscribes to chat messages in a room.
   */
  subscribeToMessages: (code: string, callback: (messages: Message[]) => void) => {
    const messagesRef = ref(rtdb, `messages/${code}`);
    let fallbackTimer: any;

    const useLocalFallback = () => {
      if (fallbackTimer) clearInterval(fallbackTimer);
      fallbackTimer = setInterval(() => {
        callback(localStore.messages[code] || []);
      }, 1000);
    };

    try {
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
          console.warn("[Firebase RTDB] Chat messages access denied. Falling back to local messages.", error);
          useLocalFallback();
        }
      );

      return () => {
        if (fallbackTimer) clearInterval(fallbackTimer);
        unsubscribe();
      };
    } catch (e) {
      useLocalFallback();
      return () => {
        if (fallbackTimer) clearInterval(fallbackTimer);
      };
    }
  },

  /**
   * Pushes a new chat message to the room's message feed.
   */
  sendChatMessage: async (code: string, msg: Message) => {
    try {
      if (!localStore.messages[code]) {
        localStore.messages[code] = [];
      }
      const newMsg = { ...msg, id: `msg-${Date.now()}` };
      localStore.messages[code].push(newMsg);

      const newMsgRef = push(ref(rtdb, `messages/${code}`));
      await set(newMsgRef, { ...msg, id: newMsgRef.key });
      return true;
    } catch (e) {
      console.warn("[Firebase RTDB] Using Local Store for sendChatMessage:", e);
      return true;
    }
  },

  /**
   * Updates players roster in a room.
   */
  updateRoomPlayers: async (code: string, players: Player[]) => {
    try {
      if (localStore.rooms[code]) {
        localStore.rooms[code].players = players;
      }
      await update(ref(rtdb, `rooms/${code}`), { players });
      return true;
    } catch (e) {
      console.warn("[Firebase RTDB] Using Local Store for updateRoomPlayers:", e);
      return true;
    }
  },

  /**
   * Subscribes to the leaderboard table.
   */
  subscribeToLeaderboard: (callback: (leaderboard: any[]) => void) => {
    const leaderboardRef = ref(rtdb, "leaderboard");
    let fallbackTimer: any;

    const useLocalFallback = () => {
      if (fallbackTimer) clearInterval(fallbackTimer);
      fallbackTimer = setInterval(() => {
        const list = Object.values(localStore.leaderboard).sort((a: any, b: any) => b.xp - a.xp);
        callback(list);
      }, 2000);
    };

    try {
      const unsubscribe = onValue(
        leaderboardRef,
        (snapshot) => {
          const data = snapshot.val();
          if (!data) {
            const list = Object.values(localStore.leaderboard).sort((a: any, b: any) => b.xp - a.xp);
            callback(list);
            return;
          }
          const list = Object.values(data).sort((a: any, b: any) => b.xp - a.xp);
          callback(list);
        },
        (error) => {
          console.warn("[Firebase RTDB] Leaderboard read denied. Switched to local standings.", error);
          useLocalFallback();
        }
      );

      return () => {
        if (fallbackTimer) clearInterval(fallbackTimer);
        unsubscribe();
      };
    } catch (e) {
      useLocalFallback();
      return () => {
        if (fallbackTimer) clearInterval(fallbackTimer);
      };
    }
  },

  /**
   * Updates or saves user leaderboard status.
   */
  updateLeaderboardXP: async (user: { id: string; name: string; avatar: string; xp: number; level: number; rank: string }) => {
    try {
      localStore.leaderboard[user.id] = user;
      await set(ref(rtdb, `leaderboard/${user.id}`), user);
      return true;
    } catch (e) {
      console.warn("[Firebase RTDB] Local Store updated for leaderboard status.", e);
      return true;
    }
  },

  /**
   * Subscribes to recent arena matches.
   */
  subscribeToRecentArenas: (callback: (arenas: any[]) => void) => {
    const arenasRef = ref(rtdb, "recent_arenas");
    let fallbackTimer: any;

    const useLocalFallback = () => {
      if (fallbackTimer) clearInterval(fallbackTimer);
      fallbackTimer = setInterval(() => {
        callback([...localStore.recent_arenas].reverse());
      }, 2000);
    };

    try {
      const unsubscribe = onValue(
        arenasRef,
        (snapshot) => {
          const data = snapshot.val();
          if (!data) {
            callback([...localStore.recent_arenas].reverse());
            return;
          }
          callback(Object.values(data).reverse());
        },
        (error) => {
          console.warn("[Firebase RTDB] Recent arenas read denied. Switched to local matches feed.", error);
          useLocalFallback();
        }
      );

      return () => {
        if (fallbackTimer) clearInterval(fallbackTimer);
        unsubscribe();
      };
    } catch (e) {
      useLocalFallback();
      return () => {
        if (fallbackTimer) clearInterval(fallbackTimer);
      };
    }
  },

  /**
   * Saves a newly completed match to the recent arenas feed.
   */
  addRecentArena: async (arena: { id: string; game: string; rank: string; xpEarned: string; date: string }) => {
    try {
      localStore.recent_arenas.push(arena);
      const newArenaRef = push(ref(rtdb, "recent_arenas"));
      await set(newArenaRef, { ...arena, id: newArenaRef.key });
      return true;
    } catch (e) {
      console.warn("[Firebase RTDB] Saved to local match log.", e);
      return true;
    }
  },

  /**
   * Registers the current user as online in the presence system.
   */
  setPresence: async (user: { id: string; name: string; avatar: string; level: number; rank: string }) => {
    const entry = { ...user, online: true, lastSeen: Date.now() };
    localStore.presence[user.id] = entry;
    try {
      await set(ref(rtdb, `presence/${user.id}`), entry);
    } catch (e) {
      // silently fallback to local
    }
  },

  /**
   * Removes the current user from the presence system (on logout/leave).
   */
  clearPresence: async (userId: string) => {
    delete localStore.presence[userId];
    try {
      await set(ref(rtdb, `presence/${userId}`), null);
    } catch (e) {
      // silently ignore
    }
  },

  /**
   * Subscribes to online players (presence feed) in real-time.
   * Shows players who were seen in the last 5 minutes.
   */
  subscribeToOnlinePlayers: (callback: (players: any[]) => void) => {
    const presenceRef = ref(rtdb, "presence");
    const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
    let fallbackTimer: any;

    const filterOnline = (data: Record<string, any>) => {
      const now = Date.now();
      return Object.values(data)
        .filter((p: any) => p.online && now - (p.lastSeen || 0) < ONLINE_THRESHOLD_MS)
        .sort((a: any, b: any) => b.level - a.level);
    };

    const useLocalFallback = () => {
      if (fallbackTimer) clearInterval(fallbackTimer);
      fallbackTimer = setInterval(() => {
        callback(filterOnline(localStore.presence));
      }, 3000);
      // Immediately emit
      callback(filterOnline(localStore.presence));
    };

    try {
      const unsubscribe = onValue(
        presenceRef,
        (snapshot) => {
          const data = snapshot.val();
          if (!data) {
            callback(filterOnline(localStore.presence));
            return;
          }
          callback(filterOnline(data));
        },
        (error) => {
          console.warn("[Firebase RTDB] Presence read denied. Using local presence.", error);
          useLocalFallback();
        }
      );

      return () => {
        if (fallbackTimer) clearInterval(fallbackTimer);
        unsubscribe();
      };
    } catch (e) {
      useLocalFallback();
      return () => {
        if (fallbackTimer) clearInterval(fallbackTimer);
      };
    }
  },
};
