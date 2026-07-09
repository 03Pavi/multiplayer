import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getDatabase, Database } from "firebase-admin/database";

/**
 * Server-side Firebase Admin initialization.
 *
 * The REST API routes run without a signed-in user, so they cannot satisfy the
 * `auth != null` Realtime Database rules using the client SDK. The Admin SDK
 * authenticates with a service account (configured via FIREBASE_ADMIN_* env
 * vars) and bypasses security rules, which is the correct way to read/write
 * Firebase from trusted server code.
 */

let cachedDb: Database | null = null;

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // Private keys stored in env commonly have escaped newlines.
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    databaseURL,
  });
}

export function getAdminDb(): Database {
  if (!cachedDb) {
    cachedDb = getDatabase(getAdminApp());
  }
  return cachedDb;
}
