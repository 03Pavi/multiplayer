/**
 * PartyVerse — Clear Firebase Realtime Database
 *
 * Run: node scripts/clear-rtdb.js
 *
 * Removes all data EXCEPT /users (user profile information).
 * Use this to reset the database to a clean state.
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

// Collections to clear (everything except user profiles)
const COLLECTIONS_TO_CLEAR = [
  "rooms",
  "messages",
  "leaderboard",
  "recent_arenas",
  "presence",
  "game_sessions",
];

async function clearDatabase() {
  console.log("🧹 PartyVerse Database Cleaner starting...\n");
  console.log(`📡 Target DB: ${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}\n`);

  for (const collection of COLLECTIONS_TO_CLEAR) {
    try {
      await db.ref(collection).remove();
      console.log(`✅ /${collection} — cleared`);
    } catch (err) {
      console.error(`❌ /${collection} — Failed:`, err.message);
    }
  }

  console.log("\n🎉 Database cleared! Only user profile data remains.");
  console.log("   Collections removed: " + COLLECTIONS_TO_CLEAR.join(", "));
  process.exit(0);
}

clearDatabase().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
