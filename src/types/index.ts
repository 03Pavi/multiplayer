export interface Player {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  rank: string;
  isHost: boolean;
  isReady: boolean;
  isOnline: boolean;
  status?: string;
  score?: number;
  answers?: string[];
  typing?: boolean;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  isPrivate: boolean;
  gameType?: GameType;
  status: RoomStatus;
  createdAt: string;
  game?: ServerGame;
}

/**
 * Authoritative game state persisted on the server (via REST API + Firebase).
 * Replaces the previous in-memory P2P/socket game loop. Each client reads this
 * via GET and mutates it through POST actions (manual refresh, no realtime).
 */
export interface RoundAnswer {
  playerId: string;
  answer: string;
  isCorrect?: boolean;
  points?: number;
  ms?: number;
}

export interface ServerGame {
  gameType: GameType;
  currentRound: number;
  totalRounds: number;
  phase: "action" | "results" | "ended";
  prompt: string;
  options?: string[];
  timer: number;
  correctAnswer?: string;
  submissions?: Record<string, string>;
  results?: { winnerId: string; answers: RoundAnswer[] } | null;
  podium?: { id: string; name: string; score: number; avatar: string }[];
}

export type RoomStatus = "lobby" | "playing" | "ended";

export type GameType =
  | "TruthOrDare"
  | "Quiz"
  | "StoryBuilder"
  | "Drawing"
  | "Reaction"
  | "WouldYouRather"
  | "NeverHaveIEver";

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  rank: string;
  bio: string;
  wins: number;
  gamesPlayed: number;
  badges: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface GameState {
  gameType: GameType;
  status: "idle" | "intro" | "round_prompt" | "action" | "voting" | "round_results" | "ended";
  currentRound: number;
  totalRounds: number;
  timer: number;
  prompt: string;
  options?: string[];
  gameData?: any;
}
