"use client";

import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, Stack, TextField, IconButton, Paper, Divider, Chip, Container, Snackbar, Alert } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import {
  setRoom,
  updatePlayers,
  playerJoined,
  playerLeft,
  addMessage,
  clearRoom,
} from "@/store/room-slice";
import {
  startGame,
  setRoundPrompt,
  tickTimer,
  setRoundResults,
  endGame,
  resetGame,
  nextRound,
  setTimer,
} from "@/store/game-slice";

import { Button, Card, PlayerCard, GameHeader, Dialog } from "@/components/ui";
import { copyToClipboard } from "@/utils/clipboard";
import socketManager from "@/socket/socket-manager";
import { GAMES_CONFIG } from "@/features/games/config";

// Game UIs
import TruthOrDareUI from "@/features/games/TruthOrDare/ui";
import QuizUI from "@/features/games/Quiz/ui";
import StoryBuilderUI from "@/features/games/StoryBuilder/ui";
import DrawingUI from "@/features/games/Drawing/ui";
import ReactionUI from "@/features/games/Reaction/ui";
import WouldYouRatherUI from "@/features/games/WouldYouRather/ui";
import NeverHaveIEverUI from "@/features/games/NeverHaveIEver/ui";

export default function RoomPage() {
  const { navigate, searchParams } = useAppNavigation();
  const dispatch = useAppDispatch();
  
  const user = useAppSelector((state) => state.auth.user);
  const { currentRoom, messages } = useAppSelector((state) => state.room);
  const gameState = useAppSelector((state) => state.game);
  
  const [chatInput, setChatInput] = useState("");
  const [gamePickerOpen, setGamePickerOpen] = useState(false);
  const [activeTypers, setActiveTypers] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error" | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Setup connection to simulation socket
  useEffect(() => {
    if (!currentRoom) {
      // Create fallback if refreshed
      if (user) {
        socketManager.emit("create_room", { user });
      }
      return;
    }

    // Connect socket listeners
    socketManager.on("player_joined", (player) => {
      dispatch(playerJoined(player));
    });

    socketManager.on("players_updated", (players) => {
      dispatch(updatePlayers(players));
    });

    socketManager.on("player_left", (playerId) => {
      dispatch(playerLeft(playerId));
    });

    socketManager.on("new_chat", (msg) => {
      dispatch(addMessage(msg));
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    socketManager.on("typing_status", ({ playerId, isTyping }) => {
      const typer = currentRoom.players.find(p => p.id === playerId);
      if (typer) {
        if (isTyping) {
          setActiveTypers(prev => [...prev.filter(n => n !== typer.name), typer.name]);
        } else {
          setActiveTypers(prev => prev.filter(n => n !== typer.name));
        }
      }
    });

    socketManager.on("game_started", ({ gameType, totalRounds }) => {
      dispatch(startGame({ gameType, totalRounds }));
    });

    socketManager.on("round_prompt", ({ prompt, options, timer, currentRound }) => {
      dispatch(setRoundPrompt({ prompt, options, timer, currentRound }));
    });

    socketManager.on("timer_tick", (timeRemaining) => {
      if (timeRemaining && typeof timeRemaining.timer === "number") {
        dispatch(setTimer(timeRemaining.timer));
      }
    });

    socketManager.on("round_results", ({ winnerId, answers }) => {
      dispatch(setRoundResults({ gameData: { winnerId, answers }, timer: 5 }));
    });

    socketManager.on("game_ended", ({ podium }) => {
      dispatch(endGame());
      // Custom podium set
    });

    socketManager.on("connection_error", ({ message }: { message: string }) => {
      console.error("[Room] Connection error:", message);
      setConnectionError(message);
      setConnectionStatus("error");
    });

    socketManager.on("connection_established", () => {
      setConnectionStatus("connected");
      setConnectionError(null);
    });

    socketManager.on("room_left", ({ reason }: { reason: string }) => {
      setConnectionError(reason || "You have left the room.");
      navigate("/dashboard");
    });

    return () => {
      socketManager.off("player_joined", () => {});
      socketManager.off("players_updated", () => {});
      socketManager.off("player_left", () => {});
      socketManager.off("new_chat", () => {});
      socketManager.off("typing_status", () => {});
      socketManager.off("game_started", () => {});
      socketManager.off("round_prompt", () => {});
      socketManager.off("timer_tick", () => {});
      socketManager.off("round_results", () => {});
      socketManager.off("game_ended", () => {});
      socketManager.off("connection_error", () => {});
      socketManager.off("connection_established", () => {});
      socketManager.off("room_left", () => {});
    };
  }, [currentRoom, dispatch, user]);

  const handleCopyLink = async () => {
    if (!currentRoom) return;
    const shareUrl = `${window.location.origin}/dashboard?join=${currentRoom.code}`;
    const ok = await copyToClipboard(shareUrl);
    if (ok) alert("Room link copied to clipboard!");
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socketManager.emit("send_chat", { content: chatInput });
    setChatInput("");
  };

  const handleToggleReady = () => {
    socketManager.emit("toggle_ready", {});
  };

  const handleStartGame = (gameType: string) => {
    setGamePickerOpen(false);
    const gameConfig = GAMES_CONFIG[gameType as keyof typeof GAMES_CONFIG];
    const rounds = gameConfig?.rounds || 5;
    socketManager.emit("start_game", { gameType, totalRounds: rounds });
  };

  const handleSubmitAnswer = (answer: string) => {
    socketManager.emit("submit_answer", { answer });
  };

  const isUserHost = currentRoom?.hostId === user?.id;
  const everyoneReady = currentRoom?.players.every(p => p.isReady) ?? false;

  // Render correct gameplay panel based on GameType
  const renderGameContent = () => {
    switch (gameState.gameType) {
      case "TruthOrDare":
        return <TruthOrDareUI gameState={gameState} onSubmitAnswer={handleSubmitAnswer} />;
      case "Quiz":
        return <QuizUI gameState={gameState} onSubmitAnswer={handleSubmitAnswer} />;
      case "StoryBuilder":
        return <StoryBuilderUI gameState={gameState} onSubmitAnswer={handleSubmitAnswer} />;
      case "Drawing":
        return <DrawingUI gameState={gameState} onSubmitAnswer={handleSubmitAnswer} />;
      case "Reaction":
        return <ReactionUI gameState={gameState} onSubmitAnswer={handleSubmitAnswer} />;
      case "WouldYouRather":
        return <WouldYouRatherUI gameState={gameState} onSubmitAnswer={handleSubmitAnswer} />;
      case "NeverHaveIEver":
        return <NeverHaveIEverUI gameState={gameState} onSubmitAnswer={handleSubmitAnswer} />;
      default:
        return <Typography variant="h6">Loading Game Engine...</Typography>;
    }
  };

  if (!currentRoom) {
    return (
      <Box sx={{ p: 4, textAlign: "center", color: "#9CA3AF" }}>
        Loading room parameters...
      </Box>
    );
  }

  // GAME MODE ACTIVE VIEW
  if (currentRoom.status === "playing" && gameState.status !== "ended") {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#0B0F14" }}>
        <GameHeader
          gameTitle={GAMES_CONFIG[gameState.gameType]?.title || gameState.gameType}
          currentRound={gameState.currentRound}
          totalRounds={gameState.totalRounds}
          timerSeconds={gameState.timer}
          onExit={() => {
            socketManager.emit("leave_room", {});
            dispatch(clearRoom());
            dispatch(resetGame());
            navigate("/dashboard");
          }}
        />

        <Container maxWidth="md" sx={{ py: 4 }}>
          {gameState.status === "round_results" ? (
            <Card sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h4" color="#F59E0B" fontWeight={950} mb={3}>
                ROUND ENDED
              </Typography>
              <Typography variant="body1" mb={4}>
                Reviewing scores. Next round starting in {gameState.timer}s...
              </Typography>
              <Stack spacing={2} sx={{ maxWidth: "400px", mx: "auto" }}>
                {gameState.gameData?.answers?.map((ans: any, idx: number) => {
                  const player = currentRoom.players.find(p => p.id === ans.playerId);
                  return (
                    <Box key={idx} display="flex" justifyContent="space-between" p={1.5} bgcolor="rgba(255,255,255,0.02)" borderRadius="8px">
                      <Typography variant="subtitle2" fontWeight={800}>{player?.name || "Player"}</Typography>
                      <Typography variant="body2" color="#3B82F6">{ans.answer}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Card>
          ) : (
            renderGameContent()
          )}
        </Container>
      </Box>
    );
  }

  // GAME OVER VIEW
  if (gameState.status === "ended") {
    return (
      <Box sx={{ py: 6, px: 3, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Card sx={{ p: 5, maxWidth: "500px", width: "100%", textAlign: "center" }}>
          <SportsEsportsIcon sx={{ fontSize: 60, color: "#22C55E", mb: 2 }} />
          <Typography variant="h4" fontWeight={950} mb={1}>
            GAME OVER
          </Typography>
          <Typography variant="body2" sx={{ color: "#9CA3AF", mb: 4 }}>
            The match has concluded. Return to lobby.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              dispatch(resetGame());
              currentRoom.status = "lobby";
              dispatch(setRoom({ ...currentRoom, status: "lobby" }));
            }}
          >
            Back to Lobby
          </Button>
        </Card>
      </Box>
    );
  }

  // LOBBY CHAT & ROSTER VIEW
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: { xs: "column", lg: "row" } }}>
      {/* Left Roster Panel */}
      <Box sx={{ flexGrow: 1, p: { xs: 3, md: 5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={900} display="flex" alignItems="center" gap={1.5}>
              LOBBY: {currentRoom.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "#9CA3AF", letterSpacing: "0.1em" }}>
              CODE: <span style={{ color: "#3B82F6", fontWeight: 800 }}>{currentRoom.code}</span>
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <IconButton onClick={handleCopyLink} sx={{ color: "#3B82F6", border: "1px solid rgba(255,255,255,0.08)" }}>
              <ContentCopyIcon />
            </IconButton>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                socketManager.emit("leave_room", {});
                dispatch(clearRoom());
                navigate("/dashboard");
              }}
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              Exit
            </Button>
            <IconButton
              color="error"
              onClick={() => {
                socketManager.emit("leave_room", {});
                dispatch(clearRoom());
                navigate("/dashboard");
              }}
              sx={{
                display: { xs: "inline-flex", sm: "none" },
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "8px",
                p: 1.2
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Stack>
        </Box>


        {/* Players Roster Grid */}
        <Typography variant="subtitle1" fontWeight={800} mb={3}>
          CONNECTED ROSTER ({currentRoom.players.length}/{currentRoom.maxPlayers})
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 5 }}>
          {currentRoom.players.map((player) => (
            <Box key={player.id} sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" }, boxSizing: "border-box" }}>
              <PlayerCard
                name={player.name}
                avatar={player.avatar}
                level={player.level}
                xp={player.xp}
                rank={player.rank}
                isHost={player.isHost}
                isReady={player.isReady}
                isOnline={player.isOnline}
              />
            </Box>
          ))}
        </Box>

        {/* Match Action Triggers */}
        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", pt: 4 }}>
          {isUserHost ? (
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={() => setGamePickerOpen(true)}
                disabled={!everyoneReady && currentRoom.players.length > 1}
                fullWidth
              >
                Launch Game Engine
              </Button>
            </Stack>
          ) : (
            <Button
              variant={user && currentRoom.players.find(p => p.id === user.id)?.isReady ? "outlined" : "contained"}
              color="secondary"
              startIcon={<CheckCircleIcon />}
              onClick={handleToggleReady}
              fullWidth
            >
              {user && currentRoom.players.find(p => p.id === user.id)?.isReady ? "Cancel Ready" : "Toggle Ready Status"}
            </Button>
          )}
        </Box>
      </Box>

      {/* Right Chat Sidebar */}
      <Box
        sx={{
          width: { xs: "100%", lg: "360px" },
          height: { xs: "400px", lg: "100vh" },
          backgroundColor: "#111827",
          borderLeft: { lg: "1px solid rgba(255, 255, 255, 0.08)" },
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <Typography variant="subtitle2" fontWeight={800}>
            ROOM CHAT LOBBY
          </Typography>
        </Box>

        {/* Messages list */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {messages.map((msg) => (
            <Box key={msg.id} alignSelf={msg.isSystem ? "center" : "flex-start"} sx={{ maxWidth: "85%" }}>
              {msg.isSystem ? (
                <Chip label={msg.content} size="small" sx={{ backgroundColor: "rgba(255,255,255,0.03)", color: "#9CA3AF" }} />
              ) : (
                <Box display="flex" gap={1}>
                  <Box sx={{ fontSize: "1.2rem" }}>{msg.senderAvatar}</Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#3B82F6", fontWeight: 700, display: "block" }}>
                      {msg.senderName}
                    </Typography>
                    <Paper sx={{ p: 1.5, backgroundColor: "#1A202C", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <Typography variant="body2">{msg.content}</Typography>
                    </Paper>
                  </Box>
                </Box>
              )}
            </Box>
          ))}
          <div ref={chatEndRef} />
        </Box>

        {/* Typer status */}
        {activeTypers.length > 0 && (
          <Box sx={{ px: 2, py: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#22C55E", fontStyle: "italic" }}>
              {activeTypers.join(", ")} is typing...
            </Typography>
          </Box>
        )}

        {/* Form input */}
        <Box component="form" onSubmit={handleSendChat} sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <TextField
            placeholder="Type message..."
            fullWidth
            size="small"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton type="submit" sx={{ color: "#22C55E" }}>
                  <SendIcon sx={{ fontSize: 18 }} />
                </IconButton>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#FFFFFF",
                backgroundColor: "rgba(255,255,255,0.02)",
                "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
              },
            }}
          />
        </Box>
      </Box>

      {/* Game Selection Modal */}
      <Dialog
        open={gamePickerOpen}
        onClose={() => setGamePickerOpen(false)}
        title="Select AI Game Module"
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
          {Object.values(GAMES_CONFIG).map((game) => (
            <Box key={game.id} sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" }, boxSizing: "border-box" }}>
              <Box
                onClick={() => handleStartGame(game.id)}
                sx={{
                  p: 2.5,
                  backgroundColor: "#1A202C",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#22C55E",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Typography variant="h5" mb={1}>{game.emoji}</Typography>
                <Typography variant="subtitle2" fontWeight={850}>{game.title}</Typography>
                <Typography variant="caption" sx={{ color: "#9CA3AF" }}>{game.description}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Dialog>
    </Box>
  );
}
