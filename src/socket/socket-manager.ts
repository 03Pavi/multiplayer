import { Player, Room, Message, GameType, GameState } from "@/types";
import Peer, { DataConnection } from "peerjs";
import { dbService } from "@/services/db-service";
import { aiService } from "@/services/ai-service";

type SocketCallback = (...args: any[]) => void;

class P2PManager {
  private peer: Peer | null = null;
  private connections: { [peerId: string]: DataConnection } = {}; // Host store
  private peerToPlayerId: { [peerId: string]: string } = {}; // Maps conn.peer to Player.id
  private activeConnection: DataConnection | null = null; // Client store
  private listeners: { [event: string]: SocketCallback[] } = {};
  
  public roomState: Room | null = null;
  public currentUser: Player | null = null;
  public isHost: boolean = false;

  // Authoritative Game Loop variables (Host only)
  private roundSubmissions: { [playerId: string]: string } = {};
  private roundTimerInterval: any = null;
  private currentRoundData: any = null;
  private nextRoundRunner: (() => void) | null = null;

  public connect(token: string) {
    console.log("[P2P Network] Initialized connection token:", token);
  }

  public disconnect() {
    this.cleanup();
    console.log("[P2P Network] Disconnected");
  }

  private cleanup() {
    if (this.roundTimerInterval) {
      clearInterval(this.roundTimerInterval);
      this.roundTimerInterval = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    Object.values(this.connections).forEach(c => c.close());
    this.connections = {};
    this.peerToPlayerId = {};
    if (this.activeConnection) {
      this.activeConnection.close();
      this.activeConnection = null;
    }
    this.roomState = null;
    this.isHost = false;
    this.roundSubmissions = {};
    this.nextRoundRunner = null;
  }

  public on(event: string, callback: SocketCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public off(event: string, callback?: SocketCallback) {
    if (this.listeners[event]) {
      if (callback) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      } else {
        this.listeners[event] = [];
      }
    }
  }

  private trigger(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  /**
   * Main router for outbound P2P events.
   */
  public emit(event: string, data: any) {
    console.log(`[P2P Emit Outbound] ${event}:`, data);

    switch (event) {
      case "create_room":
        this.handleCreateRoom(data);
        break;
      case "join_room":
        this.handleJoinRoom(data);
        break;
      case "start_game":
        this.handleStartGame(data);
        break;
      case "send_message":
        this.handleSendMessage(data);
        break;
      case "submit_answer":
        this.handleHostSubmitAnswer(data.answer);
        break;
      case "next_round":
        this.handleNextRound();
        break;
      case "end_game":
        this.handleEndGame();
        break;
      default:
        this.broadcastPayload(event, data);
        break;
    }
  }

  /**
   * Host: Creates a PeerJS node using the room code as its Peer ID.
   */
  private handleCreateRoom(payload: { user: Player; roomName: string; maxPlayers: number; isPrivate: boolean }) {
    this.cleanup();
    this.isHost = true;
    this.currentUser = { ...payload.user, isHost: true };

    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    
    this.roomState = {
      id: `room-${Date.now()}`,
      code,
      name: payload.roomName,
      maxPlayers: payload.maxPlayers,
      isPrivate: payload.isPrivate,
      players: [this.currentUser],
      status: "lobby",
      hostId: this.currentUser.id,
      createdAt: new Date().toISOString(),
    };

    this.peer = new Peer(code);

    this.peer.on("open", async (id) => {
      console.log(`[P2P Host] Room Peer created. Room Code / Peer ID: ${id}`);
      if (this.roomState) {
        await dbService.createRoom(this.roomState);
        this.trigger("room_created", this.roomState);
      }
    });

    this.peer.on("connection", (conn) => {
      this.setupHostConnectionListeners(conn);
    });

    this.peer.on("error", (err) => {
      console.error("[P2P Host Peer Error]", err);
      this.trigger("connection_error", { message: `Room setup failed: ${err.message}`, type: "host" });
    });
  }

  /**
   * Client: Connects to Host's Peer node with retry logic.
   */
  private handleJoinRoom(payload: { roomCode: string; user: Player }) {
    this.cleanup();
    this.isHost = false;
    this.currentUser = { ...payload.user, isHost: false };
    const code = payload.roomCode.toUpperCase();

    const clientId = `client-${Math.random().toString(36).substring(2, 7)}`;
    this.peer = new Peer(clientId);

    this.peer.on("open", () => {
      console.log(`[P2P Client] Peer initialized. Connecting to host Peer: ${code}`);
      this.connectToHostWithRetry(code, 0);
    });

    this.peer.on("error", (err) => {
      // Ignore peer-unavailable here — handled in connectToHostWithRetry
      if (err.type !== "peer-unavailable") {
        console.error("[P2P Client Peer Error]", err);
        this.trigger("connection_error", { message: `Connection failed: ${err.message}`, type: "client" });
      }
    });
  }

  /**
   * Retries connecting to the host peer up to maxAttempts times.
   */
  private connectToHostWithRetry(code: string, attempt: number, maxAttempts = 4, delayMs = 2000) {
    if (!this.peer) return;

    console.log(`[P2P Client] Attempt ${attempt + 1}/${maxAttempts} connecting to host: ${code}`);
    const conn = this.peer.connect(code, { reliable: true });
    this.activeConnection = conn;

    // Connection timeout — if not open within 8s, retry
    const timeout = setTimeout(() => {
      if (!conn.open) {
        console.warn(`[P2P Client] Connection attempt ${attempt + 1} timed out.`);
        conn.close();

        if (attempt + 1 < maxAttempts) {
          setTimeout(() => this.connectToHostWithRetry(code, attempt + 1, maxAttempts, delayMs), delayMs);
        } else {
          console.error(`[P2P Client] All ${maxAttempts} connection attempts failed.`);
          this.trigger("connection_error", {
            message: `Could not connect to room "${code}". Make sure the host is online and the code is correct.`,
            type: "client",
          });
        }
      }
    }, 8000);

    conn.on("open", () => {
      clearTimeout(timeout);
      this.setupClientConnectionListeners(conn);
    });

    conn.on("error", (err) => {
      clearTimeout(timeout);
      console.warn(`[P2P Client] Connection error on attempt ${attempt + 1}:`, err);
      if (attempt + 1 < maxAttempts) {
        setTimeout(() => this.connectToHostWithRetry(code, attempt + 1, maxAttempts, delayMs), delayMs);
      } else {
        this.trigger("connection_error", {
          message: `Could not connect to room "${code}". Please check the room code and try again.`,
          type: "client",
        });
      }
    });
  }

  /**
   * Host side Connection Listener
   */
  private setupHostConnectionListeners(conn: DataConnection) {
    conn.on("open", () => {
      console.log(`[P2P Host] Received connection from player peer: ${conn.peer}`);
      this.connections[conn.peer] = conn;
    });

    conn.on("data", (incoming: any) => {
      const { event, data } = incoming;
      console.log(`[P2P Host Received Data] ${event}:`, data);

      if (event === "register_player") {
        const newPlayer: Player = { ...data, isHost: false };
        this.peerToPlayerId[conn.peer] = newPlayer.id;
        if (this.roomState) {
          if (this.roomState.players.length >= this.roomState.maxPlayers) {
            conn.send({ event: "join_rejected", data: "Room is full" });
            conn.close();
            return;
          }
          this.roomState.players = this.roomState.players.filter(p => p.id !== newPlayer.id);
          this.roomState.players.push(newPlayer);

          dbService.updateRoomPlayers(this.roomState.code, this.roomState.players);
          this.broadcastPayload("room_updated", this.roomState);
          this.trigger("room_joined", this.roomState);
        }
      } else if (event === "submit_answer") {
        const playerId = this.peerToPlayerId[conn.peer] || conn.peer;
        this.handleClientSubmitAnswer(playerId, data.answer);
      } else {
        this.trigger(event, data);
        this.broadcastPayload(event, data);
      }
    });

    conn.on("close", () => {
      console.log(`[P2P Host] Player disconnected: ${conn.peer}`);
      delete this.connections[conn.peer];
      if (this.roomState) {
        const playerId = this.peerToPlayerId[conn.peer] || conn.peer;
        this.roomState.players = this.roomState.players.filter(p => p.id !== playerId);
        dbService.updateRoomPlayers(this.roomState.code, this.roomState.players);
        this.broadcastPayload("room_updated", this.roomState);
      }
    });
  }

  /**
   * Client side Connection Listener
   */
  private setupClientConnectionListeners(conn: DataConnection) {
    conn.on("open", () => {
      console.log("[P2P Client] Connected to Host. Registering player...");
      conn.send({ event: "register_player", data: this.currentUser });
      this.trigger("connection_established", { peerId: conn.peer });
    });

    conn.on("data", (incoming: any) => {
      const { event, data } = incoming;
      console.log(`[P2P Client Received Data] ${event}:`, data);

      if (event === "room_updated") {
        this.roomState = data;
        this.trigger("room_joined", data);
      } else if (event === "join_rejected") {
        alert(data);
        this.cleanup();
      } else {
        this.trigger(event, data);
      }
    });

    conn.on("close", () => {
      console.log("[P2P Client] Host disconnected connection.");
      this.cleanup();
      this.trigger("room_left", { reason: "Host disconnected or room ended." });
    });
  }

  private handleStartGame(payload: { gameType: GameType; totalRounds: number }) {
    if (this.isHost && this.roomState) {
      this.roomState.status = "playing";
      this.roomState.gameType = payload.gameType;

      this.broadcastPayload("game_started", payload);
      this.trigger("game_started", payload);

      // Trigger dynamic engine round loop
      this.triggerRoundCycle(payload.gameType, payload.totalRounds);
    }
  }

  private handleSendMessage(msg: Message) {
    if (this.roomState) {
      dbService.sendChatMessage(this.roomState.code, msg);
      this.broadcastPayload("message_received", msg);
      this.trigger("message_received", msg);
    }
  }

  private handleNextRound() {
    this.broadcastPayload("next_round", null);
    this.trigger("next_round", null);
  }

  private handleEndGame() {
    this.broadcastPayload("game_ended", null);
    this.trigger("game_ended", null);
  }

  /**
   * Sends JSON payload through the active WebRTC channel.
   */
  private broadcastPayload(event: string, data: any) {
    const payload = { event, data };
    if (this.isHost) {
      Object.values(this.connections).forEach(c => {
        if (c.open) c.send(payload);
      });
    } else if (this.activeConnection && this.activeConnection.open) {
      this.activeConnection.send(payload);
    }
  }

  /**
   * Authoritative Game Logic Actions
   */
  private handleHostSubmitAnswer(answer: string) {
    if (this.isHost) {
      this.registerSubmission(this.currentUser?.id || "host", answer);
    } else {
      this.broadcastPayload("submit_answer", { answer });
    }
  }

  private handleClientSubmitAnswer(peerId: string, answer: string) {
    // Sync using connection peer
    const player = this.roomState?.players.find(p => p.id === peerId);
    const playerId = player ? player.id : peerId;
    this.registerSubmission(playerId, answer);
  }

  private registerSubmission(playerId: string, answer: string) {
    if (!this.isHost || !this.roomState) return;

    this.roundSubmissions[playerId] = answer;
    console.log(`[P2P Host Engine] Submission registered for ${playerId}: ${answer}`);

    // Check if everyone submitted
    const activePlayers = this.roomState.players;
    const allSubmitted = activePlayers.every(p => this.roundSubmissions[p.id] !== undefined);

    if (allSubmitted) {
      this.evaluateRoundResults();
    }
  }

  private startRoundTimer(seconds: number, onTimeout: () => void) {
    if (this.roundTimerInterval) clearInterval(this.roundTimerInterval);
    
    let timeLeft = seconds;
    const tickPayload = { timer: timeLeft };
    
    this.broadcastPayload("timer_tick", tickPayload);
    this.trigger("timer_tick", tickPayload);

    this.roundTimerInterval = setInterval(() => {
      timeLeft--;
      const tick = { timer: timeLeft };
      this.broadcastPayload("timer_tick", tick);
      this.trigger("timer_tick", tick);

      if (timeLeft <= 0) {
        clearInterval(this.roundTimerInterval);
        onTimeout();
      }
    }, 1000);
  }

  private async triggerRoundCycle(gameType: GameType, totalRounds: number) {
    let round = 1;
    
    const runRound = async () => {
      if (!this.isHost || !this.roomState) return;

      this.roundSubmissions = {};
      
      let aiContent;
      try {
        aiContent = await aiService.getGameContent({
          gameType,
          playersCount: this.roomState.players.length
        });
      } catch (err) {
        aiContent = aiService.generateMockContent(gameType);
      }

      this.currentRoundData = aiContent.gameData || {};

      const promptPayload = {
        gameType,
        status: "action",
        currentRound: round,
        totalRounds,
        timer: aiContent.durationSeconds,
        prompt: aiContent.prompt,
        options: aiContent.options || [],
      };

      this.broadcastPayload("round_prompt", promptPayload);
      this.trigger("round_prompt", promptPayload);

      this.startRoundTimer(aiContent.durationSeconds, () => {
        this.evaluateRoundResults();
      });
    };

    setTimeout(() => {
      runRound();
    }, 2000);

    this.nextRoundRunner = () => {
      round++;
      if (round <= totalRounds) {
        runRound();
      } else {
        this.endMatch(gameType);
      }
    };
  }

  private evaluateRoundResults() {
    if (this.roundTimerInterval) clearInterval(this.roundTimerInterval);
    if (!this.isHost || !this.roomState) return;

    const gameType = this.roomState.gameType || "Quiz";
    const answersList: any[] = [];
    let winnerId = "";
    let maxPoints = 0;

    const players = this.roomState.players;

    if (gameType === "Quiz") {
      const correct = this.currentRoundData?.correctAnswer || "";
      players.forEach(p => {
        const ans = this.roundSubmissions[p.id] || "";
        const isCorrect = ans.toLowerCase().trim() === correct.toLowerCase().trim();
        const points = isCorrect ? 100 : 0;
        
        p.score = (p.score || 0) + points;
        p.xp = (p.xp || 0) + points;

        answersList.push({
          playerId: p.id,
          answer: ans,
          isCorrect,
          points,
        });

        if (points > maxPoints) {
          maxPoints = points;
          winnerId = p.id;
        }
      });
    } else if (gameType === "Reaction") {
      let lowestMs = Infinity;
      players.forEach(p => {
        const ans = this.roundSubmissions[p.id] || "9999ms";
        const ms = parseInt(ans.replace("ms", "")) || 9999;
        
        answersList.push({
          playerId: p.id,
          answer: ans,
          ms,
        });

        if (ms < lowestMs) {
          lowestMs = ms;
          winnerId = p.id;
        }
      });

      players.forEach(p => {
        if (p.id === winnerId && lowestMs !== Infinity) {
          p.score = (p.score || 0) + 100;
          p.xp = (p.xp || 0) + 100;
        }
      });
    } else {
      players.forEach(p => {
        const ans = this.roundSubmissions[p.id] || "Completed";
        p.score = (p.score || 0) + 50;
        p.xp = (p.xp || 0) + 50;

        answersList.push({
          playerId: p.id,
          answer: ans,
          points: 50,
        });
      });
      winnerId = players[0]?.id || "";
    }

    dbService.updateRoomPlayers(this.roomState.code, this.roomState.players);
    this.broadcastPayload("room_updated", this.roomState);

    const resultsPayload = {
      status: "round_results",
      timer: 5,
      gameData: {
        winnerId,
        answers: answersList,
      }
    };

    this.broadcastPayload("round_results", resultsPayload);
    this.trigger("round_results", resultsPayload);

    setTimeout(() => {
      if (this.nextRoundRunner) {
        this.nextRoundRunner();
      }
    }, 5000);
  }

  private endMatch(gameType: GameType) {
    if (!this.isHost || !this.roomState) return;

    const sorted = [...this.roomState.players].sort((a, b) => (b.score || 0) - (a.score || 0));
    const winner = sorted[0];

    dbService.addRecentArena({
      id: `arena-${Date.now()}`,
      game: gameType,
      rank: winner ? `${winner.name} Won` : "Completed",
      xpEarned: "+250 XP",
      date: "Just Now",
    });

    this.roomState.players.forEach(p => {
      const newXp = p.xp + (p.score || 0);
      const newLevel = Math.floor(newXp / 500) + 1;
      const ranks = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
      const rankIdx = Math.min(Math.floor(newLevel / 2), ranks.length - 1);

      dbService.updateLeaderboardXP({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        xp: newXp,
        level: newLevel,
        rank: ranks[rankIdx],
      });
    });

    const podium = sorted.map(p => ({
      id: p.id,
      name: p.name,
      score: p.score || 0,
      avatar: p.avatar,
    }));

    this.broadcastPayload("game_ended", { podium });
    this.trigger("game_ended", { podium });
  }
}

const socketManager = new P2PManager();
export default socketManager;
