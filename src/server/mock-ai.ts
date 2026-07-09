import { GameType } from "@/types";

/**
 * Mock AI content source.
 *
 * All game content is generated locally from dummy data. This module is the
 * single seam to swap for a real AI provider later: replace `generateMockContent`
 * (or add `getGameContent` that calls an API) and the game engine in
 * `server/game-engine.ts` will pick it up unchanged.
 */

export interface AIContentResponse {
  title: string;
  prompt: string;
  options?: string[];
  durationSeconds: number;
  gameData?: any;
}

const MOCKS: { [key in GameType]: AIContentResponse[] } = {
  TruthOrDare: [
    {
      title: "Truth",
      prompt: "What is a gaming secret you have never told anyone?",
      durationSeconds: 45,
    },
    {
      title: "Dare",
      prompt: "Do a 10-second dramatic victory laugh or voice impression in the lobby.",
      durationSeconds: 45,
    },
  ],
  Quiz: [
    {
      title: "Gaming History",
      prompt: "Which console was the first to use optical discs for game storage?",
      options: ["Sega Saturn", "Sony PlayStation", "3DO Interactive Multiplayer", "PC Engine Duo"],
      durationSeconds: 15,
      gameData: { correctAnswer: "3DO Interactive Multiplayer" },
    },
    {
      title: "Esports Trivia",
      prompt: "What was the first esports tournament ever held?",
      options: ["Space Invaders Championship", "Intergalactic Spacewar! Championship", "Nintendo World Championships", "Quake Red Annihilation"],
      durationSeconds: 15,
      gameData: { correctAnswer: "Intergalactic Spacewar! Championship" },
    },
  ],
  StoryBuilder: [
    {
      title: "Neon Saga",
      prompt: "In a galaxy powered by neon soda, a spaceship captain accidentally pressed the 'turbo' button and landed inside a...",
      durationSeconds: 30,
    },
  ],
  Drawing: [
    {
      title: "Artist Challenge",
      prompt: "Sketch a legendary sword stuck in a broken computer monitor.",
      durationSeconds: 45,
    },
  ],
  Reaction: [
    {
      title: "Speed Test",
      prompt: "Wait for the light... then hit the trigger button instantly!",
      durationSeconds: 10,
    },
  ],
  WouldYouRather: [
    {
      title: "Developer Dilemma",
      prompt: "Would you rather compile all your code on a floppy disk OR use a mouse trackball for esports gaming?",
      options: ["Floppy Compilation", "Trackball Esports"],
      durationSeconds: 20,
    },
  ],
  NeverHaveIEver: [
    {
      title: "Gaming Confessions",
      prompt: "Never have I ever fallen asleep during a long RPG cutscene.",
      durationSeconds: 15,
    },
  ],
};

export function generateMockContent(gameType: GameType, theme: string = "general"): AIContentResponse {
  const categoryMocks = MOCKS[gameType] || MOCKS.TruthOrDare;
  return categoryMocks[Math.floor(Math.random() * categoryMocks.length)];
}
