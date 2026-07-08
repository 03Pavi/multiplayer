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
