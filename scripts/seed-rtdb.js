/**
 * PartyVerse AI — Firebase Realtime Database Seed Script
 *
 * Run: node scripts/seed-rtdb.js
 *
 * This creates all required collections with seed data and enforces
 * the correct schema structure in the Firebase Realtime Database.
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const path = require("path");

// ─── Load .env.local manually ───────────────────────────────────────────────
const fs = require("fs");
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=").replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");
    process.env[key.trim()] = value;
  }
}

// ─── Init Admin ──────────────────────────────────────────────────────────────
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  }),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
});

const db = getDatabase();

// ─── Schema ──────────────────────────────────────────────────────────────────

const NOW = Date.now();

/**
 * /rooms/{code}
 * Active game rooms. Cleaned up when status = "ended".
 */
const rooms = {
  DEMO1: {
    id: "room-demo1",
    code: "DEMO1",
    name: "Demo Party Room",
    maxPlayers: 6,
    isPrivate: false,
    status: "lobby",          // lobby | playing | ended
    hostId: "user-seed-1",
    gameType: null,
    createdAt: new Date().toISOString(),
    players: {
      "user-seed-1": {
        id: "user-seed-1",
        name: "Alpha Player",
        avatar: "🦊",
        level: 5,
        xp: 1200,
        rank: "Gold",
        score: 0,
        isHost: true,
        isReady: false,
        isOnline: true,
      },
    },
  },
};

/**
 * /messages/{roomCode}/{msgId}
 * Per-room chat messages.
 */
const messages = {
  DEMO1: {
    "msg-seed-1": {
      id: "msg-seed-1",
      content: "Welcome to PartyVerse! 🎉",
      senderId: "system",
      senderName: "PartyVerse",
      senderAvatar: "🎮",
      timestamp: NOW,
    },
  },
};

/**
 * /leaderboard/{userId}
 * Global XP rankings, updated after each match.
 */
const leaderboard = {
  "user-seed-1": {
    id: "user-seed-1",
    name: "Alpha Player",
    avatar: "🦊",
    xp: 1200,
    level: 5,
    rank: "Gold",
    wins: 12,
    gamesPlayed: 20,
    updatedAt: NOW,
  },
  "user-seed-2": {
    id: "user-seed-2",
    name: "Beta Gamer",
    avatar: "🐰",
    xp: 950,
    level: 3,
    rank: "Silver",
    wins: 7,
    gamesPlayed: 15,
    updatedAt: NOW,
  },
  "user-seed-3": {
    id: "user-seed-3",
    name: "PixelQueen",
    avatar: "👾",
    xp: 2100,
    level: 8,
    rank: "Platinum",
    wins: 25,
    gamesPlayed: 38,
    updatedAt: NOW,
  },
  "user-seed-4": {
    id: "user-seed-4",
    name: "ShadowNinja",
    avatar: "🐱",
    xp: 3400,
    level: 14,
    rank: "Diamond",
    wins: 41,
    gamesPlayed: 57,
    updatedAt: NOW,
  },
  "user-seed-5": {
    id: "user-seed-5",
    name: "MemeLord",
    avatar: "🐼",
    xp: 420,
    level: 2,
    rank: "Bronze",
    wins: 3,
    gamesPlayed: 9,
    updatedAt: NOW,
  },
};

/**
 * /recent_arenas/{arenaId}
 * Log of completed matches shown in the Dashboard.
 */
const recent_arenas = {
  "arena-seed-1": {
    id: "arena-seed-1",
    game: "AI Quiz",
    rank: "1st Place",
    xpEarned: "+300 XP",
    date: "2 hours ago",
    players: 4,
    winner: "ShadowNinja",
    createdAt: NOW - 2 * 60 * 60 * 1000,
  },
  "arena-seed-2": {
    id: "arena-seed-2",
    game: "Truth or Dare",
    rank: "Completed",
    xpEarned: "+150 XP",
    date: "5 hours ago",
    players: 6,
    winner: "PixelQueen",
    createdAt: NOW - 5 * 60 * 60 * 1000,
  },
  "arena-seed-3": {
    id: "arena-seed-3",
    game: "Reaction Challenge",
    rank: "2nd Place",
    xpEarned: "+200 XP",
    date: "Yesterday",
    players: 3,
    winner: "Alpha Player",
    createdAt: NOW - 24 * 60 * 60 * 1000,
  },
};

/**
 * /presence/{userId}
 * Real-time online status. lastSeen is refreshed every session.
 * Entries older than 5 min are treated as offline.
 */
const presence = {
  "user-seed-3": {
    id: "user-seed-3",
    name: "PixelQueen",
    avatar: "👾",
    level: 8,
    rank: "Platinum",
    online: true,
    lastSeen: NOW,
  },
  "user-seed-4": {
    id: "user-seed-4",
    name: "ShadowNinja",
    avatar: "🐱",
    level: 14,
    rank: "Diamond",
    online: true,
    lastSeen: NOW,
  },
  "user-seed-5": {
    id: "user-seed-5",
    name: "MemeLord",
    avatar: "🐼",
    level: 2,
    rank: "Bronze",
    online: true,
    lastSeen: NOW,
  },
};

/**
 * /game_sessions/{sessionId}
 * Archived game session logs for history / analytics.
 */
const game_sessions = {
  "session-seed-1": {
    id: "session-seed-1",
    roomCode: "DEMO1",
    gameType: "Quiz",
    totalRounds: 5,
    startedAt: NOW - 3 * 60 * 60 * 1000,
    endedAt: NOW - 2.5 * 60 * 60 * 1000,
    winnerId: "user-seed-4",
    players: ["user-seed-1", "user-seed-3", "user-seed-4"],
    scores: {
      "user-seed-1": 200,
      "user-seed-3": 350,
      "user-seed-4": 500,
    },
  },
};

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  console.log("🚀 PartyVerse RTDB Seeder starting...\n");
  console.log(`📡 Target DB: ${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}\n`);

  const collections = {
    rooms,
    messages,
    leaderboard,
    recent_arenas,
    presence,
    game_sessions,
  };

  for (const [collection, data] of Object.entries(collections)) {
    try {
      const ref = db.ref(collection);
      await ref.set(data);
      console.log(`✅ /${collection} — ${Object.keys(data).length} records written`);
    } catch (err) {
      console.error(`❌ /${collection} — Failed:`, err.message);
    }
  }

  console.log("\n🎉 Database seed complete!");
  console.log("\n📋 Collections created:");
  console.log("  /rooms           — Active game rooms");
  console.log("  /messages        — Per-room chat messages");
  console.log("  /leaderboard     — Global XP rankings");
  console.log("  /recent_arenas   — Match history log");
  console.log("  /presence        — Real-time online status");
  console.log("  /game_sessions   — Archived session data");
  process.exit(0);
}

seed().catch((err) => {
  console.error("\n💥 Fatal seed error:", err);
  process.exit(1);
});
