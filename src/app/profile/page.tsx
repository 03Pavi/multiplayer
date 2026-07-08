"use client";

import React, { useState } from "react";
import { Box, Container, Typography, Stack, TextField, Chip } from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Card, Button, Avatar } from "@/components/ui";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateProfile } from "@/store/auth-slice";
import { playSound } from "@/utils/sound";

const FIXED_AVATARS = ["🦊", "🎮", "👾", "🐼", "🦖", "🦁", "🐧", "🦄", "🤖"];

const MOCK_BADGES = [
  { id: "b1", label: "First Recruit", color: "#3B82F6" },
  { id: "b2", label: "AI Conquered", color: "#22C55E" },
  { id: "b3", label: "Meme Master", color: "#F59E0B" },
];

const MOCK_HISTORY = [
  { id: "h1", game: "AI Quiz", rank: "1st Place", xpEarned: "+250 XP", date: "2 hours ago" },
  { id: "h2", game: "Truth or Dare", rank: "3rd Place", xpEarned: "+80 XP", date: "1 day ago" },
  { id: "h3", game: "Reaction Challenge", rank: "1st Place", xpEarned: "+300 XP", date: "3 days ago" },
];

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const settings = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [name, setName] = useState(user?.name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "🦊");

  const handleSave = () => {
    dispatch(updateProfile({ name, bio, avatar: selectedAvatar }));
    setEditing(false);
    if (settings.soundEnabled) {
      playSound("success");
    }
  };

  const handleSelectAvatar = (avatar: string) => {
    setSelectedAvatar(avatar);
    if (settings.soundEnabled) {
      playSound("click");
    }
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, minHeight: "100vh" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box mb={5}>
          <Typography variant="h4" fontWeight={900}>
            PLAYER DOSSIER
          </Typography>
          <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
            Configure your avatar, check statistics, and review badges.
          </Typography>
        </Box>


        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
          {/* Profile Card Summary */}
          <Box sx={{ width: { xs: "100%", md: "33.3%" } }}>
            {user && (
              <Card sx={{ p: 4, textAlign: "center", mb: 4 }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                  <Box sx={{ fontSize: "5rem", mb: 2 }}>{editing ? selectedAvatar : user.avatar}</Box>
                  
                  {editing ? (
                    <Stack spacing={2} sx={{ width: "100%", mb: 2 }}>
                      <TextField
                        size="small"
                        label="Username"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ input: { color: "#FFFFFF" } }}
                      />
                      <TextField
                        size="small"
                        label="Bio"
                        multiline
                        rows={2}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        sx={{ input: { color: "#FFFFFF" } }}
                      />
                      
                      {/* Avatar Picker Box */}
                      <Typography variant="subtitle2" sx={{ color: "#9CA3AF", textAlign: "left", mt: 1 }}>
                        SELECT AVATAR
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                        {FIXED_AVATARS.map((av) => (
                          <Box key={av}>
                            <Box
                              onClick={() => handleSelectAvatar(av)}
                              sx={{
                                fontSize: "2rem",
                                p: 1,
                                borderRadius: "8px",
                                cursor: "pointer",
                                border: selectedAvatar === av ? "2px solid #22C55E" : "2px solid transparent",
                                backgroundColor: selectedAvatar === av ? "rgba(34, 197, 94, 0.1)" : "transparent",
                                transition: "all 0.1s ease",
                                "&:hover": {
                                  backgroundColor: "rgba(255,255,255,0.05)",
                                },
                              }}
                            >
                              {av}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Stack>
                  ) : (
                    <>
                      <Typography variant="h5" fontWeight={900}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#3B82F6", fontWeight: 800, mb: 2 }}>
                        {user.rank.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#9CA3AF", fontStyle: "italic", mb: 3 }}>
                        "{user.bio}"
                      </Typography>
                    </>
                  )}

                  {editing ? (
                    <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                      <Button variant="outlined" color="secondary" fullWidth onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                      <Button variant="contained" color="primary" fullWidth onClick={handleSave}>
                        Save
                      </Button>
                    </Stack>
                  ) : (
                    <Button variant="outlined" color="primary" fullWidth onClick={() => setEditing(true)}>
                      Edit Dossier
                    </Button>
                  )}
                </Box>

                <Box display="flex" justifyContent="space-around" borderTop="1px solid rgba(255, 255, 255, 0.08)" pt={2.5}>
                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      {user.level}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                      Level
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      {user.wins}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                      Wins
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      {user.gamesPlayed}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                      Played
                    </Typography>
                  </Box>
                </Box>
              </Card>
            )}

            {/* Badges Container */}
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={800} mb={2}>
                UNLOCKED BADGES
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {MOCK_BADGES.map((b) => (
                  <Chip
                    key={b.id}
                    label={b.label}
                    sx={{
                      backgroundColor: `${b.color}15`,
                      color: b.color,
                      fontWeight: 800,
                      border: `1px solid ${b.color}30`,
                      borderRadius: "6px",
                    }}
                  />
                ))}
              </Box>
            </Card>
          </Box>

          {/* Gameplay History */}
          <Box sx={{ width: { xs: "100%", md: "66.7%" } }}>
            <Card sx={{ p: 4, mb: 4 }}>
              <Typography variant="h6" fontWeight={900} mb={3} display="flex" alignItems="center" gap={1}>
                <SportsEsportsIcon sx={{ color: "#22C55E" }} />
                RECENT ARENA OPERATIONS
              </Typography>

              <Stack spacing={2.5}>
                {MOCK_HISTORY.map((hist) => (
                  <Box
                    key={hist.id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      p: 2,
                      backgroundColor: "rgba(255, 255, 255, 0.01)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "12px",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {hist.game}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                        {hist.date}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        label={hist.rank}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                          color: "#3B82F6",
                          fontWeight: 700,
                        }}
                      />
                      <Typography variant="body2" color="#22C55E" fontWeight={850}>
                        {hist.xpEarned}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Card>

            <Card sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={900} mb={3} display="flex" alignItems="center" gap={1}>
                <EmojiEventsIcon sx={{ color: "#F59E0B" }} />
                ACHIEVEMENT PROGRESS
              </Typography>
              <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                Achievements system is currently syncing. Next level unlocks at level 5.
              </Typography>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
