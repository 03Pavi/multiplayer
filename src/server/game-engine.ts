import { GameType, Room, ServerGame, Player, RoundAnswer } from "@/types";
import { generateMockContent } from "@/server/mock-ai";
import { GAMES_CONFIG } from "@/features/games/config";
import { repository } from "@/server/repository";

/**
 * Authoritative game engine for the REST API.
 *
 * Ported from the old P2P socket manager, but event-driven instead of
 * timer/broadcast driven: each client action (start / answer / advance /
 * lobby) mutates the persisted room and returns the new state. There are no
 * server timers — a round advances when every player has submitted or when a
 * client explicitly calls "advance" (e.g. after its local countdown ends).
 */

function buildRound(gameType: GameType, round: number, totalRounds: number): ServerGame {
  const content = generateMockContent(gameType);
  // Floor the round timer to the game's configured action duration so players
  // always get enough time to read/discuss the task (e.g. Truth or Dare).
  const configured = GAMES_CONFIG[gameType]?.actionDurationSeconds || 0;
  const duration = Math.max(content.durationSeconds, configured);
  return {
    gameType,
    currentRound: round,
    totalRounds,
    phase: "action",
    prompt: content.prompt,
    options: content.options || [],
    timer: duration,
    correctAnswer: content.gameData?.correctAnswer ?? "",
    submissions: {},
    results: null,
  };
}

export const gameEngine = {
  /**
   * Host starts a game: reset scores, generate round 1.
   */
  startGame: (room: Room, gameType: GameType, totalRounds: number): Room => {
    room.status = "playing";
    room.gameType = gameType;
    room.players = room.players.map((p) => ({ ...p, score: 0, answers: [] }));
    room.game = buildRound(gameType, 1, totalRounds);
    return room;
  },

  /**
   * Records a submission. If everyone has answered, evaluate immediately.
   */
  submitAnswer: (room: Room, playerId: string, answer: string): Room => {
    if (!room.game || room.game.phase !== "action") return room;

    const submissions = { ...(room.game.submissions || {}) };
    submissions[playerId] = answer;
    room.game.submissions = submissions;

    const allSubmitted = room.players.every((p) => submissions[p.id] !== undefined);
    if (allSubmitted) {
      return gameEngine.evaluateRound(room);
    }
    return room;
  },

  /**
   * Evaluates the current round, updating scores and producing results.
   */
  evaluateRound: (room: Room): Room => {
    if (!room.game) return room;

    const gameType = room.gameType || "Quiz";
    const submissions = room.game.submissions || {};
    const answersList: RoundAnswer[] = [];
    let winnerId = "";
    let maxPoints = 0;

    const players = room.players;

    if (gameType === "Quiz") {
      const correct = room.game.correctAnswer || "";
      players.forEach((p) => {
        const ans = submissions[p.id] || "";
        const isCorrect = ans.toLowerCase().trim() === correct.toLowerCase().trim() && ans !== "";
        const points = isCorrect ? 100 : 0;
        p.score = (p.score || 0) + points;
        p.xp = (p.xp || 0) + points;
        answersList.push({ playerId: p.id, answer: ans, isCorrect, points });
        if (points > maxPoints) {
          maxPoints = points;
          winnerId = p.id;
        }
      });
    } else if (gameType === "Reaction") {
      let lowestMs = Infinity;
      players.forEach((p) => {
        const ans = submissions[p.id] || "9999ms";
        const ms = parseInt(ans.replace("ms", "")) || 9999;
        answersList.push({ playerId: p.id, answer: ans, ms });
        if (ms < lowestMs) {
          lowestMs = ms;
          winnerId = p.id;
        }
      });
      players.forEach((p) => {
        if (p.id === winnerId && lowestMs !== Infinity) {
          p.score = (p.score || 0) + 100;
          p.xp = (p.xp || 0) + 100;
        }
      });
    } else {
      players.forEach((p) => {
        const ans = submissions[p.id] || "Completed";
        p.score = (p.score || 0) + 50;
        p.xp = (p.xp || 0) + 50;
        answersList.push({ playerId: p.id, answer: ans, points: 50 });
      });
      winnerId = players[0]?.id || "";
    }

    room.game.phase = "results";
    room.game.timer = 5;
    room.game.results = { winnerId, answers: answersList };
    return room;
  },

  /**
   * Advances the game: action -> results (if not evaluated yet), or
   * results -> next round / match end.
   */
  advance: async (room: Room): Promise<Room> => {
    if (!room.game) return room;

    if (room.game.phase === "action") {
      return gameEngine.evaluateRound(room);
    }

    if (room.game.phase === "results") {
      const { currentRound, totalRounds, gameType } = room.game;
      if (currentRound < totalRounds) {
        room.game = buildRound(gameType, currentRound + 1, totalRounds);
        return room;
      }
      return gameEngine.endMatch(room);
    }

    return room;
  },

  /**
   * Ends the match: rank players, persist leaderboard + recent arena.
   */
  endMatch: async (room: Room): Promise<Room> => {
    if (!room.game) return room;
    const gameType = room.gameType || "Quiz";

    const sorted = [...room.players].sort((a, b) => (b.score || 0) - (a.score || 0));
    const winner = sorted[0];

    await repository.addRecentArena({
      id: `arena-${Date.now()}`,
      game: gameType,
      rank: winner ? `${winner.name} Won` : "Completed",
      xpEarned: "+250 XP",
      date: "Just Now",
    });

    for (const p of room.players) {
      const newXp = (p.xp || 0) + (p.score || 0);
      const newLevel = Math.floor(newXp / 500) + 1;
      const ranks = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
      const rankIdx = Math.min(Math.floor(newLevel / 2), ranks.length - 1);
      await repository.updateLeaderboardXP({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        xp: newXp,
        level: newLevel,
        rank: ranks[rankIdx],
      });
    }

    const podium = sorted.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score || 0,
      avatar: p.avatar,
    }));

    room.status = "ended";
    room.game.phase = "ended";
    room.game.podium = podium;
    return room;
  },

  /**
   * Returns the room to the lobby, clearing game state.
   */
  returnToLobby: (room: Room): Room => {
    room.status = "lobby";
    room.gameType = undefined;
    room.game = undefined;
    room.players = room.players.map((p) => ({
      ...p,
      isReady: p.isHost,
      score: 0,
      answers: [],
    }));
    return room;
  },
};
