import axios from "axios";
import { GameType } from "@/types";

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export const aiService = {
  getGameContent: async (req: AIContentRequest): Promise<AIContentResponse> => {
    try {
      // Future API Call:
      // const res = await axios.post(`${API_BASE}/ai/game`, req);
      // return res.data;

      // Simulated local generator
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(aiService.generateMockContent(req.gameType, req.theme));
        }, 1200); // realistic network delay
      });
    } catch (error) {
      console.warn("AI API request failed, falling back to local simulation", error);
      return aiService.generateMockContent(req.gameType, req.theme);
    }
  },

  generateMockContent: (gameType: GameType, theme: string = "general"): AIContentResponse => {
    const mocks: { [key in GameType]: AIContentResponse[] } = {
      TruthOrDare: [
        {
          title: "Truth",
          prompt: "What is a gaming secret you have never told anyone?",
          durationSeconds: 20,
        },
        {
          title: "Dare",
          prompt: "Do a 10-second dramatic victory laugh or voice impression in the lobby.",
          durationSeconds: 25,
        },
      ],
      Quiz: [
        {
          title: "Gaming History",
          prompt: "Which console was the first to use optical discs for game storage?",
          options: ["Sega Saturn", "Sony PlayStation", "3DO Interactive Multiplayer", "PC Engine Duo"],
          durationSeconds: 15,
          gameData: { correctAnswer: "3DO Interactive Multiplayer" }, // Tech note: PC Engine / 3DO both did, CD-ROM² in 1988 was the addon, but 3DO was built-in.
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

    const categoryMocks = mocks[gameType] || mocks.TruthOrDare;
    return categoryMocks[Math.floor(Math.random() * categoryMocks.length)];
  },
};
