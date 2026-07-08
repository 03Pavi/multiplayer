"use client";

import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Stack, TextField, InputAdornment, Chip, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import HistoryIcon from "@mui/icons-material/History";
import WifiIcon from "@mui/icons-material/Wifi";
import { Button, Card, GameCard, RoomCard, Avatar, Dialog } from "@/components/ui";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setRoom } from "@/store/room-slice";
import { GAMES_CONFIG } from "@/features/games/config";
import socketManager from "@/socket/socket-manager";
import { dbService } from "@/services/db-service";
import { Room } from "@/types";

export default function DashboardPage() {
  const { navigate } = useAppNavigation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(6);
  
  // Real-time Database Feeds
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [recentArenas, setRecentArenas] = useState<any[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);

  useEffect(() => {
    // 1. Subscribe to public rooms feed
    const unsubscribeRooms = dbService.subscribeToPublicRooms((rooms) => {
      setPublicRooms(rooms);
    });

    // 2. Subscribe to recent arenas feed
    const unsubscribeArenas = dbService.subscribeToRecentArenas((arenas) => {
      setRecentArenas(arenas);
    });

    // 3. Subscribe to online players presence feed
    const unsubscribePresence = dbService.subscribeToOnlinePlayers((players) => {
      setOnlinePlayers(players);
    });

    // 4. Register current user as online
    if (user) {
      dbService.setPresence({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        level: user.level || 1,
        rank: user.rank || "Bronze",
      });
    }

    // 5. Listen for socket connections
    socketManager.on("room_created", async (room) => {
      dispatch(setRoom(room));
      await dbService.createRoom(room);
      navigate(`/room/${room.code}`);
    });

    socketManager.on("room_joined", (room) => {
      dispatch(setRoom(room));
      navigate(`/room/${room.code}`);
    });

    socketManager.on("connection_error", (err: { message: string }) => {
      alert(err.message || "Failed to connect to the room. The host may be offline.");
    });

    return () => {
      unsubscribeRooms();
      unsubscribeArenas();
      unsubscribePresence();
      if (user) dbService.clearPresence(user.id);
      socketManager.off("room_created", () => {});
      socketManager.off("room_joined", () => {});
      socketManager.off("connection_error", () => {});
    };
  }, [dispatch, navigate, user]);

  const handleCreateRoomSubmit = () => {
    if (!user) return;
    socketManager.emit("create_room", {
      user,
      roomName: newRoomName || `${user.name}'s Arena`,
      maxPlayers,
      isPrivate: false,
    });
    setCreateDialogOpen(false);
  };

  const handleJoinRoom = () => {
    if (!roomCodeInput || !user) return;
    socketManager.emit("join_room", {
      roomCode: roomCodeInput.toUpperCase(),
      user,
    });
  };
  const allGames = Object.values(GAMES_CONFIG);
  const [showAllGames, setShowAllGames] = useState(false);

  const getGameCardPlayersLabel = (gameId: string, min: number, max: number) => {
    const livePlayers = publicRooms
      .filter((r) => r.gameType === gameId && r.status !== "ended")
      .reduce((sum, r) => sum + (r.players?.length || 0), 0);
    return livePlayers > 0 ? `${livePlayers} Live` : `${min}-${max}`;
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, sm: 3 }, minHeight: "100vh" }}>
      <Container maxWidth="xl">
        {/* Welcome HUD Header */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2.5, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }} mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={900}>
              WELCOME BACK, <span style={{ color: "#22C55E" }}>{user?.name.toUpperCase() || "SOLDIER"}</span>
            </Typography>
            <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
              Ready to challenge your squad? Create or join an arena lobby.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Create Room
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 4 }}>
          {/* Main Panel Left */}
          <Box sx={{ width: { xs: "100%", lg: "66.7%" } }}>
            {/* Quick Connect & Join Code */}
            <Card sx={{ p: 3, mb: 4 }}>
              <Typography variant="subtitle1" fontWeight={800} mb={2}>
                QUICK CONNECT TO ARENA
              </Typography>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                <TextField
                  placeholder="ENTER ROOM CODE (E.G. CYBER)"
                  fullWidth
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupAddIcon sx={{ color: "#9CA3AF" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#FFFFFF",
                      fontFamily: "monospace",
                      letterSpacing: "0.2em",
                      backgroundColor: "rgba(255,255,255,0.02)",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                      "&:hover fieldset": { borderColor: "#3B82F6" },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={!roomCodeInput}
                  onClick={handleJoinRoom}
                  sx={{ px: 4, width: { xs: "100%", sm: "auto" } }}
                >
                  Join
                </Button>
              </Box>
            </Card>


            {/* Public Rooms */}
            <Typography variant="h5" fontWeight={800} mb={2}>
              BROWSE PUBLIC ROOMS ({publicRooms.length})
            </Typography>
            <Stack spacing={2} mb={5}>
              {publicRooms.length > 0 ? (
                publicRooms.map((room) => {
                  const host = room.players.find((p) => p.isHost);
                  return (
                    <RoomCard
                      key={room.id}
                      id={room.id}
                      name={room.name}
                      code={room.code}
                      hostName={host ? host.name : "Unknown"}
                      playersCount={room.players.length}
                      maxPlayers={room.maxPlayers}
                      isPrivate={room.isPrivate}
                      gameType={room.gameType || "Lobby"}
                      isOwner={user ? room.hostId === user.id : false}
                      onDelete={async () => {
                        if (confirm(`Delete room "${room.name}" (${room.code})?`)) {
                          await dbService.deleteRoom(room.code);
                        }
                      }}
                      onJoin={() => {
                        if (user) {
                          socketManager.emit("join_room", { roomCode: room.code, user });
                        }
                      }}
                    />
                  );
                })
              ) : (
                <Card sx={{ p: 4, textAlign: "center", borderStyle: "dashed" }}>
                  <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                    No public rooms active. Be the first to create one!
                  </Typography>
                </Card>
              )}
            </Stack>

            {/* Trending Games — 2 per row + More card */}
            <Box>
              <Typography variant="h5" fontWeight={800} mb={2}>
                TRENDING GAME MODULES
              </Typography>

              {/* Single flex container for seamless wrapping layout */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: showAllGames ? 1 : 4 }}>
                {allGames.slice(0, 3).map((game) => (
                  <Box
                    key={game.id}
                    sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" }, boxSizing: "border-box", display: "flex" }}
                  >
                    <GameCard
                      id={game.id}
                      title={game.title}
                      description={game.description}
                      icon={game.emoji}
                      playersCount={getGameCardPlayersLabel(game.id, game.minPlayers, game.maxPlayers)}
                      duration={`${game.rounds} Rounds`}
                      difficulty={game.difficulty}
                      onSelect={() => setCreateDialogOpen(true)}
                      ctaText="Host Game"
                    />
                  </Box>
                ))}

                {/* 4th slot — "More" card */}
                {!showAllGames && (
                  <Box
                    sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" }, boxSizing: "border-box", display: "flex" }}
                    onClick={() => setShowAllGames(true)}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        minHeight: "260px",
                        borderRadius: "16px",
                        border: "2px dashed rgba(255,255,255,0.12)",
                        backgroundColor: "rgba(255,255,255,0.02)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        gap: 1.5,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "#22C55E",
                          backgroundColor: "rgba(34,197,94,0.05)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Typography sx={{ fontSize: "2.5rem" }}>🎮</Typography>
                      <Typography variant="h6" fontWeight={900} sx={{ color: "#FFFFFF" }}>
                        +{allGames.length - 3} More
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9CA3AF", textAlign: "center", px: 2 }}>
                        {allGames.slice(3).map(g => g.title).join(" · ")}
                      </Typography>
                      <Box sx={{ mt: 1, px: 2.5, py: 0.75, borderRadius: "8px", backgroundColor: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}>
                        <Typography variant="caption" sx={{ color: "#22C55E", fontWeight: 800 }}>
                          SEE ALL GAMES
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Expanded: remaining games — rendered in the same flex list container */}
                {showAllGames &&
                  allGames.slice(3).map((game) => (
                    <Box
                      key={game.id}
                      sx={{
                        width: { xs: "100%", sm: "calc(50% - 12px)" },
                        boxSizing: "border-box",
                        display: "flex",
                        animation: "fadeIn 0.3s ease",
                      }}
                    >
                      <GameCard
                        id={game.id}
                        title={game.title}
                        description={game.description}
                        icon={game.emoji}
                        playersCount={getGameCardPlayersLabel(game.id, game.minPlayers, game.maxPlayers)}
                        duration={`${game.rounds} Rounds`}
                        difficulty={game.difficulty}
                        onSelect={() => setCreateDialogOpen(true)}
                        ctaText="Host Game"
                      />
                    </Box>
                  ))}
              </Box>

              {/* Show Less button below the single container flow */}
              {showAllGames && (
                <Box sx={{ width: "100%", display: "flex", justifyContent: "center", pt: 1, mb: 4 }}>
                  <Box
                    onClick={() => setShowAllGames(false)}
                    sx={{
                      cursor: "pointer",
                      color: "#9CA3AF",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      px: 3,
                      py: 1,
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      transition: "all 0.2s",
                      "&:hover": { color: "#FFFFFF", borderColor: "rgba(255,255,255,0.2)" },
                    }}
                  >
                    ▲ Show Less
                  </Box>
                </Box>
              )}
            </Box>
            </Box>

            {/* Side Panels Right */}
            <Box sx={{ width: { xs: "100%", lg: "33.3%" } }}>
            {/* User Profile Mini Stats Card */}
            {user && (
              <Card sx={{ p: 3, mb: 4, textAlign: "center" }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                  <Box sx={{ fontSize: "3.5rem", mb: 1 }}>{user.avatar}</Box>
                  <Typography variant="h6" fontWeight={800}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#3B82F6", fontWeight: 800 }}>
                    {user.rank.toUpperCase()}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-around" borderTop="1px solid rgba(255, 255, 255, 0.08)" pt={2}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {user.level}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                      Level
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {user.wins}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                      Wins
                    </Typography>
                  </Box>
                </Box>
              </Card>
            )}



            {/* Online Squad */}
            <Card sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="subtitle1" fontWeight={800}>
                  ONLINE SQUAD
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#22C55E",
                      animation: "pulse 2s infinite",
                      "@keyframes pulse": {
                        "0%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.5)" },
                        "70%": { boxShadow: "0 0 0 6px rgba(34,197,94,0)" },
                        "100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "#22C55E", fontWeight: 700 }}>
                    {onlinePlayers.filter(p => user ? p.id !== user.id : true).length} ONLINE
                  </Typography>
                </Box>
              </Box>

              {onlinePlayers.filter(p => user ? p.id !== user.id : true).length === 0 ? (
                <Box textAlign="center" py={3}>
                  <WifiIcon sx={{ fontSize: 32, color: "#374151", mb: 1 }} />
                  <Typography variant="caption" sx={{ color: "#9CA3AF", display: "block" }}>
                    No other players online right now.
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    Invite your squad to party up!
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {onlinePlayers
                    .filter(p => user ? p.id !== user.id : true)
                    .slice(0, 6)
                    .map((player) => {
                      const rankColors: Record<string, string> = {
                        Bronze: "#CD7F32", Silver: "#9CA3AF", Gold: "#F59E0B",
                        Platinum: "#3B82F6", Diamond: "#A855F7",
                      };
                      const rankColor = rankColors[player.rank] || "#9CA3AF";
                      return (
                        <Box key={player.id} display="flex" alignItems="center" justifyContent="space-between"
                          sx={{
                            p: 1.5,
                            borderRadius: "10px",
                            backgroundColor: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            transition: "background 0.2s",
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.04)" },
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Box sx={{ position: "relative" }}>
                              <Avatar size={38}>{player.avatar}</Avatar>
                              <Box sx={{
                                position: "absolute", bottom: 0, right: 0,
                                width: 10, height: 10, borderRadius: "50%",
                                backgroundColor: "#22C55E",
                                border: "2px solid #0D1117",
                              }} />
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight={700}>{player.name}</Typography>
                              <Box display="flex" alignItems="center" gap={0.75} mt={0.25}>
                                <Chip
                                  label={player.rank}
                                  size="small"
                                  sx={{
                                    height: 16, fontSize: "0.6rem", fontWeight: 800,
                                    backgroundColor: `${rankColor}18`,
                                    color: rankColor,
                                    border: `1px solid ${rankColor}35`,
                                    borderRadius: "4px",
                                    "& .MuiChip-label": { px: 0.75 },
                                  }}
                                />
                                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                                  Lv.{player.level}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <Tooltip title="Invite to room">
                            <Button
                              variant="outlined"
                              color="primary"
                              sx={{ minHeight: "28px", py: 0.25, px: 1.5, fontSize: "0.7rem", fontWeight: 700 }}
                              onClick={() => setCreateDialogOpen(true)}
                            >
                              Invite
                            </Button>
                          </Tooltip>
                        </Box>
                      );
                    })}
                </Stack>
              )}
            </Card>

          </Box>
        </Box>
      </Container>

      {/* Create Room Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        title="Host New Party Room"
        actions={
          <>
            <Button variant="outlined" color="secondary" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleCreateRoomSubmit}>
              Host Room
            </Button>
          </>
        }
      >
        <Stack spacing={3} mt={2}>
          <TextField
            label="Room Name"
            fullWidth
            placeholder="e.g. Cyber Party Room"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            InputLabelProps={{ style: { color: "#9CA3AF" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#FFFFFF",
                "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
              },
            }}
          />
          <TextField
            label="Max Players Limit"
            type="number"
            fullWidth
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 6)}
            InputLabelProps={{ style: { color: "#9CA3AF" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#FFFFFF",
                "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
              },
            }}
          />
        </Stack>
      </Dialog>
    </Box>
  );
}
