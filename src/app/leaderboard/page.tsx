"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Box, Container, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Tabs, Tab, CircularProgress } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Card, Avatar } from "@/components/ui";
import { useAppSelector, useAppDispatch, useActionPending } from "@/store/hooks";
import { fetchLeaderboard, updateLeaderboardXP } from "@/store/thunks/leaderboard-thunks";

export default function LeaderboardPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [rankings, setRankings] = useState<any[]>([]);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const loading = useActionPending(fetchLeaderboard.typePrefix);

  const load = useCallback(async () => {
    try {
      // Sync current user into the leaderboard, then fetch the ranked list.
      if (user) {
        await dispatch(
          updateLeaderboardXP({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            xp: user.xp,
            level: user.level,
            rank: user.rank,
          })
        ).unwrap();
      }
      const list = await dispatch(fetchLeaderboard()).unwrap();
      setRankings(list);
    } catch (err) {
      console.error("[Leaderboard] Failed to load:", err);
    }
  }, [dispatch, user]);

  useEffect(() => {
    load();
  }, [load]);

  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1: return "#F59E0B"; // Gold
      case 2: return "#9CA3AF"; // Silver
      case 3: return "#B45309"; // Bronze
      default: return "#FFFFFF";
    }
  };

  const top3 = rankings.slice(0, 3);
  const runnersUp = rankings.slice(3);

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, minHeight: "100vh" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box mb={5}>
          <Typography variant="h4" fontWeight={900}>
            LEADERBOARD
          </Typography>
          <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
            Hall of Fame. Conquer challenges to climb the ranks.
          </Typography>
        </Box>


        {/* Tab Filters */}
        <Box sx={{ borderBottom: 1, borderColor: "rgba(255, 255, 255, 0.08)", mb: 4 }}>
          <Tabs
            value={tabIndex}
            onChange={(_e, val) => setTabIndex(val)}
            sx={{
              "& .MuiTab-root": { color: "#9CA3AF", fontWeight: 700 },
              "& .Mui-selected": { color: "#22C55E !important" },
              "& .MuiTabs-indicator": { backgroundColor: "#22C55E" },
            }}
          >
            <Tab label="Global" />
            <Tab label="Weekly" />
            <Tab label="Squad" />
          </Tabs>
        </Box>

        {/* Top 3 Podium Cards */}
        {rankings.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, alignItems: "flex-end", mb: 6, width: "100%" }}>
            {/* 2nd Place */}
            <Box sx={{ width: { xs: "100%", sm: "33.3%" }, order: { xs: 2, sm: 1 } }}>
              {top3[1] && (
                <Card sx={{ p: 3, textAlign: "center", border: `1px solid ${getPodiumColor(2)}30` }}>
                  <Typography variant="h5" fontWeight={900} sx={{ color: getPodiumColor(2) }} mb={1}>
                    2ND
                  </Typography>
                  <Box sx={{ fontSize: "3rem", mb: 1 }}>{top3[1].avatar}</Box>
                  <Typography variant="h6" fontWeight={850}>{top3[1].name}</Typography>
                  <Typography variant="caption" sx={{ color: "#3B82F6", fontWeight: 700, display: "block", mb: 2 }}>
                    {top3[1].rank || "Unranked"}
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="#22C55E">
                    {(top3[1].xp || 0).toLocaleString()} XP
                  </Typography>
                </Card>
              )}
            </Box>

            {/* 1st Place */}
            <Box sx={{ width: { xs: "100%", sm: "33.3%" }, order: { xs: 1, sm: 2 } }}>
              {top3[0] && (
                <Card sx={{ p: 4, textAlign: "center", border: `2px solid ${getPodiumColor(1)}`, transform: { sm: "scale(1.05)" } }}>
                  <Typography variant="h4" fontWeight={950} sx={{ color: getPodiumColor(1) }} mb={1}>
                    🏆 CHAMPION 🏆
                  </Typography>
                  <Box sx={{ fontSize: "4rem", mb: 1 }}>{top3[0].avatar}</Box>
                  <Typography variant="h5" fontWeight={900}>{top3[0].name}</Typography>
                  <Typography variant="caption" sx={{ color: "#3B82F6", fontWeight: 700, display: "block", mb: 2 }}>
                    {top3[0].rank || "Unranked"}
                  </Typography>
                  <Typography variant="body1" fontWeight={850} color="#22C55E">
                    {(top3[0].xp || 0).toLocaleString()} XP
                  </Typography>
                </Card>
              )}
            </Box>

            {/* 3rd Place */}
            <Box sx={{ width: { xs: "100%", sm: "33.3%" }, order: { xs: 3, sm: 3 } }}>
              {top3[2] && (
                <Card sx={{ p: 3, textAlign: "center", border: `1px solid ${getPodiumColor(3)}30` }}>
                  <Typography variant="h5" fontWeight={900} sx={{ color: getPodiumColor(3) }} mb={1}>
                    3RD
                  </Typography>
                  <Box sx={{ fontSize: "3rem", mb: 1 }}>{top3[2].avatar}</Box>
                  <Typography variant="h6" fontWeight={850}>{top3[2].name}</Typography>
                  <Typography variant="caption" sx={{ color: "#3B82F6", fontWeight: 700, display: "block", mb: 2 }}>
                    {top3[2].rank || "Unranked"}
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="#22C55E">
                    {(top3[2].xp || 0).toLocaleString()} XP
                  </Typography>
                </Card>
              )}
            </Box>
          </Box>
        )}

        {/* Rankings Table */}
        <TableContainer component={Paper} sx={{ backgroundColor: "#111827", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px" }}>
          <Table aria-label="leaderboard table">
            <TableHead sx={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
              <TableRow>
                <TableCell sx={{ color: "#9CA3AF", fontWeight: 700 }}>Rank</TableCell>
                <TableCell sx={{ color: "#9CA3AF", fontWeight: 700 }}>Player</TableCell>
                <TableCell sx={{ color: "#9CA3AF", fontWeight: 700 }} align="right">Rank Badge</TableCell>
                <TableCell sx={{ color: "#9CA3AF", fontWeight: 700 }} align="right">Level</TableCell>
                <TableCell sx={{ color: "#9CA3AF", fontWeight: 700 }} align="right">XP Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {runnersUp.length > 0 ? (
                runnersUp.map((row, idx) => (
                  <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell sx={{ color: "#FFFFFF", fontWeight: 800 }}>#{idx + 4}</TableCell>
                    <TableCell sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "#FFFFFF", fontWeight: 700 }}>
                      <Box sx={{ fontSize: "1.2rem" }}>{row.avatar}</Box>
                      {row.name}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#3B82F6", fontWeight: 700 }}>{row.rank}</TableCell>
                    <TableCell align="right" sx={{ color: "#FFFFFF", fontWeight: 750 }}>{row.level}</TableCell>
                    <TableCell align="right" sx={{ color: "#22C55E", fontWeight: 800 }}>{(row.xp || 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: "#9CA3AF", py: 4 }}>
                    {loading ? (
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1.5}>
                        <CircularProgress size={18} sx={{ color: "#22C55E" }} />
                        Loading rankings...
                      </Box>
                    ) : (
                      "No other runners-up. Level up to claim your spot!"
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
