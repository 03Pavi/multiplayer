import { GameType } from "@/types";

/**
 * Client-side AI contract (currently unused on the client).
 *
 * Game content is generated server-side from dummy data in `server/mock-ai.ts`.
 * When a real AI provider is integrated, this is the client-facing contract:
 * the server route will call the provider and return `AIContentResponse`.
 * Keep these types as the shared shape.
 */

export interface AIContentRequest {
  gameType: GameType;
  playersCount: number;
  theme?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface AIContentResponse {
  title: string;
  prompt: string;
  options?: string[];
  durationSeconds: number;
  gameData?: any;
}
