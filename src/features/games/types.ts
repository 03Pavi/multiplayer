import React from "react";
import { GameState } from "@/types";

export interface GameConfig {
  id: string;
  title: string;
  emoji: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  rounds: number;
  actionDurationSeconds: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface GameModule {
  config: GameConfig;
  getInitialState: () => any;
  handleAction: (state: any, action: string, playerId: string, payload: any) => any;
  GameplayComponent: React.ComponentType<{
    gameState: GameState;
    playerAnswers: { playerId: string; answer: string }[];
    onSubmitAnswer: (answer: string) => void;
    onSubmitVote: (votedFor: string) => void;
  }>;
}
